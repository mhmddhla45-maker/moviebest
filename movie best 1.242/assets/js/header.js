(function () {
  'use strict';

  if (window.__MB_HEADER_INIT__) return;
  window.__MB_HEADER_INIT__ = true;

  const MENU_HTML = `
    <div class="menu-wrap">
      <button class="menu-toggle" id="menuToggle" type="button" aria-label="القائمة" aria-expanded="false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M3 6h18M3 12h18M3 18h18"/>
        </svg>
        <span>القائمة</span>
      </button>
    </div>
  `;

  const DROPDOWN_HTML = `
    <div class="menu-section">
      <h4>تصفح</h4>
      <a href="index.html" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l9-9 9 9M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>
        الرئيسية
      </a>
      <a href="index.html#latest" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
        أحدث الإضافات
      </a>
      <a href="index.html#series" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="M17 2l-5 5-5-5"/></svg>
        مسلسلات
      </a>
      <a href="index.html#movies" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 3v18M17 3v18M2 9h5M2 15h5M17 9h5M17 15h5"/></svg>
        أفلام
      </a>
      <a href="genre.html" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
        كل التصنيفات
      </a>
    </div>

    <div class="menu-section">
      <h4>مكتبتي</h4>
      <a href="index.html#favoritesSection" class="menu-link" data-menu-action="favorites">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        المفضلة
        <span class="menu-badge" id="menuFavCount">0</span>
      </a>
      <a href="index.html#historySection" class="menu-link" data-menu-action="history">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        سجل المشاهدة
        <span class="menu-badge" id="menuHistCount">0</span>
      </a>
    </div>

    <div class="menu-section" id="menuGenresSection">
      <h4>تصنيفات شائعة</h4>
      <div class="menu-genres" id="menuGenres"></div>
    </div>

    <div class="menu-section">
      <h4>معلومات</h4>
      <a href="contact.html" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        اتصل بنا
      </a>
      <a href="privacy.html" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        سياسة الخصوصية
      </a>
      <a href="terms.html" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        شروط الاستخدام
      </a>
      <a href="dmca.html" class="menu-link">
        <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        DMCA
      </a>
    </div>
  `;

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function injectMenu() {
    const headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;
    if (headerInner.querySelector('.menu-wrap')) return;

    headerInner.insertAdjacentHTML('beforeend', MENU_HTML);

    const backdrop = document.createElement('div');
    backdrop.className = 'menu-backdrop';
    backdrop.id = 'menuBackdrop';
    backdrop.addEventListener('click', closeMenu);
    document.body.appendChild(backdrop);

    const dropdown = document.createElement('div');
    dropdown.className = 'menu-dropdown';
    dropdown.id = 'menuDropdown';
    dropdown.setAttribute('role', 'menu');
    dropdown.setAttribute('aria-hidden', 'true');
    dropdown.innerHTML = DROPDOWN_HTML;
    document.body.appendChild(dropdown);

    const toggle = document.getElementById('menuToggle');

    function openMenu() {
      dropdown.classList.add('open');
      backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      dropdown.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      dropdown.classList.remove('open');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      dropdown.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    window.MB_closeMenu = closeMenu;

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains('open')) closeMenu();
      else openMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && dropdown.classList.contains('open')) closeMenu();
    });

    dropdown.addEventListener('click', (e) => {
      if (e.target.closest('.menu-link, .menu-genre-chip')) {
        setTimeout(closeMenu, 80);
      }
    });
  }

  function loadMenuGenres() {
    const el = document.getElementById('menuGenres');
    if (!el) return;
    const section = document.getElementById('menuGenresSection');

    let attempts = 0;
    const maxAttempts = 8;

    function tryLoad() {
      if (typeof DATA === 'undefined' || !Array.isArray(DATA)) {
        attempts++;
        if (attempts < maxAttempts) { setTimeout(tryLoad, 100); }
        else if (section) { section.style.display = 'none'; }
        return;
      }
      const counts = {};
      DATA.forEach(item => {
        (item.genres || []).forEach(g => { counts[g] = (counts[g] || 0) + 1; });
      });
      const top = Object.keys(counts).sort((a, b) => counts[b] - counts[a]).slice(0, 10);

      if (!top.length) {
        if (section) section.style.display = 'none';
        return;
      }
      el.innerHTML = top.map(g =>
        `<a href="/genre?g=${encodeURIComponent(g)}" class="menu-genre-chip">
          ${escapeHtml(g)}
          <span>${counts[g]}</span>
        </a>`
      ).join('');
    }
    tryLoad();
  }

  function updateMenuCounts() {
    const favEl = document.getElementById('menuFavCount');
    const histEl = document.getElementById('menuHistCount');
    if (!window.MB) return;
    const favCount = MB.Favorites ? MB.Favorites.get().length : 0;
    const histCount = MB.History ? MB.History.get().length : 0;
    if (favEl) { favEl.textContent = favCount; favEl.classList.toggle('show', favCount > 0); }
    if (histEl) { histEl.textContent = histCount; histEl.classList.toggle('show', histCount > 0); }
  }

  function init() {
    injectMenu();
    loadMenuGenres();
    updateMenuCounts();
    document.addEventListener('mb:favchange', updateMenuCounts);
    window.addEventListener('pageshow', updateMenuCounts);
    window.addEventListener('storage', updateMenuCounts);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();