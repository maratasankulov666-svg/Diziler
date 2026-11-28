// Герой канала (эталон: refs/hero/hero_sheet_nanobanana.jpg): круглая белая голова, оливковая панама с налобным фонарём,
// красный вязаный шарф, бирюзовая куртка, белые варежки, ноги-палочки, коричневые сапоги, оранжевый рюкзак со скаткой, пластырь на щеке.
// drawHero(ctx, x, y, R, pose): x,y — точка на полу между ступнями, R — радиус головы.
// pose: view 'front'|'side'|'back', facing ±1 (для side), mood, look:[dx,dy], blink, armL/armR:[плечо,локоть], legL/legR:[бедро,колено],
//       lean, tilt, groundDy, lamp (true — фонарь горит), beam (угол луча, рад; null — без луча), propL/propR(ctx,[x,y],R), age (0..1: борода, потрёпанность)
const INK = '#16181d';
export const HERO = { skin: '#f1f6f8', skinSh: '#d6e2e8', hat: '#8c8a4e', hatSh: '#6f6d3a', band: '#2b2b26', lamp: '#ffe9a0', scarf: '#c8473c', scarfSh: '#962f28',
  jacket: '#2f6468', jacketSh: '#234c50', zip: '#9fb3b6', mitten: '#f4f8f9', boot: '#6b4636', bootSh: '#4e3228', pack: '#d9802e', packSh: '#ad5c22', roll: '#a0896a', rollSh: '#7d6a50' };
const P = (x, y, a, l) => [x + Math.sin(a) * l, y + Math.cos(a) * l];

export function drawHero(c, X, Y, R, o = {}) {
  const C = { ...HERO, ...(o.colors || {}) }, view = o.view || 'front', f = o.facing || 1, lw = Math.max(1.5, R * 0.075);
  c.save(); c.lineCap = c.lineJoin = 'round';
  // тень на полу
  const gd = o.groundDy || 0, shs = Math.max(0.35, 1 - gd / (R * 3));
  c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(X, Y + gd + R * 0.05, R * 1.25 * shs, R * 0.22 * shs, 0, 0, 7); c.fill();
  c.translate(X, Y); c.rotate(o.lean || 0);
  if (view === 'side') c.scale(f, 1);
  const hipY = -R * 2.25, shY = -R * 3.95, headY = -R * 4.95, legL = R * 1.12;
  const fs = fill => { c.fillStyle = fill; c.fill(); c.strokeStyle = INK; c.lineWidth = lw; c.stroke(); };
  const line = (pts, w, col = INK) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(...pts[0]); pts.slice(1).forEach(p => c.lineTo(...p)); c.stroke(); };
  const sleeve = (pts) => { line(pts, R * 0.4 + lw * 2); line(pts, R * 0.4, C.jacket); };
  const mitten = ([x, y], side) => { c.beginPath(); c.ellipse(x, y + R * 0.06, R * 0.22, R * 0.25, 0, 0, 7); fs(C.mitten);
    c.beginPath(); c.ellipse(x - side * R * 0.2, y - R * 0.02, R * 0.09, R * 0.13, side * 0.5, 0, 7); fs(C.mitten); };

  // ---- ноги и сапоги
  const leg = (side, [h, k], z) => {
    const hip = [view === 'side' ? side * R * 0.08 : side * R * 0.3, hipY], knee = P(...hip, h, legL), foot = P(...knee, h + k, legL);
    line([hip, knee, foot], R * 0.12);
    const bw = R * 0.31, bh = R * 0.95, toe = view === 'side' ? R * 0.32 : 0;
    c.save(); c.translate(foot[0], foot[1]); c.rotate(-(h + k) * 0.6);
    c.beginPath(); c.moveTo(-bw, -bh); c.lineTo(bw, -bh); c.lineTo(bw + R * 0.02, -R * 0.15);
    c.quadraticCurveTo(bw + toe + R * 0.08, -R * 0.12, bw + toe + R * 0.06, R * 0.04); c.lineTo(-bw - (view === 'side' ? 0 : R * 0.06), R * 0.04); c.closePath(); fs(z ? C.bootSh : C.boot);
    line([[-bw, -bh + R * 0.12], [bw, -bh + R * 0.12]], lw * 0.6);
    c.restore();
  };
  // ---- рюкзак (за спиной)
  const packBehind = () => {
    if (view === 'front') {
      for (const s of [-1, 1]) { c.beginPath(); c.roundRect(s > 0 ? R * 0.7 : -R * 1.22, shY + R * 0.1, R * 0.52, R * 1.5, R * 0.15); fs(C.pack); }
      c.beginPath(); c.roundRect(-R * 1.3, shY - R * 0.42, R * 2.6, R * 0.55, R * 0.27); fs(C.roll);
      for (const s of [-1, 1]) { c.beginPath(); c.ellipse(s * R * 1.12, shY - R * 0.15, R * 0.14, R * 0.25, 0, 0, 7); c.strokeStyle = C.rollSh; c.lineWidth = lw * 0.7; c.stroke(); }
    } else if (view === 'side') {
      c.beginPath(); c.roundRect(-R * 1.5, shY + R * 0.05, R * 1.0, R * 1.75, R * 0.25); fs(C.pack);
      c.beginPath(); c.roundRect(-R * 1.45, shY + R * 0.8, R * 0.55, R * 0.7, R * 0.12); fs(C.packSh);
      c.beginPath(); c.arc(-R * 0.95, shY - R * 0.2, R * 0.33, 0, 7); fs(C.roll);
      c.beginPath(); c.arc(-R * 0.95, shY - R * 0.2, R * 0.18, 0.5, 5.5); c.strokeStyle = C.rollSh; c.lineWidth = lw * 0.8; c.stroke();
    }
  };
  const packBack = () => {   // вид сзади — рюкзак поверх куртки
    c.beginPath(); c.roundRect(-R * 1.3, shY - R * 0.45, R * 2.6, R * 0.55, R * 0.27); fs(C.roll);
    c.beginPath(); c.roundRect(-R * 0.9, shY + R * 0.05, R * 1.8, R * 1.8, R * 0.3); fs(C.pack);
    c.beginPath(); c.roundRect(-R * 0.58, shY + R * 1.0, R * 1.16, R * 0.6, R * 0.12); fs(C.packSh);
    line([[-R * 0.1, shY + R * 0.05], [-R * 0.1, shY + R * 0.3]], lw); c.beginPath(); c.roundRect(-R * 0.15, shY + R * 0.28, R * 0.12, R * 0.16, 2); fs(C.zip);
  };
  // ---- куртка
  const jacket = () => {
    const sw = view === 'side' ? R * 0.62 : R * 0.88, hw = view === 'side' ? R * 0.72 : R * 1.05, hem = -R * 1.8;
    c.beginPath(); c.moveTo(-sw, shY + R * 0.25); c.quadraticCurveTo(-sw, shY - R * 0.05, -sw + R * 0.3, shY - R * 0.05);
    c.lineTo(sw - R * 0.3, shY - R * 0.05); c.quadraticCurveTo(sw, shY - R * 0.05, sw, shY + R * 0.25);
    c.lineTo(hw, hem); c.quadraticCurveTo(0, hem + R * 0.08, -hw, hem); c.closePath(); fs(C.jacket);
    c.save(); c.clip(); c.fillStyle = C.jacketSh; c.fillRect(view === 'side' ? -sw : sw - R * 0.35, shY - R * 0.1, R * 0.5, R * 2.4); c.restore();
    c.beginPath(); c.moveTo(-sw, shY + R * 0.25); c.lineTo(-hw, hem); c.quadraticCurveTo(0, hem + R * 0.08, hw, hem); c.lineTo(sw, shY + R * 0.25); c.strokeStyle = INK; c.lineWidth = lw; c.stroke();
    if (view === 'front') {
      line([[0, shY + R * 0.1], [0, hem + R * 0.02]], lw * 0.9, C.zip); line([[0, shY + R * 0.1], [0, hem + R * 0.02]], lw * 0.35);
      for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s * R * 0.25, hem - R * 0.45); c.quadraticCurveTo(s * R * 0.55, hem - R * 0.52, s * R * 0.8, hem - R * 0.42); c.strokeStyle = INK; c.lineWidth = lw * 0.7; c.stroke(); }
      for (const s of [-1, 1]) line([[s * R * 0.84, shY + R * 0.2], [s * R * 0.74, shY + R * 1.3]], lw * 0.9, C.packSh);   // лямки
    } else if (view === 'side') {
      line([[R * 0.55, shY + R * 0.2], [R * 0.62, hem]], lw * 0.5);
      line([[-R * 0.45, shY], [-R * 0.3, shY + R * 1.1]], lw * 1.2, C.packSh);
    }
  };
  // ---- шарф
  const scarf = (front = true) => {
    c.beginPath(); c.roundRect(-R * 0.7, shY - R * 0.36, R * 1.4, R * 0.5, R * 0.24); fs(C.scarf);
    for (let i = -2; i <= 2; i++) line([[i * R * 0.2, shY - R * 0.28], [i * R * 0.2 + R * 0.05, shY + R * 0.02]], lw * 0.45, C.scarfSh);
    if (front) {
      const ex = view === 'side' ? R * 0.35 : R * 0.3;
      c.beginPath(); c.moveTo(ex - R * 0.18, shY + R * 0.02); c.lineTo(ex + R * 0.2, shY + R * 0.02); c.lineTo(ex + R * 0.26, shY + R * 1.0); c.lineTo(ex - R * 0.08, shY + R * 1.02); c.closePath(); fs(C.scarf);
      c.beginPath(); c.ellipse(ex, shY + R * 0.02, R * 0.2, R * 0.16, 0, 0, 7); fs(C.scarf);
      for (let i = 0; i < 4; i++) line([[ex - R * 0.04 + i * R * 0.08, shY + R * 1.02], [ex - R * 0.05 + i * R * 0.08, shY + R * 1.15]], lw * 0.5, C.scarfSh);
    }
  };
  // ---- голова, лицо, панама
  const head = () => {
    c.save(); c.translate(0, headY); c.rotate(o.tilt || 0);
    c.beginPath(); c.arc(0, 0, R, 0, 7); c.fillStyle = C.skin; c.fill();
    c.save(); c.clip(); c.fillStyle = C.skinSh; c.beginPath(); c.arc(-R * 0.25, -R * 0.2, R * 1.08, 0, 7); c.rect(-R * 2, -R * 2, R * 4, R * 4); c.fill('evenodd'); c.restore();
    c.beginPath(); c.arc(0, 0, R, 0, 7); c.strokeStyle = INK; c.lineWidth = lw; c.stroke();
    if (view !== 'back') face();
    hat();
    c.restore();
  };
  const face = () => {
    const mood = o.mood || 'neutral', [lx, ly] = o.look || [0, 0], side = view === 'side';
    const eyes = side ? [R * 0.48] : [-R * 0.3, R * 0.3], ey = R * 0.05 + ly;
    // пластырь (на левой щеке героя — слева на экране при виде спереди)
    c.save(); c.translate(side ? R * 0.12 : -R * 0.58 + lx * 0.3, R * 0.42); c.rotate(-0.6);
    c.beginPath(); c.roundRect(-R * 0.2, -R * 0.1, R * 0.4, R * 0.2, R * 0.05); fs('#e6ebee'); c.fillStyle = '#c9d2d6'; c.fillRect(-R * 0.06, -R * 0.09, R * 0.12, R * 0.18); c.restore();
    for (const ex of eyes) {
      const x = ex + lx;
      if (o.blink > 0.5 || mood === 'relieved' || mood === 'happy') {
        c.beginPath(); if (mood === 'happy') c.arc(x, ey + R * 0.04, R * 0.1, Math.PI + 0.3, -0.3); else c.arc(x, ey - R * 0.02, R * 0.1, 0.3, Math.PI - 0.3);
        c.strokeStyle = INK; c.lineWidth = lw; c.stroke(); continue;
      }
      if (mood === 'scared') { c.beginPath(); c.arc(x, ey, R * 0.17, 0, 7); fs('#ffffff'); c.fillStyle = INK; c.beginPath(); c.arc(x, ey, R * 0.07, 0, 7); c.fill(); continue; }
      c.fillStyle = INK; c.beginPath(); c.ellipse(x, ey, R * 0.095, R * 0.14, 0, 0, 7); c.fill();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(x - R * 0.03, ey - R * 0.04, R * 0.03, 0, 7); c.fill();
      if (mood === 'tired') { c.fillStyle = C.skin; c.fillRect(x - R * 0.12, ey - R * 0.15, R * 0.24, R * 0.1); line([[x - R * 0.12, ey - R * 0.05], [x + R * 0.12, ey - R * 0.05]], lw * 0.9);
        c.beginPath(); c.arc(x, ey + R * 0.08, R * 0.12, 0.3, Math.PI - 0.3); c.strokeStyle = '#9aa6c0'; c.lineWidth = lw * 0.6; c.stroke(); }
    }
    // брови
    const br = { neutral: [0, 0], worried: [0.12, -0.05], scared: [0.18, 0.08], determined: [-0.14, 0.02], tired: [0.04, 0.02], relieved: [0.06, 0], happy: [0.02, -0.02] }[mood] || [0, 0];
    for (const ex of eyes) { const s = side ? 1 : Math.sign(ex), x = ex + lx, by = -R * 0.2 + ly - (mood === 'scared' ? R * 0.08 : 0);
      line([[x + s * R * 0.14, by + br[1] * R + (side ? 0 : br[0] * R)], [x - s * R * 0.1, by - br[0] * R]], lw * 0.9); }
    // рот
    const mx = (side ? R * 0.55 : 0) + lx * 0.6, my = R * 0.45 + ly * 0.5; c.strokeStyle = INK; c.lineWidth = lw * 0.9; c.beginPath();
    if (mood === 'happy') { c.moveTo(mx - R * 0.22, my - R * 0.05); c.quadraticCurveTo(mx, my + R * 0.3, mx + R * 0.22, my - R * 0.05); c.closePath(); fs('#7a2a2c'); }
    else if (mood === 'scared' || mood === 'relieved') { c.ellipse(mx, my, R * (mood === 'scared' ? 0.13 : 0.08), R * (mood === 'scared' ? 0.1 : 0.06), 0, 0, 7); fs('#7a2a2c'); }
    else if (mood === 'worried') { for (let i = 0; i <= 6; i++) { const x = mx - R * 0.15 + i * R * 0.05, y = my + (i % 2 ? -1 : 1) * R * 0.025; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    else if (mood === 'neutral') { c.moveTo(mx - R * 0.14, my); c.quadraticCurveTo(mx, my + R * 0.06, mx + R * 0.14, my - R * 0.02); c.stroke(); }
    else if (mood === 'tired') { c.ellipse(mx, my, R * 0.05, R * 0.04, 0, 0, 7); fs('#7a2a2c'); }
    else { c.moveTo(mx - R * 0.12, my); c.lineTo(mx + R * 0.12, my); c.stroke(); }
    if (mood === 'tired' || o.sweat) { c.beginPath(); c.moveTo(R * 0.72, -R * 0.15); c.quadraticCurveTo(R * 0.84, R * 0.05, R * 0.78, R * 0.1); c.arc(R * 0.72, R * 0.08, R * 0.065, 0.3, Math.PI - 0.5); c.closePath(); fs('#7cc8f2'); }
    if (o.age) { c.save(); c.globalAlpha = Math.min(1, o.age); c.beginPath(); c.moveTo(-R * 0.85, R * 0.2); c.bezierCurveTo(-R * 0.8, R * 1.2, R * 0.8, R * 1.2, R * 0.85, R * 0.2);
      c.quadraticCurveTo(R * 0.4, R * 0.62, 0, R * 0.58); c.quadraticCurveTo(-R * 0.4, R * 0.62, -R * 0.85, R * 0.2); fs('#6b5a48'); c.restore(); }
  };
  const hat = () => {
    c.save(); c.translate(0, -R * 0.16);
    // тулья
    const crown = () => { c.beginPath(); c.moveTo(-R * 0.95, -R * 0.4); c.bezierCurveTo(-R * 0.95, -R * 1.35, R * 0.95, -R * 1.35, R * 0.95, -R * 0.4); c.closePath(); };
    crown(); fs(C.hat); c.save(); crown(); c.clip(); c.fillStyle = C.hatSh; c.beginPath(); c.ellipse(R * 0.85, -R * 0.8, R * 0.45, R * 0.7, 0, 0, 7); c.fill(); c.restore(); crown(); c.strokeStyle = INK; c.lineWidth = lw; c.stroke();
    // лента
    c.beginPath(); c.moveTo(-R * 0.95, -R * 0.42); c.lineTo(R * 0.95, -R * 0.42); c.lineTo(R * 0.92, -R * 0.64); c.lineTo(-R * 0.92, -R * 0.64); c.closePath(); fs(C.band);
    // поля
    const bw = view === 'side' ? 1.3 : 1.42;
    c.beginPath(); c.moveTo(-R * bw, -R * 0.02); c.quadraticCurveTo(-R * 1.2, -R * 0.4, -R * 0.92, -R * 0.44); c.lineTo(R * 0.92, -R * 0.44); c.quadraticCurveTo(R * 1.2, -R * 0.4, R * bw, -R * 0.02);
    c.quadraticCurveTo(R * 1.0, -R * 0.2, 0, -R * 0.24); c.quadraticCurveTo(-R * 1.0, -R * 0.2, -R * bw, -R * 0.02); c.closePath(); fs(C.hat);
    c.save(); c.clip(); c.fillStyle = C.hatSh; c.fillRect(-R * 2, -R * 0.3, R * 4, R * 0.4); c.restore();
    c.beginPath(); c.moveTo(-R * bw, -R * 0.02); c.quadraticCurveTo(-R * 1.0, -R * 0.2, 0, -R * 0.24); c.quadraticCurveTo(R * 1.0, -R * 0.2, R * bw, -R * 0.02); c.strokeStyle = INK; c.lineWidth = lw; c.stroke();
    // налобный фонарь
    if (view !== 'back') {
      const lx = view === 'side' ? R * 0.88 : 0, ly = -R * 0.53;
      c.beginPath(); c.roundRect(lx - R * (view === 'side' ? 0.12 : 0.2), ly - R * 0.15, R * (view === 'side' ? 0.26 : 0.4), R * 0.3, R * 0.08); fs('#3a3a36');
      const on = o.lamp !== false, cx = view === 'side' ? lx + R * 0.12 : lx;
      if (on) { const g = c.createRadialGradient(cx, ly, 0, cx, ly, R * 0.45); g.addColorStop(0, 'rgba(255,235,160,0.55)'); g.addColorStop(1, 'rgba(255,235,160,0)');
        c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.fillRect(cx - R * 0.45, ly - R * 0.45, R * 0.9, R * 0.9); c.restore(); }
      c.beginPath(); if (view === 'side') c.ellipse(cx, ly, R * 0.05, R * 0.12, 0, 0, 7); else c.arc(cx, ly, R * 0.12, 0, 7); fs(on ? C.lamp : '#8a8a80');
      if (on && o.beam != null) { c.save(); c.translate(cx, ly + headY * 0); c.rotate(o.beam); const L = R * 14, g2 = c.createLinearGradient(0, 0, L, 0);
        g2.addColorStop(0, 'rgba(255,240,180,0.45)'); g2.addColorStop(1, 'rgba(255,240,180,0)'); c.globalCompositeOperation = 'lighter'; c.fillStyle = g2;
        c.beginPath(); c.moveTo(0, -R * 0.08); c.lineTo(L, -L * 0.22); c.lineTo(L, L * 0.22); c.lineTo(0, R * 0.08); c.closePath(); c.fill(); c.restore(); }
    }
    c.restore();
  };
  // ---- руки
  const arm = (side, [s, e], prop) => {
    const sh = [side * (view === 'side' ? R * 0.15 : R * 0.78), shY + R * 0.25], el = P(...sh, s, R * 1.0), hd = P(...el, s + e, R * 0.95);
    sleeve([sh, el, hd]); mitten(hd, side); if (prop) prop(c, hd, R);
  };
  const armL = o.armL || [-0.12, 0.05], armR = o.armR || [0.12, -0.05], legLp = o.legL || [-0.05, 0.01], legRp = o.legR || [0.05, -0.01];

  if (view === 'back') {
    leg(-1, legLp); leg(1, legRp); arm(-1, armL, o.propL); arm(1, armR, o.propR); jacket(); scarf(false); head(); packBack();
  } else if (view === 'side') {
    arm(-1, armL, o.propL); leg(-1, legLp, true); packBehind(); leg(1, legRp); jacket(); scarf(); head(); arm(1, armR, o.propR);
  } else {
    packBehind(); leg(-1, legLp); leg(1, legRp); jacket(); scarf(); head(); arm(-1, armL, o.propL); arm(1, armR, o.propR);
  }
  c.restore();
}
