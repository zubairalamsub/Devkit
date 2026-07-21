// Unix timestamp converter with live clock.
DK.register({
  id: 'time',
  name: 'Timestamp Converter',
  icon: '⏱',
  group: 'Time',
  keywords: 'unix epoch timestamp date time convert milliseconds iso utc',
  sub: 'Convert between Unix epoch and human-readable dates.',
  render(panel) {
    const { el } = DK;

    // Live "now" ticker
    const nowS = el('code', { class: 'mono', style: 'cursor:pointer', title: 'Click to copy' });
    const nowMs = el('code', { class: 'mono', style: 'cursor:pointer', title: 'Click to copy' });
    nowS.addEventListener('click', () => DK.copy(nowS.textContent));
    nowMs.addEventListener('click', () => DK.copy(nowMs.textContent));
    function tick() {
      const t = Date.now();
      nowS.textContent = String(Math.floor(t / 1000));
      nowMs.textContent = String(t);
    }
    tick();
    setInterval(tick, 1000);

    const nowTable = el('table', { class: 'kv-table' }, [
      el('tr', {}, [el('th', { text: 'Now (seconds)' }), el('td', {}, [nowS])]),
      el('tr', {}, [el('th', { text: 'Now (milliseconds)' }), el('td', {}, [nowMs])])
    ]);

    // Epoch -> date
    const epochIn = el('input', { type: 'text', placeholder: '1721606400 or 1721606400000', class: 'grow', spellcheck: 'false' });
    const epochOut = el('div', { class: 'out', 'data-placeholder': 'Local, UTC and ISO representations appear here.' });
    function fromEpoch() {
      const raw = epochIn.value.trim();
      if (!raw) { epochOut.textContent = ''; return; }
      let n = Number(raw);
      if (!isFinite(n)) { epochOut.textContent = 'Not a number.'; return; }
      const unit = Math.abs(n) >= 1e12 ? 'ms' : 's';
      const ms = unit === 's' ? n * 1000 : n;
      const d = new Date(ms);
      if (isNaN(d.getTime())) { epochOut.textContent = 'Out of range.'; return; }
      const rel = (() => {
        const diff = ms - Date.now();
        const abs = Math.abs(diff);
        const units = [[31536000000, 'year'], [2592000000, 'month'], [86400000, 'day'], [3600000, 'hour'], [60000, 'minute'], [1000, 'second']];
        for (const [size, name] of units) {
          if (abs >= size) {
            const v = Math.round(abs / size);
            return `${v} ${name}${v > 1 ? 's' : ''} ${diff < 0 ? 'ago' : 'from now'}`;
          }
        }
        return 'now';
      })();
      epochOut.textContent =
        `Detected unit : ${unit === 's' ? 'seconds' : 'milliseconds'}\n` +
        `Local         : ${d.toLocaleString()}\n` +
        `UTC           : ${d.toUTCString()}\n` +
        `ISO 8601      : ${d.toISOString()}\n` +
        `Relative      : ${rel}`;
    }
    epochIn.addEventListener('input', fromEpoch);

    // Date -> epoch
    const dateIn = el('input', { type: 'text', placeholder: '2026-07-22 14:30 or any Date-parsable string', class: 'grow', spellcheck: 'false' });
    const dateOut = el('div', { class: 'out', 'data-placeholder': 'Epoch seconds and milliseconds appear here.' });
    function toEpoch() {
      const raw = dateIn.value.trim();
      if (!raw) { dateOut.textContent = ''; return; }
      const d = new Date(raw);
      if (isNaN(d.getTime())) { dateOut.textContent = 'Could not parse that date.'; return; }
      dateOut.textContent =
        `Seconds       : ${Math.floor(d.getTime() / 1000)}\n` +
        `Milliseconds  : ${d.getTime()}\n` +
        `ISO 8601      : ${d.toISOString()}`;
    }
    dateIn.addEventListener('input', toEpoch);

    panel.appendChild(nowTable);
    panel.appendChild(el('h3', { text: 'Epoch → Date', style: 'margin:14px 0 6px;font-size:13px' }));
    panel.appendChild(el('div', { class: 'row' }, [epochIn]));
    panel.appendChild(epochOut);
    panel.appendChild(el('h3', { text: 'Date → Epoch', style: 'margin:14px 0 6px;font-size:13px' }));
    panel.appendChild(el('div', { class: 'row' }, [dateIn]));
    panel.appendChild(dateOut);
  }
});
