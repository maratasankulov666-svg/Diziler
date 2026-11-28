// Локации эпизода «10 лет без электричества» — кодом в стиле bgai.js (контур, 2 тона, свечения, finish()).
import { poly, rr, glow, finish, mix, INK } from './bgai.js';
let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const W = 1280, H = 720;

// ---- небо: день / ночь / сияние / снег
export function sky(c, x0, x1, hz, kind = 'night') {
  const g = c.createLinearGradient(0, 0, 0, hz);
  const pal = { day: ['#79aee0', '#cfe3ee'], dusk: ['#2a2f5e', '#e08a5c'], night: ['#070b1e', '#1a2850'], aurora: ['#050a1a', '#123a4a'], snow: ['#5d6878', '#a9b2bc'], fire: ['#1a0d12', '#b8542a'] }[kind];
  g.addColorStop(0, pal[0]); g.addColorStop(1, pal[1]); c.fillStyle = g; c.fillRect(x0, 0, x1 - x0, hz + 2);
  if (kind === 'night' || kind === 'aurora') for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.6})`; c.beginPath(); c.arc(x0 + rnd() * (x1 - x0), rnd() * hz * 0.8, rnd() < 0.1 ? 1.6 : 0.8, 0, 7); c.fill(); }
  if (kind === 'aurora') aurora(c, x0, x1, hz);
  if (kind === 'day') for (let i = 0; i < 5; i++) { const x = x0 + rnd() * (x1 - x0), y = 40 + rnd() * hz * 0.4; c.fillStyle = 'rgba(255,255,255,0.85)'; for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(x + k * 26, y + (k % 2) * 6, 22 + (k % 2) * 8, 0, 7); c.fill(); } }
}
export function aurora(c, x0, x1, hz, k = 1) {
  const a = document.createElement('canvas'); a.width = W; a.height = H; const ag = a.getContext('2d'); ag.globalCompositeOperation = 'lighter';
  const curtain = (base, amp, ph, hgt, top, bot, w) => { for (let x = x0 - 40; x < x1 + 40; x += 1.7) {
    const y = base + amp * Math.sin(x * 0.0065 + ph) + 16 * Math.sin(x * 0.021 + ph * 2), h = hgt * (0.55 + 0.45 * Math.sin(x * 0.013 + ph * 3)) * (0.7 + 0.3 * rnd());
    const q = ag.createLinearGradient(0, y, 0, y - h); q.addColorStop(0, `rgba(${bot},0)`); q.addColorStop(0.08, `rgba(${bot},${0.5 * k})`); q.addColorStop(0.45, `rgba(${bot},${0.2 * k})`); q.addColorStop(0.8, `rgba(${top},${0.13 * k})`); q.addColorStop(1, `rgba(${top},0)`);
    ag.strokeStyle = q; ag.lineWidth = w; ag.beginPath(); ag.moveTo(x, y); ag.lineTo(x + 10, y - h); ag.stroke(); } };
  curtain(hz - 110, 40, 0.3, 240, '210,70,200', '70,255,160', 2.2); curtain(hz - 190, 55, 2.1, 210, '255,80,140', '90,255,190', 1.8); curtain(hz - 60, 28, 4.0, 160, '120,90,255', '60,230,150', 1.6);
  c.save(); c.filter = 'blur(9px)'; c.globalCompositeOperation = 'lighter'; c.drawImage(a, 0, 0); c.filter = 'none'; c.drawImage(a, 0, 0); c.restore();
}
// ---- силуэт города
export function skyline(c, x0, x1, base, o = {}) {
  const lit = o.lit || 0, col = o.col || '#0b1628', rim = o.rim || 'rgba(120,255,200,0.3)';
  for (let x = x0 - 20; x < x1;) {
    const w = 40 + rnd() * 70, h = 60 + rnd() * 180, y = base - h;
    poly(c, [[x, base], [x, y], [x + w, y], [x + w, base]], col); c.fillStyle = rim; c.fillRect(x, y, w, 2);
    for (let wy = y + 10; wy < base - 8; wy += 12) for (let wx = x + 6; wx < x + w - 8; wx += 10) { const r = rnd(); if (r < lit) { c.fillStyle = '#ffd27a'; c.fillRect(wx, wy, 5, 6); } else if (r < 0.5) { c.fillStyle = mix(col, '#2a3a58', 0.4); c.fillRect(wx, wy, 5, 6); } }
    x += w + 2 + rnd() * 6;
  }
}

// ---- 1. Крыша магазина: гравий, кондиционеры, бочки, водостоки, огород; вдали город
export function drawRoof(c, o = {}) {
  seed = 41; const kind = o.sky || 'day', HZ = 300;
  sky(c, 0, W, HZ, kind); skyline(c, 0, W, HZ + 20, { col: kind === 'day' ? '#6d7f95' : '#0b1628', rim: kind === 'day' ? 'rgba(255,255,255,0.3)' : 'rgba(120,255,200,0.3)' });
  const roof = kind === 'day' ? '#b9b2a4' : kind === 'snow' ? '#dfe5ea' : '#3b4152';
  poly(c, [[0, HZ + 20], [W, HZ + 20], [W, H], [0, H]], roof);
  for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(0,0,0,${0.05 + rnd() * 0.08})`; c.fillRect(rnd() * W, HZ + 25 + rnd() * (H - HZ), 3, 2); }   // гравий
  poly(c, [[0, HZ + 20], [W, HZ + 20], [W, HZ + 44], [0, HZ + 44]], mix(roof, '#000000', 0.25), 2.5);   // парапет
  // кондиционеры
  for (const [x, y, w] of [[80, 380, 170], [1010, 370, 190]]) { rr(c, x, y, w, 90, 6, mix(roof, '#5a6274', 0.6), 3); rr(c, x + 14, y + 14, w * 0.45, 62, 4, mix(roof, '#2a3040', 0.6), 2.5); for (let k = 0; k < 5; k++) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x + w * 0.55 + k * 14, y + 16); c.lineTo(x + w * 0.55 + k * 14, y + 74); c.stroke(); } }
  // водосток → бочки
  if (o.barrels !== false) {
    c.strokeStyle = INK; c.lineWidth = 12; c.beginPath(); c.moveTo(380, 470); c.lineTo(900, 470); c.stroke(); c.strokeStyle = '#8f9aa6'; c.lineWidth = 8; c.stroke();
    for (let i = 0; i < 5; i++) { const x = 400 + i * 110; rr(c, x, 480, 80, 120, 10, ['#2f7fc1', '#3b8fd0'][i % 2], 3.5); rr(c, x - 4, 476, 88, 16, 6, '#256aa3', 3); c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 14, 500); c.lineTo(x + 14, 580); c.stroke(); }
  }
  // огород в детских бассейнах
  if (o.garden) for (const [x, y] of [[120, 560], [560, 620], [980, 560]]) { c.beginPath(); c.ellipse(x + 90, y + 40, 120, 42, 0, 0, 7); c.fillStyle = '#3fb0d9'; c.fill(); c.lineWidth = 3.5; c.strokeStyle = INK; c.stroke();
    c.beginPath(); c.ellipse(x + 90, y + 34, 104, 32, 0, 0, 7); c.fillStyle = '#5b3a24'; c.fill();
    for (let k = 0; k < 9; k++) { const px = x + 10 + k * 20, py = y + 30 - (k % 2) * 6; c.fillStyle = '#3f8f3a'; c.beginPath(); c.ellipse(px, py - 14, 10, 18, (k % 3 - 1) * 0.4, 0, 7); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
      if (k % 3 === 0) { c.fillStyle = '#e2442f'; c.beginPath(); c.arc(px + 6, py - 24, 7, 0, 7); c.fill(); c.stroke(); } } }
  if (kind === 'snow') { for (let i = 0; i < 300; i++) { c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(rnd() * W, rnd() * H, 1 + rnd() * 2.5, 0, 7); c.fill(); } }
  if (kind === 'night' || kind === 'aurora') { c.fillStyle = 'rgba(8,12,30,0.35)'; c.fillRect(0, HZ, W, H - HZ); }
  finish(c, W, H, 0.4);
}

// ---- 2. Склад и погрузочная дверь (+ раковина в комнате отдыха)
export function drawBackroom(c, o = {}) {
  seed = 52; const dark = !!o.dark;
  const wall = c.createLinearGradient(0, 0, 0, 470); wall.addColorStop(0, '#5d6878'); wall.addColorStop(1, '#8792a0'); c.fillStyle = wall; c.fillRect(0, 0, W, 470);
  poly(c, [[0, 470], [W, 470], [W, H], [0, H]], '#9a9890'); c.strokeStyle = 'rgba(60,60,60,0.25)'; c.lineWidth = 2; for (let x = -400; x < W + 400; x += 160) { c.beginPath(); c.moveTo(640 + (x - 640) * 0.4, 470); c.lineTo(x, H); c.stroke(); }
  // стеллажи с коробками слева
  for (const x of [20, 250]) { for (let y = 120; y <= 440; y += 106) { rr(c, x, y, 200, 12, 2, '#e07b2a', 3); for (let k = 0; k < 4; k++) { const bw = 40 + rnd() * 6; rr(c, x + 6 + k * 48, y - 60 - rnd() * 20, bw, 60 + rnd() * 18, 3, ['#c79a63', '#b8894f', '#d4ab74'][k % 3], 2.5); } }
    rr(c, x, 60, 12, 400, 2, '#2f6da8', 3); rr(c, x + 188, 60, 12, 400, 2, '#2f6da8', 3); }
  // раковина (тап)
  rr(c, 500, 330, 150, 140, 4, '#c9ced4', 3); rr(c, 515, 340, 120, 40, 8, '#8f969e', 2.5); c.strokeStyle = INK; c.lineWidth = 9; c.beginPath(); c.moveTo(575, 300); c.quadraticCurveTo(575, 286, 595, 286); c.lineTo(600, 312); c.stroke(); c.strokeStyle = '#d7dbe0'; c.lineWidth = 5; c.stroke();
  // погрузочная дверь (рулонная)
  rr(c, 760, 90, 440, 380, 4, '#4f5a68', 4); for (let y = 100; y < 460; y += 22) { c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(770, y); c.lineTo(1190, y); c.stroke(); }
  rr(c, 760, 70, 440, 26, 3, '#f2c230', 3); for (let x = 770; x < 1190; x += 40) poly(c, [[x, 70], [x + 20, 70], [x + 4, 96], [x - 16, 96]], '#2a2a2a');
  rr(c, 940, 430, 80, 24, 6, '#2a2d33', 3);
  // бочки у двери (после дня 5)
  if (o.barrels) for (let i = 0; i < 4; i++) { const x = 790 + i * 100; rr(c, x, 520, 76, 116, 10, '#2f7fc1', 3.5); rr(c, x - 4, 516, 84, 16, 6, '#256aa3', 3); }
  // лампа под потолком
  rr(c, 560, 20, 160, 18, 4, dark ? '#55606e' : '#f8fbff', 2.5); if (!dark) glow(c, 640, 40, 340, '#e8f0ff', 0.25);
  if (dark) { c.fillStyle = 'rgba(6,9,24,0.62)'; c.fillRect(0, 0, W, H); }
  finish(c, W, H, 0.45);
}

// ---- 3. Холодильная камера: панели, матрасы, свечи, садовые фонарики
export function drawCooler(c, o = {}) {
  seed = 63;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#5a6a72'); g.addColorStop(1, '#7c8a90'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 128) { rr(c, x + 4, 20, 120, 470, 4, x % 256 ? '#8c9aa1' : '#95a3aa', 3); for (let y = 60; y < 480; y += 70) { c.strokeStyle = 'rgba(30,40,50,0.25)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 14, y); c.lineTo(x + 114, y); c.stroke(); } }
  poly(c, [[0, 490], [W, 490], [W, H], [0, H]], '#5c6468');
  // дверь камеры справа
  rr(c, 1050, 60, 200, 440, 8, '#aeb9bf', 4); rr(c, 1070, 250, 26, 90, 6, '#3a3f45', 3);
  // матрасы и одеяла
  rr(c, 120, 500, 520, 120, 26, '#d9d4ea', 4); rr(c, 140, 470, 200, 60, 24, '#f3f0e8', 3.5); poly(c, [[300, 520], [640, 500], [660, 610], [320, 620]], '#b1453c', 3.5);
  if (o.marta) { rr(c, 700, 520, 330, 110, 26, '#cfc8de', 4); poly(c, [[720, 540], [1030, 525], [1040, 615], [730, 625]], '#6c5aa0', 3.5); }
  // ящики-столики со свечами и садовые фонарики
  rr(c, 650, 560, 70, 70, 4, '#c69a62', 3);
  const lights = o.lights !== false;
  for (const [x, y] of [[680, 548], [200, 470], [1000, 500], [560, 470]]) { rr(c, x - 7, y - 26, 14, 26, 3, '#f4efe2', 2.5); c.fillStyle = '#ffd36a'; c.beginPath(); c.ellipse(x, y - 34, 6, 10, 0, 0, 7); c.fill(); glow(c, x, y - 34, 120, '#ffb24a', 0.55); }
  if (lights) for (let i = 0; i < 12; i++) { const x = 60 + i * 95, y = 30 + (i % 2) * 14; c.strokeStyle = INK; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 0); c.lineTo(x, y); c.stroke(); c.fillStyle = '#e8f6ff'; c.beginPath(); c.arc(x, y + 8, 9, 0, 7); c.fill(); c.stroke(); glow(c, x, y + 8, 60, '#d8f0ff', 0.5); }
  c.fillStyle = 'rgba(20,14,30,0.3)'; c.fillRect(0, 0, W, H); glow(c, 640, 480, 600, '#ff9a40', 0.2);
  finish(c, W, H, 0.5);
}

// ---- 4. Садовый отдел: мешки с грунтом, семена, уголь, фонарики, растения
export function drawGarden(c, o = {}) {
  seed = 74; const dark = !!o.dark;
  sky(c, 0, W, 360, dark ? 'night' : 'day');
  // сетчатый забор и навес
  c.strokeStyle = 'rgba(40,50,60,0.6)'; c.lineWidth = 1.5; for (let x = -360; x < W; x += 22) { c.beginPath(); c.moveTo(x, 120); c.lineTo(x + 240, 360); c.stroke(); c.beginPath(); c.moveTo(x + 240, 120); c.lineTo(x, 360); c.stroke(); }
  rr(c, 0, 90, W, 34, 0, '#2f6f4a', 3); for (let x = 0; x < W; x += 80) poly(c, [[x, 124], [x + 80, 124], [x + 40, 150]], x % 160 ? '#2f6f4a' : '#e9e2c8', 2.5);
  poly(c, [[0, 360], [W, 360], [W, H], [0, H]], '#8e8a80');
  // поддон с углём и жидкостью для розжига
  rr(c, 60, 470, 380, 24, 3, '#a4783f', 3); for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) rr(c, 72 + k * 90, 390 - r * 62, 84, 82, 8, r % 2 ? '#2b2b2b' : '#3a3a3a', 3);
  for (let k = 0; k < 4; k++) { rr(c, 80 + k * 90, 220, 26, 44, 4, '#e9c43a', 2.5); rr(c, 86 + k * 90, 210, 14, 12, 3, '#d04a2f', 2); }
  // мешки с грунтом
  for (let k = 0; k < 4; k++) rr(c, 500 + k * 96, 430, 90, 120, 18, '#5a7d3a', 3.5);
  // стойка с семенами
  rr(c, 900, 200, 320, 320, 6, '#e8e0cc', 4); for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) rr(c, 914 + k * 50, 214 + r * 60, 42, 52, 3, ['#e65b3a', '#f2c230', '#5aa05a', '#8a5bb0', '#e88aa8'][(r + k) % 5], 2);
  // садовые фонарики на земле
  for (let k = 0; k < 9; k++) { const x = 480 + k * 80, y = 640; c.strokeStyle = INK; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 50); c.stroke(); rr(c, x - 12, y - 70, 24, 22, 4, dark ? '#e8f6ff' : '#cfd8de', 2.5); if (dark) glow(c, x, y - 60, 60, '#d8f0ff', 0.55); }
  if (dark) { c.fillStyle = 'rgba(6,9,24,0.55)'; c.fillRect(0, 0, W, H); }
  finish(c, W, H, 0.4);
}

// ---- 5. Дорога ночью, за спиной зарево
export function drawRoad(c, o = {}) {
  seed = 85; sky(c, 0, W, 380, 'fire'); skyline(c, 0, W, 400, { col: '#140c14', rim: 'rgba(255,140,60,0.4)' });
  glow(c, 200, 380, 500, '#ff6a20', 0.45);
  poly(c, [[0, 400], [W, 400], [W, H], [0, H]], '#1b1820');
  poly(c, [[560, 400], [720, 400], [1100, H], [180, H]], '#2a2730', 2.5);
  c.strokeStyle = 'rgba(240,220,160,0.5)'; c.lineWidth = 6; c.setLineDash([40, 40]); c.beginPath(); c.moveTo(640, 405); c.lineTo(640, H); c.stroke(); c.setLineDash([]);
  for (const [x, s] of [[120, 1], [1140, 1.1], [400, 0.6], [880, 0.6]]) { c.strokeStyle = '#0a070c'; c.lineWidth = 10 * s; c.beginPath(); c.moveTo(x, 640); c.lineTo(x, 640 - 260 * s); c.stroke();
    for (let k = 0; k < 6; k++) { c.lineWidth = 4 * s; c.beginPath(); const y = 640 - 120 * s - k * 22 * s; c.moveTo(x, y); c.lineTo(x + (k % 2 ? 1 : -1) * (40 + k * 6) * s, y - 40 * s); c.stroke(); } }
  // брошенная машина
  rr(c, 900, 470, 200, 60, 14, '#2d2a33', 3); poly(c, [[940, 470], [960, 430], [1050, 430], [1075, 470]], '#2d2a33', 3);
  finish(c, W, H, 0.55);
}

// ---- 6. Лагерь у реки: деревянные дома со светом в окнах, мельница с колесом, река
export function drawCamp(c, o = {}) {
  seed = 96; const kind = o.sky || 'dusk', lit = o.lit !== false;
  sky(c, 0, W, 360, kind);
  // холмы
  poly(c, [[0, 360], [200, 300], [460, 340], [760, 280], [1040, 330], [W, 290], [W, 420], [0, 420]], kind === 'day' ? '#5f8f5a' : '#2c3b3a');
  // река
  const rv = c.createLinearGradient(0, 520, 0, H); rv.addColorStop(0, kind === 'day' ? '#4f8fc0' : '#1f3550'); rv.addColorStop(1, kind === 'day' ? '#2f6a9a' : '#122238');
  poly(c, [[0, 540], [W, 500], [W, H], [0, H]], rv); c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 3; for (let i = 0; i < 14; i++) { const x = rnd() * W, y = 560 + rnd() * 140; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40, y); c.stroke(); }
  poly(c, [[0, 420], [W, 400], [W, 505], [0, 545]], kind === 'day' ? '#7a9a5a' : '#2a3530');
  // дома
  for (const [x, y, w] of [[60, 440, 150], [240, 425, 130], [420, 430, 160], [880, 405, 140], [1060, 410, 150]]) {
    poly(c, [[x, y], [x + w, y], [x + w, y - 90], [x, y - 90]], '#8a5e3b', 3); poly(c, [[x - 12, y - 88], [x + w / 2, y - 150], [x + w + 12, y - 88]], '#5a3a26', 3);
    for (let k = 0; k < 2; k++) { rr(c, x + 20 + k * (w - 70), y - 70, 30, 30, 2, lit ? '#ffd37a' : '#2a2f3a', 2.5); if (lit) glow(c, x + 35 + k * (w - 70), y - 55, 70, '#ffb24a', 0.5); }
    for (let k = 1; k < 4; k++) { c.strokeStyle = 'rgba(40,20,10,0.4)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y - k * 22); c.lineTo(x + w, y - k * 22); c.stroke(); }
  }
  // мельница с колесом
  poly(c, [[620, 470], [800, 460], [800, 330], [620, 340]], '#9a7a58', 3.5); poly(c, [[608, 342], [710, 270], [812, 332]], '#6a4a32', 3.5); rr(c, 680, 360, 40, 40, 2, lit ? '#ffe08a' : '#2a2f3a', 2.5); if (lit) glow(c, 700, 380, 90, '#ffc860', 0.6);
  c.save(); c.translate(600, 480); c.strokeStyle = INK; c.lineWidth = 5; c.beginPath(); c.arc(0, 0, 70, 0, 7); c.stroke(); c.strokeStyle = '#6a4a32'; c.lineWidth = 3;
  for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5 + (o.wheel || 0); c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 70, Math.sin(a) * 70); c.stroke(); rr(c, Math.cos(a) * 66 - 9, Math.sin(a) * 66 - 9, 18, 18, 2, '#7a5a3a', 2); } c.restore();
  // столбы с проводами и лампочками
  if (lit) for (let i = 0; i < 6; i++) { const x = 120 + i * 210; c.strokeStyle = '#3a2a20'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, 520); c.lineTo(x, 400); c.stroke(); c.fillStyle = '#fff2c0'; c.beginPath(); c.arc(x, 400, 8, 0, 7); c.fill(); glow(c, x, 400, 70, '#ffd88a', 0.5); }
  finish(c, W, H, 0.4);
}

// ---- 7. Город через реку: огни (lit: доля горящих окон)
export function drawCity(c, o = {}) {
  seed = 107; sky(c, 0, W, 420, o.sky || 'night'); skyline(c, 0, W, 470, { lit: o.lit || 0, col: '#0c1426' });
  const rv = c.createLinearGradient(0, 470, 0, 600); rv.addColorStop(0, '#0f1c34'); rv.addColorStop(1, '#0a1222'); poly(c, [[0, 470], [W, 470], [W, 600], [0, 600]], rv);
  if (o.lit) for (let i = 0; i < 60; i++) { const x = rnd() * W; c.strokeStyle = `rgba(255,210,122,${0.2 + rnd() * 0.3})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, 480 + rnd() * 20); c.lineTo(x, 520 + rnd() * 60); c.stroke(); }
  poly(c, [[0, 600], [W, 590], [W, H], [0, H]], '#1b2418'); for (let i = 0; i < 40; i++) { c.strokeStyle = '#2c3a24'; c.lineWidth = 3; const x = rnd() * W; c.beginPath(); c.moveTo(x, 640); c.lineTo(x + 6, 600 - rnd() * 20); c.stroke(); }
  finish(c, W, H, 0.45);
}
