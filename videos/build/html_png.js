// Render HTML snippets to transparent PNGs. usage: node html_png.js spec.json outdir
// spec: [{id, w, h, html}]  (html = full document)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [specPath, outDir] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const br = await chromium.launch();
  for (const o of spec) {
    const pg = await br.newPage({ viewport: { width: o.w, height: o.h } });
    await pg.setContent(o.html, { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(outDir, o.id + '.png'), omitBackground: true });
    await pg.close();
  }
  await br.close();
})();
