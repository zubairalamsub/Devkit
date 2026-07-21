// Reference tools: HTTP status codes, MIME types, user-agent parser.

// ---------- HTTP status codes ----------
DK.register({
  id: 'http',
  name: 'HTTP Status Codes',
  icon: '🌐',
  group: 'Reference',
  keywords: 'http status code 200 404 500 reference response',
  sub: 'Searchable reference of HTTP response status codes.',
  render(panel) {
    const { el } = DK;
    const CODES = [
      [100, 'Continue'], [101, 'Switching Protocols'], [103, 'Early Hints'],
      [200, 'OK'], [201, 'Created'], [202, 'Accepted'], [204, 'No Content'], [206, 'Partial Content'],
      [301, 'Moved Permanently'], [302, 'Found'], [303, 'See Other'], [304, 'Not Modified'], [307, 'Temporary Redirect'], [308, 'Permanent Redirect'],
      [400, 'Bad Request'], [401, 'Unauthorized'], [402, 'Payment Required'], [403, 'Forbidden'], [404, 'Not Found'], [405, 'Method Not Allowed'], [406, 'Not Acceptable'], [408, 'Request Timeout'], [409, 'Conflict'], [410, 'Gone'], [413, 'Payload Too Large'], [415, 'Unsupported Media Type'], [418, "I'm a teapot"], [422, 'Unprocessable Entity'], [425, 'Too Early'], [429, 'Too Many Requests'], [431, 'Request Header Fields Too Large'], [451, 'Unavailable For Legal Reasons'],
      [500, 'Internal Server Error'], [501, 'Not Implemented'], [502, 'Bad Gateway'], [503, 'Service Unavailable'], [504, 'Gateway Timeout'], [505, 'HTTP Version Not Supported'], [511, 'Network Authentication Required']
    ];
    const CLASS = { 1: 'Informational', 2: 'Success', 3: 'Redirection', 4: 'Client Error', 5: 'Server Error' };

    const search = el('input', { type: 'search', class: 'grow', placeholder: 'Filter by code or name… e.g. 404, redirect', spellcheck: 'false' });
    const table = el('table', { class: 'kv-table' });

    function build(q) {
      table.textContent = '';
      const filtered = CODES.filter(([c, n]) => !q || String(c).includes(q) || n.toLowerCase().includes(q.toLowerCase()) || (CLASS[Math.floor(c / 100)] || '').toLowerCase().includes(q.toLowerCase()));
      for (const [code, name] of filtered) {
        const cls = Math.floor(code / 100);
        const badgeCls = cls === 2 ? 'ok' : cls === 4 || cls === 5 ? 'err' : cls === 3 ? 'warn' : '';
        table.appendChild(el('tr', {}, [
          el('td', {}, [el('span', { class: 'badge ' + badgeCls, text: String(code) })]),
          el('td', { text: name }),
          el('td', { class: 'hint', text: CLASS[cls] || '' })
        ]));
      }
      if (!filtered.length) table.appendChild(el('tr', {}, [el('td', { class: 'hint', text: 'No matches.' })]));
    }
    search.addEventListener('input', () => build(search.value));
    panel.appendChild(el('div', { class: 'row' }, [search]));
    panel.appendChild(table);
    build('');
  }
});

// ---------- MIME types ----------
DK.register({
  id: 'mime',
  name: 'MIME Types',
  icon: '📎',
  group: 'Reference',
  keywords: 'mime type content-type extension file media reference',
  sub: 'Look up MIME types by file extension.',
  render(panel) {
    const { el } = DK;
    const MIME = [
      ['.html', 'text/html'], ['.css', 'text/css'], ['.js', 'text/javascript'], ['.mjs', 'text/javascript'], ['.json', 'application/json'], ['.xml', 'application/xml'], ['.csv', 'text/csv'], ['.txt', 'text/plain'], ['.md', 'text/markdown'],
      ['.png', 'image/png'], ['.jpg', 'image/jpeg'], ['.jpeg', 'image/jpeg'], ['.gif', 'image/gif'], ['.webp', 'image/webp'], ['.svg', 'image/svg+xml'], ['.avif', 'image/avif'], ['.ico', 'image/x-icon'],
      ['.pdf', 'application/pdf'], ['.zip', 'application/zip'], ['.gz', 'application/gzip'], ['.tar', 'application/x-tar'], ['.7z', 'application/x-7z-compressed'],
      ['.mp3', 'audio/mpeg'], ['.wav', 'audio/wav'], ['.ogg', 'audio/ogg'], ['.mp4', 'video/mp4'], ['.webm', 'video/webm'], ['.mov', 'video/quicktime'],
      ['.woff', 'font/woff'], ['.woff2', 'font/woff2'], ['.ttf', 'font/ttf'], ['.otf', 'font/otf'],
      ['.doc', 'application/msword'], ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ['.xls', 'application/vnd.ms-excel'], ['.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'], ['.ppt', 'application/vnd.ms-powerpoint'], ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
      ['.wasm', 'application/wasm'], ['.bin', 'application/octet-stream']
    ];
    const search = el('input', { type: 'search', class: 'grow', placeholder: 'Filter by extension or type… e.g. png, font', spellcheck: 'false' });
    const table = el('table', { class: 'kv-table' });

    function build(q) {
      table.textContent = '';
      const filtered = MIME.filter(([ext, type]) => !q || ext.includes(q.toLowerCase()) || type.includes(q.toLowerCase()));
      for (const [ext, type] of filtered) {
        table.appendChild(el('tr', {}, [
          el('th', { class: 'mono', text: ext }),
          el('td', { class: 'mono', text: type, style: 'cursor:pointer', title: 'Click to copy', onclick: () => DK.copy(type) })
        ]));
      }
      if (!filtered.length) table.appendChild(el('tr', {}, [el('td', { class: 'hint', text: 'No matches.' })]));
    }
    search.addEventListener('input', () => build(search.value));
    panel.appendChild(el('div', { class: 'row' }, [search]));
    panel.appendChild(table);
    build('');
  }
});

// ---------- User agent parser ----------
DK.register({
  id: 'useragent',
  name: 'User Agent',
  icon: '🧭',
  group: 'Reference',
  keywords: 'user agent ua parse browser os engine device',
  sub: 'Parse a User-Agent string into browser, OS and engine.',
  render(panel) {
    const { el } = DK;
    const input = el('textarea', { class: 'small', placeholder: 'Paste a User-Agent string…', spellcheck: 'false' });
    const result = el('div');

    function parse(ua) {
      const out = { Browser: 'Unknown', 'Browser version': '', 'Operating system': 'Unknown', 'Rendering engine': 'Unknown', 'Device type': 'Desktop' };
      const m = (re) => (ua.match(re) || [])[1] || '';

      if (/Edg\//.test(ua)) { out.Browser = 'Microsoft Edge'; out['Browser version'] = m(/Edg\/([\d.]+)/); }
      else if (/OPR\/|Opera/.test(ua)) { out.Browser = 'Opera'; out['Browser version'] = m(/(?:OPR|Opera)\/([\d.]+)/); }
      else if (/Firefox\//.test(ua)) { out.Browser = 'Firefox'; out['Browser version'] = m(/Firefox\/([\d.]+)/); }
      else if (/Chrome\//.test(ua)) { out.Browser = 'Chrome'; out['Browser version'] = m(/Chrome\/([\d.]+)/); }
      else if (/Version\/.*Safari/.test(ua)) { out.Browser = 'Safari'; out['Browser version'] = m(/Version\/([\d.]+)/); }
      else if (/MSIE|Trident/.test(ua)) { out.Browser = 'Internet Explorer'; out['Browser version'] = m(/(?:MSIE |rv:)([\d.]+)/); }

      if (/Windows NT 10/.test(ua)) out['Operating system'] = 'Windows 10/11';
      else if (/Windows NT 6\.3/.test(ua)) out['Operating system'] = 'Windows 8.1';
      else if (/Windows/.test(ua)) out['Operating system'] = 'Windows';
      else if (/iPhone|iPad|iPod/.test(ua)) { out['Operating system'] = 'iOS ' + m(/OS ([\d_]+)/).replace(/_/g, '.'); }
      else if (/Mac OS X/.test(ua)) out['Operating system'] = 'macOS ' + m(/Mac OS X ([\d_]+)/).replace(/_/g, '.');
      else if (/Android/.test(ua)) out['Operating system'] = 'Android ' + m(/Android ([\d.]+)/);
      else if (/Linux/.test(ua)) out['Operating system'] = 'Linux';

      if (/Gecko\/|Firefox/.test(ua) && !/like Gecko/.test(ua)) out['Rendering engine'] = 'Gecko';
      else if (/AppleWebKit/.test(ua)) out['Rendering engine'] = /Chrome|Edg|OPR/.test(ua) ? 'Blink' : 'WebKit';
      else if (/Trident/.test(ua)) out['Rendering engine'] = 'Trident';

      if (/Mobile|iPhone|Android.*Mobile/.test(ua)) out['Device type'] = 'Mobile';
      else if (/iPad|Tablet/.test(ua)) out['Device type'] = 'Tablet';
      return out;
    }

    function run() {
      result.textContent = '';
      const ua = input.value.trim();
      if (!ua) return;
      const table = el('table', { class: 'kv-table' });
      for (const [k, v] of Object.entries(parse(ua))) {
        table.appendChild(el('tr', {}, [el('th', { text: k }), el('td', { class: 'mono', text: v || '—' })]));
      }
      result.appendChild(table);
    }

    input.addEventListener('input', run);
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn', onclick: () => { input.value = navigator.userAgent; run(); } }, 'Use my browser'),
      el('span', { class: 'hint', text: 'or paste any UA string below' })
    ]));
    panel.appendChild(input);
    panel.appendChild(result);
    input.value = navigator.userAgent;
    run();
  }
});
