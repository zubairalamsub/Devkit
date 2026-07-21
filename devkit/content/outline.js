// DevKit outline overlay — outlines every element to reveal layout structure.
// Depth-tinted: different nesting levels get different hues.
// Injected on demand; injecting again (or pressing Esc) removes it.
(() => {
  if (window.__devkitOutline) { window.__devkitOutline.destroy(); return; }

  const style = document.createElement('style');
  style.textContent = `
    * { outline: 1px solid rgba(230, 60, 140, .45) !important; outline-offset: -1px !important; }
    * * { outline-color: rgba(60, 130, 240, .45) !important; }
    * * * { outline-color: rgba(50, 190, 120, .45) !important; }
    * * * * { outline-color: rgba(240, 160, 40, .5) !important; }
    * * * * * { outline-color: rgba(170, 90, 240, .5) !important; }
    * * * * * * { outline-color: rgba(230, 60, 140, .45) !important; }
    * * * * * * * { outline-color: rgba(60, 130, 240, .45) !important; }
    * * * * * * * * { outline-color: rgba(50, 190, 120, .45) !important; }
  `;
  document.documentElement.appendChild(style);

  function onKey(e) { if (e.key === 'Escape') destroy(); }

  function destroy() {
    removeEventListener('keydown', onKey, true);
    style.remove();
    delete window.__devkitOutline;
  }

  addEventListener('keydown', onKey, true);
  window.__devkitOutline = { destroy };
})();
