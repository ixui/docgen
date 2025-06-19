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

### From GitHub Releases (Recommended)

Download the latest pre-built package from [GitHub Releases](https://github.com/ixui/docgen/releases):

```bash
# Method 1: Install directly from release tarball (no build required)
npm install -g https://github.com/ixui/docgen/releases/download/v2.0.6/ixui-docgen-2.0.5.tgz

# Method 2: Download and install manually
wget https://github.com/ixui/docgen/releases/download/v2.0.6/docgen-dist.tar.gz
tar -xzf docgen-dist.tar.gz
cd docgen-dist
npm install -g .
```

### From Source (For Development)

```bash
# Clone and build from source
git clone https://github.com/ixui/docgen.git
cd docgen
npm install
npm run build
npm link  # Makes 'docgen' command available globally
```

### Verify Installation

```bash
# Check if installation was successful
docgen --version

# View help
docgen --help
```

### System Requirements

- Node.js 18.0.0 or higher
- NPM 6.0.0 or higher
- Works on Windows, macOS, and Linux
- **No build tools required** when using GitHub Releases

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
git clone https://github.com/ixui/docgen.git
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

## Cross-Platform Compatibility

DocGen is tested and works on:

- **Windows** - Windows 10/11 with PowerShell, Command Prompt, or WSL
- **macOS** - macOS 10.15+ with Terminal or iTerm2
- **Linux** - Ubuntu, CentOS, Alpine, and other major distributions

The tool automatically handles path separators and file system differences across platforms.

## License

MIT

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/ixui/docgen/issues) page.

## Releases

To create a new release:

1. Update the version in `package.json`
2. Commit the version change
3. Create and push a git tag: `git tag v2.0.6 && git push origin v2.0.6`
4. GitHub Actions will automatically build and create a release with pre-built packages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request