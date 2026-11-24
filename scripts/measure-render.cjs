#!/usr/bin/env node
/*
 * Mesure le rendu réel d'une page, sans Playwright : un serveur statique sur
 * `out/`, Edge en mode headless, et le protocole DevTools (WebSocket natif).
 *
 * Pourquoi : une capture d'écran seule ne prouve rien sur la géométrie.
 * Ici on mesure `scrollWidth`, les rectangles des éléments et la liste des
 * éléments qui dépassent le viewport.
 *
 * Prérequis : `npm run build:mobile` (le dossier `out/` doit exister).
 *
 * Usage :
 *   node scripts/measure-render.cjs [largeur] [hauteur] [chemin.png]
 *   node scripts/measure-render.cjs 360 720 shots/mobile.png
 *
 * Variables d'environnement :
 *   EDGE_PATH   chemin de msedge.exe (détecté automatiquement sinon)
 *   PAGE_PATH   chemin demandé au serveur (défaut : /)
 *   PAGE_COOKIE cookie posé avant navigation, au format `nom=valeur`
 *               (sert à prouver la mémorisation du choix de langue)
 */
'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const width = Number(process.argv[2] ?? 360);
const height = Number(process.argv[3] ?? 720);
const shotPath = process.argv[4] ?? null;
const pagePath = process.env.PAGE_PATH ?? '/';

const ROOT = path.resolve(__dirname, '..', 'out');
if (!fs.existsSync(ROOT)) {
  console.error(`Dossier introuvable : ${ROOT}\nLancer d'abord : npm run build:mobile`);
  process.exit(1);
}

const CANDIDATES = [
  process.env.EDGE_PATH,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/microsoft-edge',
  '/usr/bin/google-chrome',
].filter(Boolean);

const EDGE = CANDIDATES.find((p) => fs.existsSync(p));
if (!EDGE) {
  console.error('Aucun navigateur Chromium trouvé. Définir EDGE_PATH.');
  process.exit(1);
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let file = path.join(ROOT, urlPath);
  if (urlPath.endsWith('/')) file = path.join(file, 'index.html');
  if (!fs.existsSync(file) && fs.existsSync(`${file}.html`)) file = `${file}.html`;
  if (!fs.existsSync(file) || !file.startsWith(ROOT)) {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<h1>404</h1>');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const getJson = (p) =>
  new Promise((resolve, reject) => {
    http
      .get({ host: '127.0.0.1', port: PORT, path: p }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on('error', reject);
  });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const PORT = 9400 + Math.floor(Math.random() * 200);
const PROFILE = path.join(process.env.TEMP ?? '/tmp', `cultura-measure-${PORT}`);

const EXPRESSION = `(() => {
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.x),
      right: Math.round(r.right),
      width: Math.round(r.width),
      height: Math.round(r.height),
    };
  };
  const style = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    return {
      color: cs.color,
      backgroundColor: cs.backgroundColor,
      fontFamily: cs.fontFamily.split(',')[0].trim(),
      fontSize: cs.fontSize,
      lineHeight: cs.lineHeight,
    };
  };
  const headings = [...document.querySelectorAll('h1, h2, h3')].map((el) => ({
    tag: el.tagName,
    text: el.textContent.trim().slice(0, 60),
  }));
  return {
    viewport: { width: window.innerWidth, height: window.innerHeight },
    // URL réelle après chargement : prouve une éventuelle redirection.
    url: location.href,
    scrollWidth: document.documentElement.scrollWidth,
    lang: document.documentElement.lang,
    title: document.title,
    headings,
    main: box(document.querySelector('main')),
    h1: box(document.querySelector('h1')),
    paragraphStyle: style(document.querySelector('main p')),
    // Éléments qui dépassent le viewport : un débordement horizontal est un bug.
    overflowing: [...document.querySelectorAll('body *')]
      .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 0.5)
      .slice(0, 10)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: String(el.className ?? '').slice(0, 60),
        right: Math.round(el.getBoundingClientRect().right),
      })),
  };
})()`;

(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}${pagePath}`;

  const edge = spawn(EDGE, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--user-data-dir=${PROFILE}`,
    `--remote-debugging-port=${PORT}`,
    'about:blank',
  ]);
  edge.on('error', (error) => {
    console.error(`Impossible de lancer le navigateur : ${error.message}`);
    process.exit(1);
  });

  let version = null;
  for (let i = 0; i < 80 && !version; i++) {
    await sleep(200);
    try {
      version = await getJson('/json/version');
    } catch {
      /* le navigateur démarre encore */
    }
  }
  if (!version) {
    console.error('Le protocole DevTools ne répond pas.');
    edge.kill();
    process.exit(1);
  }

  const targets = await getJson('/json/list');
  const page = targets.find((t) => t.type === 'page');
  if (!page) {
    console.error('Aucune cible de page.');
    edge.kill();
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  const pending = new Map();
  let seq = 0;
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++seq;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  ws.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    const entry = message.id !== undefined ? pending.get(message.id) : undefined;
    if (!entry) return;
    pending.delete(message.id);
    if (message.error) entry.reject(new Error(JSON.stringify(message.error)));
    else entry.resolve(message.result);
  });

  await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));

  await send('Page.enable');
  await send('Runtime.enable');

  // Cookie posé avant la navigation : prouve la priorité du choix mémorisé.
  const pageCookie = process.env.PAGE_COOKIE;
  if (pageCookie) {
    const separator = pageCookie.indexOf('=');
    await send('Network.enable');
    await send('Network.setCookie', {
      name: pageCookie.slice(0, separator),
      value: pageCookie.slice(separator + 1),
      url: `http://127.0.0.1:${port}/`,
      path: '/',
    });
  }

  // Viewport forcé : `--window-size` ne donne pas la même largeur à l'écran
  // et au layout, ce qui produit de faux débordements.
  await send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 500,
  });
  await send('Page.navigate', { url });
  await sleep(1500);

  const evaluated = await send('Runtime.evaluate', { expression: EXPRESSION, returnByValue: true });
  const report = { requestedUrl: url, requested: { width, height }, ...evaluated.result.value };
  console.log(JSON.stringify(report, null, 2));

  if (shotPath) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    fs.mkdirSync(path.dirname(path.resolve(shotPath)), { recursive: true });
    fs.writeFileSync(shotPath, Buffer.from(shot.data, 'base64'));
    console.error(`Capture : ${shotPath}`);
  }

  ws.close();
  edge.kill();
  server.close();
  const failed = report.scrollWidth > width || report.overflowing.length > 0;
  process.exit(failed ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
