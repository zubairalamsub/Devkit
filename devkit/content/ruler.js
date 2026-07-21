// DevKit element ruler — hover any element to see its dimensions, box model
// and a CSS selector. Injected on demand; injecting again (or pressing Esc)
// removes it. Self-contained: no page globals are modified except the guard.
(() => {
  if (window.__devkitRuler) { window.__devkitRuler.destroy(); return; }

  const Z = 2147483646;
  const box = document.createElement('div');
  box.style.cssText = `position:fixed;pointer-events:none;z-index:${Z};` +
    'background:rgba(59,116,242,.18);border:1.5px solid #3b74f2;border-radius:2px;' +
    'transition:all .06s ease;display:none;box-sizing:border-box;';

  const tip = document.createElement('div');
  tip.style.cssText = `position:fixed;pointer-events:none;z-index:${Z + 1};` +
    'background:#151a23;color:#e8ecf3;font:11px/1.5 Consolas,Menlo,monospace;' +
    'padding:7px 10px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,.4);' +
    'max-width:340px;display:none;white-space:pre;';

  document.documentElement.appendChild(box);
  document.documentElement.appendChild(tip);

  function selectorFor(el) {
    if (el.id) return '#' + el.id;
    let sel = el.tagName.toLowerCase();
    const classes = [...el.classList].slice(0, 3);
    if (classes.length) sel += '.' + classes.join('.');
    return sel;
  }

  function onMove(e) {
    const target = document.elementFromPoint(e.clientX, e.clientY);
    if (!target || target === box || target === tip || target === document.documentElement) {
      box.style.display = tip.style.display = 'none';
      return;
    }
    const r = target.getBoundingClientRect();
    const cs = getComputedStyle(target);
    box.style.display = 'block';
    box.style.left = r.left + 'px';
    box.style.top = r.top + 'px';
    box.style.width = r.width + 'px';
    box.style.height = r.height + 'px';

    const fmt = (t, rr, b, l) => (t === rr && rr === b && b === l) ? t : `${t} ${rr} ${b} ${l}`;
    const px = (v) => v.replace('px', '') || '0';
    tip.textContent =
      selectorFor(target) + '\n' +
      Math.round(r.width * 10) / 10 + ' × ' + Math.round(r.height * 10) / 10 + ' px\n' +
      'margin : ' + fmt(px(cs.marginTop), px(cs.marginRight), px(cs.marginBottom), px(cs.marginLeft)) + '\n' +
      'padding: ' + fmt(px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)) + '\n' +
      'display: ' + cs.display + (cs.position !== 'static' ? '  pos: ' + cs.position : '');

    tip.style.display = 'block';
    const tw = tip.offsetWidth, th = tip.offsetHeight;
    let x = e.clientX + 14, y = e.clientY + 14;
    if (x + tw > innerWidth - 8) x = e.clientX - tw - 14;
    if (y + th > innerHeight - 8) y = e.clientY - th - 14;
    tip.style.left = Math.max(4, x) + 'px';
    tip.style.top = Math.max(4, y) + 'px';
  }

  function onKey(e) { if (e.key === 'Escape') destroy(); }

  function destroy() {
    removeEventListener('mousemove', onMove, true);
    removeEventListener('keydown', onKey, true);
    box.remove();
    tip.remove();
    delete window.__devkitRuler;
  }

  addEventListener('mousemove', onMove, true);
  addEventListener('keydown', onKey, true);
  window.__devkitRuler = { destroy };
})();
