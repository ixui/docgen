# Core API Reference

DocGenのコアAPIリファレンスです。

## DocumentProcessor

メインのドキュメント処理クラスです。

### Constructor

```typescript
constructor(options?: ProcessorOptions)
```

#### ProcessorOptions

```typescript
interface ProcessorOptions {
  theme?: string;
  searchEnabled?: boolean;
  minify?: boolean;
  plugins?: Plugin[];
  extensions?: Extension[];
}
```

### Methods

#### processFiles(options)

複数のファイルまたはディレクトリを処理します。

```typescript
async processFiles(options: DocGenOptions): Promise<void>
```

**Parameters:**

- `options.input` (string | string[]) - 入力ファイルまたはディレクトリ
- `options.output` (string) - 出力ディレクトリ
- `options.theme` (string) - 使用するテーマ名
- `options.searchEnabled` (boolean) - 検索機能の有効/無効
- `options.watch` (boolean) - ウォッチモードの有効/無効
- `options.minify` (boolean) - HTML圧縮の有効/無効

**Example:**

```javascript
const processor = new DocumentProcessor();

await processor.processFiles({
  input: './docs',
  output: './public',
  theme: 'default',
  searchEnabled: true,
  watch: false,
  minify: false
});
```

#### processFile(filePath, options)

単一ファイルを処理します。

```typescript
async processFile(
  filePath: string, 
  options: DocGenOptions, 
  input: string
): Promise<ProcessedDocument | null>
```

**Returns:** 処理されたドキュメントオブジェクト

#### use(plugin)

プラグインを追加します。

```typescript
use(plugin: Plugin): DocumentProcessor
```

### Events

DocumentProcessorはEventEmitterを継承しており、以下のイベントを発生させます：

```javascript
processor.on('file', (filename) => {
  console.log(`Processing: ${filename}`);
});

processor.on('complete', (stats) => {
  console.log(`Completed: ${stats.fileCount} files`);
});

processor.on('error', (error) => {
  console.error('Processing error:', error);
});
```

## MarkdownParser

Markdownファイルの解析を行うクラスです。

### Constructor

```typescript
constructor()
```

### Methods

#### parse(markdown, fileName)

Markdownテキストを解析してHTMLと メタデータを生成します。

```typescript
async parse(markdown: string, fileName: string): Promise<ParseResult>
```

**Parameters:**

- `markdown` (string) - 解析するMarkdownテキスト
- `fileName` (string) - ファイル名（メタデータ生成用）

**Returns:**

```typescript
interface ParseResult {
  html: string;
  headings: Heading[];
  metadata: Partial<DocumentMetadata>;
}
```

**Example:**

```javascript
const parser = new MarkdownParser();
const result = await parser.parse('# Hello World', 'hello.md');

console.log(result.html);     // '<h1 id="hello-world">Hello World</h1>'
console.log(result.headings); // [{ id: 'hello-world', text: 'Hello World', level: 1 }]
```

## HtmlGenerator

HTMLドキュメントの生成を行うクラスです。

### Constructor

```typescript
constructor()
```

### Methods

#### loadTemplate(themeName)

指定されたテーマのテンプレートを読み込みます。

```typescript
async loadTemplate(themeName: string): Promise<void>
```

#### generate(document, options)

処理済みドキュメントからHTMLを生成します。

```typescript
async generate(
  document: ProcessedDocument, 
  options: HtmlGeneratorOptions
): Promise<string>
```

**Parameters:**

```typescript
interface HtmlGeneratorOptions {
  theme: string;
  searchEnabled: boolean;
  minify: boolean;
  outputFilePath?: string;
  outputDir?: string;
}
```

## TocGenerator

目次（Table of Contents）の生成を行うクラスです。

### Methods

#### generate(headings)

見出しの配列から目次構造を生成します。

```typescript
generate(headings: Heading[]): TableOfContents
```

#### renderTocHtml(toc)

目次構造をHTMLとしてレンダリングします。

```typescript
renderTocHtml(toc: TableOfContents): string
```

## SearchIndexer

検索インデックスの生成を行うクラスです。

### Methods

#### addDocument(document)

ドキュメントを検索インデックスに追加します。

```typescript
addDocument(document: {
  id: string;
  title: string;
  content: string;
  url: string;
}): void
```

#### generateIndex()

検索インデックスを生成します。

```typescript
generateIndex(): SearchIndex
```

## Type Definitions

### Heading

```typescript
interface Heading {
  id: string;
  text: string;
  level: number;
  children?: Heading[];
}
```

### DocumentMetadata

```typescript
interface DocumentMetadata {
  title: string;
  fileName: string;
  lastModified?: Date;
  headings: Heading[];
}
```

### ProcessedDocument

```typescript
interface ProcessedDocument {
  content: string;
  metadata: DocumentMetadata;
  toc: TableOfContents;
  searchIndex?: SearchIndex;
}
```

### TableOfContents

```typescript
interface TableOfContents {
  items: TocItem[];
}

interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}
```

### Plugin Interface

```typescript
interface Plugin {
  name: string;
  beforeParse?(markdown: string, filename: string): string;
  afterParse?(result: ParseResult, filename: string): ParseResult;
  beforeGenerate?(document: ProcessedDocument, options: HtmlGeneratorOptions): ProcessedDocument;
  afterGenerate?(html: string, filename: string): string;
}
```

## Error Handling

DocGenは以下のエラータイプを提供します：

```typescript
class DocGenError extends Error {
  constructor(message: string, filename?: string) {
    super(message);
    this.name = 'DocGenError';
    this.filename = filename;
  }
}

class ParseError extends DocGenError {
  constructor(message: string, filename: string, line?: number) {
    super(message, filename);
    this.name = 'ParseError';
    this.line = line;
  }
}

class GenerationError extends DocGenError {
  constructor(message: string, filename: string) {
    super(message, filename);
    this.name = 'GenerationError';
  }
}
```

## Utilities

### FileSystemUtils

```typescript
class FileSystemUtils {
  async getMarkdownFiles(directory: string): Promise<string[]>
  async getFileStats(filePath: string): Promise<fs.Stats>
  async writeFile(filePath: string, content: string): Promise<void>
  async copyFile(source: string, destination: string): Promise<void>
  getOutputPath(inputPath: string, inputBase: string, outputDir: string): string
}
```

### PathUtils

```typescript
class PathUtils {
  static getCssPath(outputFilePath: string, outputDir: string): string
  static getRelativePath(from: string, to: string): string
  static ensureDirectory(dirPath: string): Promise<void>
}
```

## Configuration

### docgen.config.js

```javascript
module.exports = {
  // 基本設定
  input: './docs',
  output: './public',
  theme: 'default',
  
  // 機能設定
  searchEnabled: true,
  minify: false,
  watch: false,
  
  // 除外パターン
  ignore: [
    'node_modules/**',
    '**/*.tmp'
  ],
  
  // プラグイン
  plugins: [
    require('./plugins/custom-plugin')
  ],
  
  // カスタム設定
  customData: {
    siteName: 'My Documentation',
    version: '1.0.0'
  }
};
```

## CLI Integration

プログラムからCLIコマンドを実行：

```javascript
const { spawn } = require('child_process');

function buildDocs(options) {
  return new Promise((resolve, reject) => {
    const args = ['build', options.input];
    if (options.output) args.push('--output', options.output);
    if (options.theme) args.push('--theme', options.theme);
    if (options.watch) args.push('--watch');
    
    const process = spawn('docgen', args);
    
    process.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`DocGen exited with code ${code}`));
    });
  });
}
```

## Related

- [Getting Started Guide](../guides/getting-started.html)
- [Advanced Usage](../guides/advanced-usage.html)
- [Plugin Development Guide](plugin-development.html)