// JWT decoder (decode only — signatures are not verified).
DK.register({
  id: 'jwt',
  name: 'JWT Decoder',
  icon: '🎫',
  group: 'Code & Data',
  keywords: 'jwt json web token decode header payload claims expiry',
  sub: 'Decode a JSON Web Token and inspect its claims. Signature is NOT verified.',
  render(panel) {
    const { el, toast } = DK;
    const input = el('textarea', { class: 'small', placeholder: 'eyJhbGciOi…', spellcheck: 'false' });
    const result = el('div');

    function b64urlToStr(part) {
      let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      const bin = atob(b64);
      const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    }

    function claimHint(key, value) {
      const times = { exp: 'Expires', iat: 'Issued at', nbf: 'Not before' };
      if (times[key] && typeof value === 'number') {
        const d = new Date(value * 1000);
        let extra = '';
        if (key === 'exp') extra = d.getTime() < Date.now() ? ' — EXPIRED' : ' — valid';
        return `${times[key]}: ${d.toLocaleString()}${extra}`;
      }
      return '';
    }

    function section(title, obj) {
      const wrap = el('div');
      wrap.appendChild(el('h3', { text: title, style: 'margin:10px 0 4px;font-size:13px' }));
      const table = el('table', { class: 'kv-table' });
      for (const [k, v] of Object.entries(obj)) {
        const hint = claimHint(k, v);
        const valText = typeof v === 'object' ? JSON.stringify(v) : String(v);
        table.appendChild(el('tr', {}, [
          el('th', { class: 'mono', text: k }),
          el('td', { class: 'mono' }, [
            valText,
            hint ? el('div', { class: hint.includes('EXPIRED') ? 'status-err' : 'hint', text: hint }) : null
          ])
        ]));
      }
      wrap.appendChild(table);
      return wrap;
    }

    function decode() {
      result.textContent = '';
      const token = input.value.trim().replace(/^Bearer\s+/i, '');
      if (!token) return;
      const parts = token.split('.');
      if (parts.length < 2) { toast('Not a JWT (expected 3 dot-separated parts)'); return; }
      try {
        const header = JSON.parse(b64urlToStr(parts[0]));
        const payload = JSON.parse(b64urlToStr(parts[1]));
        result.appendChild(section('Header', header));
        result.appendChild(section('Payload', payload));
        if (payload.exp) {
          const expired = payload.exp * 1000 < Date.now();
          result.appendChild(el('div', { style: 'margin-top:10px' }, [
            el('span', { class: 'badge ' + (expired ? 'err' : 'ok'), text: expired ? 'Token expired' : 'Token not expired' })
          ]));
        }
        result.appendChild(el('p', { class: 'hint', text: 'Note: the signature is not cryptographically verified — this tool only decodes.' }));
      } catch (e) {
        toast('Decode failed: ' + e.message);
      }
    }

    input.addEventListener('input', decode);
    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: decode }, 'Decode')
    ]));
    panel.appendChild(result);
  }
});
