/* =============================================================
   TERMINAL BLOG THEME — theme.js
   Responsibilities:
     - Inject copy-to-clipboard buttons on all <pre> blocks
   ============================================================= */

(function () {
  'use strict';

  /* --- Copy-to-clipboard for code blocks --- */

  function addCopyButtons() {
    const blocks = document.querySelectorAll('pre');
    if (!blocks.length) return;

    blocks.forEach(function (pre) {
      /* skip if button already injected */
      if (pre.querySelector('.copy-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.setAttribute('aria-label', 'Copy code');
      btn.textContent = 'copy';

      /* pre needs position:relative — set defensively */
      pre.style.position = 'relative';

      btn.addEventListener('click', function () {
        const code = pre.querySelector('code');
        const text = code ? code.innerText : pre.innerText;

        navigator.clipboard.writeText(text).then(function () {
          btn.textContent = 'copied';
          btn.classList.add('copied');
        }).catch(function () {
          /* fallback for older browsers */
          const ta = document.createElement('textarea');
          ta.value = text;
          ta.style.cssText = 'position:fixed;opacity:0;';
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);

          btn.textContent = 'copied';
          btn.classList.add('copied');
        });
      });

      pre.appendChild(btn);
    });
  }

  /* --- Init --- */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }

}());
