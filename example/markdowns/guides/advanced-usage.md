# Advanced Usage

DocGenの高度な使用方法について説明します。

## カスタムテーマの作成

独自のテーマを作成して、ドキュメントの見た目をカスタマイズできます。

### テーマディレクトリ構造

```
themes/
└── custom/
    ├── template.hbs
    ├── styles.css
    └── search.js
```

### カスタムCSS

```css
/* themes/custom/styles.css */
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --background: #ffffff;
  --text-color: #1e293b;
}

.header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  padding: 2rem;
}

.sidebar {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.main-content {
  max-width: 65ch;
  line-height: 1.6;
}
```

### Handlebarsテンプレート

```handlebars
{{!-- themes/custom/template.hbs --}}
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{metadata.title}} - Custom Theme</title>
    <link rel="stylesheet" href="{{cssPath}}">
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>{{metadata.title}}</h1>
            {{#if searchEnabled}}
            <div class="search-container">
                <input type="text" id="search-input" placeholder="Search...">
                <div id="search-results"></div>
            </div>
            {{/if}}
        </header>
        
        <div class="layout">
            <aside class="sidebar">
                {{{tocHtml}}}
            </aside>
            
            <main class="main-content">
                {{{content}}}
            </main>
        </div>
    </div>
    
    {{#if searchEnabled}}
    <script src="search.js"></script>
    {{/if}}
</body>
</html>
```

## バッチ処理とワークフロー

### npm scriptsとの連携

```json
{
  "scripts": {
    "docs:build": "docgen build docs/ --output public/",
    "docs:dev": "docgen build docs/ --output public/ --watch",
    "docs:prod": "docgen build docs/ --output public/ --minify",
    "docs:clean": "rm -rf public/"
  }
}
```

### GitHub Actionsでの自動化

```yaml
# .github/workflows/docs.yml
name: Build Documentation

on:
  push:
    branches: [ main ]
    paths: [ 'docs/**' ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build documentation
      run: npm run docs:build
      
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./public
```

## プログラムでの使用

DocGenをNode.jsプログラムから直接使用できます。

### 基本的な使用方法

```javascript
const { DocumentProcessor } = require('docgen');

async function buildDocs() {
  const processor = new DocumentProcessor();
  
  const options = {
    input: './docs',
    output: './public',
    theme: 'default',
    searchEnabled: true,
    minify: false
  };
  
  await processor.processFiles(options);
  console.log('Documentation built successfully!');
}

buildDocs().catch(console.error);
```

### カスタムプラグインの作成

```javascript
// plugins/custom-plugin.js
class CustomPlugin {
  constructor(options = {}) {
    this.options = options;
  }
  
  // Markdownの前処理
  beforeParse(markdown, filename) {
    // カスタム構文の処理
    return markdown.replace(/\{\{version\}\}/g, this.options.version || '1.0.0');
  }
  
  // HTMLの後処理
  afterGenerate(html, filename) {
    // カスタムタグの追加
    return html.replace(
      '</head>',
      '  <meta name="generator" content="DocGen with Custom Plugin">\n</head>'
    );
  }
}

module.exports = CustomPlugin;
```

プラグインの使用：

```javascript
const CustomPlugin = require('./plugins/custom-plugin');

const processor = new DocumentProcessor();
processor.use(new CustomPlugin({ version: '2.1.0' }));
```

## パフォーマンスの最適化

### 大量ファイルの処理

```javascript
const options = {
  input: './docs',
  output: './public',
  
  // 並列処理数を制限
  concurrency: 4,
  
  // 除外パターン
  ignore: [
    '**/node_modules/**',
    '**/*.tmp',
    '**/.*'
  ],
  
  // 増分ビルド
  incremental: true,
  
  // キャッシュ設定
  cache: {
    enabled: true,
    directory: '.docgen-cache'
  }
};
```

### メモリ使用量の最適化

```javascript
// ストリーミング処理
const processor = new DocumentProcessor({
  streaming: true,
  maxMemory: '512MB'
});

// 大きなファイルを分割処理
processor.on('file', (filename) => {
  console.log(`Processing: ${filename}`);
});

processor.on('complete', (stats) => {
  console.log(`Processed ${stats.fileCount} files in ${stats.duration}ms`);
});
```

## 高度な設定

### 環境別設定

```javascript
// docgen.config.js
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  input: './docs',
  output: isProd ? './dist' : './dev-build',
  
  theme: isDev ? 'debug' : 'default',
  searchEnabled: true,
  minify: isProd,
  
  // 開発時のみウォッチモード
  watch: isDev,
  
  // 本番時のみ圧縮とキャッシュ
  ...(isProd && {
    minify: true,
    cache: true,
    cdn: 'https://cdn.example.com'
  }),
  
  // 開発時のみデバッグ機能
  ...(isDev && {
    debug: true,
    sourceMap: true,
    liveReload: true
  })
};
```

### カスタムマークダウン拡張

```javascript
// カスタムマークダウン拡張の例
const processor = new DocumentProcessor();

// コードブロックの拡張
processor.addMarkdownExtension({
  name: 'mermaid',
  pattern: /^```mermaid\n([\s\S]*?)\n```$/gm,
  replacement: (match, code) => {
    return `<div class="mermaid">${code}</div>`;
  }
});

// カスタムショートコード
processor.addShortcode('warning', (content, args) => {
  return `<div class="warning">${content}</div>`;
});
```

## セキュリティ考慮事項

### HTMLサニタイゼーション

```javascript
const processor = new DocumentProcessor({
  sanitize: {
    allowedTags: ['b', 'i', 'em', 'strong', 'a'],
    allowedAttributes: {
      'a': ['href', 'title']
    }
  }
});
```

### CSP設定

```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline';">
```

## 次のステップ

- [API Reference](../api/) - 詳細なAPI仕様
- [Plugin Development](plugin-development.html) - プラグイン開発ガイド
- [Contributing](../contributing.html) - 開発への参加方法