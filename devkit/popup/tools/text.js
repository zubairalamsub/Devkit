// Text tools: regex tester, line diff, case converter.

// ---------- Regex tester ----------
DK.register({
  id: 'regex',
  name: 'Regex Tester',
  icon: '.*',
  group: 'Text',
  keywords: 'regex regexp regular expression test match groups flags',
  sub: 'Live regex matching with flags and capture groups.',
  render(panel) {
    const { el } = DK;
    const pattern = el('input', { type: 'text', class: 'grow', placeholder: 'pattern e.g. (\\w+)@(\\w+\\.\\w+)', spellcheck: 'false' });
    const flags = el('input', { type: 'text', value: 'g', style: 'width:70px', placeholder: 'flags', spellcheck: 'false' });
    const sample = el('textarea', { placeholder: 'Test string…', spellcheck: 'false' });
    const status = el('div', { class: 'hint' });
    const highlighted = el('div', { class: 'out', 'data-placeholder': 'Matches are highlighted here.' });
    const groupsWrap = el('div');

    function run() {
      highlighted.textContent = '';
      groupsWrap.textContent = '';
      status.textContent = '';
      status.className = 'hint';
      const src = sample.value;
      if (!pattern.value) return;
      let re;
      try { re = new RegExp(pattern.value, flags.value); }
      catch (e) { status.textContent = e.message; status.className = 'status-err'; return; }

      const matches = [];
      if (re.global) {
        let m, guard = 0;
        while ((m = re.exec(src)) !== null && guard++ < 5000) {
          matches.push(m);
          if (m.index === re.lastIndex) re.lastIndex++;
        }
      } else {
        const m = re.exec(src);
        if (m) matches.push(m);
      }

      status.textContent = matches.length + ' match' + (matches.length === 1 ? '' : 'es');
      status.className = matches.length ? 'status-ok' : 'hint';

      // highlighted sample
      let cursor = 0;
      const frag = document.createDocumentFragment();
      for (const m of matches) {
        if (m.index > cursor) frag.appendChild(document.createTextNode(src.slice(cursor, m.index)));
        frag.appendChild(el('mark', { text: m[0] || '∅' }));
        cursor = m.index + (m[0] ? m[0].length : 0);
      }
      frag.appendChild(document.createTextNode(src.slice(cursor)));
      highlighted.appendChild(frag);

      // groups table
      const withGroups = matches.filter((m) => m.length > 1 || m.groups);
      if (withGroups.length) {
        const table = el('table', { class: 'kv-table' });
        table.appendChild(el('tr', {}, [el('th', { text: '#' }), el('th', { text: 'Match' }), el('th', { text: 'Groups' })]));
        withGroups.slice(0, 50).forEach((m, i) => {
          const named = m.groups ? Object.entries(m.groups).map(([k, v]) => `${k}=${v}`).join(', ') : '';
          const numbered = [...m].slice(1).map((g, gi) => `$${gi + 1}=${g}`).join(', ');
          table.appendChild(el('tr', {}, [
            el('td', { text: String(i + 1) }),
            el('td', { class: 'mono', text: m[0] }),
            el('td', { class: 'mono', text: [numbered, named].filter(Boolean).join(' | ') })
          ]));
        });
        groupsWrap.appendChild(el('h3', { text: 'Capture groups', style: 'margin:10px 0 4px;font-size:13px' }));
        groupsWrap.appendChild(table);
      }
    }

    for (const n of [pattern, flags, sample]) n.addEventListener('input', run);
    panel.appendChild(el('div', { class: 'row' }, [el('span', { class: 'mono', text: '/' }), pattern, el('span', { class: 'mono', text: '/' }), flags]));
    panel.appendChild(sample);
    panel.appendChild(status);
    panel.appendChild(el('div', { style: 'height:6px' }));
    panel.appendChild(highlighted);
    panel.appendChild(groupsWrap);
  }
});

// ---------- Diff ----------
DK.register({
  id: 'diff',
  name: 'Text Diff',
  icon: '±',
  group: 'Compare',
  keywords: 'diff compare text lines changes added removed',
  sub: 'Line-by-line comparison of two texts.',
  render(panel) {
    const { el } = DK;
    const left = el('textarea', { placeholder: 'Original…', spellcheck: 'false' });
    const right = el('textarea', { placeholder: 'Changed…', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Differences appear here.' });
    output.style.maxHeight = '240px';
    const stats = el('div', { class: 'hint' });

    // LCS-based line diff, with common prefix/suffix trimming and a size cap.
    function diffLines(aText, bText) {
      let a = aText.split('\n'), b = bText.split('\n');
      let prefix = 0;
      while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix++;
      let suffix = 0;
      while (suffix < a.length - prefix && suffix < b.length - prefix &&
             a[a.length - 1 - suffix] === b[b.length - 1 - suffix]) suffix++;
      const head = a.slice(0, prefix).map((l) => [' ', l]);
      const tail = a.slice(a.length - suffix).map((l) => [' ', l]);
      a = a.slice(prefix, a.length - suffix);
      b = b.slice(prefix, b.length - suffix);

      if (a.length * b.length > 4_000_000) {
        // too big for DP — degrade to naive del/add blocks
        return head.concat(a.map((l) => ['-', l]), b.map((l) => ['+', l]), tail);
      }
      const n = a.length, m = b.length;
      const dp = new Uint32Array((n + 1) * (m + 1));
      const idx = (i, j) => i * (m + 1) + j;
      for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
          dp[idx(i, j)] = a[i] === b[j]
            ? dp[idx(i + 1, j + 1)] + 1
            : Math.max(dp[idx(i + 1, j)], dp[idx(i, j + 1)]);
        }
      }
      const mid = [];
      let i = 0, j = 0;
      while (i < n && j < m) {
        if (a[i] === b[j]) { mid.push([' ', a[i]]); i++; j++; }
        else if (dp[idx(i + 1, j)] >= dp[idx(i, j + 1)]) { mid.push(['-', a[i]]); i++; }
        else { mid.push(['+', b[j]]); j++; }
      }
      while (i < n) mid.push(['-', a[i++]]);
      while (j < m) mid.push(['+', b[j++]]);
      return head.concat(mid, tail);
    }

    function compare() {
      output.textContent = '';
      const rows = diffLines(left.value, right.value);
      let add = 0, del = 0;
      for (const [op, line] of rows) {
        if (op === '+') add++;
        if (op === '-') del++;
        output.appendChild(el('span', {
          class: 'diff-line' + (op === '+' ? ' diff-add' : op === '-' ? ' diff-del' : ''),
          text: (op === ' ' ? '  ' : op + ' ') + line
        }));
      }
      stats.textContent = `+${add} added, −${del} removed, ${rows.length - add - del} unchanged`;
    }

    panel.appendChild(el('div', { class: 'col-2' }, [left, right]));
    panel.appendChild(el('div', { class: 'row', style: 'margin-top:8px' }, [
      el('button', { class: 'btn primary', onclick: compare }, 'Compare'),
      stats
    ]));
    panel.appendChild(output);
  }
});

// ---------- Case converter ----------
DK.register({
  id: 'case',
  name: 'Case Converter',
  icon: 'Aa',
  group: 'Text',
  keywords: 'case camel snake kebab pascal title upper lower convert',
  sub: 'Convert between naming conventions.',
  render(panel) {
    const { el } = DK;
    const input = el('textarea', { class: 'small', placeholder: 'hello world example', spellcheck: 'false' });
    const outWrap = el('div');

    function words(str) {
      return str
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        .split(/[^A-Za-z0-9]+/)
        .filter(Boolean)
        .map((w) => w.toLowerCase());
    }
    const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

    const CASES = [
      ['camelCase', (ws) => ws.map((w, i) => (i ? cap(w) : w)).join('')],
      ['PascalCase', (ws) => ws.map(cap).join('')],
      ['snake_case', (ws) => ws.join('_')],
      ['SCREAMING_SNAKE', (ws) => ws.join('_').toUpperCase()],
      ['kebab-case', (ws) => ws.join('-')],
      ['Title Case', (ws) => ws.map(cap).join(' ')],
      ['Sentence case', (ws) => ws.length ? cap(ws.join(' ')) : ''],
      ['lower case', (ws) => ws.join(' ')],
      ['UPPER CASE', (ws) => ws.join(' ').toUpperCase()],
      ['dot.case', (ws) => ws.join('.')]
    ];

    function update() {
      outWrap.textContent = '';
      const ws = words(input.value);
      if (!ws.length) return;
      const table = el('table', { class: 'kv-table' });
      for (const [name, fn] of CASES) {
        const val = fn(ws);
        table.appendChild(el('tr', {}, [
          el('th', { text: name }),
          el('td', { class: 'mono', text: val, style: 'cursor:pointer', title: 'Click to copy', onclick: () => DK.copy(val) })
        ]));
      }
      outWrap.appendChild(table);
      outWrap.appendChild(el('p', { class: 'hint', text: 'Click any result to copy it.' }));
    }

    input.addEventListener('input', update);
    panel.appendChild(input);
    panel.appendChild(el('div', { style: 'height:8px' }));
    panel.appendChild(outWrap);
  }
});
