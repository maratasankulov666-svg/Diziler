// Движок анимации стикмена: ходьба без скольжения ног (IK), плавности, физика предметов, камера.
// Все функции чистые от времени t: кадр можно рендерить в любом порядке.
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = t => { t = clamp(t); return t * t * (3 - 2 * t); };
export const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
// плавный переход значения между ключами [[t, v], ...] (v — число или массив чисел)
export function keys(t, ks, ease = smooth) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t < ks[i][0]) {
    const [t0, a] = ks[i - 1], [t1, b] = ks[i], u = ease((t - t0) / (t1 - t0));
    return Array.isArray(a) ? a.map((v, j) => lerp(v, b[j], u)) : lerp(a, b, u);
  }
  return ks[ks.length - 1][1];
}
// моргание: детерминированно, раз в 2.5–4.5 с, 0.13 с
export function blink(t, seed = 1) {
  let s = seed * 9301 % 233280, at = 0.7;
  while (at < t + 1) { if (t >= at && t < at + 0.13) return 1; s = (s * 9301 + 49297) % 233280; at += 2.5 + 2 * s / 233280; }
  return 0;
}
// трапеция скорости: доля пройденного пути за долю времени u (плавный разгон и торможение)
function travel(u, r = 0.18) {
  u = clamp(u); const vm = 1 / (1 - r);
  if (u < r) return vm * u * u / (2 * r);
  if (u < 1 - r) return vm * (r / 2 + (u - r));
  return 1 - vm * (1 - u) * (1 - u) / (2 * r);
}
// двухзвенная IK: углы бедра и колена (как в drawStick), колено смотрит по направлению ходьбы
function ik(hx, hy, fx, fy, L, dir) {
  const dx = fx - hx, dy = fy - hy, d = Math.min(Math.hypot(dx, dy), 2 * L * 0.999);
  const a0 = Math.atan2(dx, dy), al = Math.acos(d / (2 * L));
  const h = a0 + al * dir, sh = a0 - al * dir; return [h, sh - h];
}
// Ходьба из x0 в x1 за [t0, t1]. Возвращает позу и положение для drawStick.
// Фаза шага привязана к пройденному пути, поэтому опорная стопа стоит на полу, пока тело над ней проходит.
export function walk(t, { x0, x1, t0, t1, R, Y }) {
  const dir = Math.sign(x1 - x0) || 1, D0 = Math.abs(x1 - x0);
  let S = R * 1.35; const n = Math.max(1, Math.round(D0 / S - 0.55)); S = D0 / (n + 0.55);   // заканчиваем в двойной опоре
  const u = (t - t0) / (t1 - t0), d = D0 * travel(u), X = x0 + dir * d;
  const speed = u > 0 && u < 1 ? clamp(Math.min(u, 1 - u) / 0.18) : 0;
  const L = R * 1.12, lift = R * 0.17;
  const foot = off => {           // мировая x стопы и подъём
    const q = d / S + off, k = Math.floor(q), p = q - k;
    const plant = m => x0 + dir * ((m - off + 0.3) * S);
    if (p < 0.6) return [plant(k), 0];
    const w = smooth((p - 0.6) / 0.4); return [lerp(plant(k), plant(k + 1), w), Math.sin(Math.PI * w) * lift];
  };
  let [fa, la] = foot(0), [fb, lb] = foot(0.5);
  // после остановки задняя нога делает короткий приставной шаг
  if (u >= 1) { const w = smooth((t - t1) / 0.35), rest = R * 0.22;
    const back = dir * (fa - X) < dir * (fb - X) ? 'a' : 'b';
    if (back === 'a') { fa = lerp(fa, X - dir * rest, w); la = Math.sin(Math.PI * w) * lift * 0.6; fb = lerp(fb, X + dir * rest, w); }
    else { fb = lerp(fb, X - dir * rest, w); lb = Math.sin(Math.PI * w) * lift * 0.6; fa = lerp(fa, X + dir * rest, w); } }
  const ph = d / S, down = R * 0.07 * (1 - Math.cos(4 * Math.PI * (ph - 0.3))) / 2 * (u < 1 ? 1 : 1 - smooth((t - t1) / 0.35));
  const hipY = -R * 2.25, Yd = Y + down;
  // правая нога (side +1) — та, что правее в мире
  const [fr, lr, fl, ll] = fa > fb ? [fa, la, fb, lb] : [fb, lb, fa, la];
  const legR = ik(R * 0.22, hipY, fr - X, -down - lr, L, dir), legL = ik(-R * 0.22, hipY, fl - X, -down - ll, L, dir);
  const sw = 0.3 * Math.sin(2 * Math.PI * ph) * Math.max(speed, u < 1 && u > 0 ? 0.35 : 0) * (u >= 1 ? 0 : 1);
  return { X, Y: Yd, groundDy: -down, legL, legR, armL: [-0.14 + sw, 0.1 + Math.max(0, sw) * 0.4], armR: [0.14 + sw, -0.1 + Math.min(0, sw) * 0.4], moving: u > 0 && u < 1, dir };
}
// прыжок-испуг: высота и сжатие
export function hop(t, t0, R) { const u = (t - t0) / 0.42; if (u < 0 || u > 1) return 0; return 4 * u * (1 - u) * R * 0.45; }

// ---- физика твёрдого тела (прямоугольник) с отскоками и трением, интегрирование заранее
export function simulate({ x, y, vx, vy, a, w, hw, hh, floor, g = 2900, e = 0.32, mu = 2.2, T = 6, releaseAt = 0 }) {
  const dt = 1 / 600, out = [], hits = [];
  let t = 0, rest = false;
  while (t < T) {
    if (t >= releaseAt && !rest) {
      vy += g * dt; x += vx * dt; y += vy * dt; a += w * dt;
      // нижняя точка повёрнутого прямоугольника
      const ext = Math.abs(hh * Math.cos(a)) + Math.abs(hw * Math.sin(a));
      if (y + ext > floor && vy > 0) {
        y = floor - ext;
        if (vy > 140) hits.push({ t, v: vy });
        vy = -vy * e; vx *= 0.72;
        // удар разворачивает тело к ближайшему устойчивому положению (на бок или на дно)
        const tgt = Math.round(a / (Math.PI / 2)) * (Math.PI / 2);
        w = w * 0.45 + (tgt - a) * 9;
        if (Math.abs(vy) < 90) { vy = 0; }
      }
      const onFloor = y + ext >= floor - 0.5;
      if (onFloor && vy === 0) {
        const tgt = Math.round(a / (Math.PI / 2)) * (Math.PI / 2);
        w += ((tgt - a) * 140 - w * 14) * dt;      // оседает на грань
        vx *= Math.exp(-mu * dt * 3);
        y = floor - (Math.abs(hh * Math.cos(a)) + Math.abs(hw * Math.sin(a)));
        if (Math.abs(vx) < 3 && Math.abs(w) < 0.05 && Math.abs(tgt - a) < 0.01) { a = tgt; rest = true; }
      }
    }
    if (out.length <= t * 120) out.push({ x, y, a });
    t += dt;
  }
  return { at: tt => out[clamp(Math.floor(tt * 120), 0, out.length - 1)], hits };
}

// камера: плавный наезд к точке
export function camera(c, z, fx, fy) { c.translate(fx, fy); c.scale(z, z); c.translate(-fx, -fy); }
