# 高度な使用方法

DocGenの高度な機能について説明します。

## テーマのカスタマイズ

### CSSのカスタマイズ

独自のCSSを作成できます：

```css
.custom-header {
  background-color: #2196F3;
  color: white;
}
```

### テンプレートのカスタマイズ

Handlebarsテンプレートを使用してカスタマイズ：

```handlebars
<div class="custom-layout">
  <header>{{metadata.title}}</header>
  <main>{{{content}}}</main>
</div>
```

## バッチ処理

### 複数ファイルの処理

```bash
docgen build docs/ --output dist/
```

### ウォッチモード

```bash
docgen build docs/ --watch
```

## プラグイン

DocGenはプラグインシステムをサポートします（将来実装予定）。

### カスタムプラグイン

```javascript
class CustomPlugin {
  apply(compiler) {
    // プラグインロジック
  }
}
```