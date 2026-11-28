// Тест 04: три сцены (вход → парковка → проход с банками), анимация привязана к словам озвучки.
import { drawStick, propBox } from '../../styles/stick/stickman.js';
import { drawAisle, drawEntrance, drawParking, AISLE_JARS } from '../../styles/stick/bgai.js';
import { keys, smooth, clamp, lerp, blink, walk, hop, simulate, camera } from '../../styles/stick/anim.js';

const W = 1280, H = 720, PAD = 0.5;           // озвучка начинается через 0.5 с
let words, BG = {}, jar, jarSim, grain = [], cuts;
const T = (w, n = 0) => { const f = words.filter(x => x.w === w); return f[n].s + PAD; };
const off = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };

export function setup(ws) {
  words = ws;
  for (const [k, fn] of [['entrance', drawEntrance], ['parking', drawParking], ['aisle', drawAisle]]) { BG[k] = off(); fn(BG[k].getContext('2d')); }
  // банка, которая упадёт: правый стеллаж, 3-я полка снизу, ближайшая к z≈3
  jar = AISLE_JARS.filter(j => j.side > 0 && j.li === 2 && !j.pale).sort((a, b) => Math.abs(a.z - 3) - Math.abs(b.z - 3))[0];
  const Wf = jar.h * 0.62, floor = 360 + 600 * 1.45 / 3.0;
  jarSim = simulate({ x: jar.x - Wf * 0.35, y: jar.y + jar.h / 2, vx: -150, vy: -40, a: 0, w: -4.2, hw: Wf / 2, hh: jar.h / 2, floor, T: 5 });
  jar.Wf = Wf; jar.floor = floor;
  for (let i = 0; i < 4; i++) { const g = off(), c = g.getContext('2d'), d = c.createImageData(W, H);
    for (let p = 0; p < d.data.length; p += 4) { const v = Math.random() * 255; d.data[p] = d.data[p + 1] = d.data[p + 2] = v; d.data[p + 3] = 14; }
    c.putImageData(d, 0, 0); grain.push(g); }
  cuts = [0, T('outside') - 0.2, T('day') - 0.2, T('shelf') + 3.2];
  const slip = T('slips') - 0.05, hits = jarSim.hits.map(h => ({ t: slip + 0.3 + h.t, v: h.v }));
  return { duration: cuts[3], sfx: [{ kind: 'door', t: T('push') + 0.08 }, { kind: 'door', t: T('push') + 0.68 }, ...hits.map(h => ({ kind: 'jar', t: h.t, v: h.v }))] };
}

// ---------- сцена 1: вход, свет гаснет, двери заперты
function sEntrance(c, t) {
  const R = 52, Y = 652, tw0 = T('walk') - 0.85, tw1 = T('push') - 0.12;
  c.save(); camera(c, keys(t, [[0, 1.0], [cuts[1], 1.07]], x => x), 640, 430);
  // двери дрожат от толчков
  let dx = 0; for (const p of [T('push') + 0.08, T('push') + 0.68]) { const u = t - p; if (u > 0) dx += 3.2 * Math.sin(u * 46) * Math.exp(-u * 7); }
  c.drawImage(BG.entrance, 0, 0);
  if (dx) c.drawImage(BG.entrance, 462, 196, 358, 414, 462 + dx, 196, 358, 414);
  const w = walk(t, { x0: 330, x1: 640, t0: tw0, t1: tw1, R, Y });
  const atDoor = t >= tw1, faceAgain = t >= T('they');
  if (atDoor && !faceAgain) {   // спиной к нам, руки на стекле, толчки
    let push = 0; for (const p of [T('push'), T('push') + 0.6]) { const u = (t - p) / 0.35; if (u > 0 && u < 1) push = Math.max(push, Math.sin(Math.PI * u)); }
    const rise = smooth((t - tw1) / 0.25);
    drawStick(c, w.X, Y - push * 4, R * (1 - push * 0.035), { back: true, groundDy: push * 4,
      armL: [lerp(0.2, -2.55, rise), lerp(0.1, 0.35, rise)], armR: [lerp(-0.2, 2.55, rise), lerp(-0.1, -0.35, rise)] });
  } else {
    const look = t < tw0 ? keys(t, [[T('lights') - 0.3, [0, 0]], [T('lights'), [-1, -7]], [T('walk') - 1.1, [-1, -7]], [tw0, [5, 0]]]) : faceAgain ? keys(t, [[T('they'), [0, -2]], [T('move') + 0.5, [-4, 1]]]) : [5, 0];
    const mood = faceAgain ? 'worried' : t > T('lights') ? 'worried' : 'neutral';
    const p = faceAgain ? { X: w.X, Y, armL: keys(t, [[T('they'), [-0.5, 0.2]], [T('they') + 0.5, [-0.12, 0.08]]]), armR: keys(t, [[T('they'), [0.5, -0.2]], [T('they') + 0.5, [0.12, -0.08]]]) } : w;
    drawStick(c, p.X, p.Y, R, { mood, look, blink: blink(t, 3), legL: w.legL, legR: w.legR, groundDy: p.groundDy || 0, armL: p.armL, armR: p.armR });
  }
  // свет гаснет: два мигания, потом полумрак
  const tl = T('dim'), fl = (t > tl - 0.3 && t < tl - 0.2) || (t > tl - 0.05 && t < tl + 0.05) ? 0.35 : 0;
  c.restore();
  c.fillStyle = `rgba(8,10,28,${Math.max(fl, 0.34 * smooth((t - tl) / 0.6))})`; c.fillRect(0, 0, W, H);
}

// ---------- сцена 2: пустая парковка, ветер несёт пакет, фонарь мигает
function sParking(c, t) {
  const t0 = cuts[1], u = t - t0;
  c.save(); camera(c, lerp(1.0, 1.07, u / (cuts[2] - t0)), 650, 330); c.drawImage(BG.parking, 0, 0);
  // пакет: дрейф по ветру, подскоки по асфальту, вращение
  const bx = 1180 - u * 120 - 30 * Math.sin(u * 1.3), hb = Math.abs(Math.sin(u * 2.1)) * 26 * (0.6 + 0.4 * Math.sin(u * 0.7)), by = 612 - hb;
  c.fillStyle = 'rgba(30,20,40,0.25)'; c.beginPath(); c.ellipse(bx, 616, 22 - hb * 0.2, 5, 0, 0, 7); c.fill();
  c.save(); c.translate(bx, by); c.scale(1.5, 1.5); c.rotate(Math.sin(u * 2.6) * 0.6); const sq = 1 + 0.15 * Math.sin(u * 5);
  c.fillStyle = '#f4efe8'; c.strokeStyle = '#1c2133'; c.lineWidth = 2.5; c.beginPath();
  c.moveTo(-16 * sq, 10); c.quadraticCurveTo(-20 * sq, -8, -9, -16); c.lineTo(-6, -24); c.lineTo(-2, -16); c.lineTo(3, -16); c.lineTo(7, -25); c.lineTo(10, -15); c.quadraticCurveTo(20 * sq, -6, 15 * sq, 10); c.closePath(); c.fill(); c.stroke(); c.restore();
  c.restore();
  // левый фонарь мигает
  const fk = [0.9, 1.0, 1.35, 1.5, 3.2, 3.28].reduce((a, s, i, arr) => i % 2 ? a : a || (u > s && u < arr[i + 1]), false);
  if (fk) { const g = c.createRadialGradient(125, 160, 0, 125, 160, 230); g.addColorStop(0, 'rgba(15,18,45,0.75)'); g.addColorStop(1, 'rgba(15,18,45,0)'); c.fillStyle = g; c.fillRect(0, 0, 400, 560); }
}

// ---------- сцена 3: проход с банками, DAY 1, банка падает
function drawJar(c, x, y, a, w, h) {
  c.save(); c.translate(x, y); c.rotate(a); const r = Math.min(w, h) * 0.22, lw = 3;
  c.beginPath(); c.roundRect(-w / 2, -h / 2 + h * 0.08, w, h * 0.92, r); c.fillStyle = '#d8382c'; c.fill(); c.strokeStyle = '#1c2133'; c.lineWidth = lw; c.stroke();
  c.save(); c.clip(); c.fillStyle = '#a8261f'; c.fillRect(w * 0.28, -h / 2, w * 0.22, h); c.fillStyle = '#f3ead8'; c.fillRect(-w / 2, -h / 2 + h * 0.4, w, h * 0.36);
  c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(-w * 0.3, -h / 2 + h * 0.14, w * 0.08, h * 0.22); c.restore();
  c.beginPath(); c.roundRect(-w / 2, -h / 2 + h * 0.4, w, h * 0.36, 0); c.stroke();
  c.beginPath(); c.roundRect(-w * 0.44, -h / 2, w * 0.88, h * 0.12, r * 0.5); c.fillStyle = '#c22e24'; c.fill(); c.stroke(); c.restore();
}
function sAisle(c, t) {
  const t0 = cuts[2], u = t - t0, R = 64, Y = 690, slip = T('slips') - 0.05;
  const hitT = jarSim.hits.length ? slip + 0.3 + jarSim.hits[0].t : 1e9;
  c.save(); camera(c, keys(t, [[t0, 1.0], [slip, 1.04], [hitT + 0.6, 1.12], [cuts[3], 1.14]]), 760, 560);
  c.drawImage(BG.aisle, 0, 0);
  // банка: стоит → выезжает к краю полки (0.3 с) → падает по физике
  if (t >= slip) { c.fillStyle = '#20273a'; c.fillRect(jar.x - 1, jar.y - 1, jar.w + 2, jar.h + 2); }
  const sx0 = jar.x + jar.w / 2, sy0 = jar.y + jar.h / 2, k = smooth((t - slip) / 0.3), s = jarSim.at(Math.max(0, t - slip - 0.3));
  // героя рисуем до или после банки по глубине: банка дальше (z≈3), герой ближе
  if (t >= slip) {
    const p = t - slip < 0.3 ? { x: lerp(sx0, s.x, k), y: lerp(sy0, s.y, k), a: lerp(0, -0.25, k) } : s;
    const w = t - slip < 0.3 ? lerp(jar.w, jar.Wf, k) : jar.Wf;
    const hgt = clamp((jar.floor - p.y) / 300);
    c.fillStyle = `rgba(0,0,0,${0.3 * (1 - hgt)})`; c.beginPath(); c.ellipse(p.x, jar.floor + 2, jar.Wf * (0.7 - hgt * 0.3), 6, 0, 0, 7); c.fill();
    drawJar(c, p.x, p.y, p.a, w, jar.h);
  }
  // герой входит слева с коробкой, осматривает полки
  const w = walk(t, { x0: -70, x1: 470, t0: t0 + 0.4, t1: t0 + 3.6, R, Y }), scared = t >= hitT + 0.05, jy = hop(t, hitT + 0.08, R);
  const look = scared ? [7, 1] : keys(t, [[t0 + 3.6, [5, 0]], [T('jars') - 0.2, [-7, -3]], [T('water') - 0.2, [7, -2]], [T('enough'), [0, 0]]]);
  const armL = scared ? keys(t, [[hitT + 0.05, w.armL], [hitT + 0.25, [-0.9, -0.6]]]) : w.armL;
  drawStick(c, w.X, w.Y - jy, R, { mood: scared ? 'scared' : u > 4 && t < T('enough') ? 'neutral' : 'determined', look, blink: scared ? 0 : blink(t, 7),
    legL: w.legL, legR: w.legR, armL, armR: [0.35, 1.0], propR: propBox, groundDy: (w.groundDy || 0) + jy, tilt: scared ? 0.08 : 0 });
  c.restore();
  // заставка DAY 1
  const a = keys(u, [[0.15, 0], [0.5, 1], [2.0, 1], [2.5, 0]]);
  if (a > 0) { c.save(); c.globalAlpha = a; c.font = '900 96px "DejaVu Sans", sans-serif'; c.textAlign = 'center'; c.lineJoin = 'round';
    const sc = 0.92 + 0.08 * smooth(u / 0.5); c.translate(640, 170); c.scale(sc, sc);
    c.lineWidth = 14; c.strokeStyle = '#1c2133'; c.strokeText('DAY 1', 0, 0); c.fillStyle = '#ffffff'; c.fillText('DAY 1', 0, 0); c.restore(); }
}

export function frame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  if (t < cuts[1]) sEntrance(c, t); else if (t < cuts[2]) sParking(c, t); else sAisle(c, t);
  c.drawImage(grain[Math.floor(t * 12) % 4], 0, 0);
  // короткое затемнение на склейках и в начале/конце
  let d = 0; for (const k of [cuts[1], cuts[2]]) d = Math.max(d, 1 - Math.abs(t - k) / 0.18);
  d = Math.max(d, 1 - t / 0.35, 1 - (cuts[3] - t) / 0.6);
  if (d > 0) { c.fillStyle = `rgba(0,0,0,${clamp(d)})`; c.fillRect(0, 0, W, H); }
}
