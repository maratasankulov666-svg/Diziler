// Фоны-локации, нарисованные кодом (canvas 2D + простая перспектива). Плоские цвета, тёмный контур.
const INK = '#23242a';
export function cam(W, H, vx, vy, f) {
  const pr = (x, y, z) => [vx + f * x / z, vy - f * y / z];
  return { pr, f, W, H };
}
const mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
function quad(c, K, pts, fill, line = INK, lw = 1.6) {
  c.beginPath(); pts.forEach((p, i) => { const s = K.pr(...p); i ? c.lineTo(...s) : c.moveTo(...s); }); c.closePath();
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (line) { c.strokeStyle = line; c.lineWidth = lw; c.stroke(); }
}
// коробка: видимые грани с учётом положения камеры (x=0, y=0)
function box(c, K, [x0, x1, y0, y1, z0, z1], col, fog = 0, fogc = '#000000') {
  const f = t => mix(t, fogc, fog), lw = Math.max(0.8, 2.4 * 3 / z0);
  if (x1 < 0) quad(c, K, [[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], f(col.side || col.front), INK, lw);
  if (x0 > 0) quad(c, K, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], f(col.side || col.front), INK, lw);
  if (y1 < 0) quad(c, K, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], f(col.top || col.front), INK, lw);
  quad(c, K, [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], f(col.front), INK, lw);
}

// ---------- 1. Проход с полками, ночь, лампы дневного света
export function drawAisle(c, W = 1280, H = 720) {
  const K = cam(W, H, W * 0.6, H * 0.56, 620);
  const FOG = '#e9b06a', far = 24, Y0 = -1.6, Y1 = 2.6, XL = -1.9, XR = 2.1;
  const fz = z => Math.min(0.75, Math.max(0, (z - 5) / 26));
  // дальняя стена с тёплым светом
  const g = c.createLinearGradient(0, K.pr(0, Y1, far)[1], 0, K.pr(0, Y0, far)[1]); g.addColorStop(0, '#f6c57e'); g.addColorStop(1, '#d58a45');
  c.fillStyle = '#c9c4b8'; c.fillRect(0, 0, W, H);
  const [ax, ay] = K.pr(XL - 6, Y1, far), [bx, by] = K.pr(XR + 6, Y0, far); c.fillStyle = g; c.fillRect(ax, ay, bx - ax, by - ay);
  for (let i = -6; i <= 6; i++) box(c, K, [i * 1.3 - 0.5, i * 1.3 + 0.5, Y0, Y0 + 1.4, far - 0.6, far - 0.1], { front: ['#8f6b4a', '#a4815c', '#7d5c40'][((i % 3) + 3) % 3] }, 0.35, FOG);
  quad(c, K, [[-0.3, 2.0, far - 2], [0.3, 2.0, far - 2], [0.45, 1.7, far - 2], [-0.45, 1.7, far - 2]], '#b8463a');   // подвесная лампа
  // потолок
  quad(c, K, [[XL - 2, Y1, 0.8], [XR + 2, Y1, 0.8], [XR + 2, Y1, far], [XL - 2, Y1, far]], '#d9d6cf', null);
  for (let z = 1; z < far; z += 1.5) quad(c, K, [[XL - 2, Y1, z], [XR + 2, Y1, z], [XR + 2, Y1, z + 0.02], [XL - 2, Y1, z + 0.02]], null, '#b9b5ac', 1);
  for (const x of [-0.6, 1.0]) for (let z = 2; z < far - 1; z += 3.2) {
    quad(c, K, [[x - 0.12, Y1 - 0.08, z], [x + 0.12, Y1 - 0.08, z], [x + 0.12, Y1 - 0.08, z + 2.2], [x - 0.12, Y1 - 0.08, z + 2.2]], '#f8fbff', '#9aa3ad', 1.2);
  }
  // воздуховод
  for (let z = far - 0.5; z > 1; z -= 6) box(c, K, [0.25, 1.6, Y1 - 0.75, Y1 - 0.4, z - 5.8, z], { front: '#9ea4ab', side: '#b3b8be', top: '#9ea4ab' }, fz(z) * 0.5, FOG);
  // пол
  quad(c, K, [[XL, Y0, 0.6], [XR, Y0, 0.6], [XR, Y0, far], [XL, Y0, far]], '#b9b8b2', null);
  for (let z = 1; z < far; z += 1.2) quad(c, K, [[XL, Y0, z], [XR, Y0, z], [XR, Y0, z + 0.015], [XL, Y0, z + 0.015]], null, '#a5a49e', 1);
  for (const x of [-0.6, 1.0]) quad(c, K, [[x - 0.3, Y0, 2], [x + 0.3, Y0, 2], [x + 0.3, Y0, far], [x - 0.3, Y0, far]], 'rgba(255,255,255,0.18)', null);  // блики ламп
  // полки: слева банки, справа коробки
  const levels = [Y0 + 0.15, Y0 + 0.75, Y0 + 1.35, Y0 + 1.95, Y0 + 2.55, Y0 + 3.15];
  const shelf = (X, side) => {
    const step = 0.24;
    for (let z = far - 0.5; z > 0.7; z -= step) {
      const fo = fz(z);
      levels.slice(0, -1).forEach((yb, li) => {
        const h = 0.44, X2 = X + side * 0.0;
        if (side < 0) {   // банки: верх красный, низ белый
          const zz = [z, z + step * 0.86];
          quad(c, K, [[X2, yb, zz[0]], [X2, yb, zz[1]], [X2, yb + h, zz[1]], [X2, yb + h, zz[0]]], mix('#d9312b', FOG, fo), INK, Math.max(0.6, 1.8 * 2 / z));
          quad(c, K, [[X2, yb, zz[0]], [X2, yb, zz[1]], [X2, yb + h * 0.42, zz[1]], [X2, yb + h * 0.42, zz[0]]], mix('#f3f1ea', FOG, fo), null);
          quad(c, K, [[X2, yb + h * 0.42, zz[0]], [X2, yb + h * 0.42, zz[1]], [X2, yb + h * 0.47, zz[1]], [X2, yb + h * 0.47, zz[0]]], mix('#9e1f1b', FOG, fo), null);
        } else {          // коробки разных цветов
          const cols = ['#e9a23b', '#3f7fc4', '#5aa05a', '#c9483f', '#8a5bb0', '#e3d24a'];
          const col = cols[(Math.floor(z / step) * 7 + li * 3) % cols.length], hh = h * (0.75 + ((Math.floor(z / step) + li) % 3) * 0.1);
          quad(c, K, [[X2, yb, z], [X2, yb, z + step * 0.9], [X2, yb + hh, z + step * 0.9], [X2, yb + hh, z]], mix(col, FOG, fo), INK, Math.max(0.6, 1.8 * 2 / z));
        }
      });
    }
    // полки-доски и ценники
    levels.forEach(yb => { quad(c, K, [[X, yb - 0.06, 0.7], [X, yb - 0.06, far], [X, yb, far], [X, yb, 0.7]], '#a7abb0', INK, 1.4);
      for (let z = 1.2; z < far; z += 1.7) quad(c, K, [[X, yb - 0.05, z], [X, yb - 0.05, z + 0.25], [X, yb - 0.01, z + 0.25], [X, yb - 0.01, z]], '#ffffff', null); });
    // стойки
    for (let z = 0.9; z < far; z += 2.6) quad(c, K, [[X, Y0, z], [X, Y0, z + 0.1], [X, Y1 - 0.1, z + 0.1], [X, Y1 - 0.1, z]], '#8c9095', INK, Math.max(0.8, 2 / z * 2));
  };
  shelf(XR, 1); shelf(XL, -1);
}

// ---------- 2. Вход изнутри: стеклянная стена, кассы, ночь за окном
export function drawEntrance(c, W = 1280, H = 720) {
  const K = cam(W, H, W * 0.5, H * 0.42, 700);
  const Y0 = -1.6, Y1 = 2.8, ZG = 11;
  const [gx0, gy0] = K.pr(-9, Y1, ZG), [gx1, gy1] = K.pr(9, Y0, ZG);
  // улица за стеклом
  const sky = c.createLinearGradient(0, gy0, 0, gy1); sky.addColorStop(0, '#16213f'); sky.addColorStop(0.55, '#263760'); sky.addColorStop(0.56, '#c98a45'); sky.addColorStop(1, '#8b6037');
  c.fillStyle = '#d9cfbd'; c.fillRect(0, 0, W, H);
  c.fillStyle = sky; c.fillRect(gx0, gy0, gx1 - gx0, gy1 - gy0);
  const hz = gy0 + (gy1 - gy0) * 0.555;
  c.fillStyle = '#121a2e'; for (let x = gx0; x < gx1; x += 26) { c.beginPath(); c.arc(x, hz - 6, 18 + (x * 7 % 11), Math.PI, 0); c.fill(); }   // деревья
  for (let i = 0; i < 9; i++) {   // фонари
    const x = gx0 + 60 + i * (gx1 - gx0 - 120) / 8, top = gy0 + 40 + (i % 2) * 22;
    c.strokeStyle = '#3b3530'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, hz + 4); c.lineTo(x, top); c.stroke();
    c.fillStyle = '#ffb347'; c.fillRect(x - 12, top - 4, 24, 6);
    const lg = c.createRadialGradient(x, top, 0, x, top, 60); lg.addColorStop(0, 'rgba(255,190,90,0.55)'); lg.addColorStop(1, 'rgba(255,190,90,0)'); c.fillStyle = lg; c.fillRect(x - 60, top - 60, 120, 120);
  }
  const car = (x, y, w, col) => { c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 2;
    c.beginPath(); c.roundRect(x, y - w * 0.32, w, w * 0.32, w * 0.06); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(x + w * 0.18, y - w * 0.52, w * 0.58, w * 0.24, w * 0.08); c.fill(); c.stroke();
    c.fillStyle = '#8fa6c4'; c.fillRect(x + w * 0.24, y - w * 0.47, w * 0.2, w * 0.14); c.fillRect(x + w * 0.5, y - w * 0.47, w * 0.2, w * 0.14);
    c.fillStyle = INK; for (const k of [0.22, 0.78]) { c.beginPath(); c.arc(x + w * k, y, w * 0.08, 0, 7); c.fill(); } };
  [[0.05, '#5a6f93'], [0.2, '#cfd3d8'], [0.36, '#3e4f73'], [0.62, '#7a8aa6'], [0.8, '#4d5f86'], [0.92, '#b9bfc7']].forEach(([k, col], i) => car(gx0 + (gx1 - gx0) * k, hz + 34 + (i % 2) * 10, 92, col));
  for (const s of [-1, 1]) for (let i = 0; i < 6; i++) {   // тележки
    const x = W / 2 + s * (150 + i * 22); c.strokeStyle = '#5a6272'; c.lineWidth = 2; c.strokeRect(x, hz + 52, 34, 26); c.strokeStyle = '#b53a3a'; c.beginPath(); c.moveTo(x, hz + 52); c.lineTo(x + 34, hz + 52); c.stroke(); }
  // стеклянная стена: рамы и раздвижные двери
  for (let x = -9; x <= 9.01; x += 2.25) quad(c, K, [[x - 0.07, Y0, ZG], [x + 0.07, Y0, ZG], [x + 0.07, Y1, ZG], [x - 0.07, Y1, ZG]], '#9aa3ae', INK, 1.6);
  quad(c, K, [[-9, 1.45, ZG], [9, 1.45, ZG], [9, 1.6, ZG], [-9, 1.6, ZG]], '#9aa3ae', INK, 1.6);
  quad(c, K, [[-9, Y0, ZG], [9, Y0, ZG], [9, Y0 + 0.1, ZG], [-9, Y0 + 0.1, ZG]], '#9aa3ae', INK, 1.6);
  quad(c, K, [[-2.1, 1.0, ZG - 0.05], [2.1, 1.0, ZG - 0.05], [2.1, 1.45, ZG - 0.05], [-2.1, 1.45, ZG - 0.05]], '#aeb6c0', INK, 2);
  const [sx, sy] = K.pr(0, 1.22, ZG - 0.05); c.fillStyle = '#2a2d33'; c.fillRect(sx - 14, sy - 5, 28, 10); c.fillStyle = '#39d96b'; c.beginPath(); c.arc(sx, sy, 4, 0, 7); c.fill();
  for (const [a, b] of [[-2.0, -0.05], [0.05, 2.0]]) { quad(c, K, [[a, Y0, ZG - 0.05], [b, Y0, ZG - 0.05], [b, 1.0, ZG - 0.05], [a, 1.0, ZG - 0.05]], 'rgba(200,225,255,0.10)', '#9aa3ae', 4);
    const [p0, p1] = [K.pr(a + 0.4, 0.6, ZG), K.pr(a + 0.9, -0.3, ZG)]; c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 3; c.beginPath(); c.moveTo(...p0); c.lineTo(...p1); c.stroke(); }
  // кнопка у двери, столбики
  quad(c, K, [[2.5, 0.0, ZG - 0.1], [2.85, 0.0, ZG - 0.1], [2.85, 0.5, ZG - 0.1], [2.5, 0.5, ZG - 0.1]], '#7c838d', INK, 1.6);
  for (const x of [-1.2, 1.2]) box(c, K, [x - 0.12, x + 0.12, Y0, Y0 + 0.9, ZG + 0.6, ZG + 0.85], { front: '#8794a6' }, 0);
  // потолок и боковые стены
  quad(c, K, [[-9, Y1, 1], [9, Y1, 1], [9, Y1, ZG], [-9, Y1, ZG]], '#cfc6b4', INK, 1.5);
  for (const z of [3, 6, 9]) quad(c, K, [[-9, Y1 - 0.25, z], [9, Y1 - 0.25, z], [9, Y1, z], [-9, Y1, z]], '#c2b8a4', INK, 1.5);
  // пол
  quad(c, K, [[-9, Y0, 0.6], [9, Y0, 0.6], [9, Y0, ZG], [-9, Y0, ZG]], '#d8cfbe', null);
  // кассы по бокам (дальние раньше)
  const counter = (x0, x1, z0, z1) => {
    box(c, K, [x0, x1, Y0, Y0 + 0.95, z0, z1], { front: '#2b2e35', side: '#e2d3b4', top: '#d9c8a6' });
    const xm = (x0 + x1) / 2;
    box(c, K, [xm - 0.03, xm + 0.03, Y0 + 0.95, Y0 + 1.5, z0 + 0.3, z0 + 0.36], { front: '#2b2e35' });
    box(c, K, [xm - 0.35, xm + 0.35, Y0 + 1.4, Y0 + 1.85, z0 + 0.25, z0 + 0.3], { front: '#1d2026', side: '#2b2e35' });
    for (let k = 0; k < 2; k++) box(c, K, [x1 > 0 ? x0 + 0.1 + k * 0.42 : x1 - 0.5 - k * 0.42, x1 > 0 ? x0 + 0.45 + k * 0.42 : x1 - 0.15 - k * 0.42, Y0 + 0.95, Y0 + 1.45, z1 - 0.7, z1 - 0.35], { front: '#c79a63', side: '#b38652', top: '#a67b4a' });
    // полочка с коробками
    const sx0 = x1 > 0 ? x0 - 0.5 : x1 + 0.1, sx1 = sx0 + 0.4;
    box(c, K, [sx0, sx1, Y0, Y0 + 1.2, z0 + 0.2, z0 + 1.2], { front: '#2b2e35', side: '#3a3e47', top: '#2b2e35' });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
      const cols = ['#e64a3c', '#f2c230', '#3d8fd9', '#45b36b', '#9b59b6'], cc = cols[(r * 3 + k + Math.round(z0)) % 5], zz = z0 + 0.25 + k * 0.32;
      quad(c, K, [[x1 > 0 ? sx0 : sx1, Y0 + 0.1 + r * 0.38, zz], [x1 > 0 ? sx0 : sx1, Y0 + 0.1 + r * 0.38, zz + 0.28], [x1 > 0 ? sx0 : sx1, Y0 + 0.4 + r * 0.38, zz + 0.28], [x1 > 0 ? sx0 : sx1, Y0 + 0.4 + r * 0.38, zz]], cc, INK, 1.2);
    }
  };
  for (const z of [8.2, 5.8, 3.4, 1.4]) { counter(-6.2, -4.8, z, z + 1.6); counter(4.8, 6.2, z, z + 1.6); }
  // колонны у стекла
  for (const x of [-7, 7]) box(c, K, [x - 0.3, x + 0.3, Y0, Y1, ZG - 0.6, ZG - 0.1], { front: '#e2d8c6', side: '#cfc4b0' });
}

// ---------- 3. Парковка у магазина ночью
export function drawParking(c, W = 1280, H = 720) {
  const HZ = 410;
  const sky = c.createLinearGradient(0, 0, 0, HZ); sky.addColorStop(0, '#141a30'); sky.addColorStop(0.7, '#3a3346'); sky.addColorStop(1, '#7a4f3a');
  c.fillStyle = sky; c.fillRect(0, 0, W, HZ);
  const lot = c.createLinearGradient(0, HZ, 0, H); lot.addColorStop(0, '#5a4a3e'); lot.addColorStop(1, '#3b3430'); c.fillStyle = lot; c.fillRect(0, HZ, W, H - HZ);
  // деревья за зданием
  c.fillStyle = '#1d2231'; for (let x = 0; x < W; x += 38) { c.beginPath(); c.arc(x, 250 + (x * 13 % 17), 34 + (x * 7 % 13), 0, 7); c.fill(); }
  const R = (x, y, w, h, f, lw = 2) => { c.fillStyle = f; c.fillRect(x, y, w, h); c.strokeStyle = INK; c.lineWidth = lw; c.strokeRect(x, y, w, h); };
  // здание
  R(260, 250, 760, 160, '#8b6a55'); R(520, 205, 240, 205, '#9c7b63');
  R(548, 222, 184, 46, '#8c2a2a', 3);                                       // пустая вывеска
  for (const [x, w] of [[330, 70], [430, 40], [860, 60], [950, 44], [610, 50]]) R(x, (x === 610 ? 185 : 232), w, 20, '#6d7078');   // кондиционеры
  // светящаяся витрина с полками
  const gl = c.createLinearGradient(0, 300, 0, 405); gl.addColorStop(0, '#fff3d2'); gl.addColorStop(1, '#f2c98a');
  c.fillStyle = gl; c.fillRect(290, 300, 700, 105);
  const cols = ['#d9473b', '#3f7fc4', '#e3b23c', '#5aa05a', '#a05ab0'];
  for (let i = 0; i < 26; i++) { const x = 300 + i * 26.5; if (x > 585 && x < 690) continue;
    for (let r = 0; r < 3; r++) { c.fillStyle = cols[(i + r * 2) % 5]; c.fillRect(x, 340 + r * 20, 20, 12); } c.fillStyle = '#c9c2b2'; c.fillRect(x - 2, 336, 24, 3); }
  for (let x = 290; x <= 990; x += 70) { c.fillStyle = '#5c6470'; c.fillRect(x - 3, 300, 6, 105); }
  R(590, 320, 100, 85, 'rgba(255,240,210,0.6)', 3); c.fillStyle = '#5c6470'; c.fillRect(637, 320, 6, 85);
  c.strokeStyle = INK; c.lineWidth = 2.5; c.strokeRect(290, 300, 700, 105);
  // свет от витрины на асфальт
  const pool = c.createRadialGradient(640, 420, 10, 640, 420, 420); pool.addColorStop(0, 'rgba(255,200,120,0.35)'); pool.addColorStop(1, 'rgba(255,200,120,0)');
  c.fillStyle = pool; c.fillRect(0, HZ, W, H - HZ);
  // разметка в перспективе
  c.strokeStyle = 'rgba(240,190,80,0.75)'; c.lineWidth = 3;
  for (let i = -9; i <= 9; i++) { if (Math.abs(i) < 2) continue; c.beginPath(); c.moveTo(640 + i * 60, 430); c.lineTo(640 + i * 170, 560); c.stroke(); }
  c.beginPath(); c.moveTo(0, 430); c.lineTo(W, 430); c.stroke();
  // пятна и трещины
  c.fillStyle = 'rgba(30,25,22,0.35)'; for (let i = 0; i < 14; i++) { c.beginPath(); c.ellipse((i * 263) % W, 470 + (i * 97) % 230, 30 + i % 4 * 12, 7, 0, 0, 7); c.fill(); }
  // фонари
  for (const [x, top, s] of [[240, 70, 1], [450, 160, 0.6], [1050, 60, 1], [870, 150, 0.6]]) {
    const g = c.createRadialGradient(x, top + 6, 0, x, top + 6, 220 * s); g.addColorStop(0, 'rgba(255,170,70,0.45)'); g.addColorStop(1, 'rgba(255,170,70,0)'); c.fillStyle = g; c.fillRect(x - 230 * s, top - 220 * s, 460 * s, 460 * s);
    c.fillStyle = '#2c2a2d'; c.fillRect(x - 3 * s, top, 6 * s, (HZ + 30 * s) - top);
    R(x - 30 * s, top - 4 * s, 26 * s, 8 * s, '#ffcf73', 1.5); R(x + 4 * s, top - 4 * s, 26 * s, 8 * s, '#ffcf73', 1.5);
  }
  // машины
  const car = (x, y, w, col, flip) => { c.save(); c.translate(x, y); if (flip) c.scale(-1, 1); c.fillStyle = col; c.strokeStyle = INK; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(-w / 2, -w * 0.3, w, w * 0.3, w * 0.07); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-w * 0.3, -w * 0.3); c.lineTo(-w * 0.18, -w * 0.52); c.lineTo(w * 0.22, -w * 0.52); c.lineTo(w * 0.36, -w * 0.3); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#9fb3cc'; c.beginPath(); c.moveTo(-w * 0.24, -w * 0.32); c.lineTo(-w * 0.15, -w * 0.48); c.lineTo(w * 0.02, -w * 0.48); c.lineTo(w * 0.02, -w * 0.32); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(w * 0.06, -w * 0.32); c.lineTo(w * 0.06, -w * 0.48); c.lineTo(w * 0.2, -w * 0.48); c.lineTo(w * 0.3, -w * 0.32); c.closePath(); c.fill();
    c.fillStyle = '#ffdf8a'; c.fillRect(w * 0.44, -w * 0.24, w * 0.05, w * 0.06);
    c.fillStyle = INK; for (const k of [-0.3, 0.3]) { c.beginPath(); c.arc(w * k, 0, w * 0.1, 0, 7); c.fill(); c.fillStyle = '#777'; c.beginPath(); c.arc(w * k, 0, w * 0.045, 0, 7); c.fill(); c.fillStyle = INK; }
    c.restore(); };
  car(140, 470, 190, '#6b7a4e'); car(330, 452, 150, '#d9d4c9'); car(470, 440, 120, '#3c4f78', true); car(1000, 456, 170, '#a8392f', true); car(1160, 448, 150, '#e3e1dc');
  // клумба-островок справа
  c.fillStyle = '#6e6a63'; c.beginPath(); c.ellipse(1080, 500, 140, 22, 0, 0, 7); c.fill(); c.stroke();
  c.fillStyle = '#3d4a2c'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(970 + i * 36, 488 - (i % 2) * 8, 22, 0, 7); c.fill(); c.stroke(); }
  // загон для тележек на переднем плане
  c.fillStyle = '#4a4540'; c.beginPath(); c.moveTo(0, 600); c.quadraticCurveTo(320, 600, 420, 720); c.lineTo(0, 720); c.fill(); c.stroke();
  c.fillStyle = '#34402a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(40 + i * 60, 650 + (i % 2) * 20, 34, 0, 7); c.fill(); c.stroke(); }
  c.strokeStyle = '#8e939b'; c.lineWidth = 9; for (const x of [60, 200, 330]) { c.beginPath(); c.moveTo(x, 720); c.lineTo(x, 520); c.stroke(); }
  c.beginPath(); c.moveTo(40, 530); c.quadraticCurveTo(200, 515, 350, 530); c.stroke(); c.beginPath(); c.moveTo(40, 590); c.quadraticCurveTo(200, 580, 350, 590); c.stroke();
  c.strokeStyle = INK; c.lineWidth = 2; for (const x of [60, 200, 330]) { c.beginPath(); c.moveTo(x - 5, 720); c.lineTo(x - 5, 520); c.stroke(); }
  // тележка справа
  c.strokeStyle = '#9aa0a8'; c.lineWidth = 3; c.strokeRect(1120, 520, 70, 46); for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(1120 + i * 14, 520); c.lineTo(1120 + i * 14, 566); c.stroke(); }
  c.strokeStyle = '#b53a3a'; c.lineWidth = 5; c.beginPath(); c.moveTo(1190, 520); c.lineTo(1205, 505); c.stroke();
  c.fillStyle = INK; for (const x of [1128, 1182]) { c.beginPath(); c.arc(x, 574, 5, 0, 7); c.fill(); }
}
