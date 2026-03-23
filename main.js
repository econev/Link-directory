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
    const q = input.value.toLowerCase();
    document.querySelectorAll('.link-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      const isVisible = text.includes(q);
      item.style.display = isVisible ? '' : 'none';
      item.style.opacity = isVisible ? '1' : '0';
    });
  });
}

// ===== HERO SEARCH (Index Page) =====
function initHeroSearch() {
  const input = document.getElementById('heroSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase();
    const cards = document.querySelectorAll('.cat-card');
    cards.forEach(card => {
      const h2 = card.querySelector('h2').textContent.toLowerCase();
      const p = card.querySelector('p').textContent.toLowerCase();
      const isVisible = h2.includes(q) || p.includes(q);
      
      if (isVisible) {
        card.style.display = '';
        setTimeout(() => { card.style.opacity = '1'; card.style.transform = ''; }, 10);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => { if (card.style.opacity === '0') card.style.display = 'none'; }, 350);
      }
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
  initSmoothScroll();
  initHeaderScroll();
  initCardTilt();
});
