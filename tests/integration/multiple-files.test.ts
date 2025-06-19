import { DocumentProcessor } from '../../src/processor/document-processor';
import { FileSystemUtils } from '../../src/utils/file-system';
import { DocGenOptions } from '../../src/types';
import * as path from 'path';
import * as fs from 'fs/promises';

describe('Multiple Files Integration', () => {
  let processor: DocumentProcessor;
  let fileUtils: FileSystemUtils;
  const testOutputDir = path.join(__dirname, '../temp-output');
  const fixturesDir = path.join(__dirname, '../fixtures/docs');

  beforeEach(async () => {
    processor = new DocumentProcessor();
    fileUtils = new FileSystemUtils();
    
    // Clean up previous test outputs
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch (error) {
      // Directory might not exist, which is fine
    }
  });

  afterEach(async () => {
    // Clean up test outputs
    try {
      await fs.rm(testOutputDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Directory Processing', () => {
    it('should process all markdown files in a directory', async () => {
      const options: DocGenOptions = {
        input: fixturesDir,
        output: testOutputDir,
        theme: 'default',
        searchEnabled: true,
        watch: false,
        minify: false,
      };

      await processor.processFiles(options);

      // Check that all expected HTML files were created
      const outputFiles = await fileUtils.getMarkdownFiles(fixturesDir);
      
      for (const mdFile of outputFiles) {
        const relativePath = path.relative(fixturesDir, mdFile);
        const htmlPath = path.join(testOutputDir, relativePath.replace(/\.md$/, '.html'));
        
        // Check that HTML file exists
        const htmlExists = await fs.access(htmlPath).then(() => true).catch(() => false);
        expect(htmlExists).toBe(true);
        
        // Check that HTML file has content
        const htmlContent = await fs.readFile(htmlPath, 'utf-8');
        expect(htmlContent.length).toBeGreaterThan(0);
        expect(htmlContent).toContain('<!DOCTYPE html>');
        expect(htmlContent).toContain('<title>');
        expect(htmlContent).not.toContain('[object Object]');
      }

      // Check that CSS file was copied
      const cssPath = path.join(testOutputDir, 'styles.css');
      const cssExists = await fs.access(cssPath).then(() => true).catch(() => false);
      expect(cssExists).toBe(true);
    });

    it('should maintain directory structure in output', async () => {
      const options: DocGenOptions = {
        input: fixturesDir,
        output: testOutputDir,
        theme: 'default',
        searchEnabled: true,
        watch: false,
        minify: false,
      };

      await processor.processFiles(options);

      // Check that subdirectories are maintained
      const expectedDirs = ['guides', 'api', 'tutorials'];
      for (const dir of expectedDirs) {
        const dirPath = path.join(testOutputDir, dir);
        const dirExists = await fs.access(dirPath).then(() => true).catch(() => false);
        expect(dirExists).toBe(true);
      }

      // Check specific files in subdirectories
      const expectedFiles = [
        'guides/getting-started.html',
        'guides/advanced-usage.html',
        'api/parser.html',
        'api/generator.html',
        'tutorials/basic-tutorial.html',
        'tutorials/advanced-tutorial.html',
      ];

      for (const file of expectedFiles) {
        const filePath = path.join(testOutputDir, file);
        const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
        expect(fileExists).toBe(true);
      }
    });

    it('should generate valid TOCs for all files', async () => {
      const options: DocGenOptions = {
        input: fixturesDir,
        output: testOutputDir,
        theme: 'default',
        searchEnabled: true,
        watch: false,
        minify: false,
      };

      await processor.processFiles(options);

      // Check a few specific files for valid TOC content
      const filesToCheck = [
        'README.html',
        'guides/getting-started.html',
        'api/parser.html',
      ];

      for (const file of filesToCheck) {
        const filePath = path.join(testOutputDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check that TOC structure exists
        expect(content).toContain('class="toc"');
        expect(content).toContain('class="toc-title"');
        expect(content).toContain('class="toc-list"');
        
        // Check that no [object Object] appears in TOC
        expect(content).not.toContain('[object Object]');
        expect(content).not.toContain('object-object');
        
        // Check that TOC links are valid
        const tocLinks = content.match(/href="#[^"]+"/g) || [];
        expect(tocLinks.length).toBeGreaterThan(0);
        
        // Verify that corresponding heading IDs exist
        tocLinks.forEach(link => {
          const id = link.match(/href="#([^"]+)"/)?.[1];
          if (id) {
            expect(content).toContain(`id="${id}"`);
          }
        });
      }
    });

    it('should handle files with various encoding and special characters', async () => {
      const options: DocGenOptions = {
        input: fixturesDir,
        output: testOutputDir,
        theme: 'default',
        searchEnabled: true,
        watch: false,
        minify: false,
      };

      await processor.processFiles(options);

      // Check Japanese content is properly handled
      const readmePath = path.join(testOutputDir, 'README.html');
      const readmeContent = await fs.readFile(readmePath, 'utf-8');
      
      expect(readmeContent).toContain('DocGen テストドキュメント');
      expect(readmeContent).toContain('ガイド');
      expect(readmeContent).toContain('チュートリアル');
      
      // Check that search functionality is accessible via search button
      expect(readmeContent).toContain('🔍 検索');
      
      // Check that index.html contains search functionality
      const indexContent = await fs.readFile(path.join(testOutputDir, 'index.html'), 'utf-8');
      expect(indexContent).toContain('lunr.js'); // Search script should be present in index only
      expect(indexContent).toContain('search-input');
      
      // Check that malicious scripts are not present (this would be in markdown content)
      expect(readmeContent).not.toContain('<script>alert');
    });

    it('should handle nested directory structures', async () => {
      const options: DocGenOptions = {
        input: fixturesDir,
        output: testOutputDir,
        theme: 'default',
        searchEnabled: true,
        watch: false,
        minify: false,
      };

      await processor.processFiles(options);

      // Count total markdown files processed
      const markdownFiles = await fileUtils.getMarkdownFiles(fixturesDir);
      expect(markdownFiles.length).toBeGreaterThan(5); // We created 7 files

      // Count total HTML files generated
      const htmlFiles: string[] = [];
      const collectHtmlFiles = async (dir: string): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await collectHtmlFiles(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.html')) {
            htmlFiles.push(fullPath);
          }
        }
      };

      await collectHtmlFiles(testOutputDir);
      expect(htmlFiles.length).toBe(markdownFiles.length);
    });
  });

  describe('Performance and Scale', () => {
    it('should process multiple files efficiently', async () => {
      const startTime = Date.now();
      
      const options: DocGenOptions = {
        input: fixturesDir,
        output: testOutputDir,
        theme: 'default',
        searchEnabled: true,
        watch: false,
        minify: false,
      };

      await processor.processFiles(options);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(processingTime).toBeLessThan(10000); // 10 seconds
      
      // Log performance for monitoring
      console.log(`Processed multiple files in ${processingTime}ms`);
    });

    it('should maintain consistent output quality across all files', async () => {
      const options: DocGenOptions = {
        input: fixturesDir,
        output: testOutputDir,
        theme: 'default',
        searchEnabled: true,
        watch: false,
        minify: false,
      };

      await processor.processFiles(options);

      // Collect all HTML files
      const htmlFiles: string[] = [];
      const collectHtmlFiles = async (dir: string): Promise<void> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await collectHtmlFiles(fullPath);
          } else if (entry.isFile() && entry.name.endsWith('.html')) {
            htmlFiles.push(fullPath);
          }
        }
      };

      await collectHtmlFiles(testOutputDir);

      // Check quality metrics for each file
      for (const htmlFile of htmlFiles) {
        const content = await fs.readFile(htmlFile, 'utf-8');
        
        // All files should have proper HTML structure
        expect(content).toContain('<!DOCTYPE html>');
        expect(content).toContain('<html');
        expect(content).toContain('<head>');
        expect(content).toContain('<body>');
        expect(content).toContain('</html>');
        
        // All files should have CSS link (may be relative)
        expect(content).toMatch(/href="[\.\/]*styles\.css"/);
        
        // No files should contain processing errors in the rendered content
        expect(content).not.toContain('[object Object]');
        
        // Check for undefined only in non-script portions
        // Extract content outside of script tags
        const nonScriptContent = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        // Check that rendered content doesn't contain 'undefined'
        // (it's OK for JavaScript code to contain 'undefined')
        expect(nonScriptContent).not.toContain('undefined');
        
        // All files should have TOC structure (even if empty), except search index pages
        if (!htmlFile.endsWith('index.html')) {
          expect(content).toContain('class="sidebar"');
        }
      }
    });
  });
});