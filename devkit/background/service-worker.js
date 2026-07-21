// DevKit background service worker.
// Everything in DevKit runs client-side from the popup; the worker only
// seeds default settings on install.

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.local.set({
      theme: 'auto',
      lastTool: 'json'
    });
  }
});
