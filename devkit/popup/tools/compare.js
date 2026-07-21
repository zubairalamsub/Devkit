// Comparison tools: JSON diff, list compare, text similarity, date diff, number diff.

// ---------- JSON diff ----------
DK.register({
  id: 'jsondiff',
  name: 'JSON Diff',
  icon: '⇄',
  group: 'Compare',
  keywords: 'json diff compare object structural changed added removed keys',
  sub: 'Structurally compare two JSON documents — added, removed and changed values.',
  render(panel) {
    const { el, toast } = DK;
    const left = el('textarea', { placeholder: 'Original JSON…', spellcheck: 'false' });
    const right = el('textarea', { placeholder: 'Changed JSON…', spellcheck: 'false' });
    const summary = el('div', { class: 'row tight' });
    const result = el('div');

    function diff(a, b, path, out) {
      const bothObj = a && b && typeof a === 'object' && typeof b === 'object';
      if (bothObj) {
        const arrA = Array.isArray(a), arrB = Array.isArray(b);
        if (arrA !== arrB) { out.push({ path: path || '(root)', type: 'changed', old: a, val: b }); return; }
        const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
        for (const k of keys) {
          const p = arrA ? `${path}[${k}]` : (path ? `${path}.${k}` : k);
          if (!(k in a)) out.push({ path: p, type: 'added', val: b[k] });
          else if (!(k in b)) out.push({ path: p, type: 'removed', old: a[k] });
          else diff(a[k], b[k], p, out);
        }
      } else if (!Object.is(a, b)) {
        out.push({ path: path || '(root)', type: 'changed', old: a, val: b });
      }
    }

    const fmt = (v) => { const s = v === undefined ? '—' : JSON.stringify(v); return s.length > 80 ? s.slice(0, 80) + '…' : s; };

    function run() {
      summary.textContent = '';
      result.textContent = '';
      let a, b;
      try { a = JSON.parse(left.value); } catch (e) { toast('Left side is not valid JSON'); return; }
      try { b = JSON.parse(right.value); } catch (e) { toast('Right side is not valid JSON'); return; }
      const diffs = [];
      diff(a, b, '', diffs);
      const counts = { added: 0, removed: 0, changed: 0 };
      diffs.forEach((d) => counts[d.type]++);
      if (!diffs.length) { summary.appendChild(el('span', { class: 'badge ok', text: 'Identical ✓' })); return; }
      summary.appendChild(el('span', { class: 'badge ok', text: '+' + counts.added + ' added' }));
      summary.appendChild(el('span', { class: 'badge err', text: '−' + counts.removed + ' removed' }));
      summary.appendChild(el('span', { class: 'badge warn', text: '~' + counts.changed + ' changed' }));

      const table = el('table', { class: 'kv-table' });
      table.appendChild(el('tr', {}, [el('th', { text: 'Path' }), el('th', { text: 'Change' }), el('th', { text: 'Old → New' })]));
      for (const d of diffs.slice(0, 300)) {
        const badge = d.type === 'added' ? el('span', { class: 'badge ok', text: 'added' })
          : d.type === 'removed' ? el('span', { class: 'badge err', text: 'removed' })
            : el('span', { class: 'badge warn', text: 'changed' });
        const val = d.type === 'added' ? fmt(d.val) : d.type === 'removed' ? fmt(d.old) : `${fmt(d.old)} → ${fmt(d.val)}`;
        table.appendChild(el('tr', {}, [el('td', { class: 'mono', text: d.path }), el('td', {}, [badge]), el('td', { class: 'mono', text: val })]));
      }
      result.appendChild(table);
      if (diffs.length > 300) result.appendChild(el('p', { class: 'hint', text: `Showing first 300 of ${diffs.length} differences.` }));
    }

    panel.appendChild(el('div', { class: 'col-2' }, [left, right]));
    panel.appendChild(el('div', { class: 'row', style: 'margin-top:8px' }, [el('button', { class: 'btn primary', onclick: run }, 'Compare'), summary]));
    panel.appendChild(result);
  }
});

// ---------- List compare ----------
DK.register({
  id: 'listcompare',
  name: 'List Compare',
  icon: '≠',
  group: 'Compare',
  keywords: 'list compare set difference intersection union unique both only',
  sub: 'Compare two lists: what is unique to each, and what they share.',
  render(panel) {
    const { el } = DK;
    const left = el('textarea', { placeholder: 'List A — one item per line', spellcheck: 'false' });
    const right = el('textarea', { placeholder: 'List B — one item per line', spellcheck: 'false' });
    const trim = el('input', { type: 'checkbox', id: 'lc-trim' }); trim.checked = true;
    const ic = el('input', { type: 'checkbox', id: 'lc-ic' });
    const noEmpty = el('input', { type: 'checkbox', id: 'lc-empty' }); noEmpty.checked = true;
    const result = el('div');

    function norm(text) {
      let lines = text.split('\n');
      if (trim.checked) lines = lines.map((l) => l.trim());
      if (noEmpty.checked) lines = lines.filter((l) => l !== '');
      return lines;
    }
    const key = (s) => ic.checked ? s.toLowerCase() : s;

    function block(title, items, cls) {
      const wrap = el('div');
      wrap.appendChild(el('div', { class: 'row tight', style: 'margin-top:10px' }, [
        el('span', { class: 'badge ' + cls, text: `${title}: ${items.length}` }),
        el('span', { class: 'grow' }),
        items.length ? DK.copyBtn(() => items.join('\n'), 'Copy') : null
      ]));
      if (items.length) {
        const out = el('div', { class: 'out' });
        out.style.maxHeight = '120px';
        out.textContent = items.join('\n');
        wrap.appendChild(out);
      }
      return wrap;
    }

    function run() {
      result.textContent = '';
      const a = norm(left.value), b = norm(right.value);
      const setB = new Set(b.map(key));
      const setA = new Set(a.map(key));
      const seen = new Set();
      const aOnly = a.filter((x) => !setB.has(key(x)));
      const bOnly = b.filter((x) => !setA.has(key(x)));
      const both = a.filter((x) => { const k = key(x); if (setB.has(k) && !seen.has(k)) { seen.add(k); return true; } return false; });
      result.appendChild(block('In A only', aOnly, 'err'));
      result.appendChild(block('In B only', bOnly, 'ok'));
      result.appendChild(block('In both', both, 'warn'));
    }

    for (const c of [trim, ic, noEmpty]) c.addEventListener('change', run);
    panel.appendChild(el('div', { class: 'col-2' }, [left, right]));
    panel.appendChild(el('div', { class: 'row', style: 'margin-top:8px' }, [
      el('button', { class: 'btn primary', onclick: run }, 'Compare'),
      el('label', { class: 'hint', for: 'lc-trim' }, [trim, ' Trim']),
      el('label', { class: 'hint', for: 'lc-ic' }, [ic, ' Ignore case']),
      el('label', { class: 'hint', for: 'lc-empty' }, [noEmpty, ' Skip empty'])
    ]));
    panel.appendChild(result);
  }
});

// ---------- Text similarity ----------
DK.register({
  id: 'similarity',
  name: 'Text Similarity',
  icon: '≈',
  group: 'Compare',
  keywords: 'similarity levenshtein distance edit compare text words inline diff',
  sub: 'Edit distance, similarity percentage and a word-level inline diff.',
  render(panel) {
    const { el } = DK;
    const left = el('textarea', { class: 'small', placeholder: 'Text A…', spellcheck: 'false' });
    const right = el('textarea', { class: 'small', placeholder: 'Text B…', spellcheck: 'false' });
    const stats = el('div', { class: 'row tight' });
    const inlineOut = el('div', { class: 'out', 'data-placeholder': 'Word-level differences appear here.' });

    function levenshtein(a, b) {
      const CAP = 2000;
      let truncated = false;
      if (a.length > CAP) { a = a.slice(0, CAP); truncated = true; }
      if (b.length > CAP) { b = b.slice(0, CAP); truncated = true; }
      const m = a.length, n = b.length;
      if (!m) return { dist: n, truncated };
      if (!n) return { dist: m, truncated };
      let prev = Array.from({ length: n + 1 }, (_, i) => i);
      let cur = new Array(n + 1);
      for (let i = 1; i <= m; i++) {
        cur[0] = i;
        for (let j = 1; j <= n; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1;
          cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
        }
        [prev, cur] = [cur, prev];
      }
      return { dist: prev[n], truncated };
    }

    // LCS over word tokens for the inline diff.
    function wordDiff(a, b) {
      const tok = (s) => s.split(/(\s+)/).filter((t) => t !== '');
      let A = tok(a), B = tok(b);
      const CAP = 2500;
      if (A.length > CAP) A = A.slice(0, CAP);
      if (B.length > CAP) B = B.slice(0, CAP);
      const m = A.length, n = B.length;
      const dp = new Uint32Array((m + 1) * (n + 1));
      const idx = (i, j) => i * (n + 1) + j;
      for (let i = m - 1; i >= 0; i--)
        for (let j = n - 1; j >= 0; j--)
          dp[idx(i, j)] = A[i] === B[j] ? dp[idx(i + 1, j + 1)] + 1 : Math.max(dp[idx(i + 1, j)], dp[idx(i, j + 1)]);
      const ops = [];
      let i = 0, j = 0;
      while (i < m && j < n) {
        if (A[i] === B[j]) { ops.push([' ', A[i]]); i++; j++; }
        else if (dp[idx(i + 1, j)] >= dp[idx(i, j + 1)]) { ops.push(['-', A[i]]); i++; }
        else { ops.push(['+', B[j]]); j++; }
      }
      while (i < m) ops.push(['-', A[i++]]);
      while (j < n) ops.push(['+', B[j++]]);
      return ops;
    }

    function run() {
      const a = left.value, b = right.value;
      stats.textContent = '';
      inlineOut.textContent = '';
      if (!a && !b) return;
      const { dist, truncated } = levenshtein(a, b);
      const maxLen = Math.max(a.length, b.length) || 1;
      const sim = ((1 - dist / maxLen) * 100).toFixed(1);
      const cls = sim >= 90 ? 'ok' : sim >= 60 ? 'warn' : 'err';
      stats.appendChild(el('span', { class: 'badge ' + cls, text: sim + '% similar' }));
      stats.appendChild(el('span', { class: 'badge', text: 'edit distance ' + dist }));
      if (truncated) stats.appendChild(el('span', { class: 'badge warn', text: 'compared first 2000 chars' }));

      for (const [op, word] of wordDiff(a, b)) {
        if (op === ' ') inlineOut.appendChild(document.createTextNode(word));
        else inlineOut.appendChild(el('span', { class: op === '+' ? 'diff-add' : 'diff-del', text: word }));
      }
    }

    for (const n of [left, right]) n.addEventListener('input', run);
    panel.appendChild(el('div', { class: 'col-2' }, [left, right]));
    panel.appendChild(el('div', { class: 'row', style: 'margin-top:8px' }, [stats]));
    panel.appendChild(el('p', { class: 'hint', text: 'Inline word diff (green = added in B, red = removed from A):' }));
    panel.appendChild(inlineOut);
  }
});

// ---------- Date / time diff ----------
DK.register({
  id: 'datediff',
  name: 'Date Diff',
  icon: '📆',
  group: 'Compare',
  keywords: 'date time diff difference duration between days hours age countdown',
  sub: 'Duration between two dates, as a calendar breakdown and totals.',
  render(panel) {
    const { el } = DK;
    const a = el('input', { type: 'datetime-local', step: '1' });
    const b = el('input', { type: 'datetime-local', step: '1' });
    const result = el('div');

    function localISO(d) {
      const p = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    }
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    a.value = localISO(start);
    b.value = localISO(now);

    function breakdown(d1, d2) {
      if (d2 < d1) [d1, d2] = [d2, d1];
      let years = d2.getFullYear() - d1.getFullYear();
      let months = d2.getMonth() - d1.getMonth();
      let days = d2.getDate() - d1.getDate();
      let hours = d2.getHours() - d1.getHours();
      let mins = d2.getMinutes() - d1.getMinutes();
      let secs = d2.getSeconds() - d1.getSeconds();
      if (secs < 0) { secs += 60; mins--; }
      if (mins < 0) { mins += 60; hours--; }
      if (hours < 0) { hours += 24; days--; }
      if (days < 0) { days += new Date(d2.getFullYear(), d2.getMonth(), 0).getDate(); months--; }
      if (months < 0) { months += 12; years--; }
      return { years, months, days, hours, mins, secs };
    }

    function run() {
      result.textContent = '';
      const d1 = new Date(a.value), d2 = new Date(b.value);
      if (isNaN(d1) || isNaN(d2)) { result.appendChild(el('p', { class: 'hint', text: 'Pick two valid dates.' })); return; }
      const bd = breakdown(d1, d2);
      const parts = [];
      if (bd.years) parts.push(bd.years + 'y');
      if (bd.months) parts.push(bd.months + 'mo');
      if (bd.days) parts.push(bd.days + 'd');
      if (bd.hours) parts.push(bd.hours + 'h');
      if (bd.mins) parts.push(bd.mins + 'm');
      if (bd.secs) parts.push(bd.secs + 's');
      result.appendChild(el('p', { class: 'status-ok', style: 'font-size:14px', text: parts.length ? parts.join(' ') : 'Same instant' }));

      const ms = Math.abs(d2 - d1);
      const rows = [
        ['Total weeks', (ms / 6048e5).toFixed(2)],
        ['Total days', (ms / 864e5).toFixed(2)],
        ['Total hours', (ms / 36e5).toFixed(1)],
        ['Total minutes', Math.round(ms / 6e4).toLocaleString()],
        ['Total seconds', Math.round(ms / 1000).toLocaleString()],
        ['Milliseconds', ms.toLocaleString()]
      ];
      const table = el('table', { class: 'kv-table' });
      for (const [k, v] of rows) table.appendChild(el('tr', {}, [el('th', { text: k }), el('td', { class: 'mono', text: v })]));
      result.appendChild(table);
    }

    const nowBtn = (input) => el('button', { class: 'btn icon', title: 'Set to now', onclick: () => { input.value = localISO(new Date()); run(); } }, '⏱');
    for (const n of [a, b]) n.addEventListener('input', run);
    panel.appendChild(el('div', { class: 'row' }, [el('span', { class: 'hint', style: 'width:40px', text: 'From' }), a, nowBtn(a)]));
    panel.appendChild(el('div', { class: 'row' }, [el('span', { class: 'hint', style: 'width:40px', text: 'To' }), b, nowBtn(b)]));
    panel.appendChild(result);
    run();
  }
});

// ---------- Number diff ----------
DK.register({
  id: 'numdiff',
  name: 'Number Diff',
  icon: '%',
  group: 'Compare',
  keywords: 'number difference percent change ratio delta increase decrease compare',
  sub: 'Difference, percentage change and ratio between two numbers.',
  render(panel) {
    const { el } = DK;
    const a = el('input', { type: 'number', class: 'grow', placeholder: 'From (original)', step: 'any' });
    const b = el('input', { type: 'number', class: 'grow', placeholder: 'To (new)', step: 'any' });
    const result = el('div');

    const fmt = (n) => Number.isFinite(n) ? (Math.round(n * 1e6) / 1e6).toLocaleString() : '—';

    function run() {
      result.textContent = '';
      if (a.value === '' || b.value === '') return;
      const x = Number(a.value), y = Number(b.value);
      const diff = y - x;
      const pct = x !== 0 ? (diff / Math.abs(x)) * 100 : (y === 0 ? 0 : Infinity);
      const ratio = x !== 0 ? y / x : Infinity;
      const rows = [
        ['Difference (To − From)', (diff >= 0 ? '+' : '') + fmt(diff)],
        ['Absolute difference', fmt(Math.abs(diff))],
        ['Percentage change', Number.isFinite(pct) ? (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%' : 'n/a (from 0)'],
        ['Ratio (To / From)', Number.isFinite(ratio) ? fmt(ratio) + '×' : 'n/a (from 0)'],
        ['From as % of To', y !== 0 ? (x / y * 100).toFixed(2) + '%' : 'n/a']
      ];
      const table = el('table', { class: 'kv-table' });
      for (const [k, v] of rows) table.appendChild(el('tr', {}, [el('th', { text: k }), el('td', { class: 'mono', text: v })]));
      result.appendChild(table);
      const dir = diff > 0 ? 'increase' : diff < 0 ? 'decrease' : 'no change';
      const cls = diff > 0 ? 'ok' : diff < 0 ? 'err' : '';
      result.appendChild(el('div', { style: 'margin-top:8px' }, [el('span', { class: 'badge ' + cls, text: dir })]));
    }

    for (const n of [a, b]) n.addEventListener('input', run);
    panel.appendChild(el('div', { class: 'row' }, [a, el('span', { text: '→' }), b]));
    panel.appendChild(result);
  }
});
