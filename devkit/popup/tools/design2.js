// CSS builders: box-shadow and gradient generators with live preview.

// ---------- Box shadow ----------
DK.register({
  id: 'shadow',
  name: 'Box Shadow',
  icon: '▨',
  group: 'Design',
  keywords: 'box shadow css generator drop offset blur spread inset',
  sub: 'Design a CSS box-shadow with a live preview.',
  render(panel) {
    const { el } = DK;
    const controls = {};
    function slider(key, label, min, max, val, unit) {
      const input = el('input', { type: 'range', min: String(min), max: String(max), value: String(val), style: 'flex:1' });
      const out = el('span', { class: 'mono', text: val + (unit || '') });
      input.addEventListener('input', () => { out.textContent = input.value + (unit || ''); update(); });
      controls[key] = input;
      return el('div', { class: 'row tight' }, [el('span', { class: 'hint', style: 'width:70px', text: label }), input, out]);
    }

    const color = el('input', { type: 'color', value: '#1c2330' });
    const opacity = el('input', { type: 'range', min: '0', max: '100', value: '30', style: 'flex:1' });
    const inset = el('input', { type: 'checkbox', id: 'sh-inset' });
    const preview = el('div', { style: 'height:120px;border-radius:10px;background:var(--bg-panel);margin:12px 0;display:flex;align-items:center;justify-content:center' });
    const swatch = el('div', { style: 'width:120px;height:60px;border-radius:8px;background:var(--accent)' });
    preview.appendChild(swatch);
    const cssOut = el('div', { class: 'out' });

    function hexToRgba(hex, a) {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
    }
    function update() {
      const a = (Number(opacity.value) / 100).toFixed(2);
      const css = `${inset.checked ? 'inset ' : ''}${controls.x.value}px ${controls.y.value}px ${controls.blur.value}px ${controls.spread.value}px ${hexToRgba(color.value, a)}`;
      swatch.style.boxShadow = css;
      cssOut.textContent = 'box-shadow: ' + css + ';';
    }

    panel.appendChild(slider('x', 'Offset X', -50, 50, 0, 'px'));
    panel.appendChild(slider('y', 'Offset Y', -50, 50, 8, 'px'));
    panel.appendChild(slider('blur', 'Blur', 0, 100, 24, 'px'));
    panel.appendChild(slider('spread', 'Spread', -50, 50, -4, 'px'));
    panel.appendChild(el('div', { class: 'row tight' }, [el('span', { class: 'hint', style: 'width:70px', text: 'Color' }), color, el('span', { class: 'hint', text: 'Opacity' }), opacity]));
    panel.appendChild(el('div', { class: 'row tight' }, [el('label', { class: 'hint', for: 'sh-inset' }, [inset, ' Inset'])]));
    panel.appendChild(preview);
    panel.appendChild(el('div', { class: 'row' }, [el('span', { class: 'hint grow', text: 'CSS' }), DK.copyBtn(() => cssOut.textContent, 'Copy')]));
    panel.appendChild(cssOut);
    opacity.addEventListener('input', update);
    color.addEventListener('input', update);
    inset.addEventListener('change', update);
    update();
  }
});

// ---------- Gradient ----------
DK.register({
  id: 'gradient',
  name: 'Gradient',
  icon: '◧',
  group: 'Design',
  keywords: 'gradient css linear radial background color generator',
  sub: 'Build a CSS gradient with a live preview.',
  render(panel) {
    const { el } = DK;
    const type = el('select', {}, [el('option', { value: 'linear', text: 'Linear' }), el('option', { value: 'radial', text: 'Radial' })]);
    const angle = el('input', { type: 'range', min: '0', max: '360', value: '135', style: 'flex:1' });
    const angleLabel = el('span', { class: 'mono', text: '135deg' });
    const c1 = el('input', { type: 'color', value: '#3b74f2' });
    const c2 = el('input', { type: 'color', value: '#7a3bf2' });
    const c3 = el('input', { type: 'color', value: '#ffffff' });
    const useC3 = el('input', { type: 'checkbox', id: 'gr-c3' });
    const preview = el('div', { style: 'height:130px;border-radius:10px;margin:12px 0;border:1px solid var(--border)' });
    const cssOut = el('div', { class: 'out' });

    function update() {
      angleLabel.textContent = angle.value + 'deg';
      const stops = [c1.value, c2.value].concat(useC3.checked ? [c3.value] : []).join(', ');
      const css = type.value === 'linear'
        ? `linear-gradient(${angle.value}deg, ${stops})`
        : `radial-gradient(circle, ${stops})`;
      preview.style.background = css;
      cssOut.textContent = 'background: ' + css + ';';
    }

    panel.appendChild(el('div', { class: 'row' }, [type, el('span', { class: 'hint', text: 'Angle' }), angle, angleLabel]));
    panel.appendChild(el('div', { class: 'row' }, [
      el('span', { class: 'hint', text: 'Colors' }), c1, c2, c3,
      el('label', { class: 'hint', for: 'gr-c3' }, [useC3, ' 3rd stop'])
    ]));
    panel.appendChild(preview);
    panel.appendChild(el('div', { class: 'row' }, [el('span', { class: 'hint grow', text: 'CSS' }), DK.copyBtn(() => cssOut.textContent, 'Copy')]));
    panel.appendChild(cssOut);
    for (const n of [type, angle, c1, c2, c3]) n.addEventListener('input', update);
    useC3.addEventListener('change', update);
    update();
  }
});
