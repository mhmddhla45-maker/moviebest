(function () {
  'use strict';
  window.MB = window.MB || {};
  var BASE = 'Movie Best';

  MB.setTitle = function (page) {
    var full = page ? (page + ' — ' + BASE) : BASE;
    document.title = full;
    try {
      var og = document.querySelector('meta[property="og:title"]');
      if (og) og.setAttribute('content', full);
      var tw = document.querySelector('meta[name="twitter:title"]');
      if (tw) tw.setAttribute('content', full);
    } catch (e) {}
  };

  MB.getBaseTitle = function () { return BASE; };
})();