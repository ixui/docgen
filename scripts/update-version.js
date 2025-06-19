#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Updates version references in README.md to match package.json version
 */
function updateReadmeVersion() {
  const packagePath = path.join(__dirname, '..', 'package.json');
  const readmePath = path.join(__dirname, '..', 'README.md');
  
  try {
    // Read current version from package.json
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const currentVersion = packageJson.version;
    
    console.log(`📦 Current package version: ${currentVersion}`);
    
    // Read README.md
    let readmeContent = fs.readFileSync(readmePath, 'utf8');
    const originalContent = readmeContent;
    
    // Update version references in README.md
    // Pattern 1: GitHub release download URLs (v2.0.6)
    readmeContent = readmeContent.replace(
      /\/releases\/download\/v[\d.]+\//g,
      `/releases/download/v${currentVersion}/`
    );
    
    // Pattern 2: Git tag examples (git tag v2.0.6)
    readmeContent = readmeContent.replace(
      /git tag v[\d.]+/g,
      `git tag v${currentVersion}`
    );
    
    // Pattern 3: Git push origin commands (git push origin v2.0.6)
    readmeContent = readmeContent.replace(
      /git push origin v[\d.]+/g,
      `git push origin v${currentVersion}`
    );
    
    // Pattern 4: Tarball filenames in URLs (ixui-docgen-2.0.5.tgz)
    readmeContent = readmeContent.replace(
      /ixui-docgen-[\d.]+\.tgz/g,
      `ixui-docgen-${currentVersion}.tgz`
    );
    
    // Check if any changes were made
    if (readmeContent !== originalContent) {
      fs.writeFileSync(readmePath, readmeContent, 'utf8');
      console.log(`✅ Updated README.md with version ${currentVersion}`);
      
      // Show what was changed
      const lines = originalContent.split('\n');
      const newLines = readmeContent.split('\n');
      
      console.log('\n📝 Changes made:');
      lines.forEach((line, index) => {
        if (line !== newLines[index]) {
          console.log(`  Line ${index + 1}:`);
          console.log(`    - ${line}`);
          console.log(`    + ${newLines[index]}`);
        }
      });
    } else {
      console.log('ℹ️  No version references found to update in README.md');
    }
    
  } catch (error) {
    console.error('❌ Error updating README.md version:', error.message);
    process.exit(1);
  }
}

// Run the update if this script is executed directly
if (require.main === module) {
  updateReadmeVersion();
}

module.exports = { updateReadmeVersion };