// QR code generator.
// The encoder below is a faithful JavaScript port of Nayuki's "QR Code generator"
// reference implementation (MIT / public domain). It supports byte mode with
// automatic version selection and the four error-correction levels.
const DKQr = (() => {
  const ECC = {
    L: { ordinal: 0, formatBits: 1 },
    M: { ordinal: 1, formatBits: 0 },
    Q: { ordinal: 2, formatBits: 3 },
    H: { ordinal: 3, formatBits: 2 }
  };

  // Indexed [ecl.ordinal][version]; index 0 of each row is an illegal placeholder.
  const ECC_CODEWORDS_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30]
  ];
  const NUM_ERROR_CORRECTION_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81]
  ];

  const getBit = (x, i) => ((x >>> i) & 1) !== 0;
  function appendBits(val, len, bb) { for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1); }
  const byteCharCountBits = (ver) => (ver < 10 ? 8 : 16);

  function getNumRawDataModules(ver) {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }
  function getNumDataCodewords(ver, ecl) {
    return Math.floor(getNumRawDataModules(ver) / 8) -
      ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
  }

  function reedSolomonMultiply(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z & 0xFF;
  }
  function reedSolomonComputeDivisor(degree) {
    const result = [];
    for (let i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < result.length; j++) {
        result[j] = reedSolomonMultiply(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = reedSolomonMultiply(root, 0x02);
    }
    return result;
  }
  function reedSolomonComputeRemainder(data, divisor) {
    const result = divisor.map(() => 0);
    for (const b of data) {
      const factor = b ^ result.shift();
      result.push(0);
      divisor.forEach((coef, i) => { result[i] ^= reedSolomonMultiply(coef, factor); });
    }
    return result;
  }

  class QrCode {
    constructor(version, ecl, dataCodewords, msk) {
      this.version = version;
      this.errorCorrectionLevel = ecl;
      this.size = version * 4 + 17;
      this.modules = [];
      this.isFunction = [];
      for (let i = 0; i < this.size; i++) {
        this.modules.push(new Array(this.size).fill(false));
        this.isFunction.push(new Array(this.size).fill(false));
      }
      this.drawFunctionPatterns();
      const allCodewords = this.addEccAndInterleave(dataCodewords);
      this.drawCodewords(allCodewords);

      if (msk === -1) {
        let minPenalty = Infinity;
        for (let i = 0; i < 8; i++) {
          this.applyMask(i);
          this.drawFormatBits(i);
          const penalty = this.getPenaltyScore();
          if (penalty < minPenalty) { msk = i; minPenalty = penalty; }
          this.applyMask(i);
        }
      }
      this.mask = msk;
      this.applyMask(msk);
      this.drawFormatBits(msk);
      this.isFunction = null;
    }

    setFunctionModule(x, y, isDark) { this.modules[y][x] = isDark; this.isFunction[y][x] = true; }

    drawFunctionPatterns() {
      const size = this.size;
      for (let i = 0; i < size; i++) {
        this.setFunctionModule(6, i, i % 2 === 0);
        this.setFunctionModule(i, 6, i % 2 === 0);
      }
      this.drawFinderPattern(3, 3);
      this.drawFinderPattern(size - 4, 3);
      this.drawFinderPattern(3, size - 4);
      const pos = this.getAlignmentPatternPositions();
      const n = pos.length;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (!((i === 0 && j === 0) || (i === 0 && j === n - 1) || (i === n - 1 && j === 0))) {
            this.drawAlignmentPattern(pos[i], pos[j]);
          }
        }
      }
      this.drawFormatBits(0);
      this.drawVersion();
    }

    drawFinderPattern(x, y) {
      for (let dy = -4; dy <= 4; dy++) {
        for (let dx = -4; dx <= 4; dx++) {
          const dist = Math.max(Math.abs(dx), Math.abs(dy));
          const xx = x + dx, yy = y + dy;
          if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) {
            this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4);
          }
        }
      }
    }

    drawAlignmentPattern(x, y) {
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }

    getAlignmentPatternPositions() {
      if (this.version === 1) return [];
      const numAlign = Math.floor(this.version / 7) + 2;
      const step = (this.version === 32) ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
      const result = [6];
      for (let pos = this.size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
      return result;
    }

    drawFormatBits(mask) {
      const data = (this.errorCorrectionLevel.formatBits << 3) | mask;
      let rem = data;
      for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      const bits = ((data << 10) | rem) ^ 0x5412;
      for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i));
      this.setFunctionModule(8, 7, getBit(bits, 6));
      this.setFunctionModule(8, 8, getBit(bits, 7));
      this.setFunctionModule(7, 8, getBit(bits, 8));
      for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, getBit(bits, i));
      for (let i = 0; i < 8; i++) this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
      for (let i = 8; i < 15; i++) this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
      this.setFunctionModule(8, this.size - 8, true);
    }

    drawVersion() {
      if (this.version < 7) return;
      let rem = this.version;
      for (let i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      const bits = (this.version << 12) | rem;
      for (let i = 0; i < 18; i++) {
        const bit = getBit(bits, i);
        const a = this.size - 11 + (i % 3), b = Math.floor(i / 3);
        this.setFunctionModule(a, b, bit);
        this.setFunctionModule(b, a, bit);
      }
    }

    addEccAndInterleave(data) {
      const ver = this.version, ecl = this.errorCorrectionLevel;
      const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
      const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl.ordinal][ver];
      const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
      const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
      const shortBlockLen = Math.floor(rawCodewords / numBlocks);
      const blocks = [];
      const rsDiv = reedSolomonComputeDivisor(blockEccLen);
      for (let i = 0, k = 0; i < numBlocks; i++) {
        const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
        k += dat.length;
        const ecc = reedSolomonComputeRemainder(dat, rsDiv);
        if (i < numShortBlocks) dat.push(0);
        blocks.push(dat.concat(ecc));
      }
      const result = [];
      for (let i = 0; i < blocks[0].length; i++) {
        blocks.forEach((block, j) => {
          if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
        });
      }
      return result;
    }

    drawCodewords(data) {
      let i = 0;
      for (let right = this.size - 1; right >= 1; right -= 2) {
        if (right === 6) right = 5;
        for (let vert = 0; vert < this.size; vert++) {
          for (let j = 0; j < 2; j++) {
            const x = right - j;
            const upward = ((right + 1) & 2) === 0;
            const y = upward ? this.size - 1 - vert : vert;
            if (!this.isFunction[y][x] && i < data.length * 8) {
              this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
              i++;
            }
          }
        }
      }
    }

    applyMask(mask) {
      for (let y = 0; y < this.size; y++) {
        for (let x = 0; x < this.size; x++) {
          let invert;
          switch (mask) {
            case 0: invert = (x + y) % 2 === 0; break;
            case 1: invert = y % 2 === 0; break;
            case 2: invert = x % 3 === 0; break;
            case 3: invert = (x + y) % 3 === 0; break;
            case 4: invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
            case 5: invert = (x * y) % 2 + (x * y) % 3 === 0; break;
            case 6: invert = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
            case 7: invert = ((x + y) % 2 + (x * y) % 3) % 2 === 0; break;
          }
          if (!this.isFunction[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
        }
      }
    }

    getPenaltyScore() {
      let result = 0;
      const size = this.size, m = this.modules;
      for (let y = 0; y < size; y++) {
        let runColor = false, runX = 0;
        const hist = [0, 0, 0, 0, 0, 0, 0];
        for (let x = 0; x < size; x++) {
          if (m[y][x] === runColor) { runX++; if (runX === 5) result += 3; else if (runX > 5) result++; }
          else { this.finderPenaltyAddHistory(runX, hist); if (!runColor) result += this.finderPenaltyCountPatterns(hist) * 40; runColor = m[y][x]; runX = 1; }
        }
        result += this.finderPenaltyTerminateAndCount(runColor, runX, hist) * 40;
      }
      for (let x = 0; x < size; x++) {
        let runColor = false, runY = 0;
        const hist = [0, 0, 0, 0, 0, 0, 0];
        for (let y = 0; y < size; y++) {
          if (m[y][x] === runColor) { runY++; if (runY === 5) result += 3; else if (runY > 5) result++; }
          else { this.finderPenaltyAddHistory(runY, hist); if (!runColor) result += this.finderPenaltyCountPatterns(hist) * 40; runColor = m[y][x]; runY = 1; }
        }
        result += this.finderPenaltyTerminateAndCount(runColor, runY, hist) * 40;
      }
      for (let y = 0; y < size - 1; y++) {
        for (let x = 0; x < size - 1; x++) {
          const c = m[y][x];
          if (c === m[y][x + 1] && c === m[y + 1][x] && c === m[y + 1][x + 1]) result += 3;
        }
      }
      let dark = 0;
      for (const row of m) for (const v of row) if (v) dark++;
      const total = size * size;
      const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      result += k * 10;
      return result;
    }

    finderPenaltyCountPatterns(hist) {
      const n = hist[1];
      const core = n > 0 && hist[2] === n && hist[3] === n * 3 && hist[4] === n && hist[5] === n;
      return (core && hist[0] >= n * 4 && hist[6] >= n ? 1 : 0) + (core && hist[6] >= n * 4 && hist[0] >= n ? 1 : 0);
    }
    finderPenaltyTerminateAndCount(runColor, runLen, hist) {
      if (runColor) { this.finderPenaltyAddHistory(runLen, hist); runLen = 0; }
      runLen += this.size;
      this.finderPenaltyAddHistory(runLen, hist);
      return this.finderPenaltyCountPatterns(hist);
    }
    finderPenaltyAddHistory(runLen, hist) {
      if (hist[0] === 0) runLen += this.size;
      hist.pop();
      hist.unshift(runLen);
    }
  }

  function encodeText(text, ecl) {
    const bytes = [...new TextEncoder().encode(text)];
    // Build one byte-mode segment.
    const bitData = [];
    for (const b of bytes) appendBits(b, 8, bitData);
    const seg = { modeBits: 0x4, numChars: bytes.length, bitData };

    // Choose the smallest version that fits.
    let version;
    for (version = 1; ; version++) {
      const capacityBits = getNumDataCodewords(version, ecl) * 8;
      const ccbits = byteCharCountBits(version);
      const usedBits = (seg.numChars < (1 << ccbits)) ? 4 + ccbits + seg.bitData.length : Infinity;
      if (usedBits <= capacityBits) break;
      if (version >= 40) throw new Error('Text too long to fit in a QR code');
    }

    const capacityBits = getNumDataCodewords(version, ecl) * 8;
    const bb = [];
    appendBits(seg.modeBits, 4, bb);
    appendBits(seg.numChars, byteCharCountBits(version), bb);
    for (const b of seg.bitData) bb.push(b);
    appendBits(0, Math.min(4, capacityBits - bb.length), bb);
    appendBits(0, (8 - bb.length % 8) % 8, bb);
    for (let pad = 0xEC; bb.length < capacityBits; pad ^= 0xEC ^ 0x11) appendBits(pad, 8, bb);

    const dataCodewords = new Array(bb.length >> 3).fill(0);
    bb.forEach((bit, i) => { dataCodewords[i >>> 3] |= bit << (7 - (i & 7)); });

    return new QrCode(version, ecl, dataCodewords, -1);
  }

  function renderCanvas(qr, scale, border, dark, light) {
    const dim = (qr.size + border * 2) * scale;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = dim;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = light;
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = dark;
    for (let y = 0; y < qr.size; y++) {
      for (let x = 0; x < qr.size; x++) {
        if (qr.modules[y][x]) ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
      }
    }
    return canvas;
  }

  return {
    ECC, encodeText, renderCanvas,
    // Exposed for testing / advanced use.
    _internal: { reedSolomonComputeDivisor, reedSolomonComputeRemainder, reedSolomonMultiply, getNumDataCodewords }
  };
})();

// ---------- QR tool ----------
DK.register({
  id: 'qr',
  name: 'QR Code',
  icon: '▩',
  group: 'Generators',
  keywords: 'qr code generator barcode url wifi scan image png',
  sub: 'Generate a QR code for any text or URL, then download it.',
  render(panel) {
    const { el, toast } = DK;
    const input = el('textarea', { class: 'small', placeholder: 'Text, URL, phone, Wi-Fi config…', spellcheck: 'false' });
    input.value = 'https://chrome.google.com/webstore';
    const ecl = el('select', {}, [
      el('option', { value: 'M', text: 'ECC: Medium (default)' }),
      el('option', { value: 'L', text: 'ECC: Low' }),
      el('option', { value: 'Q', text: 'ECC: Quartile' }),
      el('option', { value: 'H', text: 'ECC: High' })
    ]);
    const scale = el('input', { type: 'range', min: '2', max: '12', value: '6', style: 'flex:1' });
    const holder = el('div', { style: 'text-align:center;padding:10px;background:#fff;border-radius:8px;display:inline-block' });
    const wrap = el('div', { style: 'text-align:center' }, [holder]);
    const status = el('div', { class: 'hint' });
    let canvas = null;

    function generate() {
      const text = input.value;
      holder.textContent = '';
      status.textContent = '';
      if (!text) { status.textContent = 'Enter some text.'; return; }
      try {
        const qr = DKQr.encodeText(text, DKQr.ECC[ecl.value]);
        canvas = DKQr.renderCanvas(qr, Number(scale.value), 4, '#000000', '#ffffff');
        canvas.style.maxWidth = '100%';
        holder.appendChild(canvas);
        status.textContent = `Version ${qr.version} · ${qr.size}×${qr.size} modules · ${text.length} chars`;
      } catch (e) {
        status.className = 'status-err';
        status.textContent = e.message;
      }
    }

    function download() {
      if (!canvas) { toast('Generate first'); return; }
      const a = el('a', { href: canvas.toDataURL('image/png'), download: 'qrcode.png' });
      document.body.appendChild(a); a.click(); a.remove();
    }
    async function copyImage() {
      if (!canvas) { toast('Generate first'); return; }
      try {
        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast('QR image copied');
      } catch (e) { toast('Copy failed: ' + e.message); }
    }

    input.addEventListener('input', generate);
    ecl.addEventListener('change', generate);
    scale.addEventListener('input', generate);

    panel.appendChild(input);
    panel.appendChild(el('div', { class: 'row' }, [
      ecl, el('span', { class: 'hint', text: 'Size' }), scale
    ]));
    panel.appendChild(el('div', { class: 'row' }, [
      el('button', { class: 'btn primary', onclick: generate }, '▩ Generate'),
      el('button', { class: 'btn', onclick: download }, 'Download PNG'),
      el('button', { class: 'btn', onclick: copyImage }, 'Copy image')
    ]));
    panel.appendChild(status);
    panel.appendChild(el('div', { style: 'height:8px' }));
    panel.appendChild(wrap);
    generate();
  }
});
