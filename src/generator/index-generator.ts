import * as path from 'path';
import * as fs from 'fs/promises';
import { FileSystemUtils } from '../utils/file-system';

export interface DirectoryInfo {
  path: string;
  name: string;
  files: FileInfo[];
  subdirectories: DirectoryInfo[];
}

export interface FileInfo {
  name: string;
  path: string;
  title?: string;
  description?: string;
}

export class IndexGenerator {
  private fileSystemUtils: FileSystemUtils;

  constructor() {
    this.fileSystemUtils = new FileSystemUtils();
  }

  /**
   * ディレクトリ構造を解析して目次用のデータ構造を生成
   */
  public async analyzeDirectory(inputPath: string): Promise<DirectoryInfo> {
    const stats = await fs.stat(inputPath);
    if (!stats.isDirectory()) {
      throw new Error(`${inputPath} is not a directory`);
    }

    const markdownFiles = await this.fileSystemUtils.getMarkdownFiles(inputPath);
    const allFiles = await fs.readdir(inputPath, { withFileTypes: true });

    // パスを正規化して比較
    const normalizedInputPath = path.resolve(inputPath);

    // 現在のディレクトリのMarkdownファイル
    const currentDirFiles = markdownFiles
      .filter(file => path.resolve(path.dirname(file)) === normalizedInputPath)
      .map(file => ({
        name: path.basename(file),
        path: file,
        title: this.extractTitleFromFileName(path.basename(file))
      }));

    // サブディレクトリを再帰的に処理
    const subdirectories: DirectoryInfo[] = [];
    for (const entry of allFiles) {
      if (entry.isDirectory()) {
        const subDirPath = path.join(inputPath, entry.name);
        const normalizedSubDirPath = path.resolve(subDirPath);
        const subDirFiles = markdownFiles.filter(file => 
          path.resolve(file).startsWith(normalizedSubDirPath + path.sep)
        );
        
        if (subDirFiles.length > 0) {
          const subDirInfo = await this.analyzeDirectory(subDirPath);
          subdirectories.push(subDirInfo);
        }
      }
    }

    return {
      path: inputPath,
      name: path.basename(inputPath),
      files: currentDirFiles,
      subdirectories
    };
  }

  /**
   * ディレクトリ情報からインデックスMarkdownを生成
   */
  public generateIndexMarkdown(dirInfo: DirectoryInfo, options: {
    title?: string;
    includeSubdirectories?: boolean;
    includeDescription?: boolean;
  } = {}): string {
    const {
      title = `${this.capitalizeFirst(dirInfo.name)} Index`,
      includeSubdirectories = true,
      includeDescription = true
    } = options;

    let markdown = `# ${title}\n\n`;

    if (includeDescription) {
      markdown += `This page provides an overview of all documents in the ${dirInfo.name} section.\n\n`;
    }

    // 現在のディレクトリのファイル
    if (dirInfo.files.length > 0) {
      markdown += `## Documents\n\n`;
      
      for (const file of dirInfo.files) {
        if (file.name.toLowerCase() === 'readme.md') continue; // README.mdは除外
        
        const linkPath = this.getRelativeLinkPath(file.name);
        const displayTitle = file.title || this.extractTitleFromFileName(file.name);
        markdown += `- [${displayTitle}](${linkPath})\n`;
      }
      markdown += '\n';
    }

    // サブディレクトリ
    if (includeSubdirectories && dirInfo.subdirectories.length > 0) {
      markdown += `## Sections\n\n`;
      
      for (const subdir of dirInfo.subdirectories) {
        const sectionName = this.capitalizeFirst(subdir.name);
        const linkPath = `${subdir.name}/`;
        
        markdown += `### [${sectionName}](${linkPath})\n\n`;
        
        if (subdir.files.length > 0) {
          markdown += `Documents in this section:\n\n`;
          for (const file of subdir.files.slice(0, 5)) { // 最大5件まで表示
            if (file.name.toLowerCase() === 'readme.md') continue;
            
            const linkPath = `${subdir.name}/${this.getRelativeLinkPath(file.name)}`;
            const displayTitle = file.title || this.extractTitleFromFileName(file.name);
            markdown += `- [${displayTitle}](${linkPath})\n`;
          }
          
          if (subdir.files.length > 5) {
            markdown += `- ... and ${subdir.files.length - 5} more documents\n`;
          }
          markdown += '\n';
        }
      }
    }

    // フッター
    if (includeDescription) {
      markdown += `---\n\n`;
      markdown += `*This index was automatically generated on ${new Date().toLocaleDateString()}.*\n`;
    }

    return markdown;
  }

  /**
   * 各ディレクトリにindex.mdファイルを生成
   */
  public async generateDirectoryIndexes(
    inputPath: string, 
    _outputPath: string,
    options: {
      overwriteExisting?: boolean;
      generateForRoot?: boolean;
    } = {}
  ): Promise<void> {
    const {
      overwriteExisting = true,
      generateForRoot = true
    } = options;

    const dirInfo = await this.analyzeDirectory(inputPath);
    
    // ルートディレクトリのindex.md生成
    if (generateForRoot) {
      await this.generateIndexForDirectory(dirInfo, inputPath, overwriteExisting);
    }

    // サブディレクトリのindex.md生成（再帰的）
    await this.generateSubdirectoryIndexes(dirInfo, inputPath, overwriteExisting);
  }

  /**
   * サブディレクトリのindex.mdを再帰的に生成
   */
  private async generateSubdirectoryIndexes(
    dirInfo: DirectoryInfo,
    _basePath: string,
    overwriteExisting: boolean
  ): Promise<void> {
    for (const subdir of dirInfo.subdirectories) {
      // サブディレクトリのindex.mdを生成
      await this.generateIndexForDirectory(subdir, subdir.path, overwriteExisting);
      
      // さらにサブディレクトリがある場合は再帰処理
      if (subdir.subdirectories.length > 0) {
        await this.generateSubdirectoryIndexes(subdir, subdir.path, overwriteExisting);
      }
    }
  }

  /**
   * 単一ディレクトリ用のindex.mdを生成
   */
  private async generateIndexForDirectory(
    dirInfo: DirectoryInfo, 
    outputPath: string, 
    overwriteExisting: boolean
  ): Promise<void> {
    const indexPath = path.join(outputPath, 'index.md');
    
    // 既存ファイルのチェック
    const indexExists = await fs.access(indexPath).then(() => true).catch(() => false);
    if (indexExists && !overwriteExisting) {
      console.log(`⏭️  Skipping ${indexPath} (already exists)`);
      return;
    }

    const markdown = this.generateIndexMarkdown(dirInfo, {
      title: dirInfo.name === '.' ? 'Documentation Index' : `${this.capitalizeFirst(dirInfo.name)} Documentation`,
      includeSubdirectories: true,
      includeDescription: true
    });

    await fs.writeFile(indexPath, markdown, 'utf-8');
    console.log(`📄 Generated index: ${indexPath}`);
  }

  /**
   * ファイル名からタイトルを抽出
   */
  private extractTitleFromFileName(fileName: string): string {
    const nameWithoutExt = path.basename(fileName, path.extname(fileName));
    
    // ケバブケースやアンダースコアをスペースに変換
    return nameWithoutExt
      .replace(/[-_]/g, ' ')
      .split(' ')
      .map(word => this.capitalizeFirst(word))
      .join(' ');
  }

  /**
   * 最初の文字を大文字にする
   */
  private capitalizeFirst(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Markdownファイル名からHTMLリンクパスを生成
   */
  private getRelativeLinkPath(fileName: string): string {
    return fileName.replace(/\.md$/, '.html');
  }

  /**
   * Markdownファイルから実際のタイトルを抽出
   */
  public async extractTitleFromMarkdownFile(filePath: string): Promise<string | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      
      for (const line of lines.slice(0, 10)) { // 最初の10行をチェック
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
          return trimmed.substring(2).trim();
        }
      }
      
      return null;
    } catch {
      return null;
    }
  }

  /**
   * ディレクトリ内の全Markdownファイルのタイトルを抽出してFileInfoを更新
   */
  public async enrichWithTitles(dirInfo: DirectoryInfo): Promise<DirectoryInfo> {
    // 現在のディレクトリのファイルのタイトルを抽出
    for (const file of dirInfo.files) {
      const actualTitle = await this.extractTitleFromMarkdownFile(file.path);
      if (actualTitle) {
        file.title = actualTitle;
      }
    }

    // サブディレクトリも再帰的に処理
    const enrichedSubdirs = await Promise.all(
      dirInfo.subdirectories.map(subdir => this.enrichWithTitles(subdir))
    );

    return {
      ...dirInfo,
      subdirectories: enrichedSubdirs
    };
  }
}