// Converters: number base, CSV ⇄ JSON, query string ⇄ JSON, SQL formatter, cron explainer.

// ---------- Number base converter ----------
DK.register({
  id: 'base',
  name: 'Number Base',
  icon: '01',
  group: 'Code & Data',
  keywords: 'number base binary octal decimal hexadecimal radix convert bin hex',
  sub: 'Convert integers between binary, octal, decimal, hex and any base up to 36.',
  render(panel) {
    const { el } = DK;
    const digits = '0123456789abcdefghijklmnopqrstuvwxyz';

    function parseBig(str, base) {
      str = str.trim().toLowerCase();
      if (!str) return null;
      let neg = false;
      if (str[0] === '-') { neg = true; str = str.slice(1); }
      str = str.replace(/^0[box]/, ''); // tolerate 0x / 0b / 0o prefixes
      if (!str) return null;
      let val = 0n;
      const b = BigInt(base);
      for (const ch of str) {
        const d = digits.indexOf(ch);
        if (d < 0 || d >= base) return null;
        val = val * b + BigInt(d);
      }
      return neg ? -val : val;
    }
    function toBase(val, base) {
      if (val === 0n) return '0';
      let neg = val < 0n;
      if (neg) val = -val;
      const b = BigInt(base);
      let out = '';
      while (val > 0n) { out = digits[Number(val % b)] + out; val /= b; }
      return (neg ? '-' : '') + out;
    }

    const input = el('input', { type: 'text', class: 'grow', placeholder: 'Enter a number…', spellcheck: 'false' });
    const fromBase = el('select', {}, [2, 8, 10, 16].map((b) => el('option', { value: String(b), text: 'Base ' + b, selected: b === 10 ? '' : null })));
    const customBase = el('input', { type: 'number', min: '2', max: '36', placeholder: 'or 2–36', style: 'width:90px' });
    const result = el('div');
    const status = el('div', { class: 'hint' });

    function convert() {
      result.textContent = '';
      status.textContent = '';
      const base = customBase.value ? Math.min(36, Math.max(2, Number(customBase.value))) : Number(fromBase.value);
      const val = parseBig(input.value, base);
      if (val === null) { if (input.value.trim()) { status.textContent = 'Not a valid base-' + base + ' number.'; status.className = 'status-err'; } return; }
      const table = el('table', { class: 'kv-table' });
      const rows = [['Binary', 2], ['Octal', 8], ['Decimal', 10], ['Hex', 16], ['Base ' + base, base]];
      const seen = new Set();
      for (const [label, b] of rows) {
        if (seen.has(b)) continue;
        seen.add(b);
        const str = (b === 16 ? '0x' : b === 2 ? '0b' : b === 8 ? '0o' : '') + toBase(val, b);
        table.appendChild(el('tr', {}, [
          el('th', { text: label }),
          el('td', { class: 'mono', text: str, style: 'cursor:pointer', title: 'Click to copy', onclick: () => DK.copy(str) })
        ]));
      }
      result.appendChild(table);
    }

    input.addEventListener('input', convert);
    fromBase.addEventListener('change', () => { customBase.value = ''; convert(); });
    customBase.addEventListener('input', convert);

    panel.appendChild(el('div', { class: 'row' }, [input]));
    panel.appendChild(el('div', { class: 'row' }, [el('span', { class: 'hint', text: 'Input base:' }), fromBase, customBase]));
    panel.appendChild(status);
    panel.appendChild(result);
  }
});

// ---------- CSV ⇄ JSON ----------
DK.register({
  id: 'csv',
  name: 'CSV ⇄ JSON',
  icon: '▦',
  group: 'Code & Data',
  keywords: 'csv json convert table spreadsheet parse',
  sub: 'Convert CSV to a JSON array of objects and back.',
  render(panel) {
    const { el, toast } = DK;
    const input = el('textarea', { placeholder: 'Paste CSV or a JSON array…', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Result appears here.' });
    output.style.maxHeight = '230px';
    const delim = el('select', {}, [
      el('option', { value: ',', text: 'Comma' }),
      el('option', { value: '\t', text: 'Tab' }),
      el('option', { value: ';', text: 'Semicolon' }),
      el('option', { value: '|', text: 'Pipe' })
    ]);

    function parseCSV(text, d) {
      const rows = []; let row = []; let field = ''; let inQ = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQ) {
          if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
          else field += c;
        } else if (c === '"') inQ = true;
        else if (c === d) { row.push(field); field = ''; }
        else if (c === '\r') { /* skip */ }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else field += c;
      }
      if (field !== '' || row.length) { row.push(field); rows.push(row); }
      return rows.filter((r) => r.length && !(r.length === 1 && r[0] === ''));
    }

    function csvToJson() {
      const d = delim.value;
      const rows = parseCSV(input.value, d);
      if (!rows.length) { output.textContent = ''; return; }
      const headers = rows[0];
      const objs = rows.slice(1).map((r) => {
        const o = {};
        headers.forEach((h, i) => {
          let v = r[i] ?? '';
          if (v !== '' && !isNaN(v) && v.trim() !== '') v = Number(v);
          else if (v === 'true') v = true;
          else if (v === 'false') v = false;
          o[h] = v;
        });
        return o;
      });
      output.textContent = JSON.stringify(objs, null, 2);
    }

    function jsonToCsv() {
      let arr;
      try { arr = JSON.parse(input.value); } catch (e) { toast('Input is not valid JSON'); return; }
      if (!Array.isArray(arr)) arr = [arr];
      const d = delim.value;
      const keys = [...new Set(arr.flatMap((o) => Object.keys(o || {})))];
      const esc = (v) => {
        v = v == null ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v);
        return (v.includes(d) || /[",\n\r]/.test(v)) ? '"' + v.replace(/"/g, '""') + '"' : v;
      };
      const lines = [keys.join(d), ...arr.map((o) => keys.map((k) => esc(o ? o[k] : '')).join(d))];
      output.textContent = lines.join('\n');
    }

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: csvToJson }, 'CSV → JSON'),
      el('button', { class: 'btn primary', onclick: jsonToCsv }, 'JSON → CSV'),
      el('span', { class: 'hint', text: 'Delimiter' }), delim,
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy')
    ]));
    panel.appendChild(output);
  }
});

// ---------- Query string ⇄ JSON ----------
DK.register({
  id: 'querystring',
  name: 'Query String',
  icon: '?=',
  group: 'Code & Data',
  keywords: 'query string url params json convert search parameters',
  sub: 'Convert a URL query string to JSON and back. Repeated keys become arrays.',
  render(panel) {
    const { el, toast } = DK;
    const input = el('textarea', { class: 'small', placeholder: 'a=1&b=two&b=three   or   {"a":1,"b":["two","three"]}', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Result appears here.' });

    function toJson() {
      let str = input.value.trim();
      const qi = str.indexOf('?');
      if (qi >= 0) str = str.slice(qi + 1);
      str = str.split('#')[0];
      const params = new URLSearchParams(str);
      const obj = {};
      for (const [k, v] of params) {
        if (k in obj) { if (Array.isArray(obj[k])) obj[k].push(v); else obj[k] = [obj[k], v]; }
        else obj[k] = v;
      }
      output.textContent = JSON.stringify(obj, null, 2);
    }

    function toQuery() {
      let obj;
      try { obj = JSON.parse(input.value); } catch (e) { toast('Input is not valid JSON'); return; }
      const p = new URLSearchParams();
      for (const [k, v] of Object.entries(obj)) {
        if (Array.isArray(v)) v.forEach((x) => p.append(k, x));
        else p.append(k, v == null ? '' : v);
      }
      output.textContent = p.toString();
    }

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: toJson }, 'Query → JSON'),
      el('button', { class: 'btn primary', onclick: toQuery }, 'JSON → Query'),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy')
    ]));
    panel.appendChild(output);
  }
});

// ---------- SQL formatter ----------
DK.register({
  id: 'sql',
  name: 'SQL Formatter',
  icon: '⛁',
  group: 'Code & Data',
  keywords: 'sql format beautify pretty query select indent',
  sub: 'Reindent and capitalize a SQL query for readability.',
  render(panel) {
    const { el } = DK;
    const input = el('textarea', { placeholder: 'select id,name from users u join orders o on o.uid=u.id where u.active=1 order by name', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Formatted SQL appears here.' });

    const NEWLINE = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET',
      'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN', 'JOIN',
      'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
    const INDENT = ['AND', 'OR', 'ON'];
    const KEYWORDS = NEWLINE.concat(INDENT, ['AS', 'IN', 'IS', 'NOT', 'NULL', 'LIKE', 'BETWEEN', 'ASC', 'DESC', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END']);

    function format() {
      let sql = input.value.replace(/\s+/g, ' ').trim();
      if (!sql) { output.textContent = ''; return; }
      // Uppercase keywords (longest first so multi-word keywords win).
      for (const kw of KEYWORDS.slice().sort((a, b) => b.length - a.length)) {
        sql = sql.replace(new RegExp('\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'gi'), kw);
      }
      // Line breaks before major clauses.
      for (const kw of NEWLINE.slice().sort((a, b) => b.length - a.length)) {
        sql = sql.replace(new RegExp('\\s*\\b' + kw.replace(/ /g, '\\s+') + '\\b', 'g'), '\n' + kw);
      }
      for (const kw of INDENT) sql = sql.replace(new RegExp('\\s*\\b' + kw + '\\b', 'g'), '\n  ' + kw);
      // Break the SELECT column list onto indented lines.
      sql = sql.replace(/,\s*/g, ',\n  ');
      output.textContent = sql.replace(/^\n/, '').trim();
    }

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: format }, 'Format'),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy')
    ]));
    panel.appendChild(output);
    panel.appendChild(el('p', { class: 'hint', text: 'A lightweight formatter — great for quick reading, not a full SQL parser.' }));
  }
});

// ---------- Cron explainer ----------
DK.register({
  id: 'cron',
  name: 'Cron Explainer',
  icon: '🕗',
  group: 'Time',
  keywords: 'cron crontab schedule expression explain next run job',
  sub: 'Explain a 5-field cron expression and show upcoming run times.',
  render(panel) {
    const { el } = DK;
    const input = el('input', { type: 'text', class: 'grow', value: '*/15 9-17 * * 1-5', spellcheck: 'false', placeholder: 'min hour day month weekday' });
    const result = el('div');

    const NAMES = ['minute (0-59)', 'hour (0-23)', 'day of month (1-31)', 'month (1-12)', 'day of week (0-6, Sun=0)'];
    const RANGES = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

    function parseField(expr, [min, max]) {
      const set = new Set();
      const isStar = expr === '*' || expr === '*/1';
      for (const part of expr.split(',')) {
        let step = 1, range = part;
        const si = part.indexOf('/');
        if (si >= 0) { step = Number(part.slice(si + 1)); range = part.slice(0, si); }
        let lo, hi;
        if (range === '*') { lo = min; hi = max; }
        else if (range.includes('-')) { const [a, b] = range.split('-'); lo = Number(a); hi = Number(b); }
        else { lo = Number(range); hi = si >= 0 ? max : lo; }
        if (isNaN(lo) || isNaN(hi) || isNaN(step) || step < 1) throw new Error('bad field: ' + expr);
        for (let v = lo; v <= hi; v += step) set.add(v);
      }
      return { set, isStar };
    }

    function normalizeDow(set) {
      if (set.has(7)) { set.delete(7); set.add(0); }
      return set;
    }

    function describe(fields, parts) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const list = (arr, fmt) => arr.map(fmt || String).join(', ');
      const f = fields;
      const min = [...f[0].set].sort((a, b) => a - b);
      const hour = [...f[1].set].sort((a, b) => a - b);
      let timePart;
      if (f[0].isStar && f[1].isStar) timePart = 'every minute';
      else if (parts[0].includes('/') && f[1].isStar) timePart = `every ${parts[0].split('/')[1]} minutes`;
      else if (f[1].isStar) timePart = `at minute ${list(min)} of every hour`;
      else if (f[0].isStar) timePart = `every minute during hour ${list(hour)}`;
      else timePart = `at ${hour.map((h) => min.map((m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`).join(', ')).join(', ')}`;

      let dayPart = '';
      if (!f[4].isStar) dayPart += ' on ' + list([...f[4].set].sort((a, b) => a - b), (d) => dayNames[d]);
      if (!f[2].isStar) dayPart += (dayPart ? ' and' : ' on') + ' day-of-month ' + list([...f[2].set].sort((a, b) => a - b));
      if (!f[3].isStar) dayPart += ' in ' + list([...f[3].set].sort((a, b) => a - b), (m) => monthNames[m]);
      return `Runs ${timePart}${dayPart}.`;
    }

    function matches(fields, date) {
      const dowMatch = fields[4].set.has(date.getDay());
      const domMatch = fields[2].set.has(date.getDate());
      let dayOk;
      if (fields[2].isStar && fields[4].isStar) dayOk = true;
      else if (fields[2].isStar) dayOk = dowMatch;
      else if (fields[4].isStar) dayOk = domMatch;
      else dayOk = domMatch || dowMatch;
      return fields[0].set.has(date.getMinutes()) && fields[1].set.has(date.getHours()) &&
        fields[3].set.has(date.getMonth() + 1) && dayOk;
    }

    function run() {
      result.textContent = '';
      const parts = input.value.trim().split(/\s+/);
      if (parts.length !== 5) { result.appendChild(el('p', { class: 'status-err', text: 'Expected exactly 5 fields (minute hour day month weekday).' })); return; }
      let fields;
      try {
        fields = parts.map((p, i) => parseField(p, RANGES[i]));
        normalizeDow(fields[4].set);
      } catch (e) { result.appendChild(el('p', { class: 'status-err', text: 'Parse error: ' + e.message })); return; }

      result.appendChild(el('p', { class: 'status-ok', text: describe(fields, parts), style: 'font-size:13px' }));

      // Per-field breakdown
      const table = el('table', { class: 'kv-table' });
      parts.forEach((p, i) => table.appendChild(el('tr', {}, [el('th', { text: NAMES[i] }), el('td', { class: 'mono', text: p })])));
      result.appendChild(table);

      // Next 5 runs
      const runs = [];
      const d = new Date();
      d.setSeconds(0, 0);
      d.setMinutes(d.getMinutes() + 1);
      for (let i = 0; i < 500000 && runs.length < 5; i++) {
        if (matches(fields, d)) runs.push(new Date(d));
        d.setMinutes(d.getMinutes() + 1);
      }
      result.appendChild(el('h3', { text: 'Next runs', style: 'margin:12px 0 4px;font-size:13px' }));
      if (!runs.length) result.appendChild(el('p', { class: 'hint', text: 'No runs found within ~1 year.' }));
      else {
        const t2 = el('table', { class: 'kv-table' });
        runs.forEach((r) => t2.appendChild(el('tr', {}, [el('td', { class: 'mono', text: r.toLocaleString() })])));
        result.appendChild(t2);
      }
    }

    input.addEventListener('input', run);
    panel.appendChild(el('div', { class: 'row' }, [input]));
    panel.appendChild(result);
    run();
  }
});
