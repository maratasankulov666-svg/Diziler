// Frame-by-frame render of a card HTML (window.renderFrame(t)) to MP4, same approach as the
// html-3d-video skill's render.py, using the pre-installed Node Playwright.
// usage: node render_card.js card.html out.mp4 [--still t out.jpg] [--fps 30]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const [html, out] = process.argv.slice(2);
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const fps = +arg('--fps', 30);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist',
    '--enable-unsafe-swiftshader', '--force-color-profile=srgb', '--hide-scrollbars', '--disable-lcd-text'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on('pageerror', e => console.log('[page error]', e.message));
  await page.goto('file://' + path.resolve(html), { waitUntil: 'networkidle' });
  await page.waitForFunction('window.READY === true', null, { timeout: 60000 });
  const still = process.argv.indexOf('--still');
  if (still > 0) {
    for (let k = still + 1; k + 1 < process.argv.length && !process.argv[k].startsWith('--'); k += 2) {
      await page.evaluate(t => window.renderFrame(t), +process.argv[k]);
      await page.screenshot({ path: process.argv[k + 1], type: 'jpeg', quality: 75 });
    }
    await browser.close(); return;
  }
  const dur = await page.evaluate('window.DURATION');
  const total = Math.round(dur * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-vcodec', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(fps), out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < total; i++) {
    await page.evaluate(t => window.renderFrame(t), i / fps);
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', out, total, 'frames');
})();
