import * as path from 'path';

export class PathUtils {
  public static normalizePath(inputPath: string): string {
    // Convert Windows paths to Unix-style paths when running on WSL/Linux
    if (process.platform === 'linux' && /^[A-Za-z]:\\/.test(inputPath)) {
      // Convert C:\ to /mnt/c/
      const driveLetter = inputPath.charAt(0).toLowerCase();
      const pathWithoutDrive = inputPath.substring(3).replace(/\\/g, '/');
      return `/mnt/${driveLetter}/${pathWithoutDrive}`;
    }
    
    // For other cases, just normalize the path
    return path.normalize(inputPath);
  }
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