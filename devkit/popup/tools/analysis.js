// Page analysis: SEO audit, performance metrics, storage viewer, tech detector.
// All functions passed to runInPage are serialized into the page — they must be
// self-contained (no closures over popup scope).

// ---------- SEO / meta inspector ----------
DK.register({
  id: 'seo',
  name: 'SEO Inspector',
  icon: '🔎',
  group: 'Page Analysis',
  keywords: 'seo meta title description og twitter canonical h1 alt robots',
  sub: 'Audit meta tags, headings and image alts on the current page.',
  render(panel) {
    const { el, runInPage } = DK;
    const result = el('div');

    function collectSeo() {
      const q = (sel) => document.querySelector(sel);
      const meta = (name) => q(`meta[name="${name}"]`)?.content || q(`meta[property="${name}"]`)?.content || '';
      const imgs = [...document.images];
      return {
        title: document.title,
        description: meta('description'),
        canonical: q('link[rel="canonical"]')?.href || '',
        robots: meta('robots'),
        viewport: meta('viewport'),
        lang: document.documentElement.lang,
        charset: document.characterSet,
        og: {
          title: meta('og:title'), description: meta('og:description'),
          image: meta('og:image'), type: meta('og:type'), url: meta('og:url')
        },
        twitter: { card: meta('twitter:card'), title: meta('twitter:title'), image: meta('twitter:image') },
        h1s: [...document.querySelectorAll('h1')].map((h) => h.textContent.trim().slice(0, 120)),
        imgCount: imgs.length,
        imgsMissingAlt: imgs.filter((i) => !i.alt).length,
        links: document.links.length,
        wordCount: (document.body?.innerText || '').split(/\s+/).filter(Boolean).length
      };
    }

    function lenBadge(len, min, max) {
      if (!len) return el('span', { class: 'badge err', text: 'missing' });
      const ok = len >= min && len <= max;
      return el('span', { class: 'badge ' + (ok ? 'ok' : 'warn'), text: len + ' chars' + (ok ? ' ✓' : ` (aim ${min}–${max})`) });
    }

    async function run() {
      result.textContent = 'Analyzing…';
      const d = await runInPage({ func: collectSeo });
      result.textContent = '';
      if (!d) { result.textContent = 'Could not analyze this page.'; return; }

      const table = el('table', { class: 'kv-table' });
      const row = (k, v, extra) => table.appendChild(el('tr', {}, [
        el('th', { text: k }),
        el('td', {}, [el('span', { class: 'mono', text: v || '—' }), extra ? el('span', { text: ' ' }) : null, extra || null])
      ]));

      row('Title', d.title, lenBadge(d.title.length, 30, 60));
      row('Description', d.description, lenBadge(d.description.length, 70, 160));
      row('Canonical', d.canonical);
      row('Robots', d.robots || '(not set — indexable)');
      row('Viewport', d.viewport, d.viewport ? null : el('span', { class: 'badge err', text: 'missing' }));
      row('Language', d.lang || '', d.lang ? null : el('span', { class: 'badge warn', text: 'html lang missing' }));
      row('Charset', d.charset);
      row('H1 headings', d.h1s.length ? d.h1s.join(' | ') : '', d.h1s.length === 1
        ? el('span', { class: 'badge ok', text: '1 ✓' })
        : el('span', { class: 'badge warn', text: d.h1s.length + ' (aim for exactly 1)' }));
      row('Images', `${d.imgCount} total`, d.imgsMissingAlt
        ? el('span', { class: 'badge warn', text: d.imgsMissingAlt + ' missing alt' })
        : el('span', { class: 'badge ok', text: 'all have alt ✓' }));
      row('Links', String(d.links));
      row('Word count', String(d.wordCount));
      row('OpenGraph', [d.og.title && 'title', d.og.description && 'description', d.og.image && 'image', d.og.type && 'type']
        .filter(Boolean).join(', ') || '', d.og.title ? el('span', { class: 'badge ok', text: 'present' }) : el('span', { class: 'badge warn', text: 'missing' }));
      row('Twitter card', d.twitter.card || '', d.twitter.card ? el('span', { class: 'badge ok', text: 'present' }) : el('span', { class: 'badge warn', text: 'missing' }));

      result.appendChild(table);
    }

    panel.appendChild(el('div', { class: 'row' }, [el('button', { class: 'btn primary', onclick: run }, '🔎 Analyze page')]));
    panel.appendChild(result);
  }
});

// ---------- Performance ----------
DK.register({
  id: 'perf',
  name: 'Performance',
  icon: '⚡',
  group: 'Page Analysis',
  keywords: 'performance web vitals lcp cls fcp ttfb load timing resources',
  sub: 'Load timings, Core Web Vitals and resource breakdown for the current page.',
  render(panel) {
    const { el, runInPage } = DK;
    const result = el('div');

    function collectPerf() {
      return new Promise((resolve) => {
        const nav = performance.getEntriesByType('navigation')[0];
        const paints = {};
        for (const p of performance.getEntriesByType('paint')) paints[p.name] = p.startTime;

        let lcp = null, cls = 0;
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length) lcp = entries[entries.length - 1].startTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver((list) => {
            for (const e of list.getEntries()) if (!e.hadRecentInput) cls += e.value;
          }).observe({ type: 'layout-shift', buffered: true });
        } catch (e) { /* observer types unsupported */ }

        setTimeout(() => {
          const res = performance.getEntriesByType('resource');
          const byType = {};
          let totalBytes = 0;
          for (const r of res) {
            const t = r.initiatorType || 'other';
            byType[t] = byType[t] || { count: 0, bytes: 0 };
            byType[t].count++;
            byType[t].bytes += r.transferSize || 0;
            totalBytes += r.transferSize || 0;
          }
          resolve({
            ttfb: nav ? nav.responseStart - nav.requestStart : null,
            domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.startTime : null,
            load: nav ? nav.loadEventEnd - nav.startTime : null,
            transferSize: nav ? nav.transferSize : null,
            protocol: nav ? nav.nextHopProtocol : '',
            fcp: paints['first-contentful-paint'] ?? null,
            lcp, cls: Math.round(cls * 1000) / 1000,
            resourceCount: res.length, totalBytes, byType
          });
        }, 350);
      });
    }

    const fmtMs = (v) => (v === null || v === undefined) ? '—' : Math.round(v).toLocaleString() + ' ms';
    const fmtKb = (b) => (b / 1024).toFixed(1) + ' KB';

    function vitalBadge(value, good, poor, unit) {
      if (value === null || value === undefined) return el('span', { class: 'badge', text: 'n/a' });
      const cls = value <= good ? 'ok' : value <= poor ? 'warn' : 'err';
      const label = value <= good ? 'good' : value <= poor ? 'needs work' : 'poor';
      return el('span', { class: 'badge ' + cls, text: label });
    }

    async function run() {
      result.textContent = 'Measuring…';
      const d = await runInPage({ func: collectPerf });
      result.textContent = '';
      if (!d) { result.textContent = 'Could not measure this page.'; return; }

      const table = el('table', { class: 'kv-table' });
      const row = (k, v, badge) => table.appendChild(el('tr', {}, [
        el('th', { text: k }), el('td', { class: 'mono' }, [v, badge ? ' ' : null, badge || null])
      ]));

      row('TTFB (server response)', fmtMs(d.ttfb), vitalBadge(d.ttfb, 800, 1800));
      row('First Contentful Paint', fmtMs(d.fcp), vitalBadge(d.fcp, 1800, 3000));
      row('Largest Contentful Paint', fmtMs(d.lcp), vitalBadge(d.lcp, 2500, 4000));
      row('Cumulative Layout Shift', d.cls === null ? '—' : String(d.cls), vitalBadge(d.cls, 0.1, 0.25));
      row('DOMContentLoaded', fmtMs(d.domContentLoaded));
      row('Full load', fmtMs(d.load));
      row('Protocol', d.protocol || '—');
      row('Document transfer', d.transferSize ? fmtKb(d.transferSize) : '—');
      row('Resources', `${d.resourceCount} requests, ${fmtKb(d.totalBytes)} transferred`);
      result.appendChild(table);

      const types = Object.entries(d.byType).sort((a, b) => b[1].bytes - a[1].bytes);
      if (types.length) {
        result.appendChild(el('h3', { text: 'Resources by type', style: 'margin:12px 0 4px;font-size:13px' }));
        const t2 = el('table', { class: 'kv-table' });
        t2.appendChild(el('tr', {}, [el('th', { text: 'Type' }), el('th', { text: 'Requests' }), el('th', { text: 'Transferred' })]));
        for (const [type, s] of types) {
          t2.appendChild(el('tr', {}, [el('td', { text: type }), el('td', { text: String(s.count) }), el('td', { class: 'mono', text: fmtKb(s.bytes) })]));
        }
        result.appendChild(t2);
        result.appendChild(el('p', { class: 'hint', text: 'Sizes use transferSize and may read 0 KB for cached or cross-origin resources without Timing-Allow-Origin.' }));
      }
    }

    panel.appendChild(el('div', { class: 'row' }, [el('button', { class: 'btn primary', onclick: run }, '⚡ Measure')]));
    panel.appendChild(result);
  }
});

// ---------- Storage viewer ----------
DK.register({
  id: 'storage',
  name: 'Storage Viewer',
  icon: '🗄',
  group: 'Page Analysis',
  keywords: 'localstorage sessionstorage cookies storage keys clear delete',
  sub: 'Inspect and clear localStorage, sessionStorage and cookies for the current tab.',
  render(panel) {
    const { el, toast, runInPage } = DK;
    const result = el('div');

    function readStorage() {
      const dump = (s) => {
        const out = [];
        for (let i = 0; i < s.length; i++) {
          const k = s.key(i);
          out.push([k, String(s.getItem(k))]);
        }
        return out;
      };
      let local = [], session = [];
      try { local = dump(localStorage); } catch (e) { /* blocked */ }
      try { session = dump(sessionStorage); } catch (e) { /* blocked */ }
      return {
        local, session,
        cookies: document.cookie ? document.cookie.split('; ').map((c) => {
          const eq = c.indexOf('=');
          return [c.slice(0, eq), c.slice(eq + 1)];
        }) : []
      };
    }

    function mutateStorage(area, key) {
      // key === null means clear the whole area
      if (area === 'cookie') {
        const clear = (name) => {
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + location.hostname;
        };
        if (key !== null) clear(key);
        else for (const c of document.cookie.split('; ')) { if (c) clear(c.slice(0, c.indexOf('='))); }
        return true;
      }
      const s = area === 'local' ? localStorage : sessionStorage;
      if (key !== null) s.removeItem(key); else s.clear();
      return true;
    }

    async function remove(area, key) {
      await runInPage({ func: mutateStorage, args: [area, key] });
      toast(key === null ? 'Cleared' : 'Deleted');
      run();
    }

    function section(title, area, entries) {
      const wrap = el('div');
      wrap.appendChild(el('div', { class: 'row', style: 'margin-top:12px' }, [
        el('h3', { text: `${title} (${entries.length})`, style: 'margin:0;font-size:13px', class: 'grow' }),
        entries.length ? el('button', { class: 'btn danger', onclick: () => remove(area, null) }, 'Clear all') : null
      ]));
      if (!entries.length) { wrap.appendChild(el('p', { class: 'hint', text: 'Empty.' })); return wrap; }
      const table = el('table', { class: 'kv-table' });
      for (const [k, v] of entries) {
        table.appendChild(el('tr', {}, [
          el('th', { class: 'mono', text: k }),
          el('td', { class: 'mono', text: v.length > 300 ? v.slice(0, 300) + '…' : v, style: 'cursor:pointer', title: 'Click to copy full value', onclick: () => DK.copy(v) }),
          el('td', {}, [el('button', { class: 'btn icon danger', title: 'Delete', onclick: () => remove(area, k) }, '✕')])
        ]));
      }
      wrap.appendChild(table);
      return wrap;
    }

    async function run() {
      const d = await runInPage({ func: readStorage });
      result.textContent = '';
      if (!d) { result.textContent = 'Could not read storage on this page.'; return; }
      result.appendChild(section('localStorage', 'local', d.local));
      result.appendChild(section('sessionStorage', 'session', d.session));
      result.appendChild(section('Cookies (JS-visible)', 'cookie', d.cookies));
      result.appendChild(el('p', { class: 'hint', text: 'HttpOnly cookies are not visible to JavaScript and are not listed.' }));
    }

    panel.appendChild(el('div', { class: 'row' }, [el('button', { class: 'btn primary', onclick: run }, '🗄 Read storage')]));
    panel.appendChild(result);
  }
});

// ---------- Tech detector ----------
DK.register({
  id: 'tech',
  name: 'Tech Detector',
  icon: '🧬',
  group: 'Page Analysis',
  keywords: 'framework detect react vue angular next jquery wordpress tailwind stack',
  sub: 'Heuristic detection of frameworks and libraries used by the current page.',
  render(panel) {
    const { el, runInPage } = DK;
    const result = el('div');

    // Runs in the page's MAIN world so page globals (window.React etc.) are visible.
    function detectTech() {
      const found = [];
      const add = (name, detail) => found.push([name, detail || '']);
      const w = window, d = document;
      const has = (sel) => !!d.querySelector(sel);

      if (w.React || has('[data-reactroot]') || Object.keys(w).some((k) => k.startsWith('__REACT'))) add('React', w.React?.version);
      if (has('#__next') || w.__NEXT_DATA__) add('Next.js');
      if (w.Vue || has('[data-v-app]') || w.__VUE__) add('Vue.js', w.Vue?.version);
      if (w.__NUXT__ || has('#__nuxt')) add('Nuxt');
      if (w.ng || has('[ng-version]')) add('Angular', d.querySelector('[ng-version]')?.getAttribute('ng-version'));
      if (w.Svelte || has('[class*="svelte-"]')) add('Svelte');
      if (w.jQuery) add('jQuery', w.jQuery.fn?.jquery);
      if (w.angular) add('AngularJS', w.angular.version?.full);
      if (w.Shopify) add('Shopify');
      if (w.wp || has('meta[name="generator"][content*="WordPress"]') || has('link[href*="wp-content"]')) add('WordPress');
      if (has('meta[name="generator"][content*="Drupal"]')) add('Drupal');
      if (has('meta[name="generator"][content*="Joomla"]')) add('Joomla');
      if (w.ga || w.gtag || w.dataLayer) add('Google Analytics / Tag Manager');
      if (w.fbq) add('Meta Pixel');
      if (w.Stripe) add('Stripe.js');
      if (w.bootstrap || has('link[href*="bootstrap"]')) add('Bootstrap');
      if (has('[class*="tw-"], .container [class~="flex"][class~="items-center"]') ||
          [...d.styleSheets].some((s) => { try { return s.href && s.href.includes('tailwind'); } catch (e) { return false; } })) add('Tailwind CSS (heuristic)');
      if (has('script[src*="cdn.jsdelivr"], script[src*="cdnjs"], script[src*="unpkg"]')) add('Public CDN scripts');
      if (w.__SVELTEKIT__) add('SvelteKit');
      if (w.Alpine) add('Alpine.js', w.Alpine.version);
      if (w.htmx) add('htmx', w.htmx.version);

      const gen = d.querySelector('meta[name="generator"]')?.content;
      if (gen) add('Generator meta', gen);
      return found;
    }

    async function run() {
      result.textContent = 'Detecting…';
      const found = await runInPage({ func: detectTech, world: 'MAIN' });
      result.textContent = '';
      if (!found) { result.textContent = 'Could not scan this page.'; return; }
      if (!found.length) {
        result.appendChild(el('p', { class: 'hint', text: 'Nothing recognized — the site may be plain HTML or heavily bundled.' }));
        return;
      }
      const table = el('table', { class: 'kv-table' });
      for (const [name, detail] of found) {
        table.appendChild(el('tr', {}, [
          el('th', { text: name }),
          el('td', { class: 'mono', text: detail || '✓' })
        ]));
      }
      result.appendChild(table);
      result.appendChild(el('p', { class: 'hint', text: 'Detection is heuristic — bundlers can hide frameworks and cause misses.' }));
    }

    panel.appendChild(el('div', { class: 'row' }, [el('button', { class: 'btn primary', onclick: run }, '🧬 Detect')]));
    panel.appendChild(result);
  }
});
