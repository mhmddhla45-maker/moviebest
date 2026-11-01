(function () {
  'use strict';

  function ShareMenu(root) {
    this.root = root;
    this.toggle = root.querySelector('[data-share-toggle]');
    this.menu = root.querySelector('[data-share-menu]');
    this.isOpen = false;
    this.items = [];
    this.init();
  }

  ShareMenu.prototype.init = function () {
    if (!this.toggle || !this.menu) return;
    this.items = Array.prototype.slice.call(this.menu.querySelectorAll('[role="menuitem"]'));

    this.toggle.setAttribute('aria-haspopup', 'menu');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('role', 'menu');
    this.menu.setAttribute('aria-hidden', 'true');
    this.menu.hidden = true;
    this.items.forEach(function (el) { el.setAttribute('tabindex', '-1'); });

    var self = this;

    this.toggle.addEventListener('click', function (e) {
      e.preventDefault();
      self.isOpen ? self.close() : self.open();
    });

    this.toggle.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        self.open();
        self.focusItem(0);
      }
    });

    this.menu.addEventListener('keydown', function (e) { self.onMenuKeydown(e); });
    this.menu.addEventListener('click', function (e) { self.onMenuClick(e); });

    document.addEventListener('click', function (e) {
      if (self.isOpen && !self.root.contains(e.target)) self.close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && self.isOpen) {
        self.close();
        self.toggle.focus();
      }
    });

    // إخفاء خيار "المشاركة السريعة" إذا لم يكن مدعوماً
    var nativeItem = this.menu.querySelector('[data-share="native"]');
    if (nativeItem && !navigator.share) {
      nativeItem.style.display = 'none';
      var sep = nativeItem.nextElementSibling;
      if (sep && sep.getAttribute('role') === 'separator') sep.style.display = 'none';
    }
  };

  ShareMenu.prototype.open = function () {
    if (this.isOpen) return;
    this.isOpen = true;
    this.menu.hidden = false;
    this.menu.setAttribute('aria-hidden', 'false');
    this.toggle.setAttribute('aria-expanded', 'true');
    this.root.classList.add('open');
    var self = this;
    requestAnimationFrame(function () { self.menu.classList.add('is-open'); });
  };

  ShareMenu.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.menu.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.menu.setAttribute('aria-hidden', 'true');
    this.root.classList.remove('open');
    var self = this;
    setTimeout(function () { if (!self.isOpen) self.menu.hidden = true; }, 180);
  };

  ShareMenu.prototype.focusItem = function (i) {
    if (!this.items.length) return;
    var n = this.items.length;
    var idx = ((i % n) + n) % n;
    this.items.forEach(function (el, k) { el.setAttribute('tabindex', k === idx ? '0' : '-1'); });
    this.items[idx].focus();
  };

  ShareMenu.prototype.onMenuKeydown = function (e) {
    var current = document.activeElement;
    var i = this.items.indexOf(current);
    if (e.key === 'ArrowDown') { e.preventDefault(); this.focusItem(i + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.focusItem(i - 1); }
    else if (e.key === 'Home') { e.preventDefault(); this.focusItem(0); }
    else if (e.key === 'End') { e.preventDefault(); this.focusItem(this.items.length - 1); }
    else if (e.key === 'Escape') { e.preventDefault(); this.close(); this.toggle.focus(); }
    else if (e.key === 'Tab') { this.close(); }
  };

  ShareMenu.prototype.onMenuClick = function (e) {
    var btn = e.target.closest('[role="menuitem"]');
    if (!btn) return;
    var action = btn.dataset.share;
    if (action) this.share(action);
    this.close();
    this.toggle.focus();
  };

  ShareMenu.prototype.payload = function () {
    return {
      url: window.location.href,
      title: document.title,
      text: document.title + ' — Movie Best'
    };
  };

  ShareMenu.prototype.share = function (action) {
    var p = this.payload();
    var MB = window.MB || {};
    var toast = MB.toast || function (m) { console.log(m); };

    if (action === 'copy' || action === 'notes') {
      var content = action === 'notes' ? (p.title + '\n' + p.url) : p.url;
      var done = function () { toast(action === 'notes' ? '📝 تم نسخ الملاحظة' : '📋 تم نسخ الرابط'); };
      var fail = function () { toast('❌ تعذّر النسخ', 'error'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(content).then(done).catch(fail);
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = content;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand('copy');
          ta.remove();
          ok ? done() : fail();
        } catch (err) { fail(); }
      }
      return;
    }

    if (action === 'native') {
      if (navigator.share) {
        navigator.share(p).catch(function (err) {
          if (err && err.name !== 'AbortError') toast('❌ فشلت المشاركة', 'error');
        });
      } else {
        toast('⚠️ المشاركة غير مدعومة في هذا المتصفح', 'error');
      }
      return;
    }

    var map = {
      whatsapp: function () {
        window.open('https://wa.me/?text=' + encodeURIComponent(p.text + '\n' + p.url), '_blank', 'noopener,noreferrer');
      },
      telegram: function () {
        window.open('https://t.me/share/url?url=' + encodeURIComponent(p.url) + '&text=' + encodeURIComponent(p.title), '_blank', 'noopener,noreferrer');
      },
      facebook: function () {
        window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(p.url), '_blank', 'noopener,noreferrer');
      },
      twitter: function () {
        window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(p.url) + '&text=' + encodeURIComponent(p.title), '_blank', 'noopener,noreferrer');
      }
    };
    if (map[action]) map[action]();
  };

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-share-menu-root]').forEach(function (el) {
      new ShareMenu(el);
    });
  });
})();