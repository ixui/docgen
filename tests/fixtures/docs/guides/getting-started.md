# 始めましょう

DocGenを使用してドキュメントを生成する方法を学びます。

## 前提条件

- Node.js 18.0.0以上
- npm または yarn

## インストール

### グローバルインストール

```bash
npm install -g docgen
```

### ローカルインストール

```bash
npm install --save-dev docgen
```

## 最初のドキュメント

### 1. マークダウンファイルの準備

まず、マークダウンファイルを作成します：

```markdown
# 私のドキュメント

これは最初のドキュメントです。

## セクション1

内容を書きます。
```

### 2. HTMLの生成

```bash
docgen build my-doc.md
```

## 設定

DocGenは設定ファイルをサポートしています。

### docgen.config.js

```javascript
module.exports = {
  theme: 'default',
  searchEnabled: true,
  minify: false
};
```