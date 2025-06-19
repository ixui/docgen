import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';

export class FileSystemUtils {
  public async readFile(filePath: string): Promise<string> {
    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
    }
  }

  public async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await this.ensureDirectoryExists(path.dirname(filePath));
      await fs.writeFile(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file ${filePath}: ${(error as Error).message}`);
    }
  }

  public async copyFile(source: string, destination: string): Promise<void> {
    try {
      await this.ensureDirectoryExists(path.dirname(destination));
      await fs.copyFile(source, destination);
    } catch (error) {
      throw new Error(`Failed to copy file from ${source} to ${destination}: ${(error as Error).message}`);
    }
  }

  public async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dirPath}: ${(error as Error).message}`);
    }
  }

  public async getMarkdownFiles(inputPath: string): Promise<string[]> {
    const stats = await fs.stat(inputPath);
    
    if (stats.isFile()) {
      if (this.isMarkdownFile(inputPath)) {
        return [inputPath];
      }
      throw new Error(`Input file ${inputPath} is not a markdown file`);
    }
    
    if (stats.isDirectory()) {
      const pattern = path.join(inputPath, '**/*.{md,markdown}');
      return await glob(pattern, { absolute: true });
    }
    
    throw new Error(`Input path ${inputPath} is neither a file nor a directory`);
  }

  private isMarkdownFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.md' || ext === '.markdown';
  }

  public async getFileStats(filePath: string): Promise<any> {
    try {
      return await fs.stat(filePath);
    } catch (error) {
      throw new Error(`Failed to get file stats for ${filePath}: ${(error as Error).message}`);
    }
  }

  public async cleanDirectory(dirPath: string): Promise<void> {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
      await this.ensureDirectoryExists(dirPath);
    } catch (error) {
      throw new Error(`Failed to clean directory ${dirPath}: ${(error as Error).message}`);
    }
  }

  public getRelativePath(from: string, to: string): string {
    return path.relative(from, to);
  }

  public getOutputPath(inputFile: string, inputBase: string, outputBase: string): string {
    const relativePath = path.relative(inputBase, inputFile);
    const outputPath = path.join(outputBase, relativePath);
    return outputPath.replace(/\.(md|markdown)$/i, '.html');
  }
}