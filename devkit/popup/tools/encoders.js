// Encoders / decoders: Base64, URL, HTML entities.

// ---------- Base64 ----------
DK.register({
  id: 'base64',
  name: 'Base64',
  icon: '64',
  group: 'Code & Data',
  keywords: 'base64 encode decode atob btoa url-safe',
  sub: 'Encode and decode Base64 (UTF-8 safe, with URL-safe variant).',
  render(panel) {
    const { el, copy, toast } = DK;
    const input = el('textarea', { placeholder: 'Text or Base64…', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Result appears here.' });
    const urlSafe = el('input', { type: 'checkbox', id: 'b64-urlsafe' });

    const enc = new TextEncoder();
    const dec = new TextDecoder();

    function bytesToBinStr(bytes) {
      // chunked to avoid call-stack overflow on large inputs
      let bin = '';
      for (let i = 0; i < bytes.length; i += 0x8000) {
        bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
      }
      return bin;
    }

    function encode() {
      try {
        const bytes = enc.encode(input.value);
        let b64 = btoa(bytesToBinStr(bytes));
        if (urlSafe.checked) b64 = b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        output.textContent = b64;
      } catch (e) { toast('Encode failed: ' + e.message); }
    }
    function decode() {
      try {
        let b64 = input.value.trim().replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        const bin = atob(b64);
        const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
        output.textContent = dec.decode(bytes);
      } catch (e) {
        output.textContent = '';
        toast('Not valid Base64');
      }
    }

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: encode }, 'Encode'),
      el('button', { class: 'btn', onclick: decode }, 'Decode'),
      el('label', { class: 'hint', for: 'b64-urlsafe' }, [urlSafe, ' URL-safe']),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy result')
    ]));
    panel.appendChild(output);
  }
});

// ---------- URL ----------
DK.register({
  id: 'url',
  name: 'URL Encode / Parse',
  icon: '🔗',
  group: 'Code & Data',
  keywords: 'url encode decode uri component query string params parse',
  sub: 'Encode/decode URI components and break a URL into parts.',
  render(panel) {
    const { el, toast } = DK;
    const input = el('textarea', { class: 'small', placeholder: 'Text or full URL…', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Result appears here.' });
    const parsedWrap = el('div');

    function run(fn, name) {
      try { output.textContent = fn(input.value); }
      catch (e) { toast(name + ' failed: ' + e.message); }
    }

    function parse() {
      parsedWrap.textContent = '';
      let url;
      try { url = new URL(input.value.trim()); }
      catch (e) { toast('Not a valid absolute URL'); return; }
      const rows = [
        ['Protocol', url.protocol], ['Host', url.hostname], ['Port', url.port || '(default)'],
        ['Path', url.pathname], ['Hash', url.hash || '—']
      ];
      const table = el('table', { class: 'kv-table' });
      for (const [k, v] of rows) table.appendChild(el('tr', {}, [el('th', { text: k }), el('td', { class: 'mono', text: v })]));
      const params = [...url.searchParams.entries()];
      if (params.length) {
        table.appendChild(el('tr', {}, [el('th', { text: 'Query params', colspan: '2' })]));
        for (const [k, v] of params) table.appendChild(el('tr', {}, [el('td', { class: 'mono', text: k }), el('td', { class: 'mono', text: v })]));
      }
      parsedWrap.appendChild(table);
    }

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: () => run(encodeURIComponent, 'Encode') }, 'Encode'),
      el('button', { class: 'btn', onclick: () => run(decodeURIComponent, 'Decode') }, 'Decode'),
      el('button', { class: 'btn', onclick: parse }, 'Parse URL'),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy result')
    ]));
    panel.appendChild(output);
    panel.appendChild(el('div', { style: 'height:8px' }));
    panel.appendChild(parsedWrap);
  }
});

// ---------- HTML entities ----------
DK.register({
  id: 'entities',
  name: 'HTML Entities',
  icon: '&',
  group: 'Code & Data',
  keywords: 'html entities escape unescape encode decode amp lt gt',
  sub: 'Escape and unescape HTML entities.',
  render(panel) {
    const { el } = DK;
    const input = el('textarea', { placeholder: '<div class="a">Tom & Jerry</div>', spellcheck: 'false' });
    const output = el('div', { class: 'out', 'data-placeholder': 'Result appears here.' });

    function encode() {
      output.textContent = input.value
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function decode() {
      const doc = new DOMParser().parseFromString(input.value, 'text/html');
      output.textContent = doc.documentElement.textContent;
    }

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: encode }, 'Escape'),
      el('button', { class: 'btn', onclick: decode }, 'Unescape'),
      el('span', { class: 'grow' }),
      DK.copyBtn(() => output.textContent, 'Copy result')
    ]));
    panel.appendChild(output);
  }
});
