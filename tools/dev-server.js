// Minimal static server for previewing the DevKit popup during development.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = 'E:/Personal/ChromeExtentions/devkit';
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.json': 'application/json' };

http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  let file = path.join(ROOT, urlPath === '/' ? 'popup/popup.html' : urlPath);
  if (!file.startsWith(path.resolve(ROOT))) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found: ' + urlPath); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8123, () => console.log('devkit preview on http://localhost:8123'));
