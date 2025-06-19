# DocGen

DocGen is a CLI tool that converts Markdown files into beautiful HTML documents with automatic table of contents generation, search functionality, and consistent design.

## Features

- **Markdown to HTML conversion** - Supports CommonMark/GitHub Flavored Markdown
- **Automatic table of contents** - Hierarchical TOC generation with navigation links
- **Multi-level directory support** - Preserves directory structure in output
- **Full-text search** - Client-side search functionality with Lunr.js
- **Responsive design** - Mobile-friendly HTML output
- **Index generation** - Automatic index files for directory navigation
- **Customizable themes** - Support for custom CSS themes

## Installation

### From GitHub Packages (Private)

```bash
# Configure npm to use GitHub Packages for @your-company scope
echo "@your-company:registry=https://npm.pkg.github.com" >> ~/.npmrc

# Authenticate with GitHub (create a personal access token with packages:read scope)
echo "//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN" >> ~/.npmrc

# Install globally
npm install -g @your-company/docgen

# Or install locally in your project
npm install --save-dev @your-company/docgen
```

### Authentication Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with `packages:read` scope
3. Replace `YOUR_GITHUB_TOKEN` in the npmrc configuration above

## Usage

### Basic Usage

```bash
# Convert a single file
docgen build README.md

# Convert a directory
docgen build ./docs --output ./website

# Use a custom theme
docgen build ./docs --theme dark

# Disable search functionality
docgen build ./docs --no-search

# Watch for changes during development
docgen build ./docs --watch

# Minify HTML output
docgen build ./docs --minify
```

### Command Line Options

```
Usage: docgen build <input> [options]

Arguments:
  input                    Input file or directory

Options:
  -o, --output <path>      Output directory (default: "./dist")
  -t, --theme <name>       Theme name (default: "default")
  --no-search             Disable search functionality
  -w, --watch             Watch for file changes
  -m, --minify            Minify HTML output
  -h, --help              Display help information
```

### Directory Structure

DocGen preserves your directory structure in the output:

```
docs/
├── index.md
├── guides/
│   ├── getting-started.md
│   └── advanced.md
└── api/
    └── reference.md

# Generates:
output/
├── index.html
├── guides/
│   ├── index.html        # Auto-generated directory index
│   ├── getting-started.html
│   └── advanced.html
├── api/
│   ├── index.html        # Auto-generated directory index
│   └── reference.html
└── styles.css
```

### Index Files

DocGen automatically generates `index.md` files for directories that don't have them. These files contain:

- Links to all documents in the current directory
- Links to subdirectories with previews of their content
- Hierarchical navigation structure

## Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/your-company/docgen.git
cd docgen

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run in development mode
npm run dev
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Example Build

```bash
# Build the example documentation
npm run example:build

# Clean example output
npm run example:clean
```

## Configuration

Create a `docgen.config.js` file in your project root for custom settings:

```javascript
module.exports = {
  theme: 'custom',
  searchEnabled: true,
  minify: true,
  // Add custom configuration here
};
```

## Themes

DocGen uses CSS-based themes. The default theme provides:

- Clean, professional design
- Responsive layout
- Dark/light mode support
- Print-friendly styles

Custom themes can be created by providing a custom CSS file.

## Requirements

- Node.js 18.0.0 or higher
- NPM or Yarn package manager

## License

MIT

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/your-company/docgen/issues) page.

## Internal Usage

This package is intended for internal company use only. Access is restricted to authorized personnel with appropriate GitHub permissions.