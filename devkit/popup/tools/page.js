// On-page tools: injected into the active tab via chrome.scripting (activeTab).

DK.register({
  id: 'pagetools',
  name: 'Page Inspector',
  icon: '🔍',
  group: 'Page Tools',
  keywords: 'ruler measure element inspect font outline overlay page',
  sub: 'Toggle inspection overlays on the current page. Click again (or press Esc on the page) to turn off.',
  render(panel) {
    const { el, toast, runInPage } = DK;

    async function toggle(file, label) {
      const res = await runInPage({ files: ['content/' + file] });
      if (res !== null) toast(label + ' toggled — switch to the page');
    }

    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: () => toggle('ruler.js', 'Element ruler') }, '📏 Element Ruler'),
      el('span', { class: 'hint grow', text: 'Hover any element to see its size, box model and selector.' })
    ]));
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: () => toggle('fonts.js', 'Font inspector') }, '🔤 Font Inspector'),
      el('span', { class: 'hint grow', text: 'Hover text to see family, size, weight, line-height and color.' })
    ]));
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: () => toggle('outline.js', 'CSS outlines') }, '🧱 Outline All Elements'),
      el('span', { class: 'hint grow', text: 'Outline every element to debug layout and nesting.' })
    ]));
    panel.appendChild(el('p', { class: 'hint', text: 'Tip: overlays stay active after the popup closes. Press Esc on the page or click the button again to remove them.' }));
  }
});

// ---------- Color palette extractor ----------
DK.register({
  id: 'palette',
  name: 'Palette Extractor',
  icon: '🌈',
  group: 'Page Tools',
  keywords: 'palette colors extract page css computed swatches',
  sub: 'Collect the colors actually used on the current page.',
  render(panel) {
    const { el, toast, runInPage } = DK;
    const grid = el('div', { class: 'swatch-grid' });
    const status = el('span', { class: 'hint', text: 'Click Extract to scan the page.' });

    function pageColors() {
      const counts = new Map();
      const els = document.querySelectorAll('*');
      const max = Math.min(els.length, 5000);
      for (let i = 0; i < max; i++) {
        const cs = getComputedStyle(els[i]);
        for (const prop of ['color', 'backgroundColor', 'borderTopColor']) {
          const v = cs[prop];
          if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'transparent') continue;
          counts.set(v, (counts.get(v) || 0) + 1);
        }
      }
      return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 42);
    }

    function toHex(rgbStr) {
      const m = rgbStr.match(/(\d+)\D+(\d+)\D+(\d+)/);
      if (!m) return rgbStr;
      return '#' + [m[1], m[2], m[3]].map((v) => Number(v).toString(16).padStart(2, '0')).join('');
    }

    async function extract() {
      status.textContent = 'Scanning…';
      const colors = await runInPage({ func: pageColors });
      grid.textContent = '';
      if (!colors) { status.textContent = 'Could not scan this page.'; return; }
      status.textContent = colors.length + ' colors found — click a swatch to copy its hex value.';
      for (const [rgb, count] of colors) {
        const hex = toHex(rgb);
        grid.appendChild(el('div', { class: 'swatch', title: `${rgb} — used ${count}×`, onclick: () => DK.copy(hex) }, [
          el('div', { class: 'chip', style: 'background:' + rgb }),
          el('div', { class: 'lbl', text: hex })
        ]));
      }
    }

    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: extract }, '🌈 Extract Colors'),
      status
    ]));
    panel.appendChild(grid);
  }
});

// ---------- Screenshot ----------
DK.register({
  id: 'screenshot',
  name: 'Screenshot',
  icon: '📸',
  group: 'Page Tools',
  keywords: 'screenshot capture png visible tab image save',
  sub: 'Capture the visible part of the current tab as a PNG.',
  render(panel) {
    const { el, toast } = DK;
    const preview = el('div', { class: 'out', 'data-placeholder': 'Capture preview appears here.' });
    preview.style.textAlign = 'center';
    let dataUrl = null;

    async function capture() {
      if (!DK.IS_EXT || !chrome.tabs || !chrome.tabs.captureVisibleTab) {
        toast('Open DevKit as an extension to capture screenshots');
        return;
      }
      try {
        dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
        preview.textContent = '';
        const img = el('img', { src: dataUrl, style: 'max-width:100%;border-radius:4px' });
        preview.appendChild(img);
        toast('Captured — click Download to save');
      } catch (e) {
        toast('Capture failed: ' + (e.message || e));
      }
    }

    function download() {
      if (!dataUrl) { toast('Capture first'); return; }
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const a = el('a', { href: dataUrl, download: 'devkit-screenshot-' + stamp + '.png' });
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    async function copyImage() {
      if (!dataUrl) { toast('Capture first'); return; }
      try {
        const blob = await (await fetch(dataUrl)).blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast('Image copied to clipboard');
      } catch (e) {
        toast('Copy failed: ' + e.message);
      }
    }

    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: capture }, '📸 Capture visible area'),
      el('button', { class: 'btn', onclick: download }, 'Download PNG'),
      el('button', { class: 'btn', onclick: copyImage }, 'Copy image')
    ]));
    panel.appendChild(preview);
  }
});
