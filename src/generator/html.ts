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
    Handlebars.registerHelper('json', (context: unknown) => {
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
          } catch {
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
      } catch {
        console.warn('Failed to load search-client.js, search functionality will be disabled');
        this.searchScript = '';
      }
    }
  }

  public async loadTemplate(themeName: string, isSearchPage: boolean = false): Promise<void> {
    let templatePath: string;
    
    if (isSearchPage) {
      // Use search-specific template for index.html
      templatePath = path.join(__dirname, '..', 'templates', 'search-index.hbs');
    } else {
      // Use regular template for other pages
      templatePath = path.join(__dirname, '..', 'templates', `${themeName}.hbs`);
    }
    
    try {
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      this.compiledTemplate = Handlebars.compile(templateContent);
    } catch (error) {
      console.error(`Failed to load template from ${templatePath}:`, error);
      // Fallback to appropriate default template
      const defaultTemplate = isSearchPage ? this.getSearchIndexTemplate() : this.getDefaultTemplate();
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
            <div class="search-link">
                <a href="{{indexPath}}" class="search-button">🔍 検索</a>
            </div>
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
</body>
</html>`;
  }

  private getSearchIndexTemplate(): string {
    // This would be the embedded search template - for now, return a simplified version
    // In practice, this would be the same as the search-index.hbs file content
    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{metadata.title}} - ドキュメント検索</title>
    <link rel="stylesheet" href="{{cssPath}}">
</head>
<body>
    <div class="search-page">
        <h1>{{metadata.title}} - ドキュメント検索</h1>
        <input type="text" id="search-input" placeholder="検索キーワードを入力...">
        <div id="search-results"></div>
    </div>
    <script>{{{lunrScript}}}</script>
    <script>window.searchIndex = {{{json searchIndex}}};</script>
    <script>{{{searchScript}}}</script>
</body>
</html>`;
  }

  public async generate(
    document: ProcessedDocument,
    options: HtmlGeneratorOptions
  ): Promise<string> {
    // Determine if this is the search index page
    const isSearchPage = options.outputFilePath ? 
      path.basename(options.outputFilePath) === 'index.html' : false;
    
    // Always reload template to ensure correct template for page type
    await this.loadTemplate(options.theme, isSearchPage);

    // Load JavaScript libraries for embedding (only for search page)
    if (options.searchEnabled && isSearchPage) {
      await this.loadScripts();
    }

    // Calculate paths relative to output file
    let cssPath = isSearchPage ? 'search.css' : 'styles.css';
    let indexPath = 'index.html';
    
    if (options.outputFilePath && options.outputDir) {
      if (isSearchPage) {
        cssPath = 'search.css'; // Search page always uses search.css at root level
      } else {
        cssPath = PathUtils.getCssPath(options.outputFilePath, options.outputDir);
      }
      
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
      indexPath,
      searchEnabled: options.searchEnabled && isSearchPage,
      searchIndex: document.searchIndex,
      lunrScript: this.lunrScript,
      searchScript: this.searchScript,
    };

    if (!this.compiledTemplate) {
      throw new Error('Template not loaded');
    }
    const html = this.compiledTemplate(templateData);

    if (options.minify) {
      // TODO: Implement HTML minification
      return html;
    }

    return html;
  }
}