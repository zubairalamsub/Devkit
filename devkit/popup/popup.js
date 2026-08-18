// DevKit popup core: tool registry, shared helpers, navigation, theme.
// Tool modules (tools/*.js) call DK.register(...) and init.js calls DK.init().

const DK = (() => {
  const IS_EXT = typeof chrome !== 'undefined' && !!(chrome.storage && chrome.storage.local);
  const tools = [];
  const groups = []; // insertion-ordered group names

  // ---------- storage (falls back to localStorage when opened as a plain page) ----------
  function store(key, value) {
    if (IS_EXT) chrome.storage.local.set({ [key]: value });
    else try { localStorage.setItem('devkit.' + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
  function load(key) {
    return new Promise((resolve) => {
      if (IS_EXT) chrome.storage.local.get(key, (r) => resolve(r[key]));
      else {
        try { resolve(JSON.parse(localStorage.getItem('devkit.' + key))); }
        catch (e) { resolve(undefined); }
      }
    });
  }

  // ---------- DOM helpers ----------
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'html') node.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
      else if (v !== undefined && v !== null) node.setAttribute(k, v);
    }
    for (const child of [].concat(children)) {
      if (child === null || child === undefined) continue;
      node.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
    }
    return node;
  }

  let toastTimer = null;
  function toast(msg, ms = 1600) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  async function copy(text, label = 'Copied to clipboard') {
    try {
      await navigator.clipboard.writeText(String(text));
      toast(label);
    } catch (e) {
      toast('Copy failed');
    }
  }

  function copyBtn(getText, label = 'Copy') {
    return el('button', { class: 'btn', onclick: () => copy(typeof getText === 'function' ? getText() : getText) }, label);
  }

  // ---------- active-tab scripting helpers ----------
  async function activeTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  function isScriptableUrl(url) {
    return /^(https?|file):/i.test(url || '');
  }

  // Run a function (or a content-script file) in the active tab.
  // opts: { func, args, files, world }
  async function runInPage(opts) {
    if (!IS_EXT || !chrome.scripting) {
      toast('Open DevKit as an extension to use page tools');
      return null;
    }
    const tab = await activeTab();
    if (!tab || !isScriptableUrl(tab.url)) {
      toast("This tool can't run on the current page (try a normal website)");
      return null;
    }
    try {
      const target = { tabId: tab.id };
      const injection = { target };
      if (opts.files) injection.files = opts.files;
      if (opts.func) { injection.func = opts.func; injection.args = opts.args || []; }
      if (opts.world) injection.world = opts.world;
      const results = await chrome.scripting.executeScript(injection);
      return results && results[0] ? results[0].result : null;
    } catch (e) {
      toast('Could not access this page: ' + (e.message || e));
      return null;
    }
  }

  // ---------- registry ----------
  function register(tool) {
    // tool: { id, name, icon, group, sub, render(panel) }
    tools.push(tool);
    if (!groups.includes(tool.group)) groups.push(tool.group);
  }

  // ---------- UI ----------
  let activeId = null;
  let favGroup = null;
  let favorites = new Set();
  const rendered = new Set();

  function toggleFavorite(id) {
    if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
    store('favorites', [...favorites]);
    document.querySelectorAll(`.nav-item[data-tool="${id}"] .fav-star`).forEach((s) => {
      const on = favorites.has(id);
      s.classList.toggle('on', on);
      s.textContent = on ? '★' : '☆';
      s.title = on ? 'Remove from favorites' : 'Add to favorites';
    });
    renderFavorites();
  }

  function makeNavItem(tool) {
    const on = favorites.has(tool.id);
    const star = el('span', {
      class: 'fav-star' + (on ? ' on' : ''),
      text: on ? '★' : '☆',
      title: on ? 'Remove from favorites' : 'Add to favorites',
      'aria-label': 'Toggle favorite',
      role: 'button',
      onclick: (e) => { e.stopPropagation(); toggleFavorite(tool.id); }
    });
    return el('button', {
      class: 'nav-item' + (tool.id === activeId ? ' active' : ''),
      'data-tool': tool.id,
      onclick: () => activate(tool.id)
    }, [
      el('span', { class: 'nav-name', text: tool.name }),
      star
    ]);
  }

  function renderFavorites() {
    if (!favGroup) return;
    favGroup.querySelectorAll('.nav-item').forEach((n) => n.remove());
    const favTools = tools.filter((t) => favorites.has(t.id));
    favGroup.classList.toggle('hidden', favTools.length === 0);
    for (const tool of favTools) favGroup.appendChild(makeNavItem(tool));
  }

  function activate(id, persist = true) {
    const tool = tools.find((t) => t.id === id) || tools[0];
    if (!tool) return;
    activeId = tool.id;
    document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b.dataset.tool === tool.id));
    document.querySelectorAll('.tool-panel').forEach((p) => p.classList.toggle('active', p.dataset.tool === tool.id));
    if (!rendered.has(tool.id)) {
      rendered.add(tool.id);
      const panel = document.querySelector(`.tool-panel[data-tool="${tool.id}"]`);
      panel.appendChild(el('h1', { class: 'tool-title', text: tool.name }));
      if (tool.sub) panel.appendChild(el('p', { class: 'tool-sub', text: tool.sub }));
      try { tool.render(panel); } catch (e) { panel.appendChild(el('p', { class: 'status-err', text: 'Tool failed to load: ' + e.message })); }
    }
    if (persist) store('lastTool', tool.id);
  }

  function buildNav() {
    const nav = document.getElementById('nav');
    const content = document.getElementById('content');
    favGroup = el('div', { class: 'nav-group hidden', id: 'fav-group' }, [el('div', { class: 'nav-group-title', text: '★ Favorites' })]);
    nav.appendChild(favGroup);
    for (const group of groups) {
      const wrap = el('div', { class: 'nav-group' }, [el('div', { class: 'nav-group-title', text: group })]);
      for (const tool of tools.filter((t) => t.group === group)) {
        wrap.appendChild(makeNavItem(tool));
        content.appendChild(el('section', { class: 'tool-panel', 'data-tool': tool.id }));
      }
      nav.appendChild(wrap);
    }
    renderFavorites();
  }

  function bindSearch() {
    const input = document.getElementById('tool-search');
    let selIndex = -1;
    const visible = () => [...document.querySelectorAll('.nav-item:not(.hidden)')];
    const clearSel = () => document.querySelectorAll('.nav-item.kbd-sel').forEach((n) => n.classList.remove('kbd-sel'));
    function setSel(i) {
      const items = visible();
      clearSel();
      if (!items.length) { selIndex = -1; return; }
      selIndex = (i + items.length) % items.length;
      const node = items[selIndex];
      node.classList.add('kbd-sel');
      node.scrollIntoView({ block: 'nearest' });
    }
    function applyFilter() {
      const q = input.value.trim().toLowerCase();
      document.querySelectorAll('.nav-item').forEach((b) => {
        const tool = tools.find((t) => t.id === b.dataset.tool);
        const hit = !q || tool.name.toLowerCase().includes(q) || (tool.keywords || '').toLowerCase().includes(q);
        b.classList.toggle('hidden', !hit);
      });
      document.querySelectorAll('.nav-group').forEach((g) => {
        g.classList.toggle('hidden', !g.querySelector('.nav-item:not(.hidden)'));
      });
      selIndex = -1;
      clearSel();
      if (q) setSel(0); // pre-highlight the top match while typing
    }
    input.addEventListener('input', applyFilter);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(selIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(selIndex - 1); }
      else if (e.key === 'Enter') {
        e.preventDefault();
        const items = visible();
        const target = items[selIndex] || items[0];
        if (target) { activate(target.dataset.tool); input.value = ''; applyFilter(); }
      } else if (e.key === 'Escape') {
        if (input.value) { input.value = ''; applyFilter(); } else input.blur();
      }
    });
  }

  // ---------- theme ----------
  async function initTheme() {
    const saved = await load('theme');
    applyTheme(saved || 'auto');
    document.getElementById('theme-toggle').addEventListener('click', async () => {
      const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store('theme', next);
    });
  }
  function applyTheme(mode) {
    let dark;
    if (mode === 'auto') dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    else dark = mode === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }

  // ---------- boot ----------
  async function init() {
    favorites = new Set((await load('favorites')) || []);
    buildNav();
    bindSearch();
    await initTheme();
    const last = await load('lastTool');
    activate(last || tools[0].id, false);
    document.getElementById('tool-search').focus();
  }

  return { IS_EXT, register, init, el, toast, copy, copyBtn, store, load, runInPage, activeTab };
})();
