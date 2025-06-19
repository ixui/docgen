import { Heading, TableOfContents, TocItem } from '../types';

export class TocGenerator {
  public generate(headings: Heading[]): TableOfContents {
    const items = this.convertHeadingsToTocItems(headings);
    
    return {
      items
    };
  }

  private convertHeadingsToTocItems(headings: Heading[]): TocItem[] {
    return headings.map(heading => this.convertHeadingToTocItem(heading));
  }

  private convertHeadingToTocItem(heading: Heading): TocItem {
    return {
      id: heading.id,
      text: heading.text,
      level: heading.level,
      children: heading.children ? this.convertHeadingsToTocItems(heading.children) : []
    };
  }

  public renderTocHtml(toc: TableOfContents, indexPath: string = 'index.html'): string {
    if (toc.items.length === 0) {
      return '';
    }

    return `
      <nav class="toc" aria-label="Table of contents">
        <h2 class="toc-title">目次</h2>
        <div class="toc-back-link">
          <a href="${indexPath}" class="toc-link toc-index-link">← インデックスに戻る</a>
        </div>
        ${this.renderTocItems(toc.items)}
      </nav>
    `;
  }

  private renderTocItems(items: TocItem[]): string {
    if (items.length === 0) {
      return '';
    }

    const listItems = items.map(item => `
      <li class="toc-item toc-level-${item.level}">
        <a href="#${item.id}" class="toc-link">${this.escapeHtml(item.text)}</a>
        ${item.children.length > 0 ? this.renderTocItems(item.children) : ''}
      </li>
    `).join('');

    return `<ul class="toc-list">${listItems}</ul>`;
  }

  private escapeHtml(text: string): string {
    const escapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };

    return text.replace(/[&<>"']/g, (match) => escapeMap[match]);
  }
}