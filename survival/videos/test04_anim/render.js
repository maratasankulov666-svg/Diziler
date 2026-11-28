// node render.js out.mp4 [fps] [t_from t_to]  — нужен сервер: python3 -m http.server 8767 в survival/
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
(async () => {
  const [out, fps = 30, a, b] = process.argv.slice(2);
  const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => console.log('page:', m.text()));
  await p.goto('http://localhost:8767/videos/test04_anim/anim.html'); await p.waitForFunction('window.READY === true');
  const info = await p.evaluate(() => window.init()); fs.writeFileSync('sfx.json', JSON.stringify(info));
  if (out.endsWith('.jpg')) { for (let i = 1; i < process.argv.length - 3; i++) {} }
  const t0 = a ? +a : 0, t1 = b ? +b : info.duration, n = Math.round((t1 - t0) * fps);
  const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', String(fps), '-i', '-', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', out]);
  const st = Date.now();
  for (let i = 0; i < n; i++) { const d = await p.evaluate(t => window.shot(t), t0 + i / fps);
    if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await br.close();
  console.log('frames', n, 'in', Math.round((Date.now() - st) / 1000), 's ->', out, 'duration', info.duration.toFixed(2));
})();
