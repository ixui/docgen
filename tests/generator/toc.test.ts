import { TocGenerator } from '../../src/generator/toc';
import { Heading, TableOfContents } from '../../src/types';

describe('TocGenerator', () => {
  let tocGenerator: TocGenerator;

  beforeEach(() => {
    tocGenerator = new TocGenerator();
  });

  describe('generate', () => {
    it('should generate TOC from headings', () => {
      const headings: Heading[] = [
        {
          id: 'intro',
          text: 'Introduction',
          level: 1,
          children: [
            {
              id: 'overview',
              text: 'Overview',
              level: 2,
              children: []
            }
          ]
        },
        {
          id: 'usage',
          text: 'Usage',
          level: 1,
          children: []
        }
      ];

      const toc = tocGenerator.generate(headings);

      expect(toc.items).toHaveLength(2);
      expect(toc.items[0].text).toBe('Introduction');
      expect(toc.items[0].children).toHaveLength(1);
      expect(toc.items[0].children[0].text).toBe('Overview');
    });

    it('should handle empty headings array', () => {
      const toc = tocGenerator.generate([]);
      expect(toc.items).toHaveLength(0);
    });
  });

  describe('renderTocHtml', () => {
    it('should render valid HTML for TOC', () => {
      const toc: TableOfContents = {
        items: [
          {
            id: 'section-1',
            text: 'Section 1',
            level: 1,
            children: [
              {
                id: 'subsection-1-1',
                text: 'Subsection 1.1',
                level: 2,
                children: []
              }
            ]
          }
        ]
      };

      const html = tocGenerator.renderTocHtml(toc);

      expect(html).toContain('<nav class="toc" aria-label="Table of contents">');
      expect(html).toContain('<h2 class="toc-title">目次</h2>');
      expect(html).toContain('<ul class="toc-list">');
      expect(html).toContain('<li class="toc-item toc-level-1">');
      expect(html).toContain('<a href="#section-1" class="toc-link">Section 1</a>');
      expect(html).toContain('<li class="toc-item toc-level-2">');
      expect(html).toContain('<a href="#subsection-1-1" class="toc-link">Subsection 1.1</a>');
    });

    it('should return empty string for empty TOC', () => {
      const toc: TableOfContents = { items: [] };
      const html = tocGenerator.renderTocHtml(toc);
      expect(html).toBe('');
    });

    it('should escape HTML in TOC text', () => {
      const toc: TableOfContents = {
        items: [
          {
            id: 'test',
            text: 'Title with <script>alert("XSS")</script>',
            level: 1,
            children: []
          }
        ]
      };

      const html = tocGenerator.renderTocHtml(toc);

      expect(html).not.toContain('<script>');
      expect(html).toContain('Title with &lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
    });

    it('should handle special characters correctly', () => {
      const toc: TableOfContents = {
        items: [
          {
            id: 'special',
            text: 'Title & "Quotes" <Tags>',
            level: 1,
            children: []
          }
        ]
      };

      const html = tocGenerator.renderTocHtml(toc);

      expect(html).toContain('Title &amp; &quot;Quotes&quot; &lt;Tags&gt;');
    });

    it('should not render [object Object] in TOC links', () => {
      const toc: TableOfContents = {
        items: [
          {
            id: 'test-1',
            text: 'Test Heading 1',
            level: 1,
            children: [
              {
                id: 'test-2',
                text: 'Test Heading 2',
                level: 2,
                children: []
              }
            ]
          }
        ]
      };

      const html = tocGenerator.renderTocHtml(toc);

      expect(html).not.toContain('[object Object]');
      expect(html).not.toContain('object-object');
      expect(html).toContain('Test Heading 1');
      expect(html).toContain('Test Heading 2');
    });

    it('should handle deeply nested TOC structure', () => {
      const toc: TableOfContents = {
        items: [
          {
            id: 'l1',
            text: 'Level 1',
            level: 1,
            children: [
              {
                id: 'l2',
                text: 'Level 2',
                level: 2,
                children: [
                  {
                    id: 'l3',
                    text: 'Level 3',
                    level: 3,
                    children: [
                      {
                        id: 'l4',
                        text: 'Level 4',
                        level: 4,
                        children: []
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const html = tocGenerator.renderTocHtml(toc);

      expect(html).toContain('toc-level-1');
      expect(html).toContain('toc-level-2');
      expect(html).toContain('toc-level-3');
      expect(html).toContain('toc-level-4');
      expect(html).toContain('Level 1');
      expect(html).toContain('Level 2');
      expect(html).toContain('Level 3');
      expect(html).toContain('Level 4');
    });
  });
});