export interface DocGenOptions {
  input: string | string[];
  output: string;
  theme: string;
  searchEnabled: boolean;
  watch: boolean;
  minify: boolean;
}

export interface ProcessedDocument {
  content: string;
  metadata: DocumentMetadata;
  toc: TableOfContents;
  searchIndex?: SearchIndex;
}

export interface DocumentMetadata {
  title: string;
  fileName: string;
  lastModified: Date;
  headings: Heading[];
}

export interface Heading {
  id: string;
  text: string;
  level: number;
  children?: Heading[];
}

export interface TableOfContents {
  items: TocItem[];
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
  children: TocItem[];
}

export interface SearchIndex {
  documents: SearchDocument[];
  index: string; // Serialized Lunr index
}

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  url: string;
}