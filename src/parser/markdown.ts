import { marked } from 'marked';
import { Heading, DocumentMetadata } from '../types';

export interface ParseResult {
  html: string;
  headings: Heading[];
  metadata: Partial<DocumentMetadata>;
}

export class MarkdownParser {
  private headings: Heading[] = [];
  private currentHeadingStack: Heading[] = [];
  private renderer: any;

  constructor() {
    this.renderer = new marked.Renderer();
    this.setupRenderer();
  }

  private setupRenderer(): void {
    // Override heading renderer
    this.renderer.heading = (text: any, level: any) => {
      // Handle case where text might be an object with tokens
      let textStr: string;
      let levelNum: number;
      
      if (typeof text === 'object' && text !== null) {
        if (Array.isArray(text)) {
          textStr = text.map(token => token.text || token.raw || String(token)).join('');
        } else if (text.text) {
          textStr = String(text.text);
        } else if (text.raw) {
          textStr = String(text.raw);
        } else {
          textStr = String(text);
        }
        // Also try to get level from text object if level is undefined
        if (level === undefined && text.depth) {
          levelNum = Number(text.depth) || 1;
        } else {
          levelNum = Number(level) || 1;
        }
      } else {
        textStr = String(text || '');
        levelNum = Number(level) || 1;
      }
      
      const cleanText = this.stripHtml(textStr);
      const id = this.generateId(cleanText);
      
      const heading: Heading = {
        id,
        text: cleanText,
        level: levelNum,
        children: []
      };

      this.addHeadingToHierarchy(heading);
      
      return `<h${levelNum} id="${id}">${textStr}</h${levelNum}>`;
    };

    // Override link renderer
    this.renderer.link = (href: any, title: any, text: any) => {
      // Handle case where href might be an object with tokens
      let hrefStr: string;
      if (typeof href === 'object' && href !== null) {
        if (href.href) {
          hrefStr = String(href.href);
        } else if (href.raw) {
          hrefStr = String(href.raw);
        } else {
          hrefStr = String(href);
        }
      } else {
        hrefStr = String(href || '');
      }
      
      // Handle case where text might be an object with tokens or undefined
      let textStr: string;
      if (text === undefined && typeof href === 'object' && href !== null && href.text) {
        // If text is undefined, try to get it from href object
        textStr = String(href.text);
      } else if (typeof text === 'object' && text !== null) {
        if (Array.isArray(text)) {
          textStr = text.map(token => token.text || token.raw || String(token)).join('');
        } else if (text.text) {
          textStr = String(text.text);
        } else if (text.raw) {
          textStr = String(text.raw);
        } else {
          textStr = String(text);
        }
      } else {
        textStr = String(text || '');
      }
      
      const titleStr = title ? String(title) : null;
      
      const processedHref = this.processLinkHref(hrefStr);
      const titleAttr = titleStr ? ` title="${this.escapeHtml(titleStr)}"` : '';
      return `<a href="${processedHref}"${titleAttr}>${textStr}</a>`;
    };
  }

  private generateId(text: string): string {
    if (!text || text.trim() === '') {
      return 'heading-' + Math.random().toString(36).substr(2, 9);
    }
    
    return String(text)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .trim() || 'heading-' + Math.random().toString(36).substr(2, 9);
  }

  private stripHtml(text: string): string {
    return String(text).replace(/<[^>]*>/g, '');
  }

  private escapeHtml(text: string): string {
    const escapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return String(text).replace(/[&<>"']/g, (match) => escapeMap[match]);
  }

  private processLinkHref(href: string): string {
    // Skip processing for absolute URLs, anchors, or already processed links
    if (href.startsWith('http') || href.startsWith('https') || 
        href.startsWith('#') || href.startsWith('mailto:') ||
        href.endsWith('.html') || href.endsWith('.htm')) {
      return href;
    }

    // Convert .md extension to .html
    if (href.endsWith('.md')) {
      return href.replace(/\.md$/, '.html');
    }

    // Convert directory paths
    if (href.endsWith('/')) {
      // For directory links ending with /, assume index.html
      return href + 'index.html';
    }

    // If it looks like a directory without trailing slash and without extension
    if (!href.includes('.') && href.includes('/')) {
      return href + '.html';
    }

    // If it's a single word without extension, assume it's a directory with index
    if (!href.includes('.') && !href.includes('/')) {
      return href + '/index.html';
    }

    return href;
  }

  private addHeadingToHierarchy(heading: Heading): void {
    while (this.currentHeadingStack.length > 0 && 
           this.currentHeadingStack[this.currentHeadingStack.length - 1].level >= heading.level) {
      this.currentHeadingStack.pop();
    }

    if (this.currentHeadingStack.length === 0) {
      this.headings.push(heading);
    } else {
      const parent = this.currentHeadingStack[this.currentHeadingStack.length - 1];
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(heading);
    }

    this.currentHeadingStack.push(heading);
  }

  public async parse(markdown: string, fileName: string): Promise<ParseResult> {
    this.headings = [];
    this.currentHeadingStack = [];

    const html = await marked(markdown, {
      renderer: this.renderer,
      gfm: true,
      breaks: true,
    });

    const title = this.extractTitle(this.headings, fileName);

    return {
      html,
      headings: this.headings,
      metadata: {
        title,
        fileName,
      }
    };
  }

  private extractTitle(headings: Heading[], fileName: string): string {
    if (headings.length > 0 && headings[0].level === 1) {
      return headings[0].text;
    }
    
    // Fallback to filename without extension
    return fileName.replace(/\.[^/.]+$/, '');
  }
}