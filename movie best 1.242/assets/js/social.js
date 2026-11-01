(function () {
  'use strict';

  const FAV_KEY = 'mb_favorites_v1';
  const HIST_KEY = 'mb_history_v1';
  const HIST_MAX = 60;

  window.MB = window.MB || {};

  MB.TELEGRAM_URL = 'https://t.me/moviebest_ar';
  MB.INSTAGRAM_URL = 'https://www.instagram.com/movie.best.ar';

  MB.toast = function (msg, type) {
    const el = document.createElement('div');
    el.className = 'mb-toast mb-toast-' + (type || 'success');
    el.textContent = msg;
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => {
      el.classList.remove('show');
      setTimeout(() => el.remove(), 320);
    }, 2400);
  };

  MB.Favorites = {
    get() {
      try {
        const raw = localStorage.getItem(FAV_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (e) { return []; }
    },
    save(arr) {
      try { localStorage.setItem(FAV_KEY, JSON.stringify(arr)); } catch (e) {}
    },
    has(id) { return this.get().indexOf(id) !== -1; },
    add(id) {
      const favs = this.get();
      if (favs.indexOf(id) === -1) {
        favs.unshift(id);
        this.save(favs);
      }
      this.updateButtons();
    },
    remove(id) {
      this.save(this.get().filter(x => x !== id));
      this.updateButtons();
    },
    toggle(id) {
      if (this.has(id)) { this.remove(id); return false; }
      this.add(id); return true;
    },
    clear() {
      this.save([]);
      this.updateButtons();
    },
    updateButtons() {
      const favs = this.get();
      document.querySelectorAll('[data-fav-id]').forEach(btn => {
        const id = btn.dataset.favId;
        if (!id) return;
        const isFav = favs.indexOf(id) !== -1;
        btn.classList.toggle('is-fav', isFav);
        btn.setAttribute('aria-label', isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة');
        btn.title = isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة';
        const icon = btn.querySelector('svg');
        if (icon) icon.setAttribute('fill', isFav ? 'currentColor' : 'none');
        const label = btn.querySelector('.fav-label');
        if (label) label.textContent = isFav ? 'في المفضلة' : 'مفضلة';
      });
    }
  };

  MB.History = {
    get() {
      try {
        const raw = localStorage.getItem(HIST_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
      } catch (e) { return []; }
    },
    save(arr) {
      try { localStorage.setItem(HIST_KEY, JSON.stringify(arr)); } catch (e) {}
    },
    add(id) {
      if (!id) return;
      const hist = this.get().filter(x => x.id !== id);
      hist.unshift({ id: id, ts: Date.now() });
      this.save(hist.slice(0, HIST_MAX));
    },
    clear() { this.save([]); }
  };

  MB.Share = {
    getUrl() { return window.location.href; },
    open(network, url, title) {
      let shareUrl = '';
      const u = encodeURIComponent(url);
      const t = encodeURIComponent(title);
      if (network === 'whatsapp') shareUrl = 'https://wa.me/?text=' + t + '%0A' + u;
      else if (network === 'telegram') shareUrl = 'https://t.me/share/url?url=' + u + '&text=' + t;
      else if (network === 'facebook') shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + u;
      else if (network === 'twitter') shareUrl = 'https://twitter.com/intent/tweet?url=' + u + '&text=' + t;
      if (!shareUrl) return;
      window.open(shareUrl, '_blank', 'noopener,noreferrer,width=620,height=540');
    },
    copy(url) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(url).then(() => true).catch(() => false);
      }
      try {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return Promise.resolve(ok);
      } catch (e) { return Promise.resolve(false); }
    },
    native(url, title) {
      if (navigator.share) {
        return navigator.share({ title: title, url: url }).then(() => true).catch(() => false);
      }
      return Promise.resolve(false);
    }
  };

  document.addEventListener('click', (e) => {
    const favBtn = e.target.closest('[data-fav-id]');
    if (!favBtn) return;
    const id = favBtn.dataset.favId;
    if (!id) { e.preventDefault(); return; }
    e.preventDefault();
    e.stopPropagation();
    const isNow = MB.Favorites.toggle(id);
    MB.toast(isNow ? '❤️ أُضيف إلى المفضلة' : '💔 أُزيل من المفضلة', isNow ? 'success' : 'error');
    document.dispatchEvent(new CustomEvent('mb:favchange', { detail: { id: id, isFav: isNow } }));
  }, true);

  window.addEventListener('pageshow', () => {
    MB.Favorites.updateButtons();
    document.dispatchEvent(new CustomEvent('mb:pageback'));
  });

  document.addEventListener('DOMContentLoaded', () => {
    MB.Favorites.updateButtons();
  });

})();