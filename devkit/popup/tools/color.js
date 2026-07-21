// Design tools: color converter + eyedropper + WCAG contrast, CSS unit calculator.

// ---------- shared color math ----------
const DKColor = {
  parseHex(hex) {
    hex = hex.trim().replace(/^#/, '');
    if (/^[0-9a-f]{3}$/i.test(hex)) hex = hex.split('').map((c) => c + c).join('');
    if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
    return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  },
  toHex([r, g, b]) {
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  },
  rgbToHsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      else if (max === g) h = ((b - r) / d + 2) / 6;
      else h = ((r - g) / d + 4) / 6;
    }
    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  },
  hslToRgb([h, s, l]) {
    h /= 360; s /= 100; l /= 100;
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const f = (t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
  },
  luminance([r, g, b]) {
    const lin = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  },
  contrast(rgb1, rgb2) {
    const l1 = this.luminance(rgb1), l2 = this.luminance(rgb2);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }
};

// ---------- Color converter ----------
DK.register({
  id: 'color',
  name: 'Color Tools',
  icon: '🎨',
  group: 'Design',
  keywords: 'color hex rgb hsl convert eyedropper picker contrast wcag accessibility',
  sub: 'Convert colors, pick from screen, check WCAG contrast.',
  render(panel) {
    const { el, toast } = DK;

    const swatch = el('input', { type: 'color', value: '#3b74f2' });
    const hexIn = el('input', { type: 'text', value: '#3b74f2', style: 'width:110px', spellcheck: 'false' });
    const rgbIn = el('input', { type: 'text', style: 'width:150px', spellcheck: 'false' });
    const hslIn = el('input', { type: 'text', style: 'width:150px', spellcheck: 'false' });

    function setAll(rgb, skip) {
      if (skip !== 'hex') hexIn.value = DKColor.toHex(rgb);
      if (skip !== 'rgb') rgbIn.value = `rgb(${rgb.map(Math.round).join(', ')})`;
      if (skip !== 'hsl') {
        const [h, s, l] = DKColor.rgbToHsl(rgb);
        hslIn.value = `hsl(${h}, ${s}%, ${l}%)`;
      }
      swatch.value = DKColor.toHex(rgb);
      updateContrast();
    }

    hexIn.addEventListener('input', () => {
      const rgb = DKColor.parseHex(hexIn.value);
      if (rgb) setAll(rgb, 'hex');
    });
    rgbIn.addEventListener('input', () => {
      const m = rgbIn.value.match(/(\d{1,3})\D+(\d{1,3})\D+(\d{1,3})/);
      if (m) setAll([+m[1], +m[2], +m[3]].map((v) => Math.min(255, v)), 'rgb');
    });
    hslIn.addEventListener('input', () => {
      const m = hslIn.value.match(/(\d{1,3})\D+(\d{1,3})\D+(\d{1,3})/);
      if (m) setAll(DKColor.hslToRgb([Math.min(360, +m[1]), Math.min(100, +m[2]), Math.min(100, +m[3])]), 'hsl');
    });
    swatch.addEventListener('input', () => setAll(DKColor.parseHex(swatch.value)));

    async function pick(targetInput) {
      if (!window.EyeDropper) { toast('EyeDropper needs Chrome 95+'); return; }
      try {
        const { sRGBHex } = await new EyeDropper().open();
        if (targetInput) { targetInput.value = sRGBHex; targetInput.dispatchEvent(new Event('input')); }
        else setAll(DKColor.parseHex(sRGBHex));
        DK.copy(sRGBHex, 'Picked ' + sRGBHex + ' (copied)');
      } catch (e) { /* user cancelled */ }
    }

    // Contrast checker
    const fgIn = el('input', { type: 'color', value: '#1c2330' });
    const bgIn = el('input', { type: 'color', value: '#ffffff' });
    const preview = el('div', {
      style: 'padding:10px 14px;border-radius:6px;border:1px solid var(--border);font-weight:600',
      text: 'Sample text Aa'
    });
    const ratioOut = el('div', { class: 'row tight' });

    function updateContrast() {
      const fg = DKColor.parseHex(fgIn.value), bg = DKColor.parseHex(bgIn.value);
      if (!fg || !bg) return;
      const ratio = DKColor.contrast(fg, bg);
      preview.style.color = fgIn.value;
      preview.style.background = bgIn.value;
      ratioOut.textContent = '';
      ratioOut.appendChild(el('span', { class: 'badge', text: 'Ratio ' + ratio.toFixed(2) + ':1' }));
      const checks = [
        ['AA normal', 4.5], ['AA large', 3], ['AAA normal', 7], ['AAA large', 4.5]
      ];
      for (const [label, min] of checks) {
        ratioOut.appendChild(el('span', { class: 'badge ' + (ratio >= min ? 'ok' : 'err'), text: label + (ratio >= min ? ' ✓' : ' ✗') }));
      }
    }
    fgIn.addEventListener('input', updateContrast);
    bgIn.addEventListener('input', updateContrast);

    panel.appendChild(el('div', { class: 'row' }, [
      swatch,
      el('button', { class: 'btn primary', onclick: () => pick(null) }, '💧 Pick from screen'),
      el('span', { class: 'hint', text: 'Pick any pixel — works outside the browser too.' })
    ]));
    panel.appendChild(el('table', { class: 'kv-table' }, [
      el('tr', {}, [el('th', { text: 'HEX' }), el('td', {}, [hexIn, ' ', DK.copyBtn(() => hexIn.value)])]),
      el('tr', {}, [el('th', { text: 'RGB' }), el('td', {}, [rgbIn, ' ', DK.copyBtn(() => rgbIn.value)])]),
      el('tr', {}, [el('th', { text: 'HSL' }), el('td', {}, [hslIn, ' ', DK.copyBtn(() => hslIn.value)])])
    ]));

    panel.appendChild(el('h3', { text: 'WCAG Contrast Checker', style: 'margin:16px 0 6px;font-size:13px' }));
    panel.appendChild(el('div', { class: 'row' }, [
      el('label', { class: 'hint', text: 'Text ' }), fgIn,
      el('button', { class: 'btn icon', title: 'Pick text color from screen', onclick: () => pick(fgIn) }, '💧'),
      el('label', { class: 'hint', text: ' Background ' }), bgIn,
      el('button', { class: 'btn icon', title: 'Pick background color from screen', onclick: () => pick(bgIn) }, '💧')
    ]));
    panel.appendChild(preview);
    panel.appendChild(el('div', { style: 'height:8px' }));
    panel.appendChild(ratioOut);

    setAll(DKColor.parseHex('#3b74f2'));
  }
});

// ---------- CSS units ----------
DK.register({
  id: 'cssunits',
  name: 'CSS Units',
  icon: '📐',
  group: 'Design',
  keywords: 'css px rem em convert units pixels root font size',
  sub: 'Convert px ⇄ rem/em against a configurable base font size.',
  render(panel) {
    const { el } = DK;
    const base = el('input', { type: 'number', value: '16', min: '1', style: 'width:70px' });
    const pxIn = el('input', { type: 'number', value: '16', style: 'width:110px' });
    const remIn = el('input', { type: 'number', value: '1', step: '0.001', style: 'width:110px' });
    const table = el('div', { class: 'out' });

    function fromPx() {
      const b = Number(base.value) || 16;
      remIn.value = +(Number(pxIn.value) / b).toFixed(4);
      buildTable();
    }
    function fromRem() {
      const b = Number(base.value) || 16;
      pxIn.value = +(Number(remIn.value) * b).toFixed(2);
      buildTable();
    }
    function buildTable() {
      const b = Number(base.value) || 16;
      const common = [4, 8, 12, 14, 16, 18, 20, 24, 32, 40, 48, 64];
      table.textContent = common.map((px) => `${String(px).padStart(3)} px = ${(px / b).toFixed(4).replace(/\.?0+$/, '')} rem`).join('\n');
    }

    pxIn.addEventListener('input', fromPx);
    remIn.addEventListener('input', fromRem);
    base.addEventListener('input', fromPx);

    panel.appendChild(el('div', { class: 'row' }, [
      el('label', { class: 'hint', text: 'Root font size (px) ' }), base
    ]));
    panel.appendChild(el('div', { class: 'row' }, [
      pxIn, el('span', { text: 'px  =' }), remIn, el('span', { text: 'rem / em' })
    ]));
    panel.appendChild(el('h3', { text: 'Quick reference', style: 'margin:12px 0 6px;font-size:13px' }));
    panel.appendChild(table);
    fromPx();
  }
});
