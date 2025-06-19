# Getting Started with DocGen

DocGenを使い始めるための完全ガイドです。

## インストール

DocGenは複数の方法でインストールできます。

### グローバルインストール

```bash
npm install -g docgen
```

### プロジェクトローカルインストール

```bash
npm install --save-dev docgen
```

### Yarn使用の場合

```bash
yarn global add docgen
# または
yarn add --dev docgen
```

## 最初のドキュメント生成

### ステップ1: Markdownファイルの準備

まず、変換したいMarkdownファイルを用意します：

```markdown
# My First Document

This is **my first** DocGen document.

## Section 1

Content goes here.

### Subsection 1.1

More detailed content.
```

### ステップ2: HTMLの生成

基本的な変換コマンド：

```bash
docgen build my-document.md
```

これにより`my-document.html`が生成されます。

### ステップ3: 出力先の指定

```bash
docgen build my-document.md --output ./dist/
```

## ディレクトリ全体の変換

複数のMarkdownファイルをまとめて変換：

```bash
docgen build docs/ --output website/
```

### ディレクトリ構造の例

```
docs/
├── README.md
├── guides/
│   ├── getting-started.md
│   └── advanced.md
└── api/
    └── reference.md
```

変換後：

```
website/
├── README.html
├── guides/
│   ├── getting-started.html
│   └── advanced.html
├── api/
│   └── reference.html
└── styles.css
```

## オプション

### 基本オプション

- `--output, -o`: 出力ディレクトリを指定
- `--theme`: テーマを指定（デフォルト: default）
- `--no-search`: 検索機能を無効化
- `--watch`: ウォッチモードで実行
- `--minify`: HTMLを圧縮

### 使用例

```bash
# ダークテーマで生成
docgen build docs/ --theme dark

# 検索機能なしで生成
docgen build docs/ --no-search

# ウォッチモードで開発
docgen build docs/ --watch

# 本番用に圧縮
docgen build docs/ --minify
```

## 設定ファイル

`docgen.config.js`で設定を永続化：

```javascript
module.exports = {
  // 出力ディレクトリ
  output: './dist',
  
  // テーマ設定
  theme: 'default',
  
  // 検索機能
  searchEnabled: true,
  
  // HTML圧縮
  minify: false,
  
  // ウォッチモード除外パターン
  ignorePatterns: [
    'node_modules/**',
    '*.tmp'
  ]
};
```

## トラブルシューティング

### よくある問題

**Q: HTMLが生成されない**
- Markdownファイルのパスが正しいか確認
- 出力ディレクトリの権限を確認

**Q: リンクが正しく動作しない**
- 相対パスを使用しているか確認
- ファイル拡張子が`.html`に変換されているか確認

**Q: 検索機能が動かない**
- JavaScriptが有効になっているか確認
- ファイルをHTTPサーバー経由で開いているか確認

## 次のステップ

- [Advanced Usage](advanced-usage.html) - 高度な使用方法
- [API Reference](../api/core.html) - プログラムでの使用
- [Customization](customization.html) - カスタマイズ方法