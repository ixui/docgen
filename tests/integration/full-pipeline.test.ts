import { MarkdownParser } from '../../src/parser/markdown';
import { TocGenerator } from '../../src/generator/toc';

describe('Full Pipeline Integration', () => {
  let markdownParser: MarkdownParser;
  let tocGenerator: TocGenerator;

  beforeEach(() => {
    markdownParser = new MarkdownParser();
    tocGenerator = new TocGenerator();
  });

  it('should process markdown to HTML without [object Object] issues', async () => {
    const markdown = `# DocGen Test Document
This is a test document to ensure the full pipeline works correctly.

## Section 1
Content for section 1.

### Subsection 1.1
Content for subsection 1.1.

## Section 2
Content for section 2.

### Subsection 2.1
Content for subsection 2.1.

#### Deep Subsection
This is a deep subsection.`;

    // Parse markdown
    const parseResult = await markdownParser.parse(markdown, 'test.md');
    
    // Verify headings were extracted correctly
    expect(parseResult.headings).toHaveLength(1); // One root heading
    expect(parseResult.headings[0].text).toBe('DocGen Test Document');
    expect(parseResult.headings[0].children).toHaveLength(2); // Two sections
    
    // Generate TOC
    const toc = tocGenerator.generate(parseResult.headings);
    
    // Verify TOC structure
    expect(toc.items[0].text).toBe('DocGen Test Document');
    expect(toc.items[0].children[0].text).toBe('Section 1');
    expect(toc.items[0].children[1].text).toBe('Section 2');
    
    // Render TOC HTML
    const tocHtml = tocGenerator.renderTocHtml(toc);
    
    // Verify no [object Object] in TOC
    expect(tocHtml).not.toContain('[object Object]');
    expect(tocHtml).not.toContain('object-object');
    expect(tocHtml).toContain('DocGen Test Document');
    expect(tocHtml).toContain('Section 1');
    expect(tocHtml).toContain('Subsection 1.1');
    
    // Verify all heading texts are strings
    const checkHeadingTexts = (headings: any[]): void => {
      headings.forEach(heading => {
        expect(typeof heading.text).toBe('string');
        expect(heading.text).not.toBe('[object Object]');
        expect(heading.text.length).toBeGreaterThan(0);
        if (heading.children) {
          checkHeadingTexts(heading.children);
        }
      });
    };
    
    checkHeadingTexts(parseResult.headings);
  });

  it('should handle Japanese text throughout the pipeline', async () => {
    const markdown = `# 日本語ドキュメント
これは日本語のテストドキュメントです。

## セクション１
セクション１の内容です。

### サブセクション１．１
サブセクションの内容です。`;

    const parseResult = await markdownParser.parse(markdown, 'japanese-test.md');
    const toc = tocGenerator.generate(parseResult.headings);
    const tocHtml = tocGenerator.renderTocHtml(toc);
    
    expect(parseResult.headings[0].text).toBe('日本語ドキュメント');
    expect(tocHtml).toContain('日本語ドキュメント');
    expect(tocHtml).toContain('セクション１');
    expect(tocHtml).not.toContain('[object Object]');
  });

  it('should handle special characters and HTML entities', async () => {
    const markdown = `# Title with Special & Characters
## Section with <em>HTML</em> & "Quotes"
### Sub with 'Single' & "Double" Quotes`;

    const parseResult = await markdownParser.parse(markdown, 'special-chars.md');
    const toc = tocGenerator.generate(parseResult.headings);
    const tocHtml = tocGenerator.renderTocHtml(toc);
    
    // Check that special characters are handled properly
    expect(parseResult.headings[0].text).toBe('Title with Special & Characters');
    expect(tocHtml).toContain('Title with Special &amp; Characters');
    expect(tocHtml).toContain('Section with HTML &amp; &quot;Quotes&quot;');
    expect(tocHtml).not.toContain('[object Object]');
  });

  it('should maintain consistency between HTML and TOC IDs', async () => {
    const markdown = `# Main Title
## Section One
### Subsection`;

    const parseResult = await markdownParser.parse(markdown, 'test.md');
    const toc = tocGenerator.generate(parseResult.headings);
    const tocHtml = tocGenerator.renderTocHtml(toc);
    
    // Check that IDs are consistent
    expect(parseResult.html).toContain('id="main-title"');
    expect(parseResult.html).toContain('id="section-one"');
    expect(parseResult.html).toContain('id="subsection"');
    
    expect(tocHtml).toContain('href="#main-title"');
    expect(tocHtml).toContain('href="#section-one"');
    expect(tocHtml).toContain('href="#subsection"');
  });
});