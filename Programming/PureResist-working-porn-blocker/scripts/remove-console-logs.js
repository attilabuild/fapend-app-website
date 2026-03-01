#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const EXCLUDE_DIRS = ['node_modules', '.git', '.expo', 'backend', 'android', 'ios'];
const INCLUDE_EXTENSIONS = ['.tsx', '.ts', '.js', '.jsx'];

function removeConsoleLogs(dir) {
  const items = fs.readdirSync(dir);

  items.forEach(item => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !EXCLUDE_DIRS.includes(item)) {
      removeConsoleLogs(fullPath);
    } else if (stat.isFile() && INCLUDE_EXTENSIONS.includes(path.extname(item))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const originalContent = content;

      // Remove console.log statements (but keep console.error and console.warn)
      content = content.replace(/^\s*console\.log\(.*?\);?\s*$/gm, '');
      content = content.replace(/console\.log\([^)]*\);?/g, '');
      
      // Clean up empty lines that might be left behind
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
      }
    }
  });
}
removeConsoleLogs(process.cwd());