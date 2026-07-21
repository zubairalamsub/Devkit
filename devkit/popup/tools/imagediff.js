// Image diff — compare two uploaded images pixel-by-pixel and highlight differences.
const DKImageDiff = (() => {
  function imgToCanvas(img) {
    const c = document.createElement('canvas');
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    return c;
  }

  // threshold: summed per-channel difference (0-765) above which a pixel counts as different.
  function compareCanvases(ca, cb, threshold) {
    const w = Math.max(ca.width, cb.width), h = Math.max(ca.height, cb.height);
    const out = document.createElement('canvas');
    out.width = w; out.height = h;
    const octx = out.getContext('2d');
    const ia = ca.getContext('2d').getImageData(0, 0, ca.width, ca.height).data;
    const ib = cb.getContext('2d').getImageData(0, 0, cb.width, cb.height).data;
    const od = octx.createImageData(w, h);
    let diffCount = 0;
    const total = w * h;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const oi = (y * w + x) * 4;
        const inA = x < ca.width && y < ca.height;
        const inB = x < cb.width && y < cb.height;
        let different = true;
        let base = 230;
        if (inA && inB) {
          const ai = (y * ca.width + x) * 4, bi = (y * cb.width + x) * 4;
          const d = Math.abs(ia[ai] - ib[bi]) + Math.abs(ia[ai + 1] - ib[bi + 1]) + Math.abs(ia[ai + 2] - ib[bi + 2]);
          different = d > threshold;
          base = 200 + Math.round((ia[ai] + ia[ai + 1] + ia[ai + 2]) / 3 * 0.2);
        }
        if (different) { od.data[oi] = 255; od.data[oi + 1] = 40; od.data[oi + 2] = 40; od.data[oi + 3] = 255; diffCount++; }
        else { od.data[oi] = od.data[oi + 1] = od.data[oi + 2] = base; od.data[oi + 3] = 255; }
      }
    }
    octx.putImageData(od, 0, 0);
    return { canvas: out, percent: diffCount / total * 100, diffCount, total, sameSize: ca.width === cb.width && ca.height === cb.height };
  }

  return { imgToCanvas, compareCanvases };
})();

DK.register({
  id: 'imagediff',
  name: 'Image Diff',
  icon: '🖼',
  group: 'Compare',
  keywords: 'image diff compare pixel difference screenshot visual regression',
  sub: 'Upload two images and highlight the pixels that differ.',
  render(panel) {
    const { el, toast } = DK;
    let canvasA = null, canvasB = null;

    function fileInput(label, onload) {
      const input = el('input', { type: 'file', accept: 'image/*', style: 'display:none' });
      input.addEventListener('change', () => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => onload(DKImageDiff.imgToCanvas(img), file.name);
          img.onerror = () => toast('Could not load image');
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
      const btn = el('button', { class: 'btn', onclick: () => input.click() }, label);
      const name = el('span', { class: 'hint' });
      return { node: el('div', { class: 'row tight' }, [btn, name, input]), name };
    }

    const a = fileInput('Choose image A', (c, n) => { canvasA = c; a.name.textContent = `${n} (${c.width}×${c.height})`; });
    const b = fileInput('Choose image B', (c, n) => { canvasB = c; b.name.textContent = `${n} (${c.width}×${c.height})`; });

    const threshold = el('input', { type: 'range', min: '0', max: '150', value: '32', style: 'flex:1' });
    const thLabel = el('span', { class: 'mono', text: '32' });
    threshold.addEventListener('input', () => { thLabel.textContent = threshold.value; });

    const status = el('div', { class: 'row tight' });
    const holder = el('div', { style: 'text-align:center' });

    function run() {
      status.textContent = '';
      holder.textContent = '';
      if (!canvasA || !canvasB) { toast('Choose both images first'); return; }
      const res = DKImageDiff.compareCanvases(canvasA, canvasB, Number(threshold.value));
      const cls = res.percent < 1 ? 'ok' : res.percent < 10 ? 'warn' : 'err';
      status.appendChild(el('span', { class: 'badge ' + cls, text: res.percent.toFixed(2) + '% of pixels differ' }));
      status.appendChild(el('span', { class: 'badge', text: res.diffCount.toLocaleString() + ' / ' + res.total.toLocaleString() + ' px' }));
      if (!res.sameSize) status.appendChild(el('span', { class: 'badge warn', text: 'different dimensions' }));
      res.canvas.style.cssText = 'max-width:100%;border:1px solid var(--border);border-radius:6px;margin-top:8px';
      holder.appendChild(res.canvas);
      holder.appendChild(el('div', { class: 'row', style: 'justify-content:center;margin-top:8px' }, [
        el('button', { class: 'btn', onclick: () => { const link = el('a', { href: res.canvas.toDataURL('image/png'), download: 'image-diff.png' }); document.body.appendChild(link); link.click(); link.remove(); } }, 'Download diff PNG')
      ]));
    }

    panel.appendChild(a.node);
    panel.appendChild(b.node);
    panel.appendChild(el('div', { class: 'row' }, [el('span', { class: 'hint', text: 'Threshold' }), threshold, thLabel]));
    panel.appendChild(el('div', { class: 'row' }, [el('button', { class: 'btn primary', onclick: run }, '🖼 Compare images')]));
    panel.appendChild(status);
    panel.appendChild(holder);
    panel.appendChild(el('p', { class: 'hint', text: 'Red marks pixels that differ beyond the threshold. Great for spotting visual regressions between screenshots.' }));
  }
});
