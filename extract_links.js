
const fs = require('fs');
const path = require('path');

const txt_dir = 'txt';
const categories_mapping = {
    "AI Services": "ai-services.html",
    "Colors": "colors.html",
    "Developer": "developer.html",
    "Help Online Resources": "help.html",
    "Illustrations": "illustrations.html",
    "MUSIC DESIGN": "music.html",
    "Software": "software.html",
    "UX": "uiux.html",
    "Video": "photos-video.html",
    "Web Design": "web-design.html"
};

const extract_links = (content) => {
    // Regex for URLs ending with any TLD (2+ letters)
    const tld_pattern = /\b(?:[a-zA-Z0-9-]+\.)+[a-z]{2,10}(?:\/[^\s]*)?\b/gi;
    
    // Clean up content
    content = content.replace(/Figma File[\s\S]*/gi, '');
    content = content.replace(/Des igned and Created by[\s\S]*/gi, '');
    
    const links = [];
    const matches = Array.from(content.matchAll(tld_pattern));
    
    let lastIndex = 0;
    matches.forEach(match => {
        const url = match[0].trim();
        const start = match.index;
        
        // Take content between URLs
        let desc = content.slice(lastIndex, start).trim();
        
        // If desc contains newlines, take the last non-empty line
        if (desc.includes('\n')) {
            const lines = desc.split('\n');
            desc = lines[lines.length - 1].trim() || lines[lines.length - 2]?.trim() || '';
        }
        
        if (desc && url) {
            links.push({ name: desc, url: url });
        }
        lastIndex = start + url.length;
    });
            
    return links;
};

const all_data = {};

const files = fs.readdirSync(txt_dir);
files.forEach(filename => {
    if (!filename.endsWith(".txt")) return;
    
    // Normalize base category name
    let base_name = filename.replace('.txt', '').replace(/\s*\d*$/, '');
    if (base_name === "Web Design-1") base_name = "Web Design";
    if (base_name === "Help Online Resources") base_name = "Help Online Resources";
    
    let match_cat = null;
    Object.keys(categories_mapping).forEach(cat => {
        if (base_name.toLowerCase().startsWith(cat.toLowerCase()) || cat.toLowerCase().startsWith(base_name.toLowerCase())) {
            match_cat = cat;
        }
    });
            
    if (!match_cat) {
        // Find by partial match if needed
        console.log(`No match for ${filename}`);
        return;
    }
        
    const content = fs.readFileSync(path.join(txt_dir, filename), 'utf8');
    const extracted = extract_links(content);
    if (!all_data[match_cat]) all_data[match_cat] = [];
    all_data[match_cat] = all_data[match_cat].concat(extracted);
});

// Deduplicate by URL
Object.keys(all_data).forEach(cat => {
    const seen = new Set();
    const unique = [];
    all_data[cat].forEach(item => {
        if (!seen.has(item.url)) {
            seen.add(item.url);
            unique.push(item);
        }
    });
    all_data[cat] = unique;
});

// Log statistics
let total = 0;
Object.keys(all_data).forEach(cat => {
    console.log(`${cat}: ${all_data[cat].length} links`);
    total += all_data[cat].length;
});
console.log(`\nTotal unique links: ${total}`);

fs.writeFileSync('extracted_links.json', JSON.stringify(all_data, null, 2), 'utf8');
console.log('\nJSON saved to extracted_links.json');
