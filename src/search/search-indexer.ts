import * as lunr from 'lunr';
import { ProcessedDocument, SearchIndex, SearchDocument } from '../types';
import { PathUtils } from '../utils/path-utils';
import * as path from 'path';

export class SearchIndexer {
  private documents: SearchDocument[] = [];

  public addDocument(document: ProcessedDocument, filePath: string, outputDir: string, outputPath?: string): void {
    // Use the actual output path if provided, otherwise calculate it
    let url: string;
    if (outputPath) {
      // Get relative path from outputDir to the actual output file
      url = PathUtils.normalizeWebPath(path.relative(outputDir, outputPath));
    } else {
      // Fallback to calculating the URL (less accurate)
      const htmlFileName = path.basename(filePath, path.extname(filePath)) + '.html';
      const relativePath = path.relative(outputDir, path.join(path.dirname(filePath), htmlFileName));
      url = PathUtils.normalizeWebPath(relativePath);
    }

    const searchDoc: SearchDocument = {
      id: this.generateDocId(filePath),
      title: document.metadata.title || 'Untitled',
      content: this.extractTextContent(document.content),
      url: url || path.basename(filePath, path.extname(filePath)) + '.html'
    };

    this.documents.push(searchDoc);
  }

  public generateIndex(): SearchIndex {
    try {
      const documents = this.documents;
      
      const builder = new lunr.Builder();
      builder.ref('id');
      builder.field('title', { boost: 10 });
      builder.field('content');

      documents.forEach(doc => {
        builder.add(doc);
      });

      const lunrIndex = builder.build();

      return {
        documents: this.documents,
        index: JSON.stringify(lunrIndex)
      };
    } catch (error) {
      console.error('Error generating search index:', error);
      return {
        documents: this.documents,
        index: JSON.stringify({})
      };
    }
  }

  public reset(): void {
    this.documents = [];
  }

  private generateDocId(filePath: string): string {
    return path.basename(filePath, path.extname(filePath))
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  private extractTextContent(html: string): string {
    // Remove HTML tags and get plain text
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}