
import os
import re
import json

txt_dir = r"e:\my\apps - for playstore\generalist-bible\txt"
categories_mapping = {
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
}

def extract_links(content):
    # This is a bit tricky. We want to find URLs and the text before them.
    # URLs often end with .com, .io, .net, etc.
    # We'll use a regex for common tlds.
    tld_pattern = r'\b(?:[a-zA-Z0-9-]+\.)+(?:com|io|net|org|tt|fm|xyz|club|sh|me|site|co|app|ru|in|wtf|gallery|id|dev|energy|cc|pro|media|ai|app|so|build|ly|is|to|cc|me|site|plus|top|tech|online|best|info)\b[^\s]*'
    
    links = []
    
    # Clean up content (remove markers like "Figma File" or footer)
    content = re.sub(r'Figma File.*', '', content, flags=re.DOTALL)
    content = re.sub(r'Des igned and Created by.*', '', content, flags=re.DOTALL)
    
    # Split by the tld_pattern but keep the matches
    parts = re.split(f'({tld_pattern})', content)
    
    # Pair items: description, url, description, url...
    for i in range(1, len(parts), 2):
        url = parts[i].strip()
        desc = parts[i-1].strip()
        
        # The description might still have some of the previous entry's description.
        # But since we split by url, the desc is what's between URLs.
        # We need to extract only the part relevant to THIS URL.
        # Actually, in the text files, it seems to be: [Description] [URL] [Description] [URL]
        
        # Clean up desc: take the last line if multiple lines, and maybe limit len.
        if '\n' in desc:
            desc = desc.split('\n')[-1].strip()
        
        # If desc is too long, it might be the start of the next one? No, in the txt it's usually short.
        # Example: "Image filters civitai.com" -> desc="Image filters", url="civitai.com"
        
        if desc and url:
            links.append({'name': desc, 'url': url})
            
    return links

all_data = {}

for filename in os.listdir(txt_dir):
    if not filename.endswith(".txt"):
         continue
         
    # Find base category name
    base_name = re.sub(r'\s*\d*$', '', filename.replace('.txt', ''))
    if base_name == "Web Design-1": base_name = "Web Design"
    
    match = None
    for cat in categories_mapping:
        if base_name.startswith(cat) or cat.startswith(base_name):
            match = cat
            break
            
    if not match:
        print(f"No match for {filename}")
        continue
        
    with open(os.path.join(txt_dir, filename), 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        extracted = extract_links(content)
        if match not in all_data:
            all_data[match] = []
        all_data[match].extend(extracted)

# Deduplicate
for cat in all_data:
    seen = set()
    unique = []
    for item in all_data[cat]:
        if item['url'] not in seen:
            seen.add(item['url'])
            unique.append(item)
    all_data[cat] = unique

print(json.dumps(all_data, indent=2))
