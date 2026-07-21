// More generators: secure password / token, and mock/random data.

// ---------- Password generator ----------
DK.register({
  id: 'password',
  name: 'Password Generator',
  icon: '🔑',
  group: 'Generators',
  keywords: 'password token secure random generate passphrase strength',
  sub: 'Cryptographically strong passwords (Web Crypto).',
  render(panel) {
    const { el } = DK;
    const SETS = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      digits: '0123456789',
      symbols: '!@#$%^&*()-_=+[]{};:,.<>/?'
    };
    const AMBIG = /[Il1O0o]/g;

    const length = el('input', { type: 'range', min: '6', max: '64', value: '20', style: 'flex:1' });
    const lenLabel = el('span', { class: 'mono', text: '20' });
    const chk = (id, label, on) => {
      const c = el('input', { type: 'checkbox', id: 'pw-' + id });
      if (on) c.checked = true;
      return { c, node: el('label', { class: 'hint', for: 'pw-' + id }, [c, ' ' + label]) };
    };
    const cLower = chk('lower', 'a-z', true);
    const cUpper = chk('upper', 'A-Z', true);
    const cDigits = chk('digits', '0-9', true);
    const cSymbols = chk('symbols', '!@#', true);
    const cNoAmbig = chk('noambig', 'No look-alikes', false);
    const count = el('input', { type: 'number', min: '1', max: '50', value: '1', style: 'width:70px' });

    const output = el('div', { class: 'out', 'data-placeholder': 'Generated passwords appear here.' });
    const strength = el('div', { class: 'row tight' });

    function pool() {
      let p = '';
      if (cLower.c.checked) p += SETS.lower;
      if (cUpper.c.checked) p += SETS.upper;
      if (cDigits.c.checked) p += SETS.digits;
      if (cSymbols.c.checked) p += SETS.symbols;
      if (cNoAmbig.c.checked) p = p.replace(AMBIG, '');
      return p;
    }

    function makeOne(chars, len) {
      const out = new Array(len);
      const rnd = crypto.getRandomValues(new Uint32Array(len));
      for (let i = 0; i < len; i++) out[i] = chars[rnd[i] % chars.length];
      return out.join('');
    }

    function estimateBits(len, poolSize) { return Math.round(len * Math.log2(poolSize || 1)); }

    function generate() {
      const chars = pool();
      strength.textContent = '';
      if (!chars) { output.textContent = 'Select at least one character set.'; return; }
      const len = Number(length.value);
      const n = Math.min(50, Math.max(1, Number(count.value) || 1));
      output.textContent = Array.from({ length: n }, () => makeOne(chars, len)).join('\n');
      const bits = estimateBits(len, chars.length);
      const label = bits < 50 ? 'Weak' : bits < 80 ? 'Fair' : bits < 120 ? 'Strong' : 'Very strong';
      const cls = bits < 50 ? 'err' : bits < 80 ? 'warn' : 'ok';
      strength.appendChild(el('span', { class: 'badge ' + cls, text: `${label} — ~${bits} bits of entropy` }));
    }

    length.addEventListener('input', () => { lenLabel.textContent = length.value; generate(); });
    for (const c of [cLower, cUpper, cDigits, cSymbols, cNoAmbig]) c.c.addEventListener('change', generate);
    count.addEventListener('input', generate);

    panel.appendChild(el('div', { class: 'row' }, [el('span', { class: 'hint', text: 'Length' }), length, lenLabel]));
    panel.appendChild(el('div', { class: 'row' }, [cLower.node, cUpper.node, cDigits.node, cSymbols.node, cNoAmbig.node]));
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: generate }, '🔑 Generate'),
      el('span', { class: 'hint', text: 'Count' }), count,
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy all')
    ]));
    panel.appendChild(strength);
    panel.appendChild(output);
    generate();
  }
});

// ---------- Random / mock data ----------
DK.register({
  id: 'randomdata',
  name: 'Mock Data',
  icon: '🎲',
  group: 'Generators',
  keywords: 'random mock fake data name email phone ip test sample',
  sub: 'Generate fake names, emails, and other test data locally.',
  render(panel) {
    const { el } = DK;
    const FIRST = 'James Mary Robert Patricia John Jennifer Michael Linda David Elizabeth Sarah Omar Aisha Wei Priya Diego Yuki Noah Emma Liam Olivia Ava Zubair Fatima'.split(' ');
    const LAST = 'Smith Johnson Williams Brown Jones Garcia Miller Davis Rodriguez Martinez Khan Chen Patel Nguyen Kim Silva Ali Haque Rahman Ahmed'.split(' ');
    const DOMAINS = 'example.com mail.com test.dev acme.io company.co'.split(' ');
    const STREETS = 'Main Oak Maple Cedar Pine Elm Lake Hill Park River'.split(' ');
    const CITIES = 'Springfield Riverside Franklin Clinton Georgetown Salem Dhaka Austin Denver Bristol'.split(' ');

    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const num = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const GENS = {
      'Full name': () => `${rand(FIRST)} ${rand(LAST)}`,
      'Email': () => `${rand(FIRST).toLowerCase()}.${rand(LAST).toLowerCase()}${num(1, 99)}@${rand(DOMAINS)}`,
      'Username': () => `${rand(FIRST).toLowerCase()}_${rand(LAST).toLowerCase()}${num(1, 999)}`,
      'Phone (US-style)': () => `(${num(200, 999)}) ${num(200, 999)}-${String(num(0, 9999)).padStart(4, '0')}`,
      'UUID v4': () => (crypto.randomUUID ? crypto.randomUUID() : ''),
      'IPv4': () => `${num(1, 255)}.${num(0, 255)}.${num(0, 255)}.${num(1, 254)}`,
      'Hex color': () => '#' + num(0, 0xffffff).toString(16).padStart(6, '0'),
      'Address': () => `${num(1, 9999)} ${rand(STREETS)} St, ${rand(CITIES)}`,
      'Company': () => `${rand(LAST)} ${rand(['Labs', 'Group', 'Systems', 'Technologies', 'Solutions', 'Digital'])}`,
      'Date (ISO)': () => new Date(Date.now() - num(0, 3e10)).toISOString().slice(0, 10)
    };

    const type = el('select', {}, Object.keys(GENS).map((k) => el('option', { value: k, text: k })));
    const count = el('input', { type: 'number', min: '1', max: '200', value: '10', style: 'width:70px' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Click Generate.' });

    function generate() {
      const fn = GENS[type.value];
      const n = Math.min(200, Math.max(1, Number(count.value) || 1));
      output.textContent = Array.from({ length: n }, fn).join('\n');
    }

    type.addEventListener('change', generate);
    count.addEventListener('input', generate);
    panel.appendChild(el('div', { class: 'row' }, [
      type, el('span', { class: 'hint', text: 'Count' }), count,
      el('button', { class: 'btn primary', onclick: generate }, 'Generate'),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy all')
    ]));
    panel.appendChild(output);
    generate();
  }
});
