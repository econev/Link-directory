// generate_links_data.js
// Extracts all links from category HTML pages and outputs links-data.js and updated extracted_links.json

const fs = require('fs');
const path = require('path');

const categories = [
  { file: 'uiux.html', title: 'UI / UX', color: '#f5c518', key: 'UX' },
  { file: 'ai-services.html', title: 'AI Services', color: '#00e5ff', key: 'AI Services' },
  { file: 'software.html', title: 'Software', color: '#ff6b35', key: 'Software' },
  { file: 'illustrations.html', title: 'Illustrations', color: '#a855f7', key: 'Illustrations' },
  { file: 'photos-video.html', title: 'Photos / Video', color: '#22d3ee', key: 'Video' },
  { file: 'colors.html', title: 'Colors', color: '#f5c518', key: 'Colors' },
  { file: 'developer.html', title: 'Developer', color: '#4ade80', key: 'Developer' },
  { file: 'music.html', title: 'Music Design', color: '#f472b6', key: 'MUSIC DESIGN' },
  { file: 'web-design.html', title: 'Web Design', color: '#fb923c', key: 'Web Design' },
  { file: 'help.html', title: 'Help Resources', color: '#818cf8', key: 'Help Online Resources' }
];

let allLinks = [];
let categoryJson = {};

categories.forEach(cat => {
  if (!fs.existsSync(cat.file)) return;
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
        page: cat.file,
        color: cat.color
      });
    }
  }
  categoryJson[cat.key] = matches.map(l => ({ name: l.name, url: l.url }));
  allLinks = allLinks.concat(matches);
  console.log(`Extracted ${matches.length} links from ${cat.file}`);
});

// The 10 most recent links added to categories (from Software and AI Services updated today)
const recentLinks = [
  {
    name: 'Open-source parametric CAD.Built in Rust.',
    url: 'solidcraft.io',
    href: 'https://solidcraft.io/download/',
    category: 'Software',
    page: 'software.html',
    color: '#ff6b35'
  },
  {
    name: 'Scroll-driven templates & prompts for AI',
    fullName: 'A curated library of scroll-driven templates and prompts. Copy one, paste it into your AI, and launch a site that doesn\'t look AI-made.',
    url: 'scrolltide.co',
    href: 'https://www.scrolltide.co/',
    category: 'AI Services',
    page: 'ai-services.html',
    color: '#00e5ff'
  },
  {
    name: 'The free, open-source CapCut replacement',
    fullName: 'The free, open-source CapCut replacement.',
    url: 'concat.standalones.org',
    href: 'https://concat.standalones.org/#download',
    category: 'Software',
    page: 'software.html',
    color: '#ff6b35'
  },
  {
    name: 'Beautiful AI Prompt Library, Made for Creators',
    url: 'sceneai.art',
    href: 'https://sceneai.art/',
    category: 'AI Services',
    page: 'ai-services.html',
    color: '#00e5ff'
  },
  {
    name: 'Reverse engineer anything with agents',
    fullName: 'Reverse engineer anything with agents, from app behavior down to native binaries.',
    url: 'rea.tools',
    href: 'https://rea.tools/',
    category: 'Software',
    page: 'software.html',
    color: '#ff6b35'
  },
  {
    name: 'Curated skills for design engineering',
    url: 'ui-skills.com',
    href: 'https://www.ui-skills.com/',
    category: 'AI Services',
    page: 'ai-services.html',
    color: '#00e5ff'
  },
  {
    name: 'Professional image editing in your browser',
    fullName: 'Professional image editing in your browser. PSDs · Layers · Masks · Effects · AI-powered tools',
    url: 'imageflow.dev',
    href: 'https://imageflow.dev/',
    category: 'Software',
    page: 'software.html',
    color: '#ff6b35'
  },
  {
    name: 'Professional Image Prompt Library',
    url: 'promptag.app',
    href: 'https://promptag.app',
    category: 'AI Services',
    page: 'ai-services.html',
    color: '#00e5ff'
  },
  {
    name: 'Extensible open source Wiki software',
    fullName: 'The most powerful and extensible open source Wiki software',
    url: 'js.wiki',
    href: 'https://js.wiki/',
    category: 'Software',
    page: 'software.html',
    color: '#ff6b35'
  },
  {
    name: 'Beautiful Landing Pages & Web Section',
    url: 'sceneai.art/landing-pages',
    href: 'https://sceneai.art/landing-pages',
    category: 'AI Services',
    page: 'ai-services.html',
    color: '#00e5ff'
  }
];

const jsContent = `// Auto-generated data for Generalist Bible 2.0
// Total links: ${allLinks.length}
// Generated on: ${new Date().toISOString()}

window.GB_CATEGORIES = ${JSON.stringify(categories, null, 2)};

window.GB_RECENT_LINKS = ${JSON.stringify(recentLinks, null, 2)};

window.ALL_LINKS = ${JSON.stringify(allLinks, null, 2)};
`;

fs.writeFileSync('links-data.js', jsContent, 'utf8');
console.log(`\n✓ links-data.js successfully written with ${allLinks.length} total links and ${recentLinks.length} recent plaques!`);

fs.writeFileSync('extracted_links.json', JSON.stringify(categoryJson, null, 2), 'utf8');
console.log('✓ extracted_links.json synchronized with current HTML content!');
