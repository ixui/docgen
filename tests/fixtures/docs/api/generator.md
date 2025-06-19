# Generator API

HTML生成とTOC生成のAPIリファレンス。

## HtmlGenerator

HTMLを生成するクラス。

### メソッド

#### loadTemplate(themeName)

テーマテンプレートを読み込みます。

**パラメータ:**

- `themeName` (string) - テーマ名

**戻り値:**

`Promise<void>`

#### generate(document, options)

ドキュメントからHTMLを生成します。

**パラメータ:**

- `document` (ProcessedDocument) - 処理済みドキュメント
- `options` (HtmlGeneratorOptions) - 生成オプション

**戻り値:**

`Promise<string>` - 生成されたHTML

## TocGenerator

目次を生成するクラス。

### メソッド

#### generate(headings)

見出しから目次を生成します。

**パラメータ:**

- `headings` (Heading[]) - 見出しの配列

**戻り値:**

`TableOfContents` - 目次オブジェクト

**例:**

```typescript
const tocGenerator = new TocGenerator();
const toc = tocGenerator.generate(headings);
```

#### renderTocHtml(toc)

目次をHTMLとしてレンダリングします。

**パラメータ:**

- `toc` (TableOfContents) - 目次オブジェクト

**戻り値:**

`string` - レンダリングされたHTML

## TableOfContents

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