(function () {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  let requestedId = params.get("id");
  
  
  if (!requestedId) {
    const pathParts = window.location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && lastPart !== 'watch.html' && lastPart !== 'watch') {
      requestedId = lastPart;
    }
  }

  const fallback = DATA.find(x => x.type === "series") || DATA[0];
  const item = DATA.find(x => x.id === requestedId) || fallback;

  const $ = id => document.getElementById(id);
  const escapeHtml = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ========== Meta tags ========== */
  document.title = `${item.title} — Movie Best`;
  const setMeta = (property, content) => {
    let tag = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(property.startsWith('og:') || property.startsWith('twitter:') ? 'property' : 'name', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };
  setMeta('description', (item.description || '').substring(0, 160));
  setMeta('og:title', item.title);
  setMeta('og:description', (item.description || '').substring(0, 200));
  setMeta('og:image', item.image || '');
  setMeta('og:url', window.location.href);
  setMeta('og:type', 'video.other');
  setMeta('twitter:card', 'summary_large_image');

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }
  canonical.href = location.origin + '/watch/' + encodeURIComponent(item.id);

  try {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": item.type === "movie" ? "Movie" : "TVEpisode",
      "name": item.title,
      "image": item.image,
      "description": item.description,
      "datePublished": String(item.year || ''),
      "genre": item.genres || []
    };
    if (item.rating) {
      jsonLd.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": String(item.rating),
        "bestRating": "10"
      };
    }
    const s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(s);
  } catch (e) { /* silent */ }

  /* ========== تعبئة البيانات ========== */
  $("watchTitle").textContent = item.title;
  $("watchStory").textContent = item.description || '';
  $("sidePoster").src = item.image || '';
  $("sidePoster").alt = item.title;
  $("crumbTitle").textContent = item.title;

  $("crumbType").textContent = item.type === "series" ? "مسلسلات" : "أفلام";
  $("crumbType").href = item.type === "series" ? "index.html#series" : "index.html#movies";

  const sideTitleEl = $("sideTitle");
  if (item.type === 'series' && item.name) {
    sideTitleEl.innerHTML = `<a href="/series?name=${encodeURIComponent(item.name)}" style="color:inherit;text-decoration:none;border-bottom:1px dashed rgba(243,194,107,.5)">${escapeHtml(item.title)}</a>`;
  } else {
    sideTitleEl.textContent = item.title;
  }

  const chips = [
    `<span class="chip chip-gold">${escapeHtml(item.year || '')}</span>`,
    `<span class="chip">${escapeHtml(item.quality || '')}</span>`
  ];
  if (item.type === "series") {
    chips.push(`<span class="chip">الموسم ${item.season || 1}</span>`);
    chips.push(`<span class="chip">الحلقة ${item.episode || 1}</span>`);
  }
  if (item.rating) chips.push(`<span class="chip chip-rating">★ ${escapeHtml(item.rating)}</span>`);
  $("watchMeta").innerHTML = chips.join('');
  $("sideChips").innerHTML = chips.join('');

  $("watchGenres").innerHTML = (item.genres || [])
    .map(g => `<a href="/genre?g=${encodeURIComponent(g)}" class="chip">${escapeHtml(g)}</a>`)
    .join('');

  /* ========== السيرفرات ========== */
  const player = $("player");
  const playerLoading = $("playerLoading");
  const serverGrid = $("serverGrid");

  function setServer(index) {
    const server = (item.servers || [])[index];
    if (!server || !server.url) return;
    playerLoading.classList.remove("hide");
    player.src = server.url;
    player.addEventListener("load", () => playerLoading.classList.add("hide"), { once: true });
    setTimeout(() => playerLoading.classList.add("hide"), 1800);
    serverGrid.querySelectorAll(".server-btn").forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
    });
  }

  if (!item.servers || !item.servers.length) {
    serverGrid.innerHTML = `<p class="panel-note">لا توجد سيرفرات متاحة حالياً.</p>`;
  } else {
    serverGrid.innerHTML = item.servers.map((s, i) => `
      <button class="server-btn" data-index="${i}" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>
        ${escapeHtml(s.name || ('سيرفر ' + (i+1)))}
      </button>
    `).join('');
    serverGrid.addEventListener("click", e => {
      const btn = e.target.closest(".server-btn");
      if (btn) setServer(Number(btn.dataset.index));
    });
    setServer(0);
  }

  /* ========== المفضلة ========== */
  const favBtn = $("favWatchBtn");
  if (favBtn && window.MB) {
    favBtn.setAttribute('data-fav-id', item.id);
    MB.Favorites.updateButtons();
  }

  /* ========== السجل ========== */
  if (window.MB) MB.History.add(item.id);

  /* ========== القائمة الجانبية ========== */
  if (item.type === "series") {
    const episodes = DATA.filter(x => x.type === "series" && x.name === item.name && x.season === item.season)
      .sort((a, b) => (a.episode||1) - (b.episode||1));
    const seasons = [...new Set(DATA.filter(x => x.type === "series" && x.name === item.name).map(x => x.season))].sort((a,b) => a-b);
    $("sideBlockTitle").textContent = `حلقات ${item.name} — الموسم ${item.season}`;

    let switcher = '';
    if (seasons.length > 1) {
      switcher = `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--line)">
        ${seasons.map(s => {
          const firstEp = DATA.find(x => x.type === "series" && x.name === item.name && x.season === s);
          const isActive = s === item.season;
          return `<a href="/watch/${encodeURIComponent(firstEp.id)}" style="padding:5px 12px;border-radius:8px;font-size:12px;font-weight:700;background:${isActive ? 'linear-gradient(150deg,var(--gold),var(--gold-2))' : 'rgba(255,255,255,.05)'};color:${isActive ? '#0a0a0f' : 'var(--muted)'}">الموسم ${s}</a>`;
        }).join('')}
      </div>`;
    }

    $("sideList").innerHTML = switcher + episodes.map(ep => `
      <a class="side-item ${ep.id === item.id ? 'active' : ''}" href="/watch/${encodeURIComponent(ep.id)}">
        <span class="num">${ep.episode || '?'}</span>
        <span class="lbl">الحلقة ${ep.episode || '?'}</span>
      </a>
    `).join('');
  } else {
    const related = DATA.filter(x => x.type === "movie" && x.id !== item.id)
      .sort((a, b) => {
        const aM = (a.genres||[]).includes((item.genres||[])[0]) ? 1 : 0;
        const bM = (b.genres||[]).includes((item.genres||[])[0]) ? 1 : 0;
        if (aM !== bM) return bM - aM;
        return (b.year||0) - (a.year||0);
      })
      .slice(0, 10);

    $("sideBlockTitle").textContent = "أفلام قد تعجبك";
    $("sideList").innerHTML = related.map(mv => `
      <a class="side-item" href="/watch/${encodeURIComponent(mv.id)}">
        <span class="num">★</span>
        <span class="lbl">${escapeHtml(mv.name || mv.title)}</span>
      </a>
    `).join('');
  }

  /* ========== البحث ========== */
  const searchInput = $("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        const q = searchInput.value.trim();
        if (q) window.location.href = '/search?q=' + encodeURIComponent(q);
      }
    });
  }

  const yearEl = $("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();