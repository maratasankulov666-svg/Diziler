// Стикмен-«кукла» на canvas 2D: круглая голова, руки и ноги — линии с суставами, руки-варежки, одежда простыми формами.
// drawStick(ctx, x, y, R, pose)  x,y — точка между ступнями (пол), R — радиус головы в пикселях.
// pose: { armL:[плечо, локоть], armR, legL:[бедро, колено], legR, tilt, lean, mood, look:[dx,dy], outfit, facing }
// Углы в радианах от вертикали вниз; плюс — по часовой (вправо на экране для правой стороны).
const INK = '#1b1b1f';
export const OUTFITS = {
  hero: { skin: '#eceeea', top: '#8e939b', topSh: '#757a82', pants: null, shoes: '#3a2c24', hat: '#f2b21b', hatSh: '#cf9010', hair: '#6b4426', kind: 'hoodie' },
  worker: { skin: '#e4e7e2', top: '#4a2f2a', topSh: '#3a2420', apron: '#f1efe8', shoes: '#3a2c24', hair: '#7a5232', kind: 'apron' },
  green: { skin: '#e7e9e4', top: '#2f6f6a', topSh: '#255955', shoes: '#5a3e2a', hair: '#2b2b2b', kind: 'jacket' },
};
const P = (x, y, a, l) => [x + Math.sin(a) * l, y + Math.cos(a) * l];

export function drawStick(c, X, Y, R, o = {}) {
  const O = typeof o.outfit === 'object' ? o.outfit : OUTFITS[o.outfit || 'hero'];
  const lw = Math.max(2, R * 0.085), limbW = Math.max(2.5, R * 0.1);
  c.save(); c.lineCap = c.lineJoin = 'round';
  // тень на полу
  c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); const gd = o.groundDy || 0, sh = Math.max(0.35, 1 - gd / (R * 3)); c.ellipse(X, Y + gd + R * 0.05, R * 1.15 * sh, R * 0.2 * sh, 0, 0, 7); c.fill();
  c.translate(X, Y); c.rotate(o.lean || 0);
  // размеры тела (y вверх отрицательный)
  const hipY = -R * 2.25, shY = -R * 3.75, headY = -R * 4.95, legL = R * 1.12;
  const seg = (pts, w = limbW, col = INK) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(...pts[0]); pts.slice(1).forEach(p => c.lineTo(...p)); c.stroke(); };
  const fillStroke = (fill) => { c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.stroke(); };
  // ноги
  const leg = (side, [h, k]) => {
    const hip = [side * R * 0.22, hipY], knee = P(...hip, h, legL), foot = P(...knee, h + k, legL);
    seg([hip, knee, foot]);
    c.beginPath(); c.ellipse(foot[0] + side * R * 0.12, foot[1] - R * 0.02, R * 0.3, R * 0.14, 0, 0, 7); fillStroke(O.shoes);
  };
  leg(-1, o.legL || [0.06, -0.04]); leg(1, o.legR || [-0.06, 0.04]);
  // торс
  const tw = R * 0.62, bw = R * 0.66;
  const torso = () => { c.beginPath(); c.moveTo(-tw, shY + R * 0.12); c.quadraticCurveTo(-tw, shY - R * 0.05, -tw + R * 0.2, shY - R * 0.05);
    c.lineTo(tw - R * 0.2, shY - R * 0.05); c.quadraticCurveTo(tw, shY - R * 0.05, tw, shY + R * 0.12);
    c.lineTo(bw, hipY + R * 0.1); c.lineTo(-bw, hipY + R * 0.1); c.closePath(); };
  torso(); fillStroke(O.top);
  if (O.kind === 'hoodie') {
    c.beginPath(); c.roundRect(-R * 0.4, hipY - R * 0.55, R * 0.8, R * 0.38, R * 0.08); fillStroke(O.topSh);
    seg([[-R * 0.12, shY + R * 0.05], [-R * 0.14, shY + R * 0.55]], lw * 0.8); seg([[R * 0.12, shY + R * 0.05], [R * 0.14, shY + R * 0.55]], lw * 0.8);
  } else if (O.kind === 'apron') {
    c.beginPath(); c.moveTo(-R * 0.42, shY + R * 0.3); c.lineTo(R * 0.42, shY + R * 0.3); c.lineTo(R * 0.5, hipY + R * 0.7); c.lineTo(-R * 0.5, hipY + R * 0.7); c.closePath(); fillStroke(O.apron);
    c.beginPath(); c.rect(-R * 0.2, hipY - R * 0.2, R * 0.4, R * 0.3); c.strokeStyle = '#555'; c.lineWidth = lw * 0.7; c.stroke();
  } else { seg([[0, shY], [0, hipY + R * 0.1]], lw * 0.8); seg([[-R * 0.3, hipY - R * 0.7], [-R * 0.32, hipY - R * 0.3]], lw * 0.6); seg([[R * 0.3, hipY - R * 0.7], [R * 0.32, hipY - R * 0.3]], lw * 0.6); }
  // руки: рукав-линия + варежка
  const arm = (side, [s, e], prop) => {
    const sh = [side * tw * 0.92, shY + R * 0.15], el = P(...sh, s, R * 0.95), hd = P(...el, s + e, R * 0.9);
    seg([sh, el, hd]);
    c.beginPath(); c.arc(hd[0], hd[1], R * 0.19, 0, 7); fillStroke('#f4f4f1');
    c.beginPath(); c.arc(hd[0] - side * R * 0.17, hd[1] - R * 0.08, R * 0.08, 0, 7); fillStroke('#f4f4f1');
    if (prop) prop(c, hd, R);
  };
  arm(-1, o.armL || [0.18, 0.05], o.propL); arm(1, o.armR || [-0.18, -0.05], o.propR);
  // шея и голова
  seg([[0, shY - R * 0.05], [0, headY + R * 0.95]], limbW);
  c.save(); c.translate(0, headY); c.rotate(o.tilt || 0);
  c.beginPath(); c.arc(0, 0, R, 0, 7); fillStroke(O.skin);
  const [lx, ly] = o.look || [0, 0];
  if (O.hat) {   // шапка-бини с отворотом
    c.beginPath(); c.moveTo(-R * 1.02, -R * 0.28); c.bezierCurveTo(-R * 1.05, -R * 1.45, R * 1.05, -R * 1.45, R * 1.02, -R * 0.28); c.closePath(); fillStroke(O.hat);
    for (let i = -3; i <= 3; i++) seg([[i * R * 0.24, -R * 0.42], [i * R * 0.2, -R * 0.95 + Math.abs(i) * R * 0.07]], lw * 0.55, O.hatSh);
    c.beginPath(); c.roundRect(-R * 1.08, -R * 0.52, R * 2.16, R * 0.36, R * 0.14); fillStroke(O.hatSh);
    for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.96, -R * 0.2); c.lineTo(s * R * 1.06, R * 0.18); c.lineTo(s * R * 0.84, -R * 0.02); c.closePath(); fillStroke(O.hair); }
  } else {       // волосы шапочкой
    c.beginPath(); c.moveTo(-R * 0.98, -R * 0.1); c.bezierCurveTo(-R * 1.1, -R * 1.25, R * 1.1, -R * 1.25, R * 0.98, -R * 0.1);
    c.quadraticCurveTo(R * 0.4, -R * 0.62, -R * 0.2, -R * 0.55); c.quadraticCurveTo(-R * 0.7, -R * 0.5, -R * 0.98, -R * 0.1); c.closePath(); fillStroke(O.hair);
  }
  if (o.back) {
    if (O.hat) { c.beginPath(); c.moveTo(-R * 1.0, -R * 0.1); c.bezierCurveTo(-R * 1.0, R * 0.5, R * 1.0, R * 0.5, R * 1.0, -R * 0.1); c.closePath(); fillStroke(O.hair); }
    c.restore(); c.restore(); return;
  }
  // лицо
  const mood = o.mood || 'neutral', ey = R * 0.05 + ly, er = R * (mood === 'scared' ? 0.11 : 0.075);
  for (const s of [-1, 1]) {
    if (o.blink > 0.5) seg([[s * R * 0.32 + lx - R * 0.09, ey], [s * R * 0.32 + lx + R * 0.09, ey]], lw * 0.8);
    else if (mood === 'tired') seg([[s * R * 0.34 + lx - R * 0.1, ey], [s * R * 0.34 + lx + R * 0.1, ey]], lw * 0.8);
    else { c.fillStyle = INK; c.beginPath(); c.ellipse(s * R * 0.32 + lx, ey, er, er * 1.15, 0, 0, 7); c.fill(); }
  }
  const [up, dn] = { neutral: [0, 0], worried: [0.12, 0.04], scared: [0.2, 0], determined: [-0.1, -0.06], happy: [0.05, 0], tired: [0, 0.06] }[mood] || [0, 0];
  for (const s of [-1, 1]) seg([[s * R * 0.54 + lx, -R * 0.24 + dn * R + ly], [s * R * 0.15 + lx, -R * 0.26 - up * R + ly]], lw * 0.8);
  c.strokeStyle = INK; c.lineWidth = lw * 0.85; c.beginPath();
  const my = R * 0.48 + ly * 0.5;
  if (mood === 'happy') c.arc(lx * 0.6, my - R * 0.15, R * 0.22, 0.4, Math.PI - 0.4);
  else if (mood === 'scared') { c.ellipse(lx * 0.6, my, R * 0.12, R * 0.15, 0, 0, 7); }
  else if (mood === 'worried') c.arc(lx * 0.6, my + R * 0.12, R * 0.17, Math.PI + 0.5, -0.5);
  else c.moveTo(lx * 0.6 - R * 0.15, my), c.lineTo(lx * 0.6 + R * 0.15, my);
  c.stroke();
  c.restore(); c.restore();
}

// реквизит: коробка с банками (как в руках у героя)
export const propBox = (c, [x, y], R) => {
  c.fillStyle = '#c69a62'; c.strokeStyle = INK; c.lineWidth = R * 0.08;
  c.beginPath(); c.rect(x - R * 0.2, y - R * 0.35, R * 1.2, R * 0.8); c.fill(); c.stroke();
  for (let i = 0; i < 3; i++) { c.fillStyle = '#d8312b'; c.beginPath(); c.rect(x + i * R * 0.36 - R * 0.1, y - R * 0.6, R * 0.3, R * 0.3); c.fill(); c.stroke(); }
};
