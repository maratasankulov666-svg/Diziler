// node shot.js "thumb.html?v=a" out.png  (сервер: python3 -m http.server 8768 в styles/thumb)
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('ERR', e.message)); const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i += 2) { await p.goto('http://localhost:8768/' + a[i]); await p.waitForFunction('window.READY === true', null, { timeout: 60000 }); await p.screenshot({ path: a[i + 1] }); console.log('ok', a[i + 1]); }
  await b.close(); })();
