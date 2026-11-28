// node render.js out.mp4 [fps] [t0 t1]   |   node render.js --frames t1,t2,... dir   (сервер :8767 в survival/)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
(async () => {
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('page:', m.text()); });
  await p.goto('http://localhost:8767/videos/ep01_blackout/anim.html'); await p.waitForFunction('window.READY === true');
  const info = await p.evaluate(() => window.init());
  if (process.argv[2] === '--frames') { const ts = process.argv[3].split(',').map(Number), dir = process.argv[4]; fs.mkdirSync(dir, { recursive: true });
    for (const t of ts) { const d = await p.evaluate(t => window.shot(t), t); fs.writeFileSync(`${dir}/f${String(t.toFixed(1)).padStart(7, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
    await br.close(); console.log('frames', ts.length); return; }
  const [out, fps = 30, a, b] = process.argv.slice(2), t0 = a ? +a : 0, t1 = b ? +b : info.duration, n = Math.round((t1 - t0) * fps);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'veryfast', out]);
  const st = Date.now();
  for (let i = 0; i < n; i++) { const d = await p.evaluate(t => window.shot(t), t0 + i / fps);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 900 === 0) console.log('frame', i, '/', n, Math.round((Date.now() - st) / 1000), 's'); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
  console.log('done', n, 'frames in', Math.round((Date.now() - st) / 1000), 's ->', out);
})();
