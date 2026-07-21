// DevKit font inspector — hover text to see typography details.
// Injected on demand; injecting again (or pressing Esc) removes it.
(() => {
  if (window.__devkitFonts) { window.__devkitFonts.destroy(); return; }

  const Z = 2147483646;
  const tip = document.createElement('div');
  tip.style.cssText = `position:fixed;pointer-events:none;z-index:${Z};` +
    'background:#151a23;color:#e8ecf3;font:11px/1.6 Consolas,Menlo,monospace;' +
    'padding:8px 11px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.4);' +
    'max-width:360px;display:none;white-space:pre-wrap;';
  document.documentElement.appendChild(tip);

  function onMove(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === tip || target === document.documentElement || target === document.body) {
      tip.style.display = 'none';
      return;
    }
    const cs = getComputedStyle(target);
    const family = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    tip.textContent =
      family + '\n' +
      'size   : ' + cs.fontSize + '   weight: ' + cs.fontWeight + '\n' +
      'line-h : ' + cs.lineHeight + '   spacing: ' + cs.letterSpacing + '\n' +
      'color  : ' + cs.color + '\n' +
      'stack  : ' + cs.fontFamily.slice(0, 90);
    tip.style.display = 'block';
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + tw > innerWidth - 8) x = e.clientX - tw - 14;
    if (y + th > innerHeight - 8) y = e.clientY - th - 14;
    tip.style.left = Math.max(4, x) + 'px';
    tip.style.top = Math.max(4, y) + 'px';
  }

  function onClick(e) {
    // Click copies the primary font family.
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    const family = getComputedStyle(target).fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    navigator.clipboard?.writeText(family).catch(() => {});
    tip.textContent = 'Copied: ' + family;
  }

  function onKey(e) { if (e.key === 'Escape') destroy(); }

  function destroy() {
    removeEventListener('mousemove', onMove, true);
    removeEventListener('click', onClick, true);
    removeEventListener('keydown', onKey, true);
    tip.remove();
    delete window.__devkitFonts;
  }

  addEventListener('mousemove', onMove, true);
  addEventListener('click', onClick, true);
  addEventListener('keydown', onKey, true);
  window.__devkitFonts = { destroy };
})();
