# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DocGen is a CLI tool that converts Markdown files into beautiful HTML documents with automatic table of contents generation, search functionality, and consistent design.

### Key Features
- Markdown to HTML conversion (CommonMark/GitHub Flavored Markdown)
- Automatic hierarchical table of contents generation
- Client-side full-text search functionality
- Customizable CSS theme system
- Mobile-responsive output

## Development Commands

```bash
# Setup development environment
npm install

# Build TypeScript to JavaScript
npm run build

# Development mode with watch
npm run dev

# Run tests
npm test

# Run specific test file
npm test -- path/to/test.spec.ts

# Lint code
npm run lint

# Type checking
npm run typecheck

# Build and package CLI tool
npm run package
```

## Architecture Overview

### Tech Stack
- **Language**: TypeScript (Node.js 18+)
- **Markdown Parser**: marked (with GitHub Flavored Markdown)
- **HTML Generation**: Handlebars templates
- **Search**: Lunr.js for client-side search
- **CSS**: TailwindCSS with custom components
- **Build Tool**: esbuild for fast builds
- **CLI Framework**: Commander.js
- **Testing**: Jest with ts-jest

### Core Architecture

1. **CLI Entry Point** (`src/cli.ts`)
   - Parses command-line arguments using Commander.js
   - Validates input files and options
   - Orchestrates the conversion pipeline

2. **Markdown Processing Pipeline**
   - **Parser** (`src/parser/`): Converts Markdown to AST using marked
   - **Transformer** (`src/transformer/`): Enhances AST with metadata (headings for TOC, content for search)
   - **Generator** (`src/generator/`): Converts AST to HTML using Handlebars templates

3. **Search System** (`src/search/`)
   - Builds Lunr.js index during generation
   - Embeds search index in generated HTML
   - Client-side JavaScript handles search queries

4. **Theme System** (`src/themes/`)
   - Each theme contains: template.hbs, styles.css, search.js
   - Themes are loaded dynamically based on CLI options
   - Default theme uses TailwindCSS

### Key Interfaces and Types

```typescript
// src/types/index.ts
interface DocGenOptions {
  input: string | string[];
  output: string;
  theme: string;
  searchEnabled: boolean;
  watch: boolean;
  minify: boolean;
}

interface ProcessedDocument {
  content: string;
  metadata: DocumentMetadata;
  toc: TableOfContents;
  searchIndex?: SearchIndex;
}
```

### Configuration Files

1. **docgen.config.js** (optional)
   - Allows users to define default options
   - Supports theme customization
   - Can define custom plugins

2. **tsconfig.json**
   - Strict mode enabled
   - Target: ES2020
   - Module: CommonJS for Node.js compatibility

## CLI Usage Examples

```bash
# Convert single file
docgen build README.md

# Convert directory with custom output
docgen build ./docs --output ./dist

# Use dark theme
docgen build ./docs --theme dark

# Disable search functionality
docgen build ./docs --no-search

# Watch mode for development
docgen build ./docs --watch

# Minify output
docgen build ./docs --minify

# Use config file
docgen build --config docgen.config.js
```

## Error Handling Strategy

1. **File Errors**: Clear messages about missing files or permissions
2. **Markdown Errors**: Line numbers and context for syntax issues
3. **Theme Errors**: Fallback to default theme with warning
4. **Search Errors**: Graceful degradation (disable search if indexing fails)

## Testing Approach

- Unit tests for individual modules (parser, generator, etc.)
- Integration tests for full pipeline
- Snapshot tests for HTML output
- E2E tests for CLI commands
- Test fixtures in `tests/fixtures/`
