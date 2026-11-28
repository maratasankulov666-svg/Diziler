// node render.js out/a.svg out/b.svg ...  -> рядом .png 1280x720
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  for (const f of process.argv.slice(2)) {
    await p.goto('file://' + path.resolve(f));
    await p.screenshot({ path: f.replace(/\.svg$/, '.png') });
  }
  await b.close();
})();
