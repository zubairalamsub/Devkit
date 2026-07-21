// JSON formatter / validator / minifier with collapsible tree view.
DK.register({
  id: 'json',
  name: 'JSON Formatter',
  icon: '{}',
  group: 'Code & Data',
  keywords: 'json format validate minify pretty tree parse',
  sub: 'Format, validate, minify and explore JSON.',
  render(panel) {
    const { el, copy } = DK;

    const input = el('textarea', { placeholder: 'Paste JSON here…', spellcheck: 'false' });
    input.style.minHeight = '130px';
    const status = el('div', { class: 'hint', text: 'Waiting for input.' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Formatted output appears here.' });
    output.style.maxHeight = '220px';
    const indentSel = el('select', {}, [
      el('option', { value: '2', text: '2 spaces' }),
      el('option', { value: '4', text: '4 spaces' }),
      el('option', { value: 'tab', text: 'Tabs' })
    ]);

    let lastText = ''; // last successful stringify result, for the copy button

    function parse() {
      const raw = input.value.trim();
      if (!raw) { status.textContent = 'Waiting for input.'; status.className = 'hint'; return null; }
      try {
        const val = JSON.parse(raw);
        status.textContent = 'Valid JSON ✓';
        status.className = 'status-ok';
        return { val };
      } catch (e) {
        status.className = 'status-err';
        status.textContent = 'Invalid: ' + e.message;
        const m = /position (\d+)/.exec(e.message);
        if (m) {
          const pos = Number(m[1]);
          const upTo = raw.slice(0, pos);
          const line = upTo.split('\n').length;
          const col = pos - upTo.lastIndexOf('\n');
          status.textContent += ` (line ${line}, column ${col})`;
          input.focus();
          input.setSelectionRange(pos, Math.min(pos + 1, raw.length));
        }
        return null;
      }
    }

    function show(text) {
      lastText = text;
      output.textContent = text;
    }

    function format() {
      const p = parse();
      if (!p) return;
      const indent = indentSel.value === 'tab' ? '\t' : Number(indentSel.value);
      show(JSON.stringify(p.val, null, indent));
    }

    function minify() {
      const p = parse();
      if (!p) return;
      show(JSON.stringify(p.val));
    }

    // ----- collapsible tree -----
    function treeNode(key, val) {
      const keySpan = key === null ? null : el('span', {}, [el('span', { class: 'json-key', text: JSON.stringify(key) }), ': ']);
      if (val !== null && typeof val === 'object') {
        const isArr = Array.isArray(val);
        const entries = isArr ? val.map((v, i) => [i, v]) : Object.entries(val);
        const open = isArr ? '[' : '{';
        const close = isArr ? ']' : '}';
        const details = el('details', { open: '' });
        const summary = el('summary', {}, [keySpan, `${open} ${entries.length} ${isArr ? 'items' : 'keys'} ${close}`].filter(Boolean));
        details.appendChild(summary);
        for (const [k, v] of entries) details.appendChild(treeNode(isArr ? String(k) : k, v));
        return details;
      }
      let cls = 'json-null', text = 'null';
      if (typeof val === 'string') { cls = 'json-str'; text = JSON.stringify(val); }
      else if (typeof val === 'number') { cls = 'json-num'; text = String(val); }
      else if (typeof val === 'boolean') { cls = 'json-bool'; text = String(val); }
      return el('div', {}, [keySpan, el('span', { class: cls, text })].filter(Boolean));
    }

    function tree() {
      const p = parse();
      if (!p) return;
      lastText = JSON.stringify(p.val, null, 2);
      output.textContent = '';
      output.appendChild(el('div', { class: 'json-tree' }, [treeNode(null, p.val)]));
    }

    input.addEventListener('input', () => { parse(); });

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: format }, 'Format'),
      el('button', { class: 'btn', onclick: minify }, 'Minify'),
      el('button', { class: 'btn', onclick: tree }, 'Tree view'),
      indentSel,
      el('span', { class: 'grow' }),
      el('button', { class: 'btn', onclick: () => copy(lastText || input.value) }, 'Copy result')
    ]));
    panel.appendChild(status);
    panel.appendChild(el('div', { style: 'height:6px' }));
    panel.appendChild(output);
  }
});
