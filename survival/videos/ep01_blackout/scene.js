// Эпизод 1 «What If the Power Went Out for 10 Years?» — раскадровка по plan.json (блоки сценария с таймингами озвучки).
import { drawHero } from '../../styles/stick/hero.js';
import { drawStick } from '../../styles/stick/stickman.js';
import { drawAisle, drawEntrance, drawParking, glow, INK } from '../../styles/stick/bgai.js';
import * as B from '../../styles/stick/bg_ep01.js';
import { keys, smooth, clamp, lerp, blink, walk, camera } from '../../styles/stick/anim.js';

const W = 1280, H = 720, FONT = 'Anton';
let plan, BG = {}, grain = [];
const off = () => { const k = document.createElement('canvas'); k.width = W; k.height = H; return k; };
const hash = n => { let x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

// ---------- фоны (кэш)
const BGS = {
  aisle: c => drawAisle(c), entrance: c => drawEntrance(c),
  parking_lit: c => drawParking(c, W, H, { sky: (g, w, h) => B.aurora(g, 0, w, h) }),
  parking_day: c => drawParking(c, W, H, { day: true, dead: true }), parking_night: c => drawParking(c, W, H, { dead: true }),
  backroom: c => B.drawBackroom(c), backroom_b: c => B.drawBackroom(c, { barrels: true }), backroom_dark: c => B.drawBackroom(c, { dark: true, barrels: true }),
  roof: c => B.drawRoof(c, { sky: 'day' }), roof_night: c => B.drawRoof(c, { sky: 'aurora' }), roof_snow: c => B.drawRoof(c, { sky: 'snow', garden: true }), roof_garden: c => B.drawRoof(c, { sky: 'day', garden: true }),
  cooler: c => B.drawCooler(c), cooler_m: c => B.drawCooler(c, { marta: true }),
  garden: c => B.drawGarden(c), garden_dark: c => B.drawGarden(c, { dark: true }),
  road: c => B.drawRoad(c), camp: c => B.drawCamp(c), camp_day: c => B.drawCamp(c, { sky: 'day', lit: false }),
  city0: c => B.drawCity(c, { lit: 0 }), city1: c => B.drawCity(c, { lit: 0.3 }),
};
const bg = k => { if (!BG[k]) { BG[k] = off(); BGS[k](BG[k].getContext('2d')); } return BG[k]; };

// локация → фон, затемнение, место героя
const LOC = {
  aisle: { bg: 'aisle', hero: [560, 690, 58] }, aisle_dark: { bg: 'aisle', dark: 0.72, hero: [560, 690, 58] }, aisle_snow: { bg: 'aisle', dark: 0.6, snow: true, hero: [560, 690, 58] },
  entrance: { bg: 'entrance', dark: 0.45, hero: [640, 700, 64] }, entrance_dark: { bg: 'entrance', dark: 0.62, hero: [640, 700, 64] }, entrance_aurora: { bg: 'entrance', aurora: true, hero: [640, 700, 64] },
  store_fire: { bg: 'entrance', dark: 0.5, fire: true, hero: [640, 705, 64] },
  parking_aurora: { bg: 'parking_lit' }, parking_day: { bg: 'parking_day' }, parking_night: { bg: 'parking_night' }, hardware_night: { bg: 'parking_night', blink: true },
  stockroom: { bg: 'backroom', hero: [470, 690, 60] }, loading_dock: { bg: 'backroom_dark', hero: [640, 700, 62] }, loading_dock_day: { bg: 'backroom_b', hero: [560, 700, 62] }, loading_dock_night: { bg: 'backroom_dark', hero: [400, 700, 62] },
  roof: { bg: 'roof', hero: [300, 700, 62] }, roof_night: { bg: 'roof_night', hero: [300, 700, 62] }, roof_snow: { bg: 'roof_snow', hero: [300, 700, 62] }, roof_garden: { bg: 'roof_garden', hero: [380, 700, 62] },
  cooler: { bg: 'cooler', hero: [430, 700, 62] }, garden: { bg: 'garden', hero: [700, 700, 62] }, garden_night: { bg: 'garden_dark', hero: [700, 700, 62] }, garden_dark: { bg: 'garden_dark', hero: [700, 700, 62] },
  road_night: { bg: 'road', hero: [640, 700, 60] }, camp_lights: { bg: 'camp', hero: [640, 705, 60] }, camp: { bg: 'camp', hero: [640, 705, 60] }, camp_day: { bg: 'camp_day', hero: [640, 705, 60] },
  city_lights: { bg: 'city0', city: true, hero: [640, 705, 62] },
};
const MARTA = { skin: '#eceeea', top: '#7a5aa0', topSh: '#5e4580', shoes: '#4a3a30', hair: '#d9d9d9', kind: 'jacket' };
const ROYCE = { skin: '#e7e9e4', top: '#f07a2a', topSh: '#c95e18', shoes: '#2a2a2a', hair: '#3a2a20', kind: 'jacket' };

export function setup(p) {
  plan = p;
  for (let i = 0; i < 4; i++) { const g = off(), c = g.getContext('2d'), d = c.createImageData(W, H);
    for (let q = 0; q < d.data.length; q += 4) { const v = Math.random() * 255; d.data[q] = d.data[q + 1] = d.data[q + 2] = v; d.data[q + 3] = 13; } c.putImageData(d, 0, 0); grain.push(g); }
  for (const b of plan.blocks) if (b.d.loc && LOC[b.d.loc]) bg(LOC[b.d.loc].bg); bg('city1'); bg('cooler_m');
}

// ---------- текст
function text(c, s, x, y, size, col = '#fff', align = 'center', stroke = 0.14) {
  c.save(); c.font = `${size}px ${FONT}`; c.textAlign = align; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = size * stroke; c.strokeStyle = '#05070d'; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y); c.restore();
}
const pop = (t, at, d = 0.35) => { const u = clamp((t - at) / d); return u <= 0 ? 0 : 1 + 0.15 * Math.sin(u * Math.PI) * (1 - u) + (smooth(u) - 1); };

// ---------- сцена-локация
function drawLoc(c, b, t) {
  const L = LOC[b.d.loc] || LOC.aisle, u = t - b.s, dur = b.e - b.s, segN = Math.max(1, Math.round(dur / 4.3)), seg = Math.min(segN - 1, Math.floor(u / (dur / segN))), su = u - seg * dur / segN, sd = dur / segN;
  const [hx, hy, hr] = L.hero || [640, 700, 60], heroOn = b.d.hero && b.d.hero !== 'none' && L.hero;
  // план кадра
  const backView = heroOn && /^back/.test(b.d.hero), kinds = heroOn ? (backView ? ['wide', 'med2', 'wide2'] : ['wide', 'med', 'close', 'med2']) : ['wide', 'pan', 'wide2'];
  const kind = b.d.cam === 'static' && seg === 0 ? 'wide' : kinds[(seg + b.i) % kinds.length];
  let z = 1, fx = 640, fy = 360;
  if (kind === 'wide') { z = lerp(1.0, 1.06, su / sd); }
  else if (kind === 'wide2') { z = lerp(1.08, 1.02, su / sd); }
  else if (kind === 'pan') { z = 1.15; fx = lerp(520, 760, su / sd); }
  else if (kind === 'med') { z = lerp(1.45, 1.52, su / sd); fx = hx; fy = hy - hr * 3.2; }
  else if (kind === 'med2') { z = lerp(1.35, 1.42, su / sd); fx = hx + 60; fy = hy - hr * 3; }
  else if (kind === 'close') { z = lerp(2.3, 2.42, su / sd); fx = hx; fy = hy - hr * 4.6; }
  const shake = b.d.cam === 'shake' ? Math.sin(t * 60) * 4 * Math.exp(-((u % 2) * 2)) : 0;
  c.save(); c.translate(shake, 0); camera(c, z, fx, fy);
  c.drawImage(bg(b.d.marta_bed ? 'cooler_m' : L.bg), 0, 0);
  if (L.city) { c.save(); c.globalAlpha = clamp(u / Math.max(4, dur * 0.7)); c.drawImage(bg('city1'), 0, 0); c.restore(); }
  if (L.aurora) { c.save(); c.beginPath(); c.rect(62, 104, 1156, 260); c.clip(); B.aurora(c, 62, 1218, 360, 0.9); c.restore(); }
  if (L.blink && Math.floor(t * 2.5) % 3 !== 2) glow(c, 680, 400, 60, '#ffffff', 0.9);
  if (b.d.convoy) for (let k = 0; k < 6; k++) { const x = ((u * 70 + k * 260) % 1700) - 200; c.fillStyle = ['#c9a23a', '#7a2f2a', '#3a5a3a'][k % 3]; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.roundRect(x, 470, k % 3 === 0 ? 220 : 130, 50, 8); c.fill(); c.stroke(); c.fillStyle = INK; for (const wx of [20, 100]) { c.beginPath(); c.arc(x + wx, 522, 14, 0, 7); c.fill(); } }
  if (b.d.trucks && L.bg.startsWith('parking')) for (let k = 0; k < 4; k++) { const x = 120 + k * 290; c.fillStyle = '#2a2d36'; c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.roundRect(x, 450, 200, 80, 8); c.fill(); c.stroke(); glow(c, x + 190, 500, 160, '#fff2c0', 0.5); }
  if (b.d.cart_line) { c.strokeStyle = '#e8e2d0'; c.lineWidth = 3; c.beginPath(); c.moveTo(40, 300); c.quadraticCurveTo(640, 380, 1240, 300); c.stroke(); const k = (Math.sin(u * 0.6) + 1) / 2, bx = lerp(140, 1140, k), by = 300 + 80 * 4 * k * (1 - k); c.strokeStyle = '#c9ced4'; c.lineWidth = 3; c.strokeRect(bx - 30, by + 10, 60, 40); }
  // затемнение и фонарь
  const dark = L.dark || 0;
  // герой
  let lampOn = b.d.lamp === 'on' || dark > 0.5, view = 'front', facing = 1, mood = b.d.mood || 'neutral', X = hx, Y = hy, pose = {};
  if (heroOn) {
    const hs = b.d.hero.split(':');
    if (hs[0] === 'back') view = 'back'; if (hs[0] === 'side') { view = 'side'; facing = hs[1] === 'left' ? -1 : 1; mood = hs[2] || mood; } if (hs[0] === 'front') mood = hs[1] || mood;
    if (hs[0] === 'walk') { const dir = hs[1] === 'left' ? -1 : 1, w = walk(u, { x0: hx - dir * 420, x1: hx, t0: 0.2, t1: Math.min(3.6, dur * 0.6), R: hr, Y: hy });
      X = w.X; Y = w.Y; pose = { legL: w.legL, legR: w.legR, armL: w.armL, armR: hs[2] === 'box' ? [0.35, 1.0] : w.armR, groundDy: w.groundDy }; }
    // вариации позы на каждом плане
    const look = [[0, 0], [-6, -2], [6, -1], [0, -5]][(seg + b.i) % 4];
    if (!pose.armL) { const g = (seg + b.i) % 3; pose.armL = mood === 'worried' && g === 1 ? [-2.2, -1.2] : mood === 'scared' ? [-0.7, -0.5] : [-0.12 + 0.03 * Math.sin(t * 1.3), 0.05];
      pose.armR = mood === 'determined' && g === 2 ? [0.9, 1.4] : mood === 'scared' ? [0.7, 0.5] : [0.12 - 0.03 * Math.sin(t * 1.3), -0.05]; }
    if (b.d.marta) drawStick(c, hx + 300, hy, hr * 0.95, { outfit: MARTA, mood: 'neutral', look: [-6, 0], armR: [0.25, 0.1], blink: blink(t, 11) });
    if (b.d.marta_bed) {}
    if (b.d.collector) drawStick(c, hx + 330, hy + 5, hr * 1.05, { outfit: ROYCE, mood: 'determined', look: [-6, 0], armL: [-0.5, -1.4], blink: blink(t, 13) });
    const breath = Math.sin(t * 1.6) * hr * 0.02;
    drawHero(c, X, Y + breath, hr, { view, facing, mood, look: view === 'front' ? look : [0, 0], blink: blink(t, b.i + 3), lamp: lampOn, beam: view === 'side' && lampOn ? 0.05 : null, sweat: mood === 'worried', ...pose });
  }
  c.restore();
  if (dark) { // полумрак со световым пятном фонаря
    const lx = (X - fx) * z + 640, ly = (Y - hr * 5.3 - fy) * z + 360;
    const g = c.createRadialGradient(lx, ly + 150 * z, 10 * z, lx, ly + 150 * z, (lampOn && heroOn ? 300 : 10) * z);
    g.addColorStop(0, `rgba(5,8,22,${dark * 0.1})`); g.addColorStop(0.55, `rgba(5,8,22,${dark * 0.75})`); g.addColorStop(1, `rgba(5,8,22,${Math.min(0.9, dark * 1.15)})`); c.fillStyle = heroOn ? g : `rgba(5,8,22,${dark})`; c.fillRect(0, 0, W, H);
  }
  if (b.d.sparks) { const fl = hash(Math.floor(t * 12)) < 0.35; if (fl) { c.fillStyle = 'rgba(255,250,220,0.25)'; c.fillRect(0, 0, W, H); }
    for (let k = 0; k < 24; k++) { const p = (t * 1.3 + hash(k)) % 1, x = 640 + (hash(k + 9) - 0.5) * 300 * p, y = 120 + p * p * 500; c.fillStyle = '#fff2a8'; c.fillRect(x, y, 3, 8); } }
  if (L.fire) { const k = clamp(u / 1.5); for (let i = 0; i < 40; i++) { const x = i * 34 + Math.sin(t * 7 + i) * 8, h = (90 + 70 * hash(i + Math.floor(t * 8))) * k;
      const g = c.createLinearGradient(0, 640 - h, 0, 640); g.addColorStop(0, 'rgba(255,220,90,0)'); g.addColorStop(0.4, 'rgba(255,140,30,0.85)'); g.addColorStop(1, 'rgba(200,40,10,0.95)'); c.fillStyle = g; c.beginPath(); c.moveTo(x - 30, 640); c.quadraticCurveTo(x, 640 - h * 1.3, x + 30, 640); c.fill(); }
    glow(c, 640, 600, 700, '#ff7a20', 0.35 * k); c.fillStyle = `rgba(30,20,20,${0.35 * k})`; c.fillRect(0, 0, W, 260); }
  if (L.snow) { c.fillStyle = 'rgba(220,235,255,0.12)'; c.fillRect(0, 0, W, H); for (let k = 0; k < 60; k++) { const x = (hash(k) * W + t * 20) % W, y = (hash(k + 5) * H + t * 40) % H; c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(x, y, 2, 0, 7); c.fill(); } }
}

// ---------- инфографика
function panel(c) { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0d1630'); g.addColorStop(1, '#162447'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.strokeStyle = 'rgba(120,160,255,0.06)'; c.lineWidth = 1; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } }
const circleIcon = (c, x, y, r, col, s) => { c.save(); c.translate(x, y); c.scale(s, s); c.beginPath(); c.arc(0, 0, r, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 6; c.strokeStyle = '#05070d'; c.stroke(); c.restore(); };
function drawInfo(c, b, t) {
  const u = t - b.s, dur = b.e - b.s, f = u / dur, k = b.d.info; panel(c);
  c.save(); const z = 1 + 0.03 * f; camera(c, z, 640, 360);
  const at = q => pop(u, q * dur);
  if (k === 'threats') { const items = [['FOOD', '#e9a23b'], ['WATER', '#3f8fd9'], ['COLD', '#9fd8ff'], ['PEOPLE', '#d9473b']];
    items.forEach(([n, col], i) => { const s = at(i * 0.18), x = 220 + i * 280; circleIcon(c, x, 330, 90, col, s); if (s) text(c, n, x, 470, 52); if (i === 0 && f > 0.25) { c.strokeStyle = '#5adc7a'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 40, 260); c.lineTo(x + 65, 290); c.lineTo(x + 110, 220); c.stroke(); } if (i > 0 && f > 0.3 + i * 0.15) text(c, '!', x + 70, 260, 80, '#ff5a4a'); }); }
  else if (k === 'sun_storm') { glow(c, 160, 360, 300, '#ffb030', 0.9); circleIcon(c, 160, 360, 120, '#ffb43a', 1);
    for (let i = 0; i < 14; i++) { const p = (u * 0.35 + i / 14) % 1, x = 300 + p * 640, y = 360 + Math.sin(i * 2.1) * 120 * p; c.fillStyle = `rgba(255,200,90,${1 - p})`; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }
    circleIcon(c, 1040, 360, 90, '#3f8fd9', at(0.15)); if (at(0.15)) { c.strokeStyle = 'rgba(120,255,200,0.7)'; c.lineWidth = 4; for (let r = 120; r < 220; r += 30) { c.beginPath(); c.ellipse(1040, 360, r, r * 0.6, 0, 0, 7); c.stroke(); } }
    text(c, 'SOLAR STORM', 640, 110, 76); if (f > 0.5) { for (let i = 0; i < 5; i++) { const x = 900 + i * 60; c.strokeStyle = '#ffe070'; c.lineWidth = 5; c.beginPath(); c.moveTo(x, 560); c.lineTo(x + 30, 600); c.lineTo(x, 640); c.stroke(); } text(c, 'POWER LINES = ANTENNAS', 640, 590, 44, '#ffe070'); } }
  else if (k === 'history') { const y = b.d.year; text(c, y, 640, 300, 210 * (at(0) || 0.01), '#ffd27a');
    text(c, y === '1859' ? 'THE CARRINGTON EVENT' : 'QUEBEC: 6 MILLION IN THE DARK', 640, 480, 58);
    if (y === '1859' && f > 0.4) text(c, 'TELEGRAPH PAPER CAUGHT FIRE', 640, 570, 40, '#ff9a5a'); if (y === '1989' && f > 0.4) text(c, '90 SECONDS · 9 HOURS', 640, 570, 44, '#9fd8ff'); }
  else if (k === 'transformer') { c.save(); c.translate(380, 420); c.scale(at(0), at(0)); c.fillStyle = '#6a7484'; c.strokeStyle = '#05070d'; c.lineWidth = 6; c.beginPath(); c.roundRect(-200, -220, 400, 260, 14); c.fill(); c.stroke();
      for (let i = 0; i < 4; i++) { c.beginPath(); c.roundRect(-170 + i * 95, -300, 40, 90, 10); c.fillStyle = '#c9ced4'; c.fill(); c.stroke(); } if (f > 0.55) { glow(c, 0, -100, 220, '#ff6a20', 0.7); } c.restore();
    text(c, '= 200 CARS', 960, 300, 80, '#fff', 'center'); if (f > 0.3) for (let i = 0; i < 20; i++) { c.fillStyle = '#9fb3cc'; c.fillRect(760 + (i % 10) * 42, 380 + Math.floor(i / 10) * 30, 34, 18); }
    if (f > 0.65) text(c, 'TAKES YEARS TO BUILD', 640, 590, 54, '#ffd27a'); }
  else if (k === 'whatif') { text(c, 'WHAT IF', 640, 280, 140 * at(0), '#ffd27a'); if (f > 0.35) text(c, 'IT TAKES 10 YEARS?', 640, 430, 80); if (f > 0.65) text(c, 'EVERYTHING ELSE: REAL', 640, 560, 46, '#9fd8ff'); }
  else if (k === 'can') { c.save(); c.translate(420, 380); c.scale(at(0), at(0)); c.fillStyle = '#c9ced4'; c.strokeStyle = '#05070d'; c.lineWidth = 6; c.beginPath(); c.roundRect(-110, -150, 220, 300, 20); c.fill(); c.stroke(); c.fillStyle = '#d9473b'; c.fillRect(-108, -70, 216, 130); c.strokeRect(-108, -70, 216, 130); c.restore();
    text(c, '1865', 880, 260, 140 * at(0.15), '#ffd27a'); if (f > 0.35) text(c, 'OPENED IN 1974', 880, 400, 60); if (f > 0.6) text(c, 'STILL SAFE', 880, 500, 70, '#5adc7a'); }
  else if (k === 'water_pumps') { const xs = [200, 520, 840, 1120]; const lab = ['PUMP', 'TOWER', 'GRAVITY', 'TAP'];
    xs.forEach((x, i) => { const s = at(i * 0.15); circleIcon(c, x, 360, 80, ['#6a7484', '#3f8fd9', '#9fd8ff', '#c9ced4'][i], s); if (s) text(c, lab[i], x, 490, 46); if (i < 3 && s) { c.strokeStyle = '#9fd8ff'; c.lineWidth = 8; c.beginPath(); c.moveTo(x + 95, 360); c.lineTo(xs[i + 1] - 95, 360); c.stroke(); } });
    if (f > 0.6) { text(c, 'NO POWER', 200, 200, 52, '#ff5a4a'); c.strokeStyle = '#ff5a4a'; c.lineWidth = 12; c.beginPath(); c.moveTo(130, 290); c.lineTo(270, 430); c.stroke(); } }
  else if (k === 'question' || k === 'final' || k === 'choice') { const lines = k === 'choice' ? ['TAKE THE SEAT?', 'SAY NO?', 'SOMETHING ELSE?'] : k === 'final' ? ['WAS IT A MISTAKE?'] : ['OPEN THE DOOR?'];
    c.fillStyle = '#ffffff'; c.strokeStyle = '#05070d'; c.lineWidth = 8; c.beginPath(); c.roundRect(240, 150, 800, 300 + (lines.length - 1) * 40, 40); c.fill(); c.stroke(); c.beginPath(); c.moveTo(420, 440 + (lines.length - 1) * 40); c.lineTo(380, 540); c.lineTo(500, 448 + (lines.length - 1) * 40); c.fill(); c.stroke();
    lines.forEach((l, i) => { if (at(0.1 + i * 0.15)) { c.save(); c.font = `64px ${FONT}`; c.fillStyle = '#0d1630'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(l, 640, (lines.length === 1 ? 300 : 230) + i * 95); c.restore(); } });
    text(c, 'WRITE IT IN THE COMMENTS', 640, 590, 50, '#ffd27a'); }
  else if (k === 'roof_rain') { c.fillStyle = '#6a7484'; c.fillRect(140, 200, 1000, 40); for (let i = 0; i < 40; i++) { const x = 160 + (i * 97) % 980, y = 40 + ((u * 300 + i * 53) % 160); c.strokeStyle = '#9fd8ff'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 6, y + 18); c.stroke(); }
    c.strokeStyle = '#c9ced4'; c.lineWidth = 14; c.beginPath(); c.moveTo(1140, 240); c.lineTo(1140, 420); c.lineTo(300, 420); c.stroke(); for (let i = 0; i < 6; i++) { const s = at(0.2 + i * 0.06); if (s) circleIcon(c, 300 + i * 150, 530, 60, '#2f7fc1', s); }
    text(c, '1 INCH OF RAIN = 50,000 GALLONS', 640, 590, 50, '#ffd27a'); }
  else if (k === 'sodis') { glow(c, 1080, 160, 240, '#ffcf40', 0.9); circleIcon(c, 1080, 160, 80, '#ffcf40', 1); for (let i = 0; i < 6; i++) { const s = at(i * 0.08), x = 180 + i * 140; c.save(); c.translate(x, 460); c.scale(s, s); c.fillStyle = 'rgba(160,220,255,0.6)'; c.strokeStyle = '#05070d'; c.lineWidth = 5; c.beginPath(); c.roundRect(-35, -110, 70, 180, 16); c.fill(); c.stroke(); c.restore(); }
    text(c, '6 HOURS OF SUN', 420, 160, 72, '#ffd27a'); if (f > 0.5) text(c, 'UV KILLS MOST GERMS', 640, 590, 52, '#5adc7a'); }
  else if (k === 'rules') { c.fillStyle = '#f4f4f0'; c.strokeStyle = '#05070d'; c.lineWidth = 8; c.beginPath(); c.roundRect(170, 90, 940, 540, 16); c.fill(); c.stroke();
    ['1. NEVER OPEN THE FRONT DOORS', '2. NO LIGHT NEAR THE WINDOWS', '3. COUNT THE FOOD EVERY SUNDAY', '4. NEVER FIRE ANYTHING INDOORS'].forEach((r, i) => { if (f > i * 0.22) { c.save(); c.font = `52px ${FONT}`; c.fillStyle = i === 3 ? '#c62828' : '#1a2a5a'; c.fillText(r, 220, 200 + i * 115); if (i === 3 && f > 0.9) { c.fillRect(220, 225 + i * 115, 760, 6); c.fillRect(220, 237 + i * 115, 760, 6); } c.restore(); } }); }
  else if (k === 'co') { circleIcon(c, 360, 380, 120, '#6a7484', at(0)); text(c, 'GENERATOR', 360, 560, 50); for (let i = 0; i < 8; i++) { const p = (u * 0.3 + i / 8) % 1; c.fillStyle = `rgba(200,200,210,${0.4 * (1 - p)})`; c.beginPath(); c.arc(520 + p * 400, 360 - p * 120, 30 + p * 50, 0, 7); c.fill(); }
    text(c, 'CO', 880, 300, 160 * at(0.2), '#ff5a4a'); if (f > 0.5) text(c, 'INVISIBLE · NO SMELL', 880, 460, 46); }
  else if (k === 'cooler') { for (let i = 0; i < 2; i++) { const s = at(i * 0.2), x = 460 + i * 360; glow(c, x, 330, 200 * s, '#ffcf70', 0.7); circleIcon(c, x, 330, 90, '#ffe9a8', s); if (s) text(c, '100 W', x, 480, 60); } text(c, '1 PERSON = 1 LIGHT BULB', 640, 590, 54, '#ffd27a'); }
  else if (k === 'scurvy') { text(c, 'VITAMIN C', 640, 230, 120 * at(0), '#ffb43a'); if (f > 0.3) text(c, '0', 640, 400, 160, '#ff5a4a'); if (f > 0.55) text(c, 'SCURVY: BLEEDING GUMS · WOUNDS WON\'T HEAL', 640, 580, 44); }
  else if (k === 'cart_line') { c.strokeStyle = '#e8e2d0'; c.lineWidth = 5; c.beginPath(); c.moveTo(80, 260); c.quadraticCurveTo(640, 360, 1200, 260); c.stroke(); circleIcon(c, 80, 300, 60, '#2f6468', 1); circleIcon(c, 1200, 300, 60, '#c9483f', 1); const p = (Math.sin(u) + 1) / 2, x = lerp(140, 1140, p); c.strokeStyle = '#c9ced4'; c.lineWidth = 5; c.strokeRect(x - 40, 300 + 70 * 4 * p * (1 - p), 80, 50);
    text(c, 'FOOD', 80, 420, 48, '#e9a23b'); text(c, 'TOOLS · STOVE', 1200, 420, 44, '#9fd8ff'); text(c, '500 FT', 640, 560, 70, '#ffd27a'); }
  else if (k === 'gas') { circleIcon(c, 420, 380, 120, '#d9473b', at(0)); text(c, 'GAS', 420, 380, 90); text(c, '< 1 YEAR', 880, 330, 110 * at(0.2), '#ffd27a'); if (f > 0.5) text(c, 'GASOLINE GOES BAD', 880, 470, 54); }
  else if (k === 'notebook') { c.save(); c.translate(640, 380); c.rotate(-0.04); c.fillStyle = '#f6f1e2'; c.strokeStyle = '#05070d'; c.lineWidth = 7; c.beginPath(); c.roundRect(-380, -240, 760, 480, 10); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(80,120,200,0.35)'; c.lineWidth = 2; for (let y = -180; y < 220; y += 50) { c.beginPath(); c.moveTo(-340, y); c.lineTo(340, y); c.stroke(); }
      const s = 'Leave before the store decides for you.', n = Math.floor(clamp(f * 1.4) * s.length); c.font = 'italic 46px serif'; c.fillStyle = '#1a2a5a'; c.textAlign = 'center'; c.fillText(s.slice(0, n), 0, 10); c.restore(); }
  else if (k === 'hydro') { c.save(); c.translate(380, 380); c.rotate(u * 1.2); c.strokeStyle = '#c9a26a'; c.lineWidth = 10; c.beginPath(); c.arc(0, 0, 150, 0, 7); c.stroke(); for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(i * 0.785) * 150, Math.sin(i * 0.785) * 150); c.stroke(); } c.restore();
    c.strokeStyle = '#ffd27a'; c.lineWidth = 8; c.beginPath(); c.moveTo(560, 380); c.lineTo(820, 380); c.stroke(); const s = at(0.3); glow(c, 960, 360, 260 * s, '#ffe08a', 0.9); circleIcon(c, 960, 360, 80, '#fff2c0', s); text(c, 'NO GRID NEEDED', 640, 590, 60, '#5adc7a'); }
  else { text(c, (k || '').toUpperCase(), 640, 360, 90); }
  c.restore();
}

// ---------- HUD, заставки, субтитры
function hud(c, t) { let v = null; for (const b of plan.blocks) { if (b.s > t) break; if (b.d.hud) v = b.d.hud; } if (!v || v === 'off') return;
  const [k, n] = v.split(':'); const label = `${k.toUpperCase()} ${n}`;
  c.save(); c.globalAlpha = 0.92; c.fillStyle = 'rgba(5,8,20,0.55)'; c.beginPath(); c.roundRect(24, 22, 40 + label.length * 22, 62, 12); c.fill();
  c.fillStyle = '#d9473b'; c.fillRect(38, 36, 30, 34); c.fillStyle = '#fff'; c.fillRect(38, 44, 30, 26); c.restore(); text(c, label, 82, 54, 42, '#fff', 'left', 0.1); }
function card(c, b, t) { const u = t - b.s; if (!b.d.card || u > b.cardDur) return false;
  const [k, n] = b.d.card.split(':'); c.fillStyle = '#05070d'; c.fillRect(0, 0, W, H); const a = clamp(u / 0.25) * clamp((b.cardDur - u) / 0.25), s = 1 + 0.05 * u;
  c.save(); c.globalAlpha = a; c.translate(640, 360); c.scale(s, s); text(c, `${k.toUpperCase()} ${Number(n).toLocaleString('en-US')}`, 0, 0, 130); c.restore(); return true; }
function subs(c, t) { const g = plan.subs.find(x => t >= x.s && t < x.e); if (!g) return; text(c, g.t.toUpperCase(), 640, 676, 36, '#ffffff', 'center', 0.22); }

export function frame(c, t) {
  c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  let b = plan.blocks.find(x => t >= x.s && t < x.e) || plan.blocks[plan.blocks.length - 1];
  if (!card(c, b, t)) { const bb = { ...b, s: b.s + (b.cardDur || 0) }; if (b.d.info) drawInfo(c, bb, t); else drawLoc(c, bb, t); hud(c, t); }
  c.drawImage(grain[Math.floor(t * 12) % 4], 0, 0);
  subs(c, t);
  const d = Math.max(1 - t / 0.4, 1 - (plan.duration - t) / 1.0); if (d > 0) { c.fillStyle = `rgba(0,0,0,${clamp(d)})`; c.fillRect(0, 0, W, H); }
}
