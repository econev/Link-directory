// watch_links.js
// Automatically watches all category HTML files and keeps index.html and links-data.js up to date in real time!

const fs = require('fs');
const path = require('path');
const { syncAll, categories } = require('./generate_links_data.js');

let debounceTimer = null;
const debounceMs = 250;

console.log('[Auto-Sync Watcher] Initializing watcher for category HTML files...');

// Initial sync on start
try {
  syncAll();
} catch (e) {
  console.error('[Auto-Sync Watcher] Initial sync error:', e);
}

categories.forEach(cat => {
  if (!fs.existsSync(cat.file)) return;

  fs.watch(cat.file, (eventType) => {
    if (eventType === 'change') {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        try {
          console.log(`[Auto-Sync] Detected changes in ${cat.file}. Updating index.html and links-data.js...`);
          syncAll(cat.file);
        } catch (err) {
          console.error(`[Auto-Sync] Error syncing after changes in ${cat.file}:`, err);
        }
      }, debounceMs);
    }
  });
  console.log(`  Watching: ${cat.file}`);
});

console.log('[Auto-Sync Watcher] Running and waiting for file changes. Press Ctrl+C to stop.');
