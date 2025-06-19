#!/usr/bin/env node

import { Command } from 'commander';
import { version } from '../package.json';
import { DocGenOptions } from './types';
import { DocumentProcessor } from './processor/document-processor';

const program = new Command();

program
  .name('docgen')
  .description('CLI tool to convert Markdown files to beautiful HTML documents')
  .version(version);

program
  .command('build <input>')
  .description('Convert markdown files to HTML')
  .option('-o, --output <path>', 'Output directory', './dist')
  .option('-t, --theme <name>', 'Theme to use', 'default')
  .option('--no-search', 'Disable search functionality')
  .option('-w, --watch', 'Watch for changes', false)
  .option('-m, --minify', 'Minify output', false)
  .action(async (input: string, options: { output?: string; theme?: string; search?: boolean; watch?: boolean; minify?: boolean }) => {
    const fullOptions: DocGenOptions = {
      input,
      output: options.output ?? './dist',
      theme: options.theme ?? 'default',
      searchEnabled: options.search !== false,
      watch: options.watch ?? false,
      minify: options.minify ?? false,
    };

    try {
      const processor = new DocumentProcessor();
      await processor.processFiles(fullOptions);
    } catch (error) {
      console.error('Error:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();