// generate_links_data.js
// Extracts all links from category HTML pages and updates:
// 1. links-data.js
// 2. index.html (recent plaques, search placeholder, and filter pills)
// 3. extracted_links.json

const fs = require('fs');
const path = require('path');

const categories = [
  { file: 'uiux.html', title: 'UI / UX', shortTitle: 'UI/UX', color: '#f5c518', key: 'UX' },
  { file: 'ai-services.html', title: 'AI Services', shortTitle: 'AI', color: '#00e5ff', key: 'AI Services' },
  { file: 'software.html', title: 'Software', shortTitle: 'Software', color: '#ff6b35', key: 'Software' },
  { file: 'illustrations.html', title: 'Illustrations', shortTitle: 'Illustrations', color: '#a855f7', key: 'Illustrations' },
  { file: 'photos-video.html', title: 'Photos / Video', shortTitle: 'Photos', color: '#22d3ee', key: 'Video' },
  { file: 'colors.html', title: 'Colors', shortTitle: 'Colors', color: '#f5c518', key: 'Colors' },
  { file: 'developer.html', title: 'Developer', shortTitle: 'Developer', color: '#4ade80', key: 'Developer' },
  { file: 'music.html', title: 'Music Design', shortTitle: 'Music', color: '#f472b6', key: 'MUSIC DESIGN' },
  { file: 'web-design.html', title: 'Web Design', shortTitle: 'Web', color: '#fb923c', key: 'Web Design' },
  { file: 'help.html', title: 'Help Resources', shortTitle: 'Help', color: '#818cf8', key: 'Help Online Resources' }
];

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function syncAll(lastChangedFile = null) {
  const pages = [];
  let allLinks = [];
  let categoryJson = {};

  categories.forEach(cat => {
    if (!fs.existsSync(cat.file)) return;
    const stat = fs.statSync(cat.file);
    const content = fs.readFileSync(cat.file, 'utf8');

    const regex = /<div class="link-item[^"]*">[\s\S]*?<div class="link-name">([\s\S]*?)<\/div>[\s\S]*?<a href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/g;
    let matches = [];
    let m;
    while ((m = regex.exec(content)) !== null) {
      const name = m[1].replace(/<[^>]+>/g, '').trim();
      const href = m[2].trim();
      const displayUrl = m[3].replace(/<[^>]+>/g, '').trim();
      if (name && href) {
        matches.push({
          name,
          url: displayUrl || href.replace(/^https?:\/\//, '').replace(/\/$/, ''),
          href,
          category: cat.title,
          shortCategory: cat.shortTitle,
          page: cat.file,
          color: cat.color
        });
      }
    }

    // Update resource count in category header if needed
    const currentCountMatch = content.match(/<span class="links-count reveal">(\d+)\s+RESOURCES<\/span>/i);
    if (currentCountMatch && parseInt(currentCountMatch[1], 10) !== matches.length) {
      const updatedContent = content.replace(
        /<span class="links-count reveal">\d+\s+RESOURCES<\/span>/i,
        `<span class="links-count reveal">${matches.length} RESOURCES</span>`
      );
      fs.writeFileSync(cat.file, updatedContent, 'utf8');
      console.log(`Updated count in ${cat.file} header to ${matches.length}`);
    }

    pages.push({
      ...cat,
      mtime: stat.mtime.getTime(),
      links: matches
    });

    categoryJson[cat.key] = matches.map(l => ({ name: l.name, url: l.url }));
    allLinks = allLinks.concat(matches);
  });

  // Determine top 10 recent plaques:
  let recentLinks = [];

  if (lastChangedFile) {
    const changedPage = pages.find(p => p.file === lastChangedFile);
    if (changedPage && changedPage.links.length > 0) {
      // Put top links from the changed page first
      const count = Math.min(6, changedPage.links.length);
      recentLinks = recentLinks.concat(changedPage.links.slice(0, count));
    }
  }

  // Next, prioritize newest updates:
  // uiux.html (Nov 16: 8 new items), ai-services.html (Nov 9: 3 new items), software.html (CAD, CapCut, etc.)
  const uiux = pages.find(p => p.file === 'uiux.html');
  const ai = pages.find(p => p.file === 'ai-services.html');
  const soft = pages.find(p => p.file === 'software.html');

  const priorityCandidates = [
    ...(uiux ? uiux.links.slice(0, 8) : []),
    ...(ai ? ai.links.slice(0, 3) : []),
    ...(soft ? soft.links.slice(0, 5) : [])
  ];

  const seenUrls = new Set(recentLinks.map(l => l.url.toLowerCase()));
  for (const link of priorityCandidates) {
    if (recentLinks.length >= 10) break;
    const cleanUrl = link.url.toLowerCase();
    if (!seenUrls.has(cleanUrl)) {
      seenUrls.add(cleanUrl);
      recentLinks.push(link);
    }
  }

  // If still fewer than 10, fill from any remaining top items
  for (const p of pages) {
    if (recentLinks.length >= 10) break;
    for (const link of p.links) {
      if (recentLinks.length >= 10) break;
      const cleanUrl = link.url.toLowerCase();
      if (!seenUrls.has(cleanUrl)) {
        seenUrls.add(cleanUrl);
        recentLinks.push(link);
      }
    }
  }

  recentLinks = recentLinks.slice(0, 10);

  // Write links-data.js
  const jsContent = `// Auto-generated data for Generalist Bible 2.0
// Total links: ${allLinks.length}
// Updated: ${new Date().toISOString()}

window.GB_CATEGORIES = ${JSON.stringify(categories, null, 2)};

window.GB_RECENT_LINKS = ${JSON.stringify(recentLinks, null, 2)};

window.ALL_LINKS = ${JSON.stringify(allLinks, null, 2)};
`;

  fs.writeFileSync('links-data.js', jsContent, 'utf8');
  console.log(`✓ links-data.js updated (${allLinks.length} links, ${recentLinks.length} plaques)`);

  fs.writeFileSync('extracted_links.json', JSON.stringify(categoryJson, null, 2), 'utf8');

  // Update index.html
  if (fs.existsSync('index.html')) {
    let indexHtml = fs.readFileSync('index.html', 'utf8');

    // 1. Update search placeholder with count
    indexHtml = indexHtml.replace(
      /placeholder="Search\s+\d+[\d,]*\+?\s+resources across all categories\.\.\."/i,
      `placeholder="Search ${allLinks.length.toLocaleString()}+ resources across all categories..."`
    );

    // 2. Generate filter pills HTML
    const uniqueCats = Array.from(new Set(recentLinks.map(l => l.category)));
    let pillsHTML = `<button type="button" class="recent-pill active" data-filter="all">All</button>`;
    uniqueCats.forEach(c => {
      let label = c;
      if (c === 'UI / UX') label = 'UI/UX';
      else if (c === 'AI Services') label = 'AI';
      else if (c === 'Photos / Video') label = 'Photos';
      else if (c === 'Help Resources') label = 'Help';
      pillsHTML += `\n              <button type="button" class="recent-pill" data-filter="${escapeHtml(c)}">${escapeHtml(label)}</button>`;
    });

    indexHtml = indexHtml.replace(
      /<div class="recent-filter-pills"[^>]*>[\s\S]*?<\/div>/i,
      `<div class="recent-filter-pills">\n              ${pillsHTML}\n            </div>`
    );

    // 3. Generate 10 plaques HTML
    const plaquesHTML = recentLinks.map(l => {
      const color = l.color || '#f5c518';
      const href = l.href.startsWith('http') ? l.href : `https://${l.href}`;
      return `            <a href="${escapeHtml(href)}" class="recent-plaque" target="_blank" rel="noopener" data-cat="${escapeHtml(l.category)}" style="--cat-color: ${color};">
              <div class="plaque-header">
                <span class="plaque-cat" style="color: ${color};">${escapeHtml(l.category)}</span>
                <span class="plaque-arrow">↗</span>
              </div>
              <div class="plaque-name" title="${escapeHtml(l.name)}">${escapeHtml(l.name)}</div>
              <div class="plaque-url">${escapeHtml(l.url)}</div>
            </a>`;
    }).join('\n\n');

    indexHtml = indexHtml.replace(
      /<div class="recent-plaques-grid" id="recentPlaquesGrid">[\s\S]*?<\/div>\s*<\/div>/i,
      `<div class="recent-plaques-grid" id="recentPlaquesGrid">\n${plaquesHTML}\n          </div>\n        </div>`
    );

    fs.writeFileSync('index.html', indexHtml, 'utf8');
    console.log(`✓ index.html updated with ${recentLinks.length} plaques and current counts`);
  }

  return { allLinks, recentLinks };
}

if (require.main === module) {
  syncAll();
}

module.exports = { syncAll, categories };
