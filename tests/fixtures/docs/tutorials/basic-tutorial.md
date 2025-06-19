# 基本チュートリアル

DocGenを使って最初のドキュメントサイトを作成してみましょう。

## ステップ 1: プロジェクトの準備

### 1.1 ディレクトリの作成

```bash
mkdir my-docs
cd my-docs
```

### 1.2 ディレクトリ構造

```
my-docs/
├── docs/
│   ├── index.md
│   ├── guide.md
│   └── api.md
└── dist/
```

## ステップ 2: マークダウンファイルの作成

### 2.1 index.md

```markdown
# 私のプロジェクト

これはプロジェクトのメインページです。

## 概要

このプロジェクトについて説明します。
```

### 2.2 guide.md

```markdown
# ガイド

使用方法を説明します。

## インストール

```bash
npm install my-project
```

## 使用方法

基本的な使用方法を説明します。
```

## ステップ 3: ドキュメントの生成

### 3.1 基本的な生成

```bash
docgen build docs/
```

### 3.2 出力先の指定

```bash
docgen build docs/ --output dist/
```

### 3.3 テーマの指定

```bash
docgen build docs/ --theme dark
```

## ステップ 4: 結果の確認

生成されたHTMLファイルをブラウザで開いて確認します。

### 生成されるファイル

- `index.html` - メインページ
- `guide.html` - ガイドページ
- `api.html` - APIページ
- `styles.css` - スタイルシート

## 次のステップ

- [高度な使用方法](../guides/advanced-usage.md)を学ぶ
- [API リファレンス](../api/)を確認する