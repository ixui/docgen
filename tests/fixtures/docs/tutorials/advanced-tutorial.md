# 高度なチュートリアル

より複雑なドキュメントサイトの構築方法を学びます。

## 大規模ドキュメントの管理

### ディレクトリ構造の設計

```
docs/
├── getting-started/
│   ├── installation.md
│   ├── quick-start.md
│   └── configuration.md
├── guides/
│   ├── basic-usage.md
│   ├── advanced-features.md
│   └── troubleshooting.md
├── api/
│   ├── core/
│   │   ├── parser.md
│   │   └── generator.md
│   └── plugins/
│       ├── search.md
│       └── themes.md
└── examples/
    ├── simple-site.md
    └── complex-site.md
```

## 相互参照とリンク

### 内部リンク

```markdown
詳細は[APIリファレンス](../api/core/parser.md)を参照してください。
```

### アンカーリンク

```markdown
[概要セクション](#概要)に戻る
```

## メタデータの活用

### フロントマター（将来実装予定）

```yaml
---
title: "カスタムタイトル"
description: "ページの説明"
date: 2024-01-01
---

# ページ内容

ここから本文が始まります。
```

## カスタムテーマの作成

### テーマディレクトリ構造

```
themes/
└── custom/
    ├── template.hbs
    ├── styles.css
    └── search.js
```

### カスタムテンプレート

```handlebars
<!DOCTYPE html>
<html>
<head>
    <title>{{metadata.title}}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="custom-wrapper">
        <nav>{{{tocHtml}}}</nav>
        <main>{{{content}}}</main>
    </div>
</body>
</html>
```

## 自動化とCI/CD

### GitHub Actions

```yaml
name: Build Docs
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install DocGen
        run: npm install -g docgen
      - name: Build Documentation
        run: docgen build docs/ --output dist/
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```