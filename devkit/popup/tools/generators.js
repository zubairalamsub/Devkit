// Generators: UUID, cryptographic hashes, lorem ipsum.

// ---------- UUID ----------
DK.register({
  id: 'uuid',
  name: 'UUID Generator',
  icon: '🆔',
  group: 'Generators',
  keywords: 'uuid guid v4 random identifier generate',
  sub: 'Generate RFC 4122 version-4 UUIDs.',
  render(panel) {
    const { el, copy } = DK;
    const count = el('input', { type: 'number', value: '1', min: '1', max: '500', style: 'width:70px' });
    const upper = el('input', { type: 'checkbox', id: 'uuid-upper' });
    const noDash = el('input', { type: 'checkbox', id: 'uuid-nodash' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Click Generate.' });

    function uuid() {
      if (crypto.randomUUID) return crypto.randomUUID();
      const b = crypto.getRandomValues(new Uint8Array(16));
      b[6] = (b[6] & 0x0f) | 0x40;
      b[8] = (b[8] & 0x3f) | 0x80;
      const h = [...b].map((x) => x.toString(16).padStart(2, '0')).join('');
      return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
    }

    function generate() {
      const n = Math.min(500, Math.max(1, Number(count.value) || 1));
      let list = Array.from({ length: n }, uuid);
      if (noDash.checked) list = list.map((u) => u.replace(/-/g, ''));
      if (upper.checked) list = list.map((u) => u.toUpperCase());
      output.textContent = list.join('\n');
    }

    generate();
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: generate }, 'Generate'),
      el('label', { class: 'hint', text: 'Count ' }), count,
      el('label', { class: 'hint', for: 'uuid-upper' }, [upper, ' Uppercase']),
      el('label', { class: 'hint', for: 'uuid-nodash' }, [noDash, ' No dashes']),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy all')
    ]));
    panel.appendChild(output);
  }
});

// ---------- Hash ----------
DK.register({
  id: 'hash',
  name: 'Hash Generator',
  icon: '#',
  group: 'Generators',
  keywords: 'hash sha1 sha256 sha384 sha512 checksum digest',
  sub: 'SHA hashes computed locally with the Web Crypto API.',
  render(panel) {
    const { el } = DK;
    const input = el('textarea', { placeholder: 'Text to hash…', spellcheck: 'false' });
    const outWrap = el('div');
    const algos = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

    async function digest(algo, text) {
      const buf = await crypto.subtle.digest(algo, new TextEncoder().encode(text));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    }

    let timer = null;
    async function update() {
      const text = input.value;
      outWrap.textContent = '';
      if (!text) return;
      const table = el('table', { class: 'kv-table' });
      for (const algo of algos) {
        const hex = await digest(algo, text);
        table.appendChild(el('tr', {}, [
          el('th', { text: algo }),
          el('td', { class: 'mono', text: hex, style: 'cursor:pointer', title: 'Click to copy', onclick: () => DK.copy(hex) })
        ]));
      }
      outWrap.appendChild(table);
      outWrap.appendChild(el('p', { class: 'hint', text: 'Click a hash to copy it. MD5 is intentionally omitted (broken for security use).' }));
    }

    input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(update, 200); });
    panel.appendChild(input);
    panel.appendChild(el('div', { style: 'height:8px' }));
    panel.appendChild(outWrap);
  }
});

// ---------- Lorem ipsum ----------
DK.register({
  id: 'lorem',
  name: 'Lorem Ipsum',
  icon: '¶',
  group: 'Generators',
  keywords: 'lorem ipsum placeholder text dummy filler',
  sub: 'Generate placeholder text.',
  render(panel) {
    const { el } = DK;
    const WORDS = ('lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt culpa qui officia deserunt mollit anim id est laborum').split(' ');

    const count = el('input', { type: 'number', value: '3', min: '1', max: '50', style: 'width:70px' });
    const unit = el('select', {}, [
      el('option', { value: 'paragraphs', text: 'Paragraphs' }),
      el('option', { value: 'sentences', text: 'Sentences' }),
      el('option', { value: 'words', text: 'Words' })
    ]);
    const output = el('div', { class: 'out', 'data-placeholder': 'Click Generate.' });
    output.style.whiteSpace = 'pre-wrap';

    const rand = (n) => Math.floor(Math.random() * n);
    const word = () => WORDS[rand(WORDS.length)];
    function sentence() {
      const len = 6 + rand(10);
      const words = Array.from({ length: len }, word);
      words[0] = words[0][0].toUpperCase() + words[0].slice(1);
      return words.join(' ') + '.';
    }
    const paragraph = () => Array.from({ length: 4 + rand(4) }, sentence).join(' ');

    function generate() {
      const n = Math.min(50, Math.max(1, Number(count.value) || 1));
      const mode = unit.value;
      if (mode === 'words') output.textContent = Array.from({ length: n }, word).join(' ');
      else if (mode === 'sentences') output.textContent = Array.from({ length: n }, sentence).join(' ');
      else output.textContent = Array.from({ length: n }, paragraph).join('\n\n');
    }

    generate();
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: generate }, 'Generate'),
      count, unit,
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy')
    ]));
    panel.appendChild(output);
  }
});
