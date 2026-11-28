// Плоский 2D-герой (canvas). Рисуется на отдельном холсте 400x700, ноги внизу по центру.
// Части рисуются отдельно, поэтому позы и эмоции меняются параметрами: o.armL/o.armR (угол), o.headTilt, o.mood.
export function drawHero2D(cv, o = {}) {
  const P = { skin: '#f7f3ec', skinSh: '#dcd6cc', hat: '#f4b41a', hatSh: '#d4940c', hair: '#7a4a26', hood: '#8d9199', hoodSh: '#72767e', dark: '#1d1d22', shoe: '#b4bac2', sole: '#f2f2f2', ink: '#16161c', ...o.pal };
  const x = cv.getContext('2d'); cv.width = 400; cv.height = 700; x.clearRect(0, 0, 400, 700);
  const lw = o.lineW ?? 5, ink = o.outline === null ? null : (o.outline || P.ink);
  x.lineJoin = x.lineCap = 'round';
  const shape = (path, fill, shade) => {     // заливка; тень — серп снизу слева (форма, сдвинутая вправо-вверх)
    x.save(); x.beginPath(); path(); x.fillStyle = shade && o.shade !== false ? shade : fill; x.fill();
    if (shade && o.shade !== false) { x.clip(); x.translate(10, -9); x.beginPath(); path(); x.fillStyle = fill; x.fill(); }
    x.restore();
    if (ink) { x.beginPath(); path(); x.strokeStyle = ink; x.lineWidth = lw; x.stroke(); }
  };
  const limb = (x0, y0, len, ang, w, col) => {        // рука/нога: толстая линия с контуром
    const x1 = x0 + Math.sin(ang) * len, y1 = y0 + Math.cos(ang) * len;
    if (ink) { x.strokeStyle = ink; x.lineWidth = w + lw * 2; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); }
    x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
    return [x1, y1];
  };
  const circ = (cx, cy, r, fill, shade) => shape(() => x.arc(cx, cy, r, 0, 7), fill, shade);
  const ell = (cx, cy, rx, ry, fill, shade, rot = 0) => shape(() => x.ellipse(cx, cy, rx, ry, rot, 0, 7), fill, shade);
  const cx = 200;
  // ноги и кроссовки
  limb(cx - 22, 520, 140, 0.03, 13, P.dark); limb(cx + 22, 520, 140, -0.03, 13, P.dark);
  for (const s of [-1, 1]) { ell(cx + s * 32, 668, 36, 17, P.shoe, P.skinSh); x.fillStyle = P.sole; x.fillRect(cx + s * 32 - 34, 674, 68, 7); }
  // рука сзади
  const aL = o.armL ?? 0.35, aR = o.armR ?? -0.35;
  let [gx, gy] = limb(cx - 62, 400, 120, aL, 30, P.hoodSh); circ(gx, gy, 20, P.dark);
  // худи
  shape(() => { x.moveTo(cx - 78, 530); x.quadraticCurveTo(cx - 92, 430, cx - 64, 382); x.quadraticCurveTo(cx, 360, cx + 64, 382); x.quadraticCurveTo(cx + 92, 430, cx + 78, 530); x.closePath(); }, P.hood, P.hoodSh);
  shape(() => { x.roundRect(cx - 44, 456, 88, 40, 10); }, P.hoodSh);
  if (ink) { x.strokeStyle = ink; x.lineWidth = 3; for (const s of [-1, 1]) { x.beginPath(); x.moveTo(cx + s * 16, 392); x.lineTo(cx + s * 18, 440); x.stroke(); } }
  // голова
  x.save(); x.translate(cx, 270); x.rotate(o.headTilt || 0); x.translate(-cx, -270);
  circ(cx, 270, 118, P.skin, P.skinSh);
  // волосы
  for (const [a, b] of [[-112, 232], [-104, 262], [112, 232], [104, 262]]) shape(() => { x.moveTo(cx + a, b - 30); x.lineTo(cx + a * 1.12, b + 12); x.lineTo(cx + a * 0.86, b); x.closePath(); }, P.hair);
  // шапка
  shape(() => { x.moveTo(cx - 124, 222); x.bezierCurveTo(cx - 128, 90, cx + 128, 90, cx + 124, 222); x.closePath(); }, P.hat, P.hatSh);
  if (o.ribs !== false) { x.strokeStyle = P.hatSh; x.lineWidth = 5; for (let i = -4; i <= 4; i++) { x.beginPath(); x.moveTo(cx + i * 24, 200); x.quadraticCurveTo(cx + i * 22, 150, cx + i * 14, 120 + Math.abs(i) * 6); x.stroke(); } }
  shape(() => x.roundRect(cx - 130, 192, 260, 44, 20), P.hatSh);
  circ(cx, 92, 28, P.hat, P.hatSh);
  // лицо
  const mood = o.mood || 'worried', big = mood === 'scared' ? 1.35 : 1;
  for (const s of [-1, 1]) { ell(cx + s * 40, 288, 13 * big, 19 * big, P.dark); x.fillStyle = '#fff'; x.beginPath(); x.arc(cx + s * 40 + 4, 281, 4.5 * big, 0, 7); x.fill(); }
  x.strokeStyle = P.dark; x.lineWidth = 6;
  if (mood !== 'happy') { x.beginPath(); x.moveTo(cx - 64, 262); x.lineTo(cx - 26, 250); x.moveTo(cx + 26, 250); x.lineTo(cx + 64, 262); x.stroke(); }
  x.beginPath();
  if (mood === 'happy') x.arc(cx, 330, 22, 0.2, Math.PI - 0.2);
  else if (mood === 'scared') x.ellipse(cx, 342, 12, 16, 0, 0, 7);
  else x.arc(cx, 352, 20, Math.PI + 0.4, -0.4);
  x.stroke();
  x.restore();
  // рука спереди
  [gx, gy] = limb(cx + 62, 400, 120, aR, 30, P.hood); circ(gx, gy, 20, P.dark);
  return cv;
}
