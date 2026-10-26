// ===== SCROLL REVEAL =====
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => observer.observe(el));
}

// ===== BURGER MENU =====
function initBurger() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;
  burger.addEventListener('click', () => {
    menu.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    if (menu.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });
}

// ===== SEARCH (Category Pages) =====
function initSearch() {
  const input = document.getElementById('searchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    const items = document.querySelectorAll('.link-item');
    let visibleCount = 0;
    items.forEach(item => {
      const text = item.textContent.toLowerCase();
      const isVisible = text.includes(q);
      item.style.display = isVisible ? '' : 'none';
      item.style.opacity = isVisible ? '1' : '0';
      if (isVisible) visibleCount++;
    });

    // Update count in header if present
    const countEl = document.querySelector('.links-count');
    if (countEl) {
      if (q) {
        countEl.textContent = `${visibleCount} FOUND`;
      } else {
        countEl.textContent = `${items.length} RESOURCES`;
      }
    }
  });
}

// ===== HERO SEARCH (Global across all pages and links) =====
function initHeroSearch() {
  const input = document.getElementById('heroSearch');
  if (!input) return;

  const searchWrapper = document.querySelector('.hero-search-wrapper');
  const clearBtn = document.getElementById('searchClear');
  const dropdown = document.getElementById('searchResults');
  const resultsCount = document.getElementById('resultsCount');
  const resultsList = document.getElementById('resultsList');
  const catCards = document.querySelectorAll('.cat-card');

  let selectedIndex = -1;

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlight(text, query) {
    if (!text) return '';
    if (!query) return escapeHtml(text);
    const escapedText = escapeHtml(text);
    const escapedQuery = escapeRegExp(escapeHtml(query));
    try {
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      return escapedText.replace(regex, '<mark>$1</mark>');
    } catch (e) {
      return escapedText;
    }
  }

  function performSearch() {
    const rawVal = input.value;
    const q = rawVal.trim().toLowerCase();
    selectedIndex = -1;

    if (clearBtn) {
      clearBtn.style.display = q ? 'flex' : 'none';
    }

    if (!q) {
      if (dropdown) dropdown.style.display = 'none';
      catCards.forEach(card => {
        card.style.display = '';
        card.style.opacity = '1';
        card.style.transform = '';
        const badge = card.querySelector('.cat-match-badge');
        if (badge) badge.remove();
      });
      return;
    }

    const allLinks = window.ALL_LINKS || [];
    const tokens = q.split(/\s+/).filter(Boolean);

    // Multi-token search across name, url, and category
    const matches = allLinks.filter(item => {
      const name = item.name.toLowerCase();
      const url = (item.url || '').toLowerCase();
      const cat = (item.category || '').toLowerCase();
      return tokens.every(token => name.includes(token) || url.includes(token) || cat.includes(token));
    });

    // Count matches per page for category card indicators
    const pageCounts = {};
    matches.forEach(item => {
      pageCounts[item.page] = (pageCounts[item.page] || 0) + 1;
    });

    // Update Category Cards in section #categories
    catCards.forEach(card => {
      const href = card.getAttribute('href');
      const h2 = card.querySelector('h2').textContent.toLowerCase();
      const p = card.querySelector('p').textContent.toLowerCase();
      const titleMatches = tokens.some(token => h2.includes(token) || p.includes(token));
      const matchCount = pageCounts[href] || 0;

      let badge = card.querySelector('.cat-match-badge');

      if (matchCount > 0 || titleMatches) {
        card.style.display = '';
        card.style.opacity = '1';
        card.style.transform = '';

        if (matchCount > 0) {
          if (!badge) {
            badge = document.createElement('span');
            badge.className = 'cat-match-badge';
            card.appendChild(badge);
          }
          badge.textContent = `${matchCount} match${matchCount === 1 ? '' : 'es'}`;
        } else if (badge) {
          badge.remove();
        }
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          if (input.value.trim() && !pageCounts[href] && !titleMatches) {
            card.style.display = 'none';
          }
        }, 250);
        if (badge) badge.remove();
      }
    });

    // Render results in Dropdown
    if (!dropdown || !resultsList || !resultsCount) return;

    dropdown.style.display = 'flex';

    if (matches.length === 0) {
      resultsCount.innerHTML = `<span>0 resources found</span>`;
      resultsList.innerHTML = `
        <div class="search-no-results">
          No resources found matching "<strong>${escapeHtml(rawVal.trim())}</strong>"
          <span>Try searching for keywords like "cad", "editor", "video", "ai", "icons", etc.</span>
        </div>
      `;
      return;
    }

    const uniqueCategories = new Set(matches.map(m => m.category)).size;
    resultsCount.innerHTML = `Found <strong>${matches.length}</strong> resources in <strong>${uniqueCategories}</strong> categories`;

    const displayMatches = matches.slice(0, 60);
    resultsList.innerHTML = displayMatches.map((item, idx) => {
      const href = item.href.startsWith('http') ? item.href : `https://${item.href}`;
      const color = item.color || '#f5c518';
      return `
        <a href="${href}" class="search-result-item" target="_blank" rel="noopener" data-index="${idx}" style="--res-color: ${color}">
          <div class="search-result-main">
            <div class="search-result-title" title="${escapeHtml(item.name)}">${highlight(item.name, q)}</div>
            <div class="search-result-sub">
              <span class="search-result-cat" style="color: ${color}; border-color: ${color}55;">${escapeHtml(item.category)}</span>
              <span class="search-result-url">${highlight(item.url, q)}</span>
            </div>
          </div>
          <div class="search-result-actions">
            <button type="button" class="search-result-cat-link" onclick="event.preventDefault(); event.stopPropagation(); window.location.href='${item.page}'" title="Browse all ${escapeHtml(item.category)} resources">Category ↗</button>
            <span class="search-result-arrow">↗</span>
          </div>
        </a>
      `;
    }).join('');

    if (matches.length > 60) {
      const moreDiv = document.createElement('div');
      moreDiv.className = 'search-more-hint';
      moreDiv.textContent = `+ ${matches.length - 60} more resources. Refine your query to narrow down.`;
      resultsList.appendChild(moreDiv);
    }
  }

  input.addEventListener('input', performSearch);
  input.addEventListener('focus', () => {
    if (input.value.trim()) {
      if (dropdown) dropdown.style.display = 'flex';
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      performSearch();
      input.focus();
    });
  }

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    if (!dropdown || dropdown.style.display === 'none') return;
    const items = dropdown.querySelectorAll('.search-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % items.length;
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + items.length) % items.length;
      updateSelection(items);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && items[selectedIndex]) {
        e.preventDefault();
        items[selectedIndex].click();
      }
    } else if (e.key === 'Escape') {
      dropdown.style.display = 'none';
      input.blur();
    }
  });

  function updateSelection(items) {
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (searchWrapper && !searchWrapper.contains(e.target)) {
      if (dropdown) dropdown.style.display = 'none';
    }
  });
}

// ===== RECENT LINKS FILTER (Index Page) =====
function initRecentLinks() {
  const pills = document.querySelectorAll('.recent-pill');
  const plaques = document.querySelectorAll('.recent-plaque');
  if (!pills.length || !plaques.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const filter = pill.getAttribute('data-filter');

      plaques.forEach(plaque => {
        const cat = plaque.getAttribute('data-cat') || '';
        if (filter === 'all' || cat.toLowerCase() === filter.toLowerCase()) {
          plaque.style.display = '';
          setTimeout(() => { plaque.style.opacity = '1'; plaque.style.transform = ''; }, 10);
        } else {
          plaque.style.opacity = '0';
          plaque.style.transform = 'scale(0.95)';
          setTimeout(() => { if (plaque.style.opacity === '0') plaque.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

// ===== SMOOTH SCROLL =====
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ===== HEADER SCROLL =====
function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  window.addEventListener('scroll', () => {
    header.style.boxShadow = window.scrollY > 20
      ? '0 4px 32px rgba(0,0,0,0.5)'
      : 'none';
  });
}

// ===== CARD TILT (subtle) =====
function initCardTilt() {
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initBurger();
  initSearch();
  initHeroSearch();
  initRecentLinks();
  initSmoothScroll();
  initHeaderScroll();
  initCardTilt();
});
