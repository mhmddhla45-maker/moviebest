(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const escapeHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function normalize(str) {
    return String(str || '').toLowerCase()
      .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه")
      .replace(/[\u064B-\u0652]/g, "");
  }

  function cardHTML(item) {
    const badge = item.type === "series"
      ? `<span class="card-badge">الحلقة ${item.episode || 1}</span>`
      : `<span class="card-badge">${item.year || ''}</span>`;
    const seriesLabel = item.type === "series" && item.name
      ? `<span class="card-series">${escapeHtml(item.name)}</span>` : "";
    const genresStr = (item.genres || []).join('|');
    const searchHay = normalize([item.title, item.name, item.year, ...(item.genres || [])].join(' '));

    return `
      <article class="card" data-type="${item.type}" data-id="${item.id}" data-year="${item.year || ''}" data-quality="${item.quality || ''}" data-genres="${escapeHtml(genresStr)}" data-search="${escapeHtml(searchHay)}">
        <a class="card-link" href="/watch/${encodeURIComponent(item.id)}">
          <div class="card-media">
            ${badge}
            <span class="card-quality">${escapeHtml(item.quality || '')}</span>
            <img src="${escapeHtml(item.image || '')}" alt="${escapeHtml(item.title)}" loading="lazy">
            <div class="card-play"><span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg></span></div>
          </div>
          <div class="card-body">
            ${seriesLabel}
            <h3 class="card-title">${escapeHtml(item.title)}</h3>
            <div class="card-meta">
              <span class="card-star">★ ${escapeHtml(item.rating || "—")}</span>
              <span class="sep"></span>
              <span>${escapeHtml(item.year || '')}</span>
              <span class="sep"></span>
              <span>${escapeHtml((item.genres || [])[0] || '')}</span>
            </div>
          </div>
        </a>
        <button class="fav-btn" data-fav-id="${item.id}" title="إضافة للمفضلة" aria-label="إضافة للمفضلة" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </article>`;
  }

  /* رسم الشبكات */
  const seriesItems = DATA.filter(i => i.type === "series").sort((a, b) => {
    if (a.name === b.name) return (a.season||1) - (b.season||1) || (a.episode||1) - (b.episode||1);
    return String(a.name||'').localeCompare(String(b.name||''));
  });
  const movieItems = DATA.filter(i => i.type === "movie").sort((a, b) => (b.year||0) - (a.year||0));

  const indexed = DATA.map((it, i) => ({ it, i }));
  indexed.sort((a, b) => ((b.it.year||0) - (a.it.year||0)) || (b.i - a.i));
  const latestItems = indexed.slice(0, 8).map(x => x.it);

  if ($("seriesGrid")) $("seriesGrid").innerHTML = seriesItems.map(cardHTML).join("");
  if ($("moviesGrid")) $("moviesGrid").innerHTML = movieItems.map(cardHTML).join("");
  if ($("latestGrid")) $("latestGrid").innerHTML = latestItems.map(cardHTML).join("");

  if ($("seriesCount")) $("seriesCount").textContent = new Set(seriesItems.map(s => s.name)).size + " مسلسل · " + seriesItems.length + " حلقة";
  if ($("moviesCount")) $("moviesCount").textContent = movieItems.length + " فيلم";
  if ($("latestCount")) $("latestCount").textContent = latestItems.length + " عنصر";

  /* الهيرو */
  function shuffle(a) { const b = a.slice(); for (let i = b.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; } return b; }

  const heroEl = $("hero"), heroBg = $("heroBg"), heroPoster = $("heroPoster");
  const heroTitle = $("heroTitle"), heroSub = $("heroSub"), heroMeta = $("heroMeta"), heroDesc = $("heroDesc");
  const heroBadge = $("heroBadge"), heroWatchBtn = $("heroWatchBtn"), heroSecBtn = $("heroSecBtn"), heroDots = $("heroDots");

  if (heroEl && heroBg && heroPoster) {
    const ICON_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5-11-6.5z"/></svg>';
    const ICON_LIST = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>';

    const seriesMap = new Map();
    DATA.filter(i => i.type === "series").forEach(i => {
      const key = `${i.name}||${i.season}`;
      const cur = seriesMap.get(key);
      if (!cur || (i.episode||1) < (cur.episode||1)) seriesMap.set(key, i);
    });
    const reps = [...seriesMap.values()];
    const movies = DATA.filter(i => i.type === "movie");
    const pool = [...reps, ...movies];

    function prepSlide(item) {
      if (item.type === "series") {
        const eps = DATA.filter(x => x.type === "series" && x.name === item.name && x.season === item.season)
          .sort((a, b) => (a.episode||1) - (b.episode||1));
        const first = eps[0] || item;
        return {
          repId: first.id, isSeries: true, item,
          title: item.name, sub: `الموسم ${item.season}`,
          chips: `<span class="chip chip-gold">${item.year||''}</span><span class="chip">${item.quality||''}</span><span class="chip">${eps.length} حلقات</span><span class="chip chip-rating">★ ${item.rating||'—'}</span>`
        };
      }
      return {
        repId: item.id, isSeries: false, item,
        title: item.name || item.title, sub: `فيلم · ${(item.genres||[])[0]||'مترجم'}`,
        chips: `<span class="chip chip-gold">${item.year||''}</span><span class="chip">${item.quality||''}</span><span class="chip">${(item.genres||[])[0]||''}</span><span class="chip chip-rating">★ ${item.rating||'—'}</span>`
      };
    }

    const idx = pool.map((it, i) => ({ it, i }));
    idx.sort((a, b) => ((b.it.year||0) - (a.it.year||0)) || (b.i - a.i));
    const latest = idx.slice(0, 8).map(x => x.it);
    const latestIds = new Set(latest.map(x => x.id));
    const rest = pool.filter(x => !latestIds.has(x.id));
    const rand = shuffle(rest).slice(0, 6);
    const slides = shuffle([...latest.slice(0, 4), ...rand]).slice(0, 6).map(prepSlide);

    let current = 0, autoTimer = null, switching = false;

    function render(slide) {
      const url = `/watch/${slide.repId}`;
      heroBg.style.backgroundImage = `url("${slide.item.image}")`;
      heroPoster.src = slide.item.image;
      heroPoster.alt = slide.title;
      heroTitle.textContent = slide.title;
      heroSub.textContent = slide.sub;
      heroMeta.innerHTML = slide.chips;
      heroDesc.textContent = slide.item.description || '';
      heroBadge.innerHTML = `<span class="dot"></span> ${slide.isSeries ? 'مسلسل مميز' : 'فيلم مميز'}`;
      heroWatchBtn.href = url;
      heroWatchBtn.innerHTML = `${ICON_PLAY} شاهد الآن`;
      if (slide.isSeries) {
        heroSecBtn.href = `/series?name=${encodeURIComponent(slide.item.name)}`;
        heroSecBtn.innerHTML = `${ICON_LIST} كل الحلقات`;
      } else {
        heroSecBtn.href = '#movies';
        heroSecBtn.innerHTML = `${ICON_LIST} المزيد من الأفلام`;
      }
    }

    function updateDots() {
      if (!heroDots) return;
      heroDots.querySelectorAll('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === current));
    }

    function goTo(i) {
      if (i === current || switching) return;
      switching = true;
      heroEl.classList.add('switching');
      setTimeout(() => {
        current = i;
        render(slides[current]);
        updateDots();
        heroEl.classList.remove('switching');
        switching = false;
      }, 240);
    }

    function startAuto() { stopAuto(); if (slides.length > 1) autoTimer = setInterval(() => goTo((current + 1) % slides.length), 7000); }
    function stopAuto() { if (autoTimer) { clearInterval(autoTimer); autoTimer = null; } }

    if (heroDots) {
      heroDots.innerHTML = slides.map((_, i) => `<button class="hero-dot" data-i="${i}" aria-label="الشريحة ${i+1}"></button>`).join('');
      heroDots.addEventListener('click', e => {
        const b = e.target.closest('.hero-dot');
        if (b) { goTo(Number(b.dataset.i)); startAuto(); }
      });
    }

    render(slides[0]);
    updateDots();
    startAuto();
    heroEl.addEventListener('mouseenter', stopAuto);
    heroEl.addEventListener('mouseleave', startAuto);
    document.addEventListener('visibilitychange', () => { if (document.hidden) stopAuto(); else startAuto(); });
  }

  /* الفلاتر */
  const filterYear = $("filterYear"), filterQuality = $("filterQuality"), filterGenre = $("filterGenre");
  const filterClear = $("filterClear"), filterCount = $("filterCount");

  if (filterYear) {
    const years = [...new Set(DATA.map(x => x.year).filter(Boolean))].sort((a,b) => b - a);
    const qualities = [...new Set(DATA.map(x => x.quality).filter(Boolean))].sort();
    const genres = [...new Set(DATA.flatMap(x => x.genres || []))].sort();
    years.forEach(y => filterYear.innerHTML += `<option value="${y}">${y}</option>`);
    qualities.forEach(q => filterQuality.innerHTML += `<option value="${escapeHtml(q)}">${escapeHtml(q)}</option>`);
    genres.forEach(g => filterGenre.innerHTML += `<option value="${escapeHtml(g)}">${escapeHtml(g)}</option>`);
  }

  /* البحث + الفلاتر */
  const searchInput = $("searchInput"), searchClear = $("searchClear"), emptyState = $("emptyState");
  const seriesSec = $("series"), moviesSec = $("movies"), latestSec = $("latest");

  function applyAllFilters() {
    const term = normalize((searchInput && searchInput.value) || '');
    const year = filterYear ? filterYear.value : '';
    const quality = filterQuality ? filterQuality.value : '';
    const genre = filterGenre ? filterGenre.value : '';

    let visLatest = 0, visSeries = 0, visMovies = 0, total = 0;

    document.querySelectorAll('.card').forEach(card => {
      const parent = card.closest('.section');
      if (parent && (parent.id === 'favoritesSection' || parent.id === 'historySection')) return;

      const cYear = card.dataset.year || '';
      const cQuality = card.dataset.quality || '';
      const cGenres = (card.dataset.genres || '').split('|').filter(Boolean);
      const cSearch = card.dataset.search || '';

      const ok = (!term || cSearch.indexOf(term) !== -1)
        && (!year || cYear === year)
        && (!quality || cQuality === quality)
        && (!genre || cGenres.indexOf(genre) !== -1);

      card.style.display = ok ? '' : 'none';
      if (!ok) return;

      if (parent === latestSec) visLatest++;
      else if (parent === seriesSec) visSeries++;
      else if (parent === moviesSec) visMovies++;
      total++;
    });

    if (latestSec) latestSec.style.display = visLatest ? '' : 'none';
    if (seriesSec) seriesSec.style.display = visSeries ? '' : 'none';
    if (moviesSec) moviesSec.style.display = visMovies ? '' : 'none';

    const hasFilters = !!(term || year || quality || genre);
    if (emptyState) emptyState.hidden = !(hasFilters && total === 0);
    if (searchClear) searchClear.hidden = !(searchInput && searchInput.value);
    if (filterClear) filterClear.hidden = !(year || quality || genre);
    if (filterCount) filterCount.innerHTML = hasFilters ? `عرض <b>${total}</b> عنصر` : '';
  }

  let searchTimer;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyAllFilters, 120);
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      applyAllFilters();
    });
  }
  [filterYear, filterQuality, filterGenre].forEach(sel => {
    if (sel) sel.addEventListener('change', applyAllFilters);
  });
  if (filterClear) {
    filterClear.addEventListener('click', () => {
      if (filterYear) filterYear.value = '';
      if (filterQuality) filterQuality.value = '';
      if (filterGenre) filterGenre.value = '';
      applyAllFilters();
    });
  }

  /* المفضلة + السجل */
  const favoritesSection = $("favoritesSection"), favoritesGrid = $("favoritesGrid");
  const historySection = $("historySection"), historyGrid = $("historyGrid");
  const clearFavoritesBtn = $("clearFavoritesBtn"), clearHistoryBtn = $("clearHistoryBtn");

  function renderFavorites() {
    if (!window.MB || !MB.Favorites || !favoritesSection) return;
    const favIds = MB.Favorites.get();
    const items = favIds.map(id => DATA.find(x => x.id === id)).filter(Boolean);
    if (!items.length) {
      favoritesSection.hidden = true;
      favoritesGrid.innerHTML = '';
      return;
    }
    favoritesSection.hidden = false;
    favoritesGrid.innerHTML = items.map(cardHTML).join('');
    MB.Favorites.updateButtons();
  }

  function renderHistory() {
    if (!window.MB || !MB.History || !historySection) return;
    const hist = MB.History.get();
    const items = hist.map(h => DATA.find(x => x.id === h.id)).filter(Boolean).slice(0, 8);
    if (!items.length) {
      historySection.hidden = true;
      historyGrid.innerHTML = '';
      return;
    }
    historySection.hidden = false;
    historyGrid.innerHTML = items.map(cardHTML).join('');
    MB.Favorites.updateButtons();
  }

  if (clearFavoritesBtn) {
    clearFavoritesBtn.addEventListener('click', () => {
      if (!confirm('مسح كل المفضلة؟')) return;
      MB.Favorites.clear();
      renderFavorites();
      MB.toast('تم مسح المفضلة');
    });
  }
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      if (!confirm('مسح كل سجل المشاهدة؟')) return;
      MB.History.clear();
      renderHistory();
      MB.toast('تم مسح السجل');
    });
  }

  document.addEventListener('mb:favchange', renderFavorites);
  document.addEventListener('mb:pageback', () => { renderFavorites(); renderHistory(); });
  window.addEventListener('pageshow', () => { renderFavorites(); renderHistory(); });

  renderFavorites();
  renderHistory();

  /* ⚡ التمرير التلقائي للأقسام عند الوصول بـ hash */
  function scrollToHash() {
    const hash = window.location.hash;
    if (!hash) return;
    if (hash === '#favoritesSection' && favoritesSection && !favoritesSection.hidden) {
      setTimeout(() => favoritesSection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    } else if (hash === '#historySection' && historySection && !historySection.hidden) {
      setTimeout(() => historySection.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }
  scrollToHash();
  window.addEventListener('hashchange', scrollToHash);

  /* الهيدر */
  const header = $("siteHeader"), toTop = $("toTop");
  function onScroll() {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 10);
    if (toTop) toTop.classList.toggle('show', y > 500);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const yearEl = $("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();