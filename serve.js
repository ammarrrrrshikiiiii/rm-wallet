// ===== RM Wallet – zero-dependency static dev server (Bun) =====
// Usage: `bun serve.js` or `npm start` (via package.json) or `make start`.
import { existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';

const ROOT = resolve(process.cwd());
const PORT = Number(process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

const server = Bun.serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let pathname;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response('Bad request', { status: 400 });
    }
    if (pathname.endsWith('/')) pathname += 'index.html';

    // Resolve within the project root and block path traversal.
    const filePath = resolve(ROOT, '.' + pathname);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) {
      return new Response('Forbidden', { status: 403 });
    }

    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return new Response('Not found', { status: 404 });
    }

    const type = MIME[extname(filePath).toLowerCase()] || 'application/octet-stream';
    return new Response(Bun.file(filePath), {
      headers: {
        'Content-Type': type,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer',
        'Cache-Control': 'no-cache',
      },
    });
  },
});

console.log(`RM Wallet running at http://localhost:${server.port}\nPress Ctrl+C to stop.`);
