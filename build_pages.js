
const fs = require('fs');
const path = require('path');

const extractedData = JSON.parse(fs.readFileSync('extracted_links.json', 'utf8'));

const pages = [
  {
    file: 'uiux.html',
    title: 'UI / UX',
    subtitle: 'Design tools, mockups, UI kits, inspiration & resources',
    color: '#f5c518',
    links: extractedData['UX'] || []
  },
  {
    file: 'ai-services.html',
    title: 'AI Services',
    subtitle: 'Image generators, AI tools, translation & automation',
    color: '#00e5ff',
    links: extractedData['AI Services'] || []
  },
  {
    file: 'software.html',
    title: 'Software',
    subtitle: 'Editors, converters, online tools & file managers',
    color: '#ff6b35',
    links: extractedData['Software'] || []
  },
  {
    file: 'illustrations.html',
    title: 'Illustrations',
    subtitle: 'Free icons, SVGs, vectors, illustrations & avatars',
    color: '#a855f7',
    links: extractedData['Illustrations'] || []
  },
  {
    file: 'photos-video.html',
    title: 'Photos / Video',
    subtitle: 'Stock photos, free footage, PNG & video templates',
    color: '#22d3ee',
    links: extractedData['Video'] || []
  },
  {
    file: 'colors.html',
    title: 'Colors',
    subtitle: 'Gradient makers, palette generators & color tools',
    color: '#f5c518',
    links: extractedData['Colors'] || []
  },
  {
    file: 'developer.html',
    title: 'Developer',
    subtitle: 'Code tools, fonts, storage, CSS utilities & builders',
    color: '#4ade80',
    links: extractedData['Developer'] || []
  },
  {
    file: 'music.html',
    title: 'Music Design',
    subtitle: 'Free loops, royalty-free music, sound effects & tools',
    color: '#f472b6',
    links: extractedData['MUSIC DESIGN'] || []
  },
  {
    file: 'web-design.html',
    title: 'Web Design',
    subtitle: 'Templates, mockups, HTML themes & design resources',
    color: '#fb923c',
    links: extractedData['Web Design'] || []
  },
  {
    file: 'help.html',
    title: 'Help Resources',
    subtitle: 'Inspiration, tutorials, UX tools & learning platforms',
    color: '#818cf8',
    links: extractedData['Help Online Resources'] || []
  }
];

function buildPage(page) {
  const linksHTML = page.links.map(l => {
    const href = l.url.startsWith('http') ? l.url : `https://${l.url}`;
    return `
        <div class="link-item reveal">
          <div class="link-info">
            <div class="link-name">${l.name}</div>
            <a href="${href}" class="link-url" target="_blank" rel="noopener">${l.url}</a>
          </div>
        </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} — Generalist Bible 2.0</title>
  <link rel="stylesheet" href="main.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    .page-title { color: ${page.color}; }
    .cat-label { color: ${page.color}; }
    .link-url { color: ${page.color}; }
    .links-count { color: ${page.color}; border-color: ${page.color}44; }
    .page-hero::after {
      content: '';
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: radial-gradient(ellipse 60% 80% at 80% 50%, ${page.color}0a 0%, transparent 65%);
      pointer-events: none;
    }
    .page-hero { position: relative; overflow: hidden; }
  </style>
</head>
<body class="category-page">
  <div class="noise-overlay"></div>
  <div class="bg-gradient"></div>

  <header class="site-header">
    <div class="header-inner">
      <a href="index.html" class="logo">
        <img src="logo.svg" alt="Logo" class="logo-img">
      </a>
      <nav class="main-nav">
        <a href="uiux.html">UI/UX</a>
        <a href="ai-services.html">AI</a>
        <a href="software.html">Software</a>
        <a href="illustrations.html">Illustrations</a>
        <a href="photos-video.html">Photos</a>
        <a href="colors.html">Colors</a>
        <a href="developer.html">Developer</a>
        <a href="music.html">Music</a>
        <a href="web-design.html">Web Design</a>
        <a href="help.html">Help</a>
      </nav>
      <button class="burger" id="burger" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu">
    <a href="uiux.html">UI/UX</a>
    <a href="ai-services.html">AI Services</a>
    <a href="software.html">Software</a>
    <a href="illustrations.html">Illustrations</a>
    <a href="photos-video.html">Photos/Video</a>
    <a href="colors.html">Colors</a>
    <a href="developer.html">Developer</a>
    <a href="music.html">Music Design</a>
    <a href="web-design.html">Web Design</a>
    <a href="help.html">Help Resources</a>
  </div>

  <main>
    <section class="page-hero">
      <div class="page-hero-inner">
        <a href="index.html" class="back-link reveal">← Back to all categories</a>
        <h1 class="page-title reveal">${page.title}</h1>
        <p class="page-subtitle reveal">${page.subtitle}</p>
        <span class="links-count reveal">${page.links.length} RESOURCES</span>
      </div>
    </section>

    <section class="links-container">
      <input type="text" class="search-bar" id="searchInput" placeholder="Search resources...">
      <div class="links-grid">
${linksHTML}
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <span>Designed and Created by <strong>Evghenii Conev</strong></span>
      <span class="footer-dot">◆</span>
      <span>Generalist Bible Link Directory 2.0</span>
    </div>
  </footer>

  <script src="main.js"></script>
</body>
</html>`;
}

// Write pages directly to root
pages.forEach(page => {
  const html = buildPage(page);
  fs.writeFileSync(page.file, html, 'utf8');
  console.log(`✓ ${page.file} (${page.links.length} links)`);
});
console.log('\nAll pages updated with links from text files!');
