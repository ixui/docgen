import * as path from 'path';

export class PathUtils {
  public static getRelativePath(from: string, to: string): string {
    return path.relative(path.dirname(from), to);
  }

  public static getCssPath(htmlFilePath: string, outputDir: string): string {
    const cssPath = path.join(outputDir, 'styles.css');
    const relativePath = this.getRelativePath(htmlFilePath, cssPath);
    
    // Ensure forward slashes for web paths
    return relativePath.replace(/\\/g, '/');
  }

  public static normalizeWebPath(filePath: string): string {
    return filePath.replace(/\\/g, '/');
  }

  public static getDepthFromRoot(filePath: string, rootPath: string): number {
    const relativePath = path.relative(rootPath, filePath);
    const segments = relativePath.split(path.sep).filter(segment => segment !== '');
    return segments.length - 1; // Subtract 1 because we count directories, not the file itself
  }

  public static getPathToRoot(depth: number): string {
    if (depth === 0) return './';
    return '../'.repeat(depth);
  }
}