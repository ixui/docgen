// Client-side search functionality
class DocGenSearch {
  constructor() {
    this.searchIndex = null;
    this.documents = [];
    this.searchInput = null;
    this.searchResults = null;
    this.isInitialized = false;
  }

  init(indexData) {
    if (!indexData || !indexData.index || !indexData.documents) {
      console.warn('Search index data is not available');
      return;
    }

    // Check if lunr is available
    if (typeof lunr === 'undefined' || !lunr) {
      console.error('Lunr.js library is not loaded. Search functionality will be disabled.');
      return;
    }

    try {
      this.searchIndex = lunr.Index.load(JSON.parse(indexData.index));
      this.documents = indexData.documents;
      this.setupUI();
      this.isInitialized = true;
      console.log(`Search initialized with ${this.documents.length} documents`);
    } catch (error) {
      console.error('Failed to initialize search:', error);
      console.error('This may be due to lunr.js not being properly loaded.');
    }
  }

  setupUI() {
    this.searchInput = document.getElementById('search-input');
    this.searchResults = document.getElementById('search-results');

    if (!this.searchInput || !this.searchResults) {
      console.warn('Search UI elements not found');
      return;
    }

    // Add event listeners
    this.searchInput.addEventListener('input', (e) => {
      this.performSearch(e.target.value);
    });

    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim()) {
        this.searchResults.style.display = 'block';
      }
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
        this.searchResults.style.display = 'none';
      }
    });

    // Handle keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.searchResults.style.display = 'none';
        this.searchInput.blur();
      }
    });
  }

  performSearch(query) {
    if (!this.isInitialized || !query.trim()) {
      this.searchResults.style.display = 'none';
      return;
    }

    try {
      const results = this.searchIndex.search(query);
      this.displayResults(results, query);
    } catch (error) {
      console.error('Search error:', error);
      this.searchResults.style.display = 'none';
    }
  }

  displayResults(results, query) {
    if (results.length === 0) {
      this.searchResults.innerHTML = '<div class="search-no-results">検索結果が見つかりません</div>';
      this.searchResults.style.display = 'block';
      return;
    }

    const resultsHtml = results.slice(0, 10).map(result => {
      const doc = this.documents.find(d => d.id === result.ref);
      if (!doc) return '';

      const snippet = this.createSnippet(doc.content, query);
      const finalUrl = this.getDocumentUrl(doc.url);
      
      // Debug logging
      console.log('Search result:', {
        docId: doc.id,
        docUrl: doc.url,
        finalUrl: finalUrl,
        currentLocation: window.location.pathname
      });
      
      return `
        <div class="search-result">
          <a href="${finalUrl}" class="search-result-title">
            ${this.highlightQuery(doc.title, query)}
          </a>
          <div class="search-result-snippet">
            ${snippet}
          </div>
        </div>
      `;
    }).join('');

    this.searchResults.innerHTML = resultsHtml;
    this.searchResults.style.display = 'block';
  }

  createSnippet(content, query, maxLength = 150) {
    const queryLower = query.toLowerCase();
    const contentLower = content.toLowerCase();
    const queryIndex = contentLower.indexOf(queryLower);
    
    if (queryIndex === -1) {
      return content.substring(0, maxLength) + '...';
    }

    const start = Math.max(0, queryIndex - 50);
    const end = Math.min(content.length, queryIndex + query.length + 100);
    
    let snippet = content.substring(start, end);
    if (start > 0) snippet = '...' + snippet;
    if (end < content.length) snippet = snippet + '...';
    
    return this.highlightQuery(snippet, query);
  }

  highlightQuery(text, query) {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  getDocumentUrl(url) {
    // Simple approach: treat all URLs as relative to the root of the output directory
    // Since all search results URLs are already relative to the output root
    
    const currentLocation = window.location;
    const currentPath = currentLocation.pathname;
    
    // Count how many directories deep the current file is
    // by counting the slashes after the last occurrence of /output/ or similar
    const pathSegments = currentPath.split('/').filter(s => s.length > 0);
    
    // If we're viewing index.html at the root, the URL is used as-is
    if (currentPath.endsWith('/index.html') || currentPath.endsWith('/')) {
      // Check if we're at the root level by seeing if there's no subdirectory in the path
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment === 'index.html' || lastSegment === 'output') {
        // We're at root level
        return url;
      }
    }
    
    // For file:// protocol on Windows, handle paths carefully
    let normalizedPath = currentPath;
    if (currentLocation.protocol === 'file:' && /^\/[A-Za-z]:/.test(currentPath)) {
      normalizedPath = currentPath.substring(1);
    }
    
    // Find how deep we are from the output root
    let depth = 0;
    const outputMatch = normalizedPath.match(/\/output\/(.*)/);
    if (outputMatch) {
      const afterOutput = outputMatch[1];
      const segments = afterOutput.split('/').filter(s => s.length > 0);
      // Don't count the filename itself
      depth = segments.length - 1;
    } else {
      // Fallback: count segments from the last slash
      const lastSlashIndex = normalizedPath.lastIndexOf('/');
      const dirPath = normalizedPath.substring(0, lastSlashIndex);
      const segments = dirPath.split('/').filter(s => s.length > 0);
      
      // Try to determine if we're in a subdirectory
      // Look for common patterns like api/, guides/, tutorials/
      for (let i = segments.length - 1; i >= 0; i--) {
        if (segments[i] === 'api' || segments[i] === 'guides' || segments[i] === 'tutorials') {
          depth = 1;
          break;
        }
      }
    }
    
    console.log('URL navigation:', {
      currentPath: normalizedPath,
      depth: depth,
      targetUrl: url,
      willReturn: depth > 0 ? '../'.repeat(depth) + url : url
    });
    
    // If we're in a subdirectory, add appropriate ../ prefixes
    if (depth > 0) {
      return '../'.repeat(depth) + url;
    }
    
    return url;
  }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Check if lunr is available
  if (typeof lunr === 'undefined') {
    console.error('Lunr.js is not loaded. Search functionality is disabled.');
    console.error('This is a known issue when opening HTML files directly (file:// protocol).');
    console.error('For full functionality, please serve the files through a web server.');
    return;
  }
  
  if (window.searchIndex && window.lunr) {
    window.docgenSearch = new DocGenSearch();
    window.docgenSearch.init(window.searchIndex);
  } else if (!window.searchIndex) {
    console.warn('Search index is not available.');
  }
});