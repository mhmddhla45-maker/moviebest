/* ==========================================================
   Movie Best — إدارة الإعلانات (النسخة النهائية المستقرة)
   ========================================================== */
window.MB_ADS = {
  enabled: true,

  slots: {
    // الإعلان العريض (728x90) في أعلى الرئيسية
    'home-top': { 
      type: 'banner', 
      label: 'إعلان', 
      html: `
        <script>
          atOptions = { 'key' : 'f753f5e3c800b50856526f12cc652b22', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };
        </script>
        <script src="https://bancadeltempoidea.org/22/f753f5e3c800b50856526f12cc652b22"></script>
      ` 
    },
    
    // إعلان مربع (300x250) في القائمة الجانبية لصفحة المشاهدة
    'watch-sidebar-top': { 
      type: 'box', 
      label: 'إعلان', 
      html: `
        <script>
          atOptions = { 'key' : '972d6e683ab1deaad130f5b21ff56a95', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {} };
        </script>
        <script src="https://bancadeltempoidea.org/22/972d6e683ab1deaad130f5b21ff56a95"></script>
      ` 
    },
    
    // الإعلان العريض (728x90) تحت الفيديو مباشرة في صفحة المشاهدة
    'watch-below-player': { 
      type: 'banner', 
      label: 'إعلان', 
      html: `
        <script>
          atOptions = { 'key' : 'f753f5e3c800b50856526f12cc652b22', 'format' : 'iframe', 'height' : 90, 'width' : 728, 'params' : {} };
        </script>
        <script src="https://bancadeltempoidea.org/22/f753f5e3c800b50856526f12cc652b22"></script>
      ` 
    },

    // أماكن أخرى فارغة
    'home-between': { type: 'banner', label: 'إعلان', html: '' },
    'home-bottom': { type: 'banner', label: 'إعلان', html: '' },
    'watch-above-player': { type: 'banner', label: 'إعلان', html: '' },
    'watch-above-servers': { type: 'banner', label: 'إعلان', html: '' },
    'watch-below-story': { type: 'banner', label: 'إعلان', html: '' },
    'watch-sidebar-bottom': { type: 'box', label: 'إعلان', html: '' },
    'genre-top': { type: 'banner', label: 'إعلان', html: '' },
    'search-top': { type: 'banner', label: 'إعلان', html: '' }
  }
};

/* ==========================================================
   محرك عرض الإعلانات — لا تعدّل هذا الجزء
   ========================================================== */
(function () {
  'use strict';
  if (!window.MB_ADS) return;

  function renderAd(slotName) {
    const container = document.querySelector('[data-ad="' + slotName + '"]');
    if (!container) return;

    const slot = MB_ADS.slots[slotName];

    if (!MB_ADS.enabled || !slot || !slot.html || !String(slot.html).trim()) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML =
      '<div class="ad-wrap ad-' + (slot.type || 'banner') + '">' +
        '<span class="ad-label">' + (slot.label || 'إعلان') + '</span>' +
        '<div class="ad-content" id="ad-content-' + slotName + '"></div>' +
      '</div>';
      
    // إصلاح الإخفاء لضمان ظهور الإطار
    container.style.display = 'block';
    
    var adContent = document.getElementById('ad-content-' + slotName);
    if (adContent) {
      const iframe = document.createElement('iframe');
      iframe.src = 'about:blank';
      iframe.style.border = 'none';
      iframe.style.overflow = 'hidden';
      iframe.style.margin = '0 auto';
      iframe.style.display = 'block';
      
      // تحديد الأبعاد الدقيقة المطلوبة من Adsterra
      if (slot.type === 'box') {
        iframe.width = '300';
        iframe.height = '250';
        iframe.style.width = '300px';
        iframe.style.height = '250px';
      } else {
        iframe.width = '728';
        iframe.height = '90';
        iframe.style.width = '728px';
        iframe.style.height = '90px';
        iframe.style.maxWidth = '100%'; // لكي لا يتخطى حدود الشاشة في الهاتف
      }

      adContent.appendChild(iframe);

      // حقن الكود بطريقة document.write (الطريقة الوحيدة التي تدعمها Adsterra داخل iframe)
      const iframeDoc = iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
          <style>
            body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
          </style>
        </head>
        <body>
          ${slot.html}
        </body>
        </html>
      `);
      iframeDoc.close();
    }
  }

  function renderAll() {
    Object.keys(MB_ADS.slots).forEach(renderAd);
  }

  window.MB_renderAds = renderAll;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }
})();