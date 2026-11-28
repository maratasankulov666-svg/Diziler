// Фоны кодом «как у генерации» (Z-Image): плоская заливка + 2 тона светотени, толстый тёмно-синий контур,
// ночная сине-оранжевая палитра, мягкое свечение ламп, виньетка и лёгкое зерно. Без нейросетей.
const INK = '#1c2133';
export const AISLE_JARS = [];   // экранные прямоугольники банок (для анимации: какую банку уронить)
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
const poly = (c, pts, fill, lw = 0, line = INK) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.strokeStyle = line; c.lineWidth = lw; c.lineJoin = 'round'; c.stroke(); } };
const rr = (c, x, y, w, h, r, fill, lw = 0, line = INK) => { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); }
  if (lw) { c.strokeStyle = line; c.lineWidth = lw; c.stroke(); } };
const glow = (c, x, y, r, col, a) => { const [R, G, B] = hex(col); const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${R},${G},${B},${a})`); g.addColorStop(1, `rgba(${R},${G},${B},0)`); c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore(); };
// финальная обработка: смягчение, виньетка, зерно — то, что делает кадр «как сгенерированный»
function finish(c, W, H, vig = 0.45) {
  const tmp = document.createElement('canvas'); tmp.width = W; tmp.height = H; const t = tmp.getContext('2d');
  t.filter = 'blur(0.7px)'; t.drawImage(c.canvas, 0, 0); c.globalAlpha = 0.55; c.drawImage(tmp, 0, 0); c.globalAlpha = 1;
  const v = c.createRadialGradient(W / 2, H * 0.48, H * 0.35, W / 2, H / 2, W * 0.72); v.addColorStop(0, 'rgba(10,12,30,0)'); v.addColorStop(1, `rgba(10,12,30,${vig})`);
  c.fillStyle = v; c.fillRect(0, 0, W, H);
  const d = c.getImageData(0, 0, W, H), p = d.data; for (let i = 0; i < p.length; i += 4) { const n = (rnd() - 0.5) * 9; p[i] += n; p[i + 1] += n; p[i + 2] += n; }
  c.putImageData(d, 0, 0);
}

// ---------- 1. Проход с банками: тёмный потолок с балками, лампы по центру, оранжевый свет в конце
export function drawAisle(c, W = 1280, H = 720) {
  seed = 11; AISLE_JARS.length = 0;
  const vx = W / 2, vy = H * 0.5, f = 600, pr = (x, y, z) => [vx + f * x / z, vy - f * y / z];
  const Y0 = -1.45, Y1 = 1.9, XL = -1.55, XR = 1.55, far = 20, D = 0.75;
  // фон и дальняя стена
  c.fillStyle = '#1f2537'; c.fillRect(0, 0, W, H);
  const [wx0, wy0] = pr(XL - 2, Y1, far), [wx1, wy1] = pr(XR + 2, Y0, far);
  const wg = c.createLinearGradient(0, wy0, 0, wy1); wg.addColorStop(0, '#f4a04a'); wg.addColorStop(1, '#e87d2e'); c.fillStyle = wg; c.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  c.fillStyle = '#f7b25d'; c.beginPath(); c.ellipse(vx, wy1 - 4, (wx1 - wx0) * 0.42, (wy1 - wy0) * 0.75, 0, Math.PI, 0); c.fill();   // светлый «холм»
  glow(c, vx, (wy0 + wy1) / 2, 300, '#ff8a2c', 0.35);
  // перила в конце
  const [rx0, ry] = pr(XL + 0.5, Y0 + 0.45, far - 1), [rx1] = pr(XR - 0.5, Y0 + 0.45, far - 1), [, ry0] = pr(0, Y0, far - 1);
  c.strokeStyle = '#a2552a'; c.lineWidth = 2; c.strokeRect(rx0, ry, rx1 - rx0, ry0 - ry); for (let x = rx0; x < rx1; x += 7) { c.beginPath(); c.moveTo(x, ry); c.lineTo(x, ry0); c.stroke(); }
  // потолок
  poly(c, [pr(XL - 3, Y1, 0.5), pr(XR + 3, Y1, 0.5), pr(XR + 3, Y1, far), pr(XL - 3, Y1, far)], '#232a3d');
  for (const x of [-1.25, 1.25]) {   // продольные балки
    const s = Math.sign(x);
    poly(c, [pr(x - 0.16, Y1, 0.5), pr(x + 0.16, Y1, 0.5), pr(x + 0.16, Y1, far), pr(x - 0.16, Y1, far)], '#2f3750');
    poly(c, [pr(x - s * 0.16, Y1 - 0.22, 0.5), pr(x - s * 0.16, Y1 - 0.22, far), pr(x - s * 0.16, Y1, far), pr(x - s * 0.16, Y1, 0.5)], '#3b4460', 1.5);
    poly(c, [pr(x - 0.16, Y1 - 0.22, 0.5), pr(x + 0.16, Y1 - 0.22, 0.5), pr(x + 0.16, Y1 - 0.22, far), pr(x - 0.16, Y1 - 0.22, far)], '#454f6c', 1.5);
  }
  for (let z = far - 1; z > 1.4; z -= 2.8) {   // поперечные балки
    poly(c, [pr(XL - 3, Y1 - 0.18, z), pr(XR + 3, Y1 - 0.18, z), pr(XR + 3, Y1, z), pr(XL - 3, Y1, z)], '#3a4360', Math.max(0.8, 5 / z));
    poly(c, [pr(XL - 3, Y1 - 0.18, z), pr(XR + 3, Y1 - 0.18, z), pr(XR + 3, Y1 - 0.18, z + 0.25), pr(XL - 3, Y1 - 0.18, z + 0.25)], '#2b3249');
  }
  // лампы дневного света по центру
  for (let z = far - 2; z > 1.6; z -= 3.6) {
    const q = [pr(-0.17, Y1 - 0.24, z), pr(0.17, Y1 - 0.24, z), pr(0.17, Y1 - 0.24, z + 1.5), pr(-0.17, Y1 - 0.24, z + 1.5)];
    poly(c, [pr(-0.22, Y1 - 0.22, z - 0.05), pr(0.22, Y1 - 0.22, z - 0.05), pr(0.22, Y1 - 0.22, z + 1.55), pr(-0.22, Y1 - 0.22, z + 1.55)], '#3a4258', Math.max(0.8, 4 / z));
    poly(c, q, '#fbfdff'); const [gx, gy] = pr(0, Y1 - 0.24, z + 0.75); if (z < 9) glow(c, gx, gy, 200 / Math.sqrt(z), '#dfe9ff', 0.22);
  }
  // кондиционер справа
  { const x0 = 0.55, x1 = 1.35, y0 = Y1 - 0.42, y1 = Y1 - 0.2, z0 = 3.4, z1 = 4.5;
    poly(c, [pr(x0, y1, z0), pr(x1, y1, z0), pr(x1, Y1, z0), pr(x0, Y1, z0)], '#2c3243', 2);
    poly(c, [pr(x0, y0, z0), pr(x1, y0, z0), pr(x1, y1, z0), pr(x0, y1, z0)], '#3e4456', 2.5);
    poly(c, [pr(x0, y0, z0), pr(x1, y0, z0), pr(x1, y0, z1), pr(x0, y0, z1)], '#b6aeb1', 2.5);
    poly(c, [pr(x0 + 0.15, y0, z0 + 0.2), pr(x1 - 0.15, y0, z0 + 0.2), pr(x1 - 0.15, y0, z1 - 0.2), pr(x0 + 0.15, y0, z1 - 0.2)], '#8f878c', 1.5);
    c.strokeStyle = '#6d6670'; c.lineWidth = 2; for (let k = 0; k < 4; k++) { const z = z0 + 0.3 + k * 0.17; c.beginPath(); c.moveTo(...pr(x0 + 0.25, y0, z)); c.lineTo(...pr(x0 + 0.38, y0, z + 0.1)); c.stroke(); } }
  // пол: светлая плитка, блик от ламп
  poly(c, [pr(XL, Y0, 0.5), pr(XR, Y0, 0.5), pr(XR, Y0, far), pr(XL, Y0, far)], '#c9ccd2');
  const fg = c.createLinearGradient(0, vy, 0, H); fg.addColorStop(0, 'rgba(120,110,120,0.35)'); fg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = fg; c.fillRect(0, vy, W, H - vy);
  poly(c, [pr(-0.35, Y0, 1), pr(0.35, Y0, 1), pr(0.35, Y0, far), pr(-0.35, Y0, far)], 'rgba(255,255,255,0.22)');
  c.strokeStyle = 'rgba(150,152,162,0.55)'; c.lineWidth = 1.2;
  for (let z = 1; z < far; z *= 1.16) { c.beginPath(); c.moveTo(...pr(XL, Y0, z)); c.lineTo(...pr(XR, Y0, z)); c.stroke(); }
  for (const x of [-0.78, 0, 0.78]) { c.beginPath(); c.moveTo(...pr(x, Y0, 0.6)); c.lineTo(...pr(x, Y0, far)); c.stroke(); }
  // стеллажи с банками
  const levels = [Y0 + 0.08, Y0 + 0.78, Y0 + 1.48, Y0 + 2.18, Y0 + 2.88];
  const shelf = side => {
    const X = side < 0 ? XL : XR, Xb = X + side * D;
    // задняя стенка и тень внутри
    poly(c, [pr(Xb, Y0, 0.4), pr(Xb, Y0, far), pr(Xb, Y1 + 0.3, far), pr(Xb, Y1 + 0.3, 0.4)], '#20273a');
    // банки: от дальних к ближним
    const step = 0.3, jw = 0.26, h = 0.5;
    for (let z = far - 0.6; z > 0.55; z -= step) {
      const zm = z + jw / 2, lw = Math.min(4, Math.max(0.6, 7 / zm));
      levels.slice(0, -1).forEach((yb, li) => {
        if (li === 3 && z < 1.2) return;
        const pale = rnd() < 0.12, xj = X + side * 0.08;
        const xa = pr(xj, 0, z)[0], xb = pr(xj, 0, z + jw)[0], x0 = Math.min(xa, xb), w = Math.abs(xa - xb);
        const top = pr(xj, yb + h, zm)[1], bot = pr(xj, yb, zm)[1], hh = bot - top;
        if (w < 0.8) return;
        AISLE_JARS.push({ side, li, z, x: x0, y: top, w, h: hh, pale });
        const body = pale ? '#efe6d2' : '#d8382c', dark = pale ? '#cbbfa6' : '#a8261f', lab = pale ? '#e0d2b6' : '#f3ead8';
        rr(c, x0, top + hh * 0.08, w, hh * 0.92, Math.min(w, hh) * 0.22, body, lw);
        // тень на дальней от лампы стороне
        c.save(); c.beginPath(); c.roundRect(x0, top + hh * 0.08, w, hh * 0.92, Math.min(w, hh) * 0.22); c.clip();
        c.fillStyle = dark; c.fillRect(side < 0 ? x0 : x0 + w * 0.78, top, w * 0.22, hh);
        c.fillStyle = lab; c.fillRect(x0, top + hh * 0.4, w, hh * 0.36);
        c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(side < 0 ? x0 + w * 0.62 : x0 + w * 0.18, top + hh * 0.14, w * 0.08, hh * 0.22);
        c.restore();
        c.strokeStyle = INK; c.lineWidth = lw * 0.7; c.beginPath(); c.moveTo(x0, top + hh * 0.4); c.lineTo(x0 + w, top + hh * 0.4); c.moveTo(x0, top + hh * 0.76); c.lineTo(x0 + w, top + hh * 0.76); c.stroke();
        // крышка
        rr(c, x0 + w * 0.06, top, w * 0.88, hh * 0.12, Math.min(w, hh) * 0.1, pale ? '#d9cdb3' : '#c22e24', lw * 0.8);
      });
    }
    // полки: толстая светлая кромка, низ полок выше глаз — тёмный
    levels.forEach((yb, li) => {
      const t = yb - 0.1, lw = 2.5;
      if (yb > 0) poly(c, [pr(X, t, 0.5), pr(X, t, far), pr(Xb, t, far), pr(Xb, t, 0.5)], '#2c3346');
      else poly(c, [pr(X, yb, 0.5), pr(X, yb, far), pr(Xb, yb, far), pr(Xb, yb, 0.5)], '#9ea3ae');
      poly(c, [pr(X, t, 0.5), pr(X, t, far), pr(X, yb, far), pr(X, yb, 0.5)], '#e6e6e8', lw);
      poly(c, [pr(X, yb - 0.035, 0.5), pr(X, yb - 0.035, far), pr(X, yb, far), pr(X, yb, 0.5)], '#ffffff');
    });
    // стойки
    for (let z = 1.1; z < far; z += 4.2) poly(c, [pr(X, Y0, z), pr(X, Y0, z + 0.12), pr(X, Y1 + 0.3, z + 0.12), pr(X, Y1 + 0.3, z)], '#7f8697', Math.max(1, 6 / z));
  };
  shelf(-1); shelf(1);
  // общий тёплый отсвет от конца прохода и холод сверху
  glow(c, vx, vy + 20, 420, '#ff8a3a', 0.12);
  finish(c, W, H, 0.5);
}

// ---------- 2. Вход: большое окно в ночь, кассы, полки с коробками, пакеты
export function drawEntrance(c, W = 1280, H = 720) {
  seed = 23;
  const wall = c.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#f2bea6'); wall.addColorStop(1, '#f6d2bd'); c.fillStyle = wall; c.fillRect(0, 0, W, H);
  // пол
  poly(c, [[0, 600], [W, 600], [W, H], [0, H]], '#f6e2cc');
  c.strokeStyle = 'rgba(200,160,140,0.35)'; c.lineWidth = 1.5; for (let i = -8; i <= 8; i++) { c.beginPath(); c.moveTo(640 + i * 90, 600); c.lineTo(640 + i * 230, H); c.stroke(); }
  // окно: ночь снаружи
  const ox0 = 62, oy0 = 72, ox1 = 1218, oy1 = 600;
  const sky = c.createLinearGradient(0, oy0, 0, oy1); sky.addColorStop(0, '#1b2343'); sky.addColorStop(0.55, '#25305a'); sky.addColorStop(1, '#2c3660');
  c.fillStyle = sky; c.fillRect(ox0, oy0, ox1 - ox0, oy1 - oy0);
  c.fillStyle = '#323e6c'; c.beginPath(); c.arc(1050, 300, 90, Math.PI, 0); c.fill();                // дальний купол дерева
  c.fillStyle = '#34405f'; c.fillRect(ox0, 365, ox1 - ox0, oy1 - 365);                               // асфальт
  c.fillStyle = '#e47b3c'; c.fillRect(ox0, 362, ox1 - ox0, 5);                                       // бордюр в свете фонарей
  c.fillStyle = '#3e5f3e'; for (let x = 480; x < 600; x += 22) { c.beginPath(); c.arc(x, 350, 16 + (x % 3) * 3, Math.PI, 0); c.fill(); }
  c.strokeStyle = '#c8cde0'; c.lineWidth = 3; for (const [a, b] of [[400, 470], [720, 760]]) { c.beginPath(); c.moveTo(a, 405); c.lineTo(b, 405); c.stroke(); }
  c.beginPath(); c.moveTo(735, 385); c.lineTo(760, 405); c.stroke();
  for (const x of [340, 955]) {   // фонари
    c.fillStyle = '#e8763a'; c.fillRect(x - 3, 175, 6, 190);
    glow(c, x, 155, 120, '#ff9a4a', 0.4); c.fillStyle = '#ee7a3a'; c.beginPath(); c.arc(x, 155, 20, 0, 7); c.fill(); c.fillStyle = '#ffe9cf'; c.beginPath(); c.arc(x, 155, 11, 0, 7); c.fill();
  }
  const car = (x, y, w, col, sh, flip) => { c.save(); c.translate(x, y); if (flip) c.scale(-1, 1);
    c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -w * 0.17); c.quadraticCurveTo(-w * 0.45, -w * 0.24, -w * 0.3, -w * 0.25); c.lineTo(-w * 0.16, -w * 0.4);
    c.quadraticCurveTo(0, -w * 0.45, w * 0.2, -w * 0.38); c.lineTo(w * 0.34, -w * 0.25); c.quadraticCurveTo(w * 0.5, -w * 0.22, w / 2, -w * 0.08); c.lineTo(w / 2, 0); c.closePath();
    c.fillStyle = col; c.fill(); c.fillStyle = sh; c.fillRect(-w / 2, -w * 0.08, w, w * 0.08);
    c.fillStyle = '#4a5370'; c.beginPath(); c.moveTo(-w * 0.13, -w * 0.37); c.lineTo(w * 0.17, -w * 0.36); c.lineTo(w * 0.27, -w * 0.25); c.lineTo(-w * 0.24, -w * 0.25); c.closePath(); c.fill();
    c.fillStyle = '#2a2f40'; for (const k of [-0.3, 0.3]) { c.beginPath(); c.arc(w * k, 0, w * 0.085, 0, 7); c.fill(); }
    c.fillStyle = '#ffbf7a'; c.fillRect(w * 0.44, -w * 0.15, w * 0.05, w * 0.04); c.restore(); };
  car(345, 382, 250, '#8b93b0', '#6f7895'); car(835, 382, 250, '#8c3b34', '#6e2b27', true);
  // рамы окна (тёмно-синие)
  c.strokeStyle = INK; c.lineWidth = 12; c.strokeRect(ox0 - 10, oy0 - 14, ox1 - ox0 + 20, oy1 - oy0 + 20);
  rr(c, ox0, oy0, ox1 - ox0, 32, 0, '#f3eadb');                                                       // светлый козырёк
  poly(c, [[ox0, oy0 + 32], [ox0 + 100, oy0 + 32], [ox0 + 100, oy0 + 52]], '#e8dcc8'); poly(c, [[ox1, oy0 + 32], [ox1 - 100, oy0 + 32], [ox1 - 100, oy0 + 52]], '#e8dcc8');
  c.fillStyle = '#2a3150'; for (const x of [222, 455, 825, 1055]) c.fillRect(x - 7, oy0 + 30, 14, oy1 - oy0 - 30);
  c.fillRect(ox0, 182, ox1 - ox0, 12);
  rr(c, 462, 202, 356, 405, 0, null, 9, '#2a3150'); c.fillStyle = '#2a3150'; c.fillRect(636, 202, 8, 405);
  c.fillStyle = 'rgba(255,255,255,0.06)'; poly(c, [[480, 600], [560, 210], [600, 210], [520, 600]], 'rgba(255,255,255,0.06)');
  // боковые простенки
  rr(c, ox0, oy0 + 32, 98, oy1 - oy0 - 32, 0, '#f4e6d4'); rr(c, ox1 - 98, oy0 + 32, 98, oy1 - oy0 - 32, 0, '#f4e6d4');
  // полки с коробками
  const boxes = (x, side) => {
    const cols = [['#4a90d9', '#6fb0f0'], ['#e95a4f', '#f78478'], ['#3fae8a', '#62cfa8'], ['#f2b544', '#f8cf72'], ['#e86d8f', '#f792ad']];
    for (let r = 0; r < 3; r++) {
      const y = 330 + r * 58;
      for (let k = 0; k < 2; k++) { const [a, b] = cols[(r * 2 + k + (side > 0 ? 1 : 0)) % 5], w = k ? 40 : 64, bx = side < 0 ? x + 12 + k * 70 : x + 110 - k * 64 - w;
        rr(c, bx, y - 46, w, 46, 5, a, 3.5); rr(c, bx + 3, y - 46, w - 6, 10, 3, b); }
      poly(c, [[x, y], [x + 130, y], [x + 130 + side * 10, y + 8], [x + side * 10, y + 8]], '#f4f1ec', 3);
      rr(c, x, y, 130, 10, 2, '#e9e3da', 3);
    }
  };
  boxes(78, -1); boxes(1072, 1);
  // кассы
  const counter = (side) => {
    const m = s => side < 0 ? s : W - s;
    poly(c, [[m(170), 412], [m(368), 400], [m(368), 418], [m(170), 436]], '#f3efe9', 3.5);
    poly(c, [[m(170), 436], [m(368), 418], [m(368), 480], [m(240), 572], [m(170), 572]], '#8e95a8', 3.5);
    poly(c, [[m(250), 452], [m(350), 438], [m(350), 470], [m(250), 518]], '#7a8195', 2);
    poly(c, [[m(368), 418], [m(380), 420], [m(380), 482], [m(240), 584], [m(240), 572], [m(368), 480]], '#666c80', 3);
    // монитор
    poly(c, [[m(272), 360], [m(312), 350], [m(318), 410], [m(278), 420]], '#2f3548', 3.5); poly(c, [[m(278), 366], [m(306), 359], [m(311), 404], [m(283), 411]], '#e9ecf2');
    poly(c, [[m(285), 420], [m(305), 415], [m(318), 428], [m(272), 432]], '#2f3548', 3);
  };
  counter(-1); counter(1);
  // столы с пакетами на переднем плане
  const table = side => { const m = s => side < 0 ? s : W - s;
    poly(c, [[m(-10), 545], [m(225), 545], [m(250), 560], [m(250), H + 5], [m(-10), H + 5]], '#8c93a6', 4);
    poly(c, [[m(-10), 525], [m(232), 525], [m(252), 548], [m(-10), 548]], '#f4f0ea', 4);
    for (const [bx, s] of [[18, 1], [92, 1.06]]) { const x0 = m(bx), w = 66 * s * (side < 0 ? 1 : -1), y1 = 548, y0 = 470 - s * 8;
      c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.ellipse(x0 + w * 0.5, y0, Math.abs(w) * 0.22, 22, 0, Math.PI, 0); c.stroke();
      c.strokeStyle = '#7a4a28'; c.lineWidth = 2.5; c.stroke();
      poly(c, [[x0, y0], [x0 + w, y0], [x0 + w * 1.05, y1], [x0 - w * 0.05, y1]], '#d48f57', 4);
      poly(c, [[x0 + w * 0.7, y0], [x0 + w, y0], [x0 + w * 1.05, y1], [x0 + w * 0.75, y1]], '#b8733f'); poly(c, [[x0, y0], [x0 + w, y0], [x0 + w * 1.05, y1], [x0 - w * 0.05, y1]], null, 4); }
  };
  table(-1); table(1);
  glow(c, W / 2, 300, 520, '#ffb08a', 0.08);
  finish(c, W, H, 0.3);
}

// ---------- 3. Парковка ночью: светящийся магазин, фонари, оранжевые деревья
export function drawParking(c, W = 1280, H = 720) {
  seed = 37;
  const sky = c.createLinearGradient(0, 0, 0, 420); sky.addColorStop(0, '#18204a'); sky.addColorStop(1, '#2c3266'); c.fillStyle = sky; c.fillRect(0, 0, W, 420);
  // дальние дома
  for (const [x, y, w] of [[0, 80, 290], [290, 150, 140], [880, 85, 400], [980, 160, 300]]) {
    rr(c, x, y, w, 340, 0, '#283364'); c.fillStyle = '#33407a';
    for (let wx = x + 18; wx < x + w - 30; wx += 48) for (let wy = y + 30; wy < 330; wy += 46) if (rnd() < 0.75) c.fillRect(wx, wy, 26, 22);
  }
  // земля
  const lot = c.createLinearGradient(0, 400, 0, H); lot.addColorStop(0, '#d88772'); lot.addColorStop(1, '#f1a58a'); c.fillStyle = lot; c.fillRect(0, 395, W, H - 395);
  glow(c, 640, 470, 520, '#ffb070', 0.25);
  // магазин
  poly(c, [[205, 262], [890, 262], [890, 450], [205, 450]], '#e9a08e', 3);
  poly(c, [[890, 222], [1130, 252], [1130, 455], [890, 450]], '#8d6f9e', 3);
  poly(c, [[205, 262], [890, 262], [890, 290], [205, 290]], '#f0b7a2');
  poly(c, [[205, 290], [890, 290], [890, 300], [205, 300]], '#2f3a5e');
  poly(c, [[860, 210], [890, 210], [890, 262], [860, 262]], '#f3b9a3', 3);
  // вывеска
  rr(c, 510, 152, 278, 132, 4, '#c9402e', 4); rr(c, 516, 158, 266, 120, 2, '#ea5a3f'); glow(c, 650, 218, 200, '#ff6a40', 0.2);
  c.fillStyle = '#2b2f40'; c.fillRect(560, 284, 6, 10); c.fillRect(730, 284, 6, 10);
  // навес
  poly(c, [[422, 288], [968, 288], [968, 312], [422, 312]], '#4a6585', 3); poly(c, [[422, 312], [968, 312], [956, 326], [434, 326]], '#2f4562', 3);
  // витрины
  const win = (x0, x1) => { const g = c.createLinearGradient(0, 320, 0, 440); g.addColorStop(0, '#fff1d6'); g.addColorStop(1, '#f6c98e');
    rr(c, x0, 320, x1 - x0, 122, 0, g, 3);
    for (let y = 352; y < 440; y += 30) { c.fillStyle = '#e6b07a'; c.fillRect(x0 + 4, y, x1 - x0 - 8, 4);
      for (let x = x0 + 10; x < x1 - 20; x += 34) if (rnd() < 0.7) rr(c, x, y - 14, 20 + rnd() * 10, 14, 2, ['#e8874a', '#d9663a', '#f0a45e'][Math.floor(rnd() * 3)]); }
    c.fillStyle = 'rgba(60,70,100,0.6)'; for (let x = x0 + 52; x < x1; x += 52) c.fillRect(x - 2, 320, 4, 122); };
  win(236, 448); win(458, 590); win(698, 860);
  rr(c, 596, 345, 96, 98, 0, '#fff4df', 3.5); c.fillStyle = '#9aa1b5'; c.fillRect(641, 345, 5, 98); glow(c, 644, 395, 140, '#ffd59a', 0.35);
  poly(c, [[205, 442], [1130, 442], [1130, 458], [205, 458]], '#c98b78', 2.5);
  rr(c, 980, 390, 26, 48, 2, '#ad4a3e', 2.5);
  // бордюр и тротуар
  poly(c, [[110, 458], [1180, 458], [1260, 478], [40, 478]], '#eab6a0', 2.5);
  // разметка
  c.strokeStyle = '#ffe6da'; c.lineWidth = 4; c.lineCap = 'round';
  for (let i = 0; i < 4; i++) { const y = 540 + i * 38; c.beginPath(); c.moveTo(760 + i * 40, y); c.lineTo(1280, y + 10); c.stroke(); }
  c.beginPath(); c.moveTo(760, 540); c.lineTo(1080, 500); c.stroke(); c.beginPath(); c.moveTo(760, 640); c.lineTo(1050, 650); c.stroke();
  c.beginPath(); c.moveTo(160, 520); c.lineTo(330, 470); c.stroke(); c.beginPath(); c.moveTo(60, 580); c.lineTo(330, 520); c.stroke();
  // деревья
  const tree = (x, y, s) => { c.strokeStyle = '#7a3f2e'; c.lineWidth = 9 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 200 * s);
    c.moveTo(x, y - 110 * s); c.lineTo(x - 30 * s, y - 150 * s); c.moveTo(x, y - 140 * s); c.lineTo(x + 28 * s, y - 175 * s); c.stroke();
    c.save(); c.globalCompositeOperation = 'destination-over'; c.restore();
    const blob = (bx, by, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(bx, by, r, 0, 7); c.fill(); };
    blob(x - 30 * s, y - 230 * s, 70 * s, '#d9622f'); blob(x + 25 * s, y - 250 * s, 64 * s, '#e57434'); blob(x - 5 * s, y - 300 * s, 58 * s, '#ec8640'); blob(x + 40 * s, y - 200 * s, 44 * s, '#cf5a2c');
    c.strokeStyle = '#7a3f2e'; c.lineWidth = 9 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 170 * s); c.moveTo(x, y - 110 * s); c.lineTo(x - 30 * s, y - 150 * s); c.stroke(); };
  tree(40, 530, 1); tree(1250, 480, 0.85);
  // машины
  const car = (x, y, w, col, sh, flip) => { c.save(); c.translate(x, y); if (flip) c.scale(-1, 1); c.lineWidth = 3; c.strokeStyle = INK;
    c.beginPath(); c.moveTo(-w / 2, 0); c.lineTo(-w / 2, -w * 0.18); c.quadraticCurveTo(-w * 0.44, -w * 0.25, -w * 0.28, -w * 0.26); c.lineTo(-w * 0.14, -w * 0.42);
    c.quadraticCurveTo(0, -w * 0.46, w * 0.18, -w * 0.4); c.lineTo(w * 0.32, -w * 0.26); c.quadraticCurveTo(w * 0.5, -w * 0.23, w / 2, -w * 0.08); c.lineTo(w / 2, 0); c.closePath();
    c.fillStyle = col; c.fill(); c.stroke(); c.fillStyle = sh; c.fillRect(-w / 2 + 2, -w * 0.09, w - 4, w * 0.07);
    c.fillStyle = '#5a6584'; c.beginPath(); c.moveTo(-w * 0.12, -w * 0.38); c.lineTo(w * 0.15, -w * 0.37); c.lineTo(w * 0.25, -w * 0.27); c.lineTo(-w * 0.22, -w * 0.27); c.closePath(); c.fill();
    c.fillStyle = '#fff3c9'; c.beginPath(); c.ellipse(w * 0.46, -w * 0.15, w * 0.035, w * 0.025, 0, 0, 7); c.fill(); glow(c, w * 0.48, -w * 0.15, w * 0.25, '#ffe2a0', 0.35);
    c.fillStyle = '#e2563f'; c.fillRect(-w * 0.5, -w * 0.16, w * 0.03, w * 0.04);
    c.fillStyle = '#1e2232'; for (const k of [-0.3, 0.3]) { c.beginPath(); c.arc(w * k, 0, w * 0.09, 0, 7); c.fill(); c.fillStyle = '#7c849a'; c.beginPath(); c.arc(w * k, 0, w * 0.04, 0, 7); c.fill(); c.fillStyle = '#1e2232'; }
    c.restore(); };
  car(275, 432, 150, '#3e4868', '#2c344e'); car(95, 520, 220, '#4e5670', '#383f56'); car(1075, 462, 170, '#4a5576', '#343c58', true);
  // фонари
  const lamp = (x, y, h, s) => { c.strokeStyle = '#d86a30'; c.lineWidth = 8 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.quadraticCurveTo(x, y - h - 18 * s, x - 18 * s * Math.sign(s), y - h - 20 * s); c.stroke();
    c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
    const hx = x - 30 * Math.sign(s) * Math.abs(s), hy = y - h - 22 * Math.abs(s);
    c.fillStyle = '#e8763a'; c.beginPath(); c.ellipse(hx, hy, 32 * Math.abs(s), 9 * Math.abs(s), -0.25 * Math.sign(s), 0, 7); c.fill();
    c.fillStyle = '#fff4d6'; c.beginPath(); c.ellipse(hx, hy + 4, 24 * Math.abs(s), 5 * Math.abs(s), -0.25 * Math.sign(s), 0, 7); c.fill();
    glow(c, hx, hy + 10, 180 * Math.abs(s), '#ffbc6a', 0.45);
    c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createLinearGradient(0, hy, 0, y + 20); g.addColorStop(0, 'rgba(255,190,110,0.22)'); g.addColorStop(1, 'rgba(255,190,110,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(hx - 18, hy); c.lineTo(hx + 18, hy); c.lineTo(hx + 150 * Math.abs(s), y + 20); c.lineTo(hx - 150 * Math.abs(s), y + 20); c.fill(); c.restore();
    rr(c, x - 10 * Math.abs(s), y - 6, 20 * Math.abs(s), 10, 3, '#b95527'); };
  lamp(155, 535, 380, 1); lamp(1150, 560, 400, -1);
  // тележки
  const cart = (x, y) => { c.strokeStyle = '#3a3f55'; c.lineWidth = 3; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + 60, y); c.lineTo(x + 52, y + 42); c.lineTo(x + 8, y + 42); c.closePath(); c.stroke();
    c.lineWidth = 1.5; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(x + i * 10, y); c.lineTo(x + 4 + i * 8.4, y + 42); c.stroke(); }
    for (let j = 1; j < 3; j++) { c.beginPath(); c.moveTo(x + j * 2.6, y + j * 14); c.lineTo(x + 60 - j * 2.6, y + j * 14); c.stroke(); }
    c.lineWidth = 3; c.beginPath(); c.moveTo(x - 8, y - 8); c.lineTo(x, y); c.moveTo(x + 10, y + 42); c.lineTo(x + 10, y + 60); c.moveTo(x + 50, y + 42); c.lineTo(x + 50, y + 60); c.stroke();
    c.fillStyle = '#3a3f55'; for (const k of [12, 50]) { c.beginPath(); c.arc(x + k, y + 62, 5, 0, 7); c.fill(); } };
  for (let i = 0; i < 4; i++) cart(110 + i * 92, 555 + i * 6);
  // кусты переднего плана
  const leaves = (x, y, s) => { c.fillStyle = '#1b2242'; for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.42; c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2);
    c.beginPath(); c.ellipse(0, -90 * s, 22 * s, 95 * s, 0, 0, 7); c.fill(); c.restore(); } };
  leaves(40, H + 30, 1.25); leaves(1250, H + 30, 1.25);
  finish(c, W, H, 0.4);
}
