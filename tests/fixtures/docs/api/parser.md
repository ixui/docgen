# Parser API

マークダウンパーサーのAPIリファレンス。

## MarkdownParser

### コンストラクタ

```typescript
constructor()
```

新しいMarkdownParserインスタンスを作成します。

### メソッド

#### parse(markdown, fileName)

マークダウンをパースしてHTMLに変換します。

**パラメータ:**

- `markdown` (string) - パースするマークダウンテキスト
- `fileName` (string) - ファイル名

**戻り値:**

`Promise<ParseResult>` - パース結果

```typescript
interface ParseResult {
  html: string;
  headings: Heading[];
  metadata: Partial<DocumentMetadata>;
}
```

**例:**

```typescript
const parser = new MarkdownParser();
const result = await parser.parse('# タイトル\n内容', 'test.md');
console.log(result.html); // <h1 id="title">タイトル</h1><p>内容</p>
```

## Heading

見出し情報を表すインターフェース。

```typescript
interface Heading {
  id: string;
  text: string;
  level: number;
  children?: Heading[];
}
```

### プロパティ

- `id` - 見出しのID（アンカーリンク用）
- `text` - 見出しのテキスト
- `level` - 見出しレベル（1-6）
- `children` - 子見出しの配列