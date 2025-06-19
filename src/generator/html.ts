import * as Handlebars from 'handlebars';
import { ProcessedDocument } from '../types';
import { TocGenerator } from './toc';
import { PathUtils } from '../utils/path-utils';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface HtmlGeneratorOptions {
  theme: string;
  searchEnabled: boolean;
  minify: boolean;
  outputFilePath?: string;
  outputDir?: string;
}

export class HtmlGenerator {
  private tocGenerator: TocGenerator;
  private compiledTemplate?: Handlebars.TemplateDelegate;
  private lunrScript?: string;
  private searchScript?: string;

  constructor() {
    this.tocGenerator = new TocGenerator();
    this.registerHelpers();
    this.lunrScript = '';
    this.searchScript = '';
  }

  private registerHelpers(): void {
    Handlebars.registerHelper('json', (context: any) => {
      if (context === undefined || context === null) {
        return 'null';
      }
      return JSON.stringify(context);
    });

    Handlebars.registerHelper('formatDate', (date: Date | undefined) => {
      if (!date) {
        return new Date().toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
      return new Date(date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });
  }

  private async loadScripts(): Promise<void> {
    if (!this.lunrScript) {
      try {
        // Try multiple possible paths for lunr.js
        const possiblePaths = [
          path.join(__dirname, '..', '..', 'node_modules', 'lunr', 'lunr.js'),
          path.join(__dirname, '..', '..', 'node_modules', 'lunr', 'lib', 'lunr.js'),
          path.join(process.cwd(), 'node_modules', 'lunr', 'lunr.js'),
          path.join(process.cwd(), 'node_modules', 'lunr', 'lib', 'lunr.js')
        ];
        
        let loaded = false;
        for (const lunrPath of possiblePaths) {
          try {
            this.lunrScript = await fs.readFile(lunrPath, 'utf-8');
            loaded = true;
            console.log(`Loaded lunr.js from: ${lunrPath}`);
            break;
          } catch (e) {
            // Try next path
          }
        }
        
        if (!loaded) {
          throw new Error('Could not find lunr.js in any expected location');
        }
      } catch (error) {
        console.warn('Failed to load lunr.js locally, search functionality will be disabled:', error);
        this.lunrScript = '';
      }
    }

    if (!this.searchScript) {
      try {
        const searchPath = path.join(__dirname, '..', 'search', 'search-client.js');
        this.searchScript = await fs.readFile(searchPath, 'utf-8');
      } catch (error) {
        console.warn('Failed to load search-client.js, search functionality will be disabled');
        this.searchScript = '';
      }
    }
  }

  public async loadTemplate(themeName: string): Promise<void> {
    const templatePath = path.join(__dirname, '..', 'templates', `${themeName}.hbs`);
    
    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      this.compiledTemplate = Handlebars.compile(templateContent);
    } catch (error) {
      // Fallback to default template
      const defaultTemplate = this.getDefaultTemplate();
      this.compiledTemplate = Handlebars.compile(defaultTemplate);
    }
  }

  private getDefaultTemplate(): string {
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{metadata.title}} - DocGen</title>
    <link rel="stylesheet" href="{{cssPath}}">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1 class="site-title">{{metadata.title}}</h1>
            {{#if searchEnabled}}
            <div class="search-container">
                <input type="text" id="search-input" class="search-input" placeholder="検索...">
                <div id="search-results" class="search-results"></div>
            </div>
            {{/if}}
        </header>
        
        <div class="content-wrapper">
            <aside class="sidebar">
                {{{tocHtml}}}
            </aside>
            
            <main class="main-content">
                <article class="article">
                    {{{content}}}
                </article>
                
                <footer class="article-footer">
                    <p class="last-modified">最終更新: {{formatDate metadata.lastModified}}</p>
                </footer>
            </main>
        </div>
    </div>
    
    {{#if searchEnabled}}
    <script>
        // lunr.js library embedded for local file compatibility
        {{{lunrScript}}}
        
        // Ensure lunr is available globally
        if (typeof lunr !== 'undefined') {
            window.lunr = lunr;
            console.log('Lunr.js loaded successfully');
        } else {
            console.error('Failed to load lunr.js');
        }
    </script>
    <script>
        // Search index data
        window.searchIndex = {{{json searchIndex}}};
    </script>
    <script>
        // Search client functionality
        {{{searchScript}}}
    </script>
    {{/if}}
</body>
</html>`;
  }

  public async generate(
    document: ProcessedDocument,
    options: HtmlGeneratorOptions
  ): Promise<string> {
    if (!this.compiledTemplate) {
      await this.loadTemplate(options.theme);
    }

    // Load JavaScript libraries for embedding
    if (options.searchEnabled) {
      await this.loadScripts();
    }

    // Calculate paths relative to output file
    let cssPath = 'styles.css';
    let indexPath = 'index.html';
    
    if (options.outputFilePath && options.outputDir) {
      cssPath = PathUtils.getCssPath(options.outputFilePath, options.outputDir);
      
      // Calculate relative path to index.html
      const relativeDepth = path.relative(options.outputDir, path.dirname(options.outputFilePath));
      const depthLevel = relativeDepth ? relativeDepth.split(path.sep).length : 0;
      indexPath = depthLevel > 0 ? '../'.repeat(depthLevel) + 'index.html' : 'index.html';
    }

    const tocHtml = this.tocGenerator.renderTocHtml(document.toc, indexPath);

    const templateData = {
      metadata: document.metadata,
      content: document.content,
      tocHtml,
      cssPath,
      searchEnabled: options.searchEnabled,
      searchIndex: document.searchIndex,
      lunrScript: this.lunrScript,
      searchScript: this.searchScript,
    };

    const html = this.compiledTemplate!(templateData);

    if (options.minify) {
      // TODO: Implement HTML minification
      return html;
    }

    return html;
  }
}