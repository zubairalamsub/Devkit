// More text tools: counter, line tools, slugify, string escaper.

// ---------- Word & character counter ----------
DK.register({
  id: 'counter',
  name: 'Word Counter',
  icon: '№',
  group: 'Text',
  keywords: 'word character count lines sentences reading time statistics',
  sub: 'Live counts and reading time for any text.',
  render(panel) {
    const { el } = DK;
    const input = el('textarea', { placeholder: 'Type or paste text…', spellcheck: 'false' });
    input.style.minHeight = '120px';
    const grid = el('div', { style: 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px' });

    function stat(label, value) {
      return el('div', { style: 'background:var(--bg-inset);border:1px solid var(--border);border-radius:6px;padding:8px 10px' }, [
        el('div', { style: 'font-size:19px;font-weight:700', text: String(value) }),
        el('div', { class: 'hint', text: label })
      ]);
    }

    function update() {
      const t = input.value;
      const words = (t.match(/\S+/g) || []).length;
      const chars = t.length;
      const noSpace = t.replace(/\s/g, '').length;
      const lines = t ? t.split(/\n/).length : 0;
      const sentences = (t.match(/[.!?]+(\s|$)/g) || []).length;
      const paragraphs = t.trim() ? t.trim().split(/\n\s*\n/).length : 0;
      const mins = words / 200;
      const readTime = words ? (mins < 1 ? '<1 min' : Math.round(mins) + ' min') : '0 min';
      grid.textContent = '';
      grid.appendChild(stat('Words', words));
      grid.appendChild(stat('Characters', chars));
      grid.appendChild(stat('Chars (no spaces)', noSpace));
      grid.appendChild(stat('Lines', lines));
      grid.appendChild(stat('Sentences', sentences));
      grid.appendChild(stat('Paragraphs', paragraphs));
      grid.appendChild(stat('Reading time', readTime));
    }
    input.addEventListener('input', update);
    panel.appendChild(input);
    panel.appendChild(el('div', { style: 'height:8px' }));
    panel.appendChild(grid);
    update();
  }
});

// ---------- Line tools ----------
DK.register({
  id: 'lines',
  name: 'Line Tools',
  icon: '≣',
  group: 'Text',
  keywords: 'lines sort dedupe unique reverse shuffle trim number remove empty',
  sub: 'Sort, dedupe, reverse and transform lists of lines.',
  render(panel) {
    const { el } = DK;
    const input = el('textarea', { placeholder: 'One item per line…', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Result appears here.' });
    output.style.maxHeight = '200px';
    let current = '';

    function getLines() { return input.value.split('\n'); }
    function set(lines) { current = lines.join('\n'); output.textContent = current; }

    const ops = {
      'Sort A→Z': (l) => l.slice().sort((a, b) => a.localeCompare(b)),
      'Sort Z→A': (l) => l.slice().sort((a, b) => b.localeCompare(a)),
      'Sort numeric': (l) => l.slice().sort((a, b) => parseFloat(a) - parseFloat(b)),
      'Dedupe': (l) => [...new Set(l)],
      'Reverse': (l) => l.slice().reverse(),
      'Shuffle': (l) => { const a = l.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; },
      'Trim': (l) => l.map((x) => x.trim()),
      'Remove empty': (l) => l.filter((x) => x.trim()),
      'Number': (l) => l.map((x, i) => `${i + 1}. ${x}`),
      'lowercase': (l) => l.map((x) => x.toLowerCase()),
      'UPPERCASE': (l) => l.map((x) => x.toUpperCase())
    };

    const btns = el('div', { class: 'row' });
    for (const [label, fn] of Object.entries(ops)) {
      btns.appendChild(el('button', { class: 'btn', onclick: () => set(fn(getLines())) }, label));
    }

    panel.appendChild(input);
    panel.appendChild(btns);
    panel.appendChild(el('div', { class: 'row' }, [
      el('span', { class: 'grow' }),
      el('button', { class: 'btn', onclick: () => { input.value = current; } }, 'Use as input'),
      DK.copyBtn(() => current, 'Copy')
    ]));
    panel.appendChild(output);
  }
});

// ---------- Slugify ----------
DK.register({
  id: 'slugify',
  name: 'Slugify',
  icon: '⎯',
  group: 'Text',
  keywords: 'slug slugify url friendly kebab permalink',
  sub: 'Turn any text into a URL-friendly slug.',
  render(panel) {
    const { el } = DK;
    const input = el('textarea', { class: 'small', placeholder: 'Héllo, World! (2026 Edition)', spellcheck: 'false' });
    const sep = el('select', {}, [el('option', { value: '-', text: 'hyphen -' }), el('option', { value: '_', text: 'underscore _' })]);
    const lower = el('input', { type: 'checkbox', id: 'slug-lower' });
    lower.checked = true;
    const output = el('div', { class: 'out', 'data-placeholder': 'Slug appears here.' });

    const COMBINING = new RegExp('[\\u0300-\\u036f]', 'g'); // combining diacritical marks
    function update() {
      let s = input.value.normalize('NFKD').replace(COMBINING, ''); // strip accents
      if (lower.checked) s = s.toLowerCase();
      s = s.replace(/[^a-zA-Z0-9]+/g, sep.value).replace(new RegExp('^\\' + sep.value + '+|\\' + sep.value + '+$', 'g'), '');
      output.textContent = s;
    }
    for (const n of [input, sep, lower]) n.addEventListener('input', update);
    lower.addEventListener('change', update);

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('span', { class: 'hint', text: 'Separator' }), sep,
      el('label', { class: 'hint', for: 'slug-lower' }, [lower, ' lowercase']),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy')
    ]));
    panel.appendChild(output);
  }
});

// ---------- String escaper ----------
DK.register({
  id: 'escape',
  name: 'String Escape',
  icon: '\\n',
  group: 'Text',
  keywords: 'escape unescape string javascript json backslash quotes newline',
  sub: 'Escape or unescape strings for JavaScript / JSON source.',
  render(panel) {
    const { el, toast } = DK;
    const input = el('textarea', { placeholder: 'Text with "quotes" and\nnewlines…', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Result appears here.' });

    function escape() {
      output.textContent = JSON.stringify(input.value).slice(1, -1);
    }
    function unescape() {
      try { output.textContent = JSON.parse('"' + input.value.replace(/^"|"$/g, '') + '"'); }
      catch (e) { toast('Could not unescape — invalid escape sequence'); }
    }

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: escape }, 'Escape'),
      el('button', { class: 'btn', onclick: unescape }, 'Unescape'),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy')
    ]));
    panel.appendChild(output);
    panel.appendChild(el('p', { class: 'hint', text: 'Escapes \\n, \\t, \\", \\\\ and unicode — ready to paste into a string literal.' }));
  }
});
