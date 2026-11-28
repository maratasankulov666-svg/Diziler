// Наш герой, собранный из простых фигур three.js. Каждая часть — отдельный объект,
// поэтому анимировать легко: голова, руки, ноги, глаза, рот двигаются кодом.
import * as THREE from 'three';

export function makeHero(toon, opts = {}) {
  const C = { skin: 0xf4f1ea, hat: 0xf2b51c, hair: 0x7a4a26, hoodie: 0x8a8d93, dark: 0x1d1d22, shoe: 0x9aa0a8, sole: 0xf0f0f0, ...opts };
  const g = new THREE.Group(); const parts = {};
  const m = (geo, col, x, y, z, name) => { const o = new THREE.Mesh(geo, toon(col)); o.position.set(x, y, z); g.add(o); if (name) parts[name] = o; return o; };

  // ноги-палочки и кроссовки
  for (const s of [-1, 1]) {
    m(new THREE.CylinderGeometry(0.045, 0.045, 0.62, 12), C.dark, 0.11 * s, 0.38, 0, s < 0 ? 'legL' : 'legR');
    const shoe = m(new THREE.CapsuleGeometry(0.085, 0.16, 6, 12), C.shoe, 0.12 * s, 0.07, 0.06);
    shoe.rotation.x = Math.PI / 2;
    const sole = m(new THREE.BoxGeometry(0.19, 0.04, 0.36), C.sole, 0.12 * s, 0.02, 0.06);
  }
  // худи
  const body = m(new THREE.CapsuleGeometry(0.29, 0.22, 8, 20), C.hoodie, 0, 0.98, 0, 'body');
  body.scale.set(1, 1, 0.8);
  const pocket = m(new THREE.BoxGeometry(0.34, 0.14, 0.05), 0x7b7e84, 0, 0.88, 0.235);
  // капюшон за головой
  const hood = m(new THREE.TorusGeometry(0.26, 0.09, 10, 24), C.hoodie, 0, 1.3, -0.1);
  hood.rotation.x = Math.PI / 2.4;
  // руки
  for (const s of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(0.3 * s, 1.18, 0); g.add(arm); parts[s < 0 ? 'armL' : 'armR'] = arm;
    const sleeve = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.36, 6, 12), toon(C.hoodie));
    sleeve.position.y = -0.24; arm.add(sleeve);
    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 12), toon(C.dark));
    glove.position.y = -0.5; arm.add(glove);
    arm.rotation.z = 0.25 * s;
  }
  // голова
  const head = new THREE.Group(); head.position.set(0, 1.78, 0); head.scale.setScalar(1.3); g.add(head); parts.head = head;
  const hm = (geo, col, x, y, z) => { const o = new THREE.Mesh(geo, toon(col)); o.position.set(x, y, z); head.add(o); return o; };
  hm(new THREE.SphereGeometry(0.44, 40, 30), C.skin, 0, 0, 0);
  // волосы-пряди по бокам из-под шапки
  for (const [x, z, r] of [[-0.4, 0.05, 0.6], [-0.36, 0.2, 0.3], [0.4, 0.05, -0.6], [0.36, 0.2, -0.3], [-0.2, 0.36, 0.1], [0.12, 0.38, -0.1]]) {
    const t = hm(new THREE.ConeGeometry(0.08, 0.22, 8), C.hair, x, 0.1, z); t.rotation.z = Math.PI + r; t.rotation.x = z > 0.3 ? -0.5 : 0;
  }
  // шапка: купол + отворот + помпон
  const cap = hm(new THREE.SphereGeometry(0.46, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), C.hat, 0, 0.1, 0);
  cap.scale.set(1, 1.05, 1);
  const rim = hm(new THREE.TorusGeometry(0.44, 0.085, 12, 40), 0xe3a514, 0, 0.12, 0); rim.rotation.x = Math.PI / 2;
  hm(new THREE.SphereGeometry(0.1, 16, 12), C.hat, 0, 0.6, 0);
  // глаза-точки и рот
  const eyes = [];
  for (const s of [-1, 1]) { const e = hm(new THREE.SphereGeometry(0.055, 16, 12), C.dark, 0.14 * s, -0.08, 0.41); e.scale.set(1, 1.3, 0.5); eyes.push(e); }
  parts.eyes = eyes;
  const mouth = hm(new THREE.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), C.dark, 0, -0.26, 0.4);
  mouth.rotation.z = opts.worried ? 0 : Math.PI; parts.mouth = mouth;
  g.userData.parts = parts;
  return g;
}
