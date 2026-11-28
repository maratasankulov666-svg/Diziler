// Четыре сцены теста 03. Каждая: build() -> { scene, cam, update(t, u) }, t — секунды, u — 0..1 доля сцены.
import { THREE, toon, boxer, cyl, shadowBlob, ease, lerp, lerpV, blinkAt } from './engine3d.js';
import { makeHero } from './hero.js';

function base(sky, fog, fogNear, fogFar, hemi, sun) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(sky); scene.fog = new THREE.Fog(fog, fogNear, fogFar);
  scene.add(new THREE.HemisphereLight(...hemi));
  const s = new THREE.DirectionalLight(...sun); s.position.set(-6, 14, 8); scene.add(s);
  const cam = new THREE.PerspectiveCamera(40, 16 / 9, 0.1, 100);
  return { scene, cam };
}
function hero(scene, opts) { const h = makeHero(toon, opts); scene.add(h); return [h, h.userData.parts]; }
function look(cam, pos, tgt) { cam.position.copy(pos); cam.lookAt(tgt); }
function setEyes(p, k, big = 1) { for (const e of p.eyes) e.scale.set(big, 1.3 * k * big, 0.5); }

// ---------- 1. Кинозал: просыпается, тянется, оглядывается
export function cinema() {
  const { scene, cam } = base(0x06081a, 0x0a0e26, 8, 30, [0x3b4f9a, 0x0a0a18, 1.1], [0x7f9cff, 0.5]);
  const B = boxer(scene);
  // экран (тёмный, чуть светится) и стены
  B(18, 7, 0.2, 0x1a2242, 0, 4.5, -12, 0x24305e, 0.6);
  B(0.4, 12, 30, 0x1e1630, -10, 5, -2); B(0.4, 12, 30, 0x1e1630, 10, 5, -2);
  for (let i = 0; i < 6; i++) { B(0.2, 3, 0.8, 0x2a1d3a, -9.7, 4, -9 + i * 3); B(0.2, 3, 0.8, 0x2a1d3a, 9.7, 4, -9 + i * 3); }
  B(1.2, 0.4, 0.1, 0x1a6b3a, 8, 8.5, -11.8, 0x2bdc6a, 1.2);              // табличка выхода без надписи
  // ряды кресел ступенями
  let heroSeat;
  for (let k = 0; k < 8; k++) {
    const y = k * 0.38, z = -6 + k * 1.25;
    B(20, 0.38, 1.25, 0x231a2e, 0, y - 0.19, z);
    for (let i = -7; i <= 7; i++) {
      const x = i * 1.05;
      B(0.92, 0.22, 0.75, 0xb0202e, x, y + 0.42, z);
      B(0.92, 0.95, 0.18, 0xc42634, x, y + 0.85, z + 0.4);
      B(0.08, 0.55, 0.7, 0x1a1420, x + 0.5, y + 0.3, z);
      if (k === 5 && i === 1) heroSeat = [x, y, z];
    }
    B(0.12, 0.05, 0.12, 0xffd27a, -8.7, y + 0.03, z - 0.4, 0xffc050, 2);     // подсветка ступеней
  }
  // свет от экрана
  const sl = new THREE.PointLight(0x5a7cff, 10, 22, 1.2); sl.position.set(0, 4, -9); scene.add(sl);
  const [h, p] = hero(scene, { worried: true });
  const [sx, sy, sz] = heroSeat;
  h.position.set(sx, sy + 0.55 - 0.69 + 0.08, sz - 0.05); h.rotation.y = Math.PI + 0.25;
  p.legL.rotation.x = p.legR.rotation.x = -1.45;
  const fill = new THREE.PointLight(0xc8d4ff, 6, 5, 1.2); fill.position.set(sx - 1.2, sy + 2.4, sz - 2.2); scene.add(fill);
  return { scene, cam, update(t, u) {
    // камера: от общего плана к среднему
    const e = ease(u);
    look(cam, lerpV([sx - 6.5, sy + 3.8, sz - 7.5], [sx - 1.5, sy + 2.0, sz - 2.5], e), lerpV([sx - 0.5, sy + 1.2, sz - 1], [sx, sy + 1.45, sz], e));
    const wake = ease((t - 1.2) / 1.0);
    p.head.rotation.x = lerp(0.55, -0.05, wake);                           // поднимает голову
    setEyes(p, wake < 0.5 ? 0.12 : blinkAt(t, [3.0, 5.6]));
    // потягивается 2.6–4.4 с
    const st = Math.sin(Math.PI * Math.min(1, Math.max(0, (t - 2.6) / 1.8)));
    p.armL.rotation.z = lerp(0.25, 2.7, st); p.armR.rotation.z = lerp(-0.25, -2.7, st);
    // оглядывается после 4.5 с
    p.head.rotation.y = t > 4.5 ? 0.6 * Math.sin((t - 4.5) * 1.1) : 0;
    p.mouth.rotation.z = t > 4.5 ? 0 : Math.PI;
    p.body.scale.y = 1 + 0.015 * Math.sin(t * 2);
  } };
}

// ---------- 2. Пустой торговый центр ночью: идёт и смотрит вверх
function mallSet(scene, P) {
  const B = boxer(scene);
  B(60, 0.2, 40, P.floor, 0, -0.1, 0);
  for (let i = -14; i <= 14; i++) B(0.03, 0.01, 40, P.metal, i * 1.6, 0.005, 0);
  const shops = [];
  const row = (y, z) => {
    B(40, 4, 0.4, P.wall, 0, y + 2, z - 0.6);
    for (let i = -5; i <= 5; i++) {
      const x = i * 3.4;
      shops.push(B(2.8, 2.4, 0.1, P.shop, x, y + 1.3, z - 0.35, P.shop, P.ei));
      B(3.0, 0.5, 0.25, P.metal, x, y + 2.75, z - 0.3); B(0.08, 2.4, 0.16, P.metal, x, y + 1.3, z - 0.28);
      for (let k = 0; k < 3; k++) B(0.5, 0.8 + (k % 2) * 0.4, 0.2, P.goods, x - 0.8 + k * 0.8, y + 0.5 + (k % 2) * 0.2, z - 0.2);
    }
  };
  row(0, -9); row(4.2, -12); row(8.4, -15);
  for (const [y, z0, z1] of [[4.2, -12.6, -6.2], [8.4, -15.6, -9.2]]) {
    B(40, 0.5, z1 - z0, P.slab, 0, y - 0.25, (z0 + z1) / 2);
    const g = new THREE.Mesh(new THREE.BoxGeometry(40, 1.0, 0.05), new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.15 }));
    g.position.set(0, y + 0.5, z1); scene.add(g);
    B(40, 0.08, 0.12, P.metal, 0, y + 1.02, z1);
    for (let i = -12; i <= 12; i++) B(0.05, 1.0, 0.05, P.metal, i * 1.6, y + 0.5, z1);
  }
  for (const x of [-9, -2.5, 4, 10.5]) cyl(scene, 0.45, 0.45, 13, P.pill, x, 6.5, -6.6, 24);
  for (let i = -6; i <= 6; i++) B(0.12, 0.12, 30, P.metal, i * 3, 12.5, -5);
  for (let k = -4; k <= 4; k++) B(40, 0.12, 0.12, P.metal, 0, 12.5, -5 + k * 3);
  B(2.2, 0.12, 0.6, 0x7a5236, 5.6, 0.5, -1.5); for (const s of [-1, 1]) B(0.1, 0.5, 0.5, P.metal, 5.6 + s * 0.95, 0.25, -1.5);
  cyl(scene, 0.28, 0.24, 0.8, P.metal, 7.2, 0.4, -1.4);
  for (let i = -5; i <= 5; i += 2) { const l = new THREE.PointLight(P.shop, 8, 9, 1.6); l.position.set(i * 3.4, 1.6, -8); scene.add(l); }
  return shops;
}
// эскалатор: шаги движутся сами
function escalator(scene, x0, z0, P, glow) {
  const B = boxer(scene), g = new THREE.Group(); scene.add(g); g.position.set(x0, 0, z0);
  const len = Math.hypot(4.2, 5.2), ang = Math.atan2(4.2, 5.2);
  const run = (w, h, x, c) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, len), toon(c)); o.position.set(x, 2.1, -2.6); o.rotation.x = ang; g.add(o); return o; };
  run(1.4, 0.5, 0, P.metal);
  for (const s of [-1, 1]) run(0.12, 1.1, 0.72 * s, 0x111522).position.y = 2.6;
  const steps = [];
  for (let i = 0; i < 18; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.06, 0.3), toon(0x5d6987, glow, 0.6)); g.add(s); steps.push(s); }
  B(1.6, 0.25, 1.2, P.metal, x0, 0.12, z0 + 1.4);
  return (t, speed) => steps.forEach((s, i) => { const k = ((i / 18 + t * speed) % 1 + 1) % 1; s.position.set(0, 0.32 + 4.2 * k, -5.2 * k); });
}
const NIGHT = { floor: 0x26324f, wall: 0x2f3c63, slab: 0x3a4870, metal: 0x1a2138, pill: 0x34416a, shop: 0xffc46b, goods: 0xb0773c, ei: 0.9 };

export function mall() {
  const { scene, cam } = base(0x0b1530, 0x14204a, 14, 46, [0x4a6bc4, 0x10142a, 1.4], [0x8fb0ff, 1.0]);
  mallSet(scene, NIGHT);
  const esc = escalator(scene, -4.2, -1.2, NIGHT, 0); esc(0, 0);
  const [h, p] = hero(scene, { worried: true }); const sh = shadowBlob(scene);
  const key = new THREE.PointLight(0xffe2b0, 12, 6, 1.2); scene.add(key);
  return { scene, cam, update(t, u) {
    const walk = Math.min(1, t / 4.2);                                       // идёт 4.2 с, потом стоит
    const x = lerp(-2.6, 1.6, ease(walk) * 0.15 + walk * 0.85);
    h.position.set(x, 0, 5.4); h.rotation.y = walk < 1 ? 1.2 : lerp(1.2, -0.3, ease((t - 4.2) / 0.8));
    const sw = walk < 1 ? Math.sin(t * 6.5) : 0;
    p.legL.rotation.x = 0.55 * sw; p.legR.rotation.x = -0.55 * sw;
    p.armL.rotation.x = -0.5 * sw; p.armR.rotation.x = 0.5 * sw;
    h.position.y = walk < 1 ? Math.abs(Math.sin(t * 6.5)) * 0.04 : 0;
    p.head.rotation.x = t > 4.6 ? lerp(0, -0.35, ease((t - 4.6) / 0.8)) : 0;   // смотрит вверх на этажи
    p.head.rotation.y = walk < 1 ? -0.5 : 0;
    setEyes(p, blinkAt(t, [1.4, 5.8]));
    sh.position.set(x, 0.012, 5.45); key.position.set(x - 0.8, 2.6, 7.4);
    look(cam, lerpV([-1.5, 2.4, 13.5], [1.6, 2.0, 12.5], ease(u)), lerpV([-1.6, 3.2, 0], [0.6, 3.6, 0], ease(u)));
  } };
}

// ---------- 3. Фудкорт утром: считает запасы
export function foodcourt() {
  const { scene, cam } = base(0xcfe6ff, 0xe6f0ff, 16, 50, [0xffffff, 0x9a8a78, 1.7], [0xfff1da, 2.0]);
  const B = boxer(scene);
  B(60, 0.2, 40, 0xe2d6c4, 0, -0.1, 0);
  B(40, 8, 0.4, 0xf1e6d6, 0, 4, -9.5);
  B(40, 0.5, 9, 0xf6efe4, 0, 8, -5);                                      // потолок-козырёк
  for (let i = -3; i <= 3; i++) B(1.6, 0.06, 0.6, 0xffffff, i * 4, 7.72, -4, 0xffffff, 0.8);
  // прилавки с витринами-холодильниками
  for (let i = -2; i <= 2; i++) {
    const x = i * 5;
    B(4.4, 1.1, 1.2, 0xc96f3c, x, 0.55, -7.2);
    const glass = B(4.2, 0.7, 0.9, 0xbfe6ff, x, 1.45, -7.2, 0xd8f2ff, 0.5);
    for (let k = 0; k < 6; k++) B(0.45, 0.25, 0.45, [0xe85a4f, 0xf2c14e, 0x7cc36a, 0xf08a3c][k % 4], x - 1.6 + k * 0.64, 1.25, -7.1);
    B(4.4, 0.6, 0.3, 0x7a3e22, x, 3.6, -9.1);                              // пустая вывеска
  }
  // автоматы с водой
  for (let i = 0; i < 3; i++) {
    const x = 9.2 + i * 1.5;
    B(1.3, 2.6, 0.9, 0x2f6fd0, x, 1.3, -3.5 + i * 0.05);
    B(1.0, 1.7, 0.05, 0xdff3ff, x - 0.05, 1.6, -3.03, 0xeaf7ff, 0.6);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) cyl(scene, 0.06, 0.06, 0.3, 0x3fa9ff, x - 0.4 + c * 0.22, 0.95 + r * 0.42, -3.0, 8);
  }
  // столы и стулья
  for (let r = 0; r < 3; r++) for (let c = -3; c <= 2; c++) {
    const x = c * 3 + (r % 2) * 1.5, z = -2 + r * 2.8;
    if (Math.abs(x - 0.6) < 1.4 && r === 2) continue;
    cyl(scene, 0.7, 0.7, 0.08, 0xe9c48f, x, 0.78, z, 28); cyl(scene, 0.06, 0.06, 0.78, 0x6b6f78, x, 0.39, z, 10);
    for (const s of [-1, 1]) { B(0.5, 0.06, 0.5, 0xd98b3a, x + 0.95 * s, 0.48, z); B(0.06, 0.6, 0.5, 0xd98b3a, x + 1.18 * s, 0.78, z); B(0.05, 0.48, 0.05, 0x6b6f78, x + 0.95 * s, 0.24, z); }
  }
  const [h, p] = hero(scene, {}); const sh = shadowBlob(scene);
  h.position.set(0.6, 0, 3.6); h.rotation.y = -0.3; sh.position.set(0.6, 0.012, 3.65);
  // планшет в левой руке, карандаш в правой
  const clip = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.5, 0.03), toon(0xb07a46)); clip.position.set(0.08, -0.5, 0.18); clip.rotation.x = -0.9; p.armL.add(clip);
  const paper = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.4, 0.01), toon(0xffffff)); paper.position.set(0, 0.0, 0.02); clip.add(paper);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 8), toon(0xf2b51c)); pen.position.set(0, -0.58, 0.05); pen.rotation.x = 0.4; p.armR.add(pen);
  return { scene, cam, update(t, u) {
    p.armL.rotation.set(-1.0, 0, -0.35);
    p.armR.rotation.set(-1.1 + 0.08 * Math.sin(t * 14), 0, 0.45 + 0.05 * Math.sin(t * 9));   // пишет
    // смотрит то на планшет, то на прилавки и автоматы
    const ph = Math.floor(t / 1.6) % 4;
    const tgt = [[0.45, 0], [0.05, 0.5], [0.45, 0], [0.0, -0.7]][ph];
    p.head.rotation.x = lerp(p.head.rotation.x, tgt[0], 0.15); p.head.rotation.y = lerp(p.head.rotation.y, tgt[1], 0.15);
    setEyes(p, blinkAt(t, [2.2, 6.4, 9.1]));
    p.mouth.rotation.z = Math.PI;
    if (u < 0.5) look(cam, lerpV([-4.5, 3.0, 12.5], [-0.9, 1.9, 7.4], ease(u / 0.5)), lerpV([1.5, 1.8, -2], [0.7, 1.55, 3.4], ease(u / 0.5)));
    else look(cam, lerpV([-1.0, 2.3, 7.4], [-0.7, 2.2, 6.8], ease((u - 0.5) / 0.5)), new THREE.Vector3(0.62, 1.75, 3.6));   // крупный план
  } };
}

// ---------- 4. Ночь: (а) эскалатор едет сам, (б) испуганный герой выглядывает из-за колонны
export function escalatorNight() {
  const { scene, cam } = base(0x060c22, 0x0a1430, 8, 30, [0x3a55b0, 0x070912, 1.5], [0x7f9cff, 0.6]);
  const P = { ...NIGHT };
  const B = boxer(scene);
  B(60, 0.2, 40, 0x1c2648, 0, -0.1, 0);
  B(40, 4.2, 0.4, 0x1e2a50, 0, 2.1, -9.6);
  B(40, 0.5, 6.4, 0x2a3664, 0, 3.95, -9.4); B(40, 0.08, 0.12, 0x0d1222, 0, 5.2, -6.2);
  for (let i = -5; i <= 5; i++) B(2.8, 2.4, 0.1, 0x22305c, i * 3.4, 1.3, -9.3, 0x2a3c80, 0.35);
  for (const x of [-6, 5]) cyl(scene, 0.45, 0.45, 9, 0x26315c, x, 4.5, -5.8, 24);
  const esc = escalator(scene, -0.6, -0.6, P, 0x9fd0ff);
  const el = new THREE.PointLight(0x8fc4ff, 18, 9, 1.2); el.position.set(-0.6, 2.6, -2.0); scene.add(el);
  // герой и колонна (план б)
  const fin = new THREE.Vector3(3.2, 0, 4.6), cp = new THREE.Vector3(-0.3, 1.9, 0.9);
  const d = fin.clone().sub(cp).setY(0).normalize(), right = new THREE.Vector3(d.z, 0, -d.x);
  const pil = fin.clone().addScaledVector(right, 0.85).addScaledVector(d, -0.45);
  B(1.1, 9, 1.1, 0x222c52, pil.x, 4.5, pil.z).rotation.y = Math.atan2(d.x, d.z);
  const [h, p] = hero(scene, { worried: true });
  h.rotation.y = Math.atan2(-d.x, -d.z);
  const face = new THREE.PointLight(0x9fd0ff, 10, 6, 1.2); face.position.copy(cp).add(new THREE.Vector3(0, 0.3, 0)); scene.add(face);
  return { scene, cam, update(t, u) {
    esc(t, 0.12);
    el.intensity = Math.random() < 0.06 ? 10 : 18;                           // лампа подрагивает
    const cut = u < 0.45; h.visible = !cut;
    if (cut) { const k = ease(u / 0.45); look(cam, lerpV([3.6, 1.5, 6.5], [2.4, 1.7, 4.6], k), new THREE.Vector3(-0.8, 2.1, -2.6)); return; }
    const tt = t - 0.45 * t / Math.max(u, 1e-3);                              // время внутри плана б
    const peek = ease((tt - 0.3) / 1.0);
    h.position.copy(fin).addScaledVector(right, 0.75 * (1 - peek)).addScaledVector(d, 0.25 * (1 - peek));
    h.position.y = 0.008 * Math.sin(t * 24);                                 // дрожит
    p.head.rotation.set(0.0, 0, lerp(0, 0.28, peek));
    p.armL.rotation.set(-1.3, 0, 0.5);                                       // держится за колонну
    setEyes(p, blinkAt(tt, [1.9]), 1.4);
    p.mouth.rotation.z = 0;
    look(cam, cp.clone().addScaledVector(d, 0.35 * ease(tt / 3)), fin.clone().add(new THREE.Vector3(0, 1.75, 0)));
  } };
}
