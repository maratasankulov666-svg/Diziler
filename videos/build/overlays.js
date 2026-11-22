// Render transparent 1920x1080 PNG overlays from a JSON spec using HTML/CSS (emoji + Inter font).
// usage: node overlays.js spec.json outdir
// spec: [{id, kind:"bar"|"chip"|"meme"|"stamp"|"center", ...}]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [specPath, outDir] = process.argv.slice(2);
const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
fs.mkdirSync(outDir, { recursive: true });

const CSS = `
html,body{margin:0;width:1920px;height:1080px;background:transparent;font-family:"Inter Display","Inter",Arial,sans-serif;color:#fff;overflow:hidden}
.abs{position:absolute}
.bar{left:0;right:0;bottom:0;height:230px;background:linear-gradient(to top,rgba(5,6,14,.97) 0%,rgba(5,6,14,.92) 52%,rgba(5,6,14,0) 100%)}
.barin{position:absolute;left:70px;right:70px;bottom:44px;display:flex;align-items:center;gap:26px}
.rank{width:96px;height:96px;border-radius:22px;background:linear-gradient(135deg,#ffb547,#ff3d3d);display:flex;align-items:center;justify-content:center;font-weight:900;font-size:62px;box-shadow:0 8px 30px rgba(255,80,40,.45)}
.name{font-weight:900;font-size:56px;letter-spacing:-.01em;line-height:1}
.meta{font-weight:700;font-size:26px;letter-spacing:.18em;color:#ffb547;margin-top:10px}
.brand{margin-left:auto;font-weight:900;font-size:38px}.brand b{color:#ffb547}
.live{display:inline-block;width:14px;height:14px;border-radius:50%;background:#ff3d3d;margin-right:12px;vertical-align:middle;box-shadow:0 0 14px #ff3d3d}
.chip{left:70px;top:70px;padding:20px 34px;border-radius:20px;background:rgba(8,10,24,.82);border-left:10px solid #ffb547;font-weight:800;font-size:44px;box-shadow:0 10px 40px rgba(0,0,0,.45);max-width:1500px}
.meme{left:0;right:0;bottom:250px;text-align:center}
.meme span{display:inline-block;font-weight:900;font-size:78px;line-height:1.08;color:#ffe14d;-webkit-text-stroke:3px #000;paint-order:stroke fill;text-shadow:0 6px 0 #000,0 10px 40px rgba(0,0,0,.6);max-width:1700px;transform:rotate(-2deg)}
.stamp{right:90px;top:80px;transform:rotate(12deg);border:10px solid #ff2d3d;color:#ff2d3d;font-weight:900;font-size:110px;padding:6px 40px;border-radius:18px;letter-spacing:.08em;background:rgba(0,0,0,.25)}
.center{left:0;right:0;top:360px;text-align:center}
.center .big{display:inline-block;font-weight:900;font-size:96px;padding:26px 54px;border-radius:30px;background:rgba(8,10,24,.8);box-shadow:0 20px 60px rgba(0,0,0,.5)}
.center .small{font-weight:700;font-size:44px;margin-top:26px;color:#ffb547;text-shadow:0 4px 20px #000}
`;
function html(o) {
  let b = '';
  if (o.kind === 'bar') b = `<div class="abs bar"><div class="barin">
      ${o.rank ? `<div class="rank">${o.rank}</div>` : `<div class="rank" style="font-size:34px">TOP</div>`}
      <div><div class="name">${o.title}</div><div class="meta">${o.meta || ''}</div></div>
      <div class="brand"><span class="live"></span>Dizi<b>Vizyon</b></div></div></div>`;
  if (o.kind === 'chip') b = `<div class="abs chip">${o.text}</div>`;
  if (o.kind === 'meme') b = `<div class="abs meme"><span>${o.text}</span></div>`;
  if (o.kind === 'stamp') b = `<div class="abs stamp">${o.text}</div>`;
  if (o.kind === 'center') b = `<div class="abs center"><div class="big">${o.text}</div>${o.small ? `<div class="small">${o.small}</div>` : ''}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${b}</body></html>`;
}
(async () => {
  const br = await chromium.launch();
  const pg = await br.newPage({ viewport: { width: 1920, height: 1080 } });
  for (const o of spec) {
    await pg.setContent(html(o), { waitUntil: 'load' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(outDir, o.id + '.png'), omitBackground: true });
  }
  await br.close();
  console.log('overlays', spec.length);
})();
