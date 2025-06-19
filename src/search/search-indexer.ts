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

      // 語幹変換を無効化して完全一致検索を改善
      builder.pipeline.remove(lunr.stemmer);
      builder.searchPipeline.remove(lunr.stemmer);

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
    let text = html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Add Japanese text processing for better search
    text = this.enhanceJapaneseText(text);
    
    return text;
  }

  private enhanceJapaneseText(text: string): string {
    // Create N-grams for Japanese text to improve partial matching
    const words = text.split(/\s+/);
    const enhancedWords: string[] = [];
    
    words.forEach(word => {
      enhancedWords.push(word);
      
      // Generate bi-grams and tri-grams for Japanese characters
      if (this.containsJapanese(word) && word.length > 2) {
        // Bi-grams
        for (let i = 0; i < word.length - 1; i++) {
          enhancedWords.push(word.substring(i, i + 2));
        }
        // Tri-grams for longer words
        if (word.length > 3) {
          for (let i = 0; i < word.length - 2; i++) {
            enhancedWords.push(word.substring(i, i + 3));
          }
        }
      }
    });
    
    return enhancedWords.join(' ');
  }

  private containsJapanese(text: string): boolean {
    // Check for Hiragana, Katakana, and Kanji characters
    return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  }
}