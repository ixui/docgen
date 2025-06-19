import { MarkdownParser } from '../../src/parser/markdown';

describe('MarkdownParser', () => {
  let parser: MarkdownParser;

  beforeEach(() => {
    parser = new MarkdownParser();
  });

  describe('parse', () => {
    it('should correctly extract headings from markdown', async () => {
      const markdown = `# Main Title
## Section 1
### Subsection 1.1
## Section 2
### Subsection 2.1
#### Subsubsection 2.1.1`;

      const result = await parser.parse(markdown, 'test.md');

      expect(result.headings).toHaveLength(1); // Only one top-level heading
      expect(result.headings[0].text).toBe('Main Title');
      expect(result.headings[0].level).toBe(1);
      expect(result.headings[0].id).toBe('main-title');
      
      expect(result.headings[0].children).toHaveLength(2); // Two level 2 children
      expect(result.headings[0].children![0].text).toBe('Section 1');
      expect(result.headings[0].children![0].level).toBe(2);
      expect(result.headings[0].children![0].children).toHaveLength(1);
      expect(result.headings[0].children![0].children![0].text).toBe('Subsection 1.1');
    });

    it('should handle Japanese text in headings', async () => {
      const markdown = `# 日本語のタイトル
## セクション１
### サブセクション`;

      const result = await parser.parse(markdown, 'test.md');

      expect(result.headings[0].text).toBe('日本語のタイトル');
      expect(result.headings[0].children![0].text).toBe('セクション１');
      expect(result.headings[0].children![0].children![0].text).toBe('サブセクション');
    });

    it('should generate valid HTML with proper heading IDs', async () => {
      const markdown = `# Test Title
This is a paragraph.
## Test Section`;

      const result = await parser.parse(markdown, 'test.md');

      expect(result.html).toContain('<h1 id="test-title">Test Title</h1>');
      expect(result.html).toContain('<h2 id="test-section">Test Section</h2>');
      expect(result.html).toContain('<p>This is a paragraph.</p>');
    });

    it('should handle special characters in heading IDs', async () => {
      const markdown = `# Title with Special! Characters? & Symbols`;

      const result = await parser.parse(markdown, 'test.md');

      expect(result.headings[0].id).toBe('title-with-special-characters-symbols');
    });

    it('should strip HTML from heading text', async () => {
      const markdown = `# Title with <em>HTML</em> tags`;

      const result = await parser.parse(markdown, 'test.md');

      expect(result.headings[0].text).toBe('Title with HTML tags');
      expect(result.html).toContain('<h1 id="title-with-html-tags">Title with <em>HTML</em> tags</h1>');
    });

    it('should maintain heading hierarchy correctly', async () => {
      const markdown = `# Level 1
## Level 2
### Level 3
#### Level 4
### Another Level 3
## Another Level 2`;

      const result = await parser.parse(markdown, 'test.md');

      expect(result.headings).toHaveLength(1); // Only one top-level
      expect(result.headings[0].children).toHaveLength(2); // Two level 2s
      expect(result.headings[0].children![0].children).toHaveLength(2); // Two level 3s under first level 2
      expect(result.headings[0].children![0].children![0].children).toHaveLength(1); // One level 4
      expect(result.headings[0].children![1].children).toHaveLength(0); // No children for second level 2
    });

    it('should extract title from first h1 heading', async () => {
      const markdown = `# Document Title
## Section`;

      const result = await parser.parse(markdown, 'test.md');

      expect(result.metadata.title).toBe('Document Title');
    });

    it('should use filename as title when no h1 exists', async () => {
      const markdown = `## Section 1
### Subsection`;

      const result = await parser.parse(markdown, 'test-document.md');

      expect(result.metadata.title).toBe('test-document');
    });

    it('should not produce [object Object] in heading text', async () => {
      const markdown = `# Test Heading
## Another Heading`;

      const result = await parser.parse(markdown, 'test.md');

      // Check that no heading contains [object Object]
      const checkHeading = (heading: any): void => {
        expect(heading.text).not.toContain('[object Object]');
        expect(heading.text).not.toBe('[object Object]');
        if (heading.children) {
          heading.children.forEach(checkHeading);
        }
      };

      result.headings.forEach(checkHeading);
    });
  });
});