import { MarkdownParser } from '../parser/markdown';
import { HtmlGenerator, HtmlGeneratorOptions } from '../generator/html';
import { TocGenerator } from '../generator/toc';
import { IndexGenerator } from '../generator/index-generator';
import { FileSystemUtils } from '../utils/file-system';
import { SearchIndexer } from '../search/search-indexer';
import { ProcessedDocument, DocGenOptions } from '../types';
import * as path from 'path';
import * as fs from 'fs/promises';

export class DocumentProcessor {
  private markdownParser: MarkdownParser;
  private htmlGenerator: HtmlGenerator;
  private tocGenerator: TocGenerator;
  private indexGenerator: IndexGenerator;
  private fileSystemUtils: FileSystemUtils;
  private searchIndexer: SearchIndexer;

  constructor() {
    this.markdownParser = new MarkdownParser();
    this.htmlGenerator = new HtmlGenerator();
    this.tocGenerator = new TocGenerator();
    this.indexGenerator = new IndexGenerator();
    this.fileSystemUtils = new FileSystemUtils();
    this.searchIndexer = new SearchIndexer();
  }

  public async processFiles(options: DocGenOptions): Promise<void> {
    console.log('🚀 Starting document processing...');
    
    // Reset search indexer for new processing session
    this.searchIndexer.reset();
    
    // Get all markdown files
    const input = Array.isArray(options.input) ? options.input[0] : options.input;
    
    // Check if input is a directory for index generation
    const isInputDirectory = (await fs.stat(input)).isDirectory();
    
    // Generate index files for directories if needed
    if (isInputDirectory) {
      console.log('📑 Generating directory indexes...');
      await this.generateDirectoryIndexes(input);
    }
    
    const markdownFiles = await this.fileSystemUtils.getMarkdownFiles(input);
    console.log(`📝 Found ${markdownFiles.length} markdown file(s)`);

    // Load template
    await this.htmlGenerator.loadTemplate(options.theme);

    // Ensure output directory exists
    await this.fileSystemUtils.ensureDirectoryExists(options.output);

    // Copy CSS file
    await this.copyCssFile(options.output);

    // Process each file and build search index
    const processedDocuments: { document: ProcessedDocument; filePath: string; outputPath: string }[] = [];
    
    for (const file of markdownFiles) {
      const result = await this.processFile(file, options, input);
      if (result) {
        processedDocuments.push(result);
      }
    }

    // Generate global search index if enabled
    if (options.searchEnabled) {
      console.log('🔍 Generating global search index...');
      const globalSearchIndex = this.searchIndexer.generateIndex();
      
      // Update all HTML files with the global search index
      for (const { document, outputPath } of processedDocuments) {
        document.searchIndex = globalSearchIndex;
        
        const htmlOptions: HtmlGeneratorOptions = {
          theme: options.theme,
          searchEnabled: options.searchEnabled,
          minify: options.minify,
          outputFilePath: outputPath,
          outputDir: options.output,
        };
        
        const html = await this.htmlGenerator.generate(document, htmlOptions);
        await this.fileSystemUtils.writeFile(outputPath, html);
      }
    }

    console.log('✅ Document processing completed!');
  }

  private async processFile(filePath: string, options: DocGenOptions, input: string): Promise<{ document: ProcessedDocument; filePath: string; outputPath: string } | null> {
    try {
      console.log(`📄 Processing: ${path.basename(filePath)}`);

      // Read markdown content
      const markdownContent = await this.fileSystemUtils.readFile(filePath);

      // Parse markdown
      const parseResult = await this.markdownParser.parse(
        markdownContent,
        path.basename(filePath)
      );

      // Get file stats
      const stats = await this.fileSystemUtils.getFileStats(filePath);

      // Generate table of contents
      const toc = this.tocGenerator.generate(parseResult.headings);

      // Create processed document
      const processedDocument: ProcessedDocument = {
        content: parseResult.html,
        metadata: {
          ...parseResult.metadata,
          title: parseResult.metadata.title || path.basename(filePath, path.extname(filePath)),
          fileName: path.basename(filePath),
          lastModified: stats.mtime,
          headings: parseResult.headings,
        },
        toc,
      };

      // Determine output path
      const inputBase = Array.isArray(options.input) ? '.' : 
        (await this.fileSystemUtils.getFileStats(input)).isDirectory() ? 
        input : path.dirname(input);
      
      const outputPath = this.fileSystemUtils.getOutputPath(
        filePath,
        inputBase,
        options.output
      );

      // Add to search index if enabled
      if (options.searchEnabled) {
        this.searchIndexer.addDocument(processedDocument, filePath, options.output, outputPath);
      }

      // Generate HTML (without search index for now)
      const htmlOptions: HtmlGeneratorOptions = {
        theme: options.theme,
        searchEnabled: options.searchEnabled,
        minify: options.minify,
        outputFilePath: outputPath,
        outputDir: options.output,
      };
      const html = await this.htmlGenerator.generate(processedDocument, htmlOptions);

      // Write HTML file
      await this.fileSystemUtils.writeFile(outputPath, html);
      console.log(`✅ Generated: ${path.basename(outputPath)}`);

      return { document: processedDocument, filePath, outputPath };

    } catch (error) {
      console.error(`❌ Error processing ${filePath}: ${(error as Error).message}`);
      throw error;
    }
  }

  private async copyCssFile(outputDir: string): Promise<void> {
    const cssSource = path.join(__dirname, '..', 'styles', 'default.css');
    const cssDestination = path.join(outputDir, 'styles.css');
    await this.fileSystemUtils.copyFile(cssSource, cssDestination);
    console.log('🎨 Copied CSS styles');
  }

  /**
   * Generate index.md files for directories that don't have them
   */
  private async generateDirectoryIndexes(inputPath: string): Promise<void> {
    try {
      await this.indexGenerator.generateDirectoryIndexes(inputPath, inputPath, {
        overwriteExisting: false,
        generateForRoot: true
      });
    } catch (error) {
      console.warn(`⚠️  Warning: Could not generate directory indexes: ${(error as Error).message}`);
    }
  }

}