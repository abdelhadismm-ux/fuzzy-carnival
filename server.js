const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const productsJs = path.join(root, 'data', 'products.js');
const PORT = process.env.PORT || 8080;

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
};

function extractArray(src, marker) {
  const mi = src.indexOf(marker);
  if (mi < 0) return null;
  const start = src.indexOf('[', mi);
  if (start < 0) return null;
  let depth = 0;
  let i = start;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) break;
    }
  }
  if (i >= src.length) return null;
  return { start, end: i + 1, literal: src.slice(start, i + 1) };
}

function readProducts() {
  if (!fs.existsSync(productsJs)) return [];
  const src = fs.readFileSync(productsJs, 'utf8');
  const block = extractArray(src, 'var products = [');
  if (!block) return [];
  try { return new Function('IMG', 'return (' + block.literal + ');')('assets/images/products/'); }
  catch (e) { return []; }
}

function writeProducts(list) {
  const src = fs.readFileSync(productsJs, 'utf8');
  const block = extractArray(src, 'var products = [');
  if (!block) throw new Error('products array not found');
  const json = JSON.stringify(list, null, 4);
  const out = src.slice(0, block.start) + json + src.slice(block.end);
  fs.writeFileSync(productsJs, out, 'utf8');
}

function readBody(req, cb) {
  let data = '';
  req.on('data', (c) => { data += c; if (data.length > 2e6) req.destroy(); });
  req.on('end', () => cb(data));
  req.on('error', () => cb(null));
}

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];

  if (url === '/api/products' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    return res.end(JSON.stringify(readProducts()));
  }

  if (url === '/api/products' && req.method === 'POST') {
    return readBody(req, (body) => {
      let list;
      try { list = JSON.parse(body); } catch (e) { list = null; }
      if (!Array.isArray(list) || list.length > 2000 ||
          list.some((p) => !p || typeof p.id !== 'string' || typeof p.name !== 'string')) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify({ error: 'Invalid product list' }));
      }
      try {
        writeProducts(list);
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: true, count: list.length }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: String(e && e.message) }));
      }
    });
  }

  let f = url.replace(/\\/g, '/');
  if (f === '/') f = '/index.html';
  const p = path.normalize(path.join(root, decodeURIComponent(f)));
  if (!p.startsWith(root)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(p, (e, d) => {
    if (e) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(p).toLowerCase()] || 'application/octet-stream' });
    res.end(d);
  });
}).listen(PORT, () => {
  console.log('Baladis.com store running on port ' + PORT);
});