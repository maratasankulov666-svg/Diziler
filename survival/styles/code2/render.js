// node render.js stills            -> out/anim_<сцена>.jpg (по 2 кадра на сцену, для проверки)
// node render.js video plan.json out.mp4  -> клипы сцен по плану [[сцена|"card:TEXT", начало, конец], ...]
const { chromium } = require('playwright'); const fs = require('fs'); const { spawn, execFileSync } = require('child_process');
const FPS = 30;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://localhost:8765/anim.html'); await p.waitForFunction('window.READY === true');
  const grab = async (t, u) => Buffer.from((await p.evaluate(([t, u]) => window.frame(t, u), [t, u])).split(',')[1], 'base64');
  if (process.argv[2] === 'stills') {
    for (const [n, d] of [['cinema', 8], ['mall', 7], ['foodcourt', 11], ['escalatorNight', 6]]) {
      await p.evaluate(n => window.setup(n), n);
      for (let i = 0; i < Math.round(d * FPS); i++) { const t = i / FPS; const img = await grab(t, t / d);
        if (i === Math.round(d * FPS * 0.15) || i === Math.round(d * FPS * 0.7)) fs.writeFileSync(`out/anim_${n}_${i < d * FPS * 0.5 ? 'a' : 'b'}.jpg`, img); }
      console.log('ok', n);
    }
  } else {
    const plan = JSON.parse(fs.readFileSync(process.argv[3])); const parts = [];
    for (const [i, [n, a, z]] of plan.entries()) {
      const out = `part${i}.mp4`, d = z - a; parts.push(out);
      if (n.startsWith('card:')) { execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `color=black:s=1280x720:d=${d.toFixed(3)}:r=30`, '-vf', `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${n.slice(5)}':fontsize=80:fontcolor=white:x=(w-tw)/2:y=(h-th)/2`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out]); continue; }
      await p.evaluate(n => window.setup(n), n);
      const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-crf', '19', '-pix_fmt', 'yuv420p', '-r', String(FPS), out]);
      const N = Math.round(d * FPS);
      for (let k = 0; k < N; k++) { const t = k / FPS; if (!ff.stdin.write(await grab(t, t / d))) await new Promise(r => ff.stdin.once('drain', r)); }
      ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok', n, d.toFixed(1), 'с');
    }
    fs.writeFileSync('parts.txt', parts.map(x => `file '${x}'\n`).join(''));
  }
  await b.close();
})();
