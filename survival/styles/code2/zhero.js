// Герой на Zdog (github.com/metafizzy/zdog): круглый плоский псевдо-3D, рисуется на холст 400x700.
export function drawZHero(cv, o = {}) {
  const Z = window.Zdog, TAU = Z.TAU;
  cv.width = 400; cv.height = 700;
  const C = { skin: '#f7f3ec', hat: '#f4b41a', hatSh: '#d4940c', hair: '#7a4a26', hood: '#8d9199', hoodSh: '#6f737b', dark: '#1d1d22', shoe: '#b4bac2' };
  const illo = new Z.Illustration({ element: cv, rotate: { y: o.turn ?? -0.35, x: -0.08 }, translate: { y: 330 } });
  const sh = (opt) => new Z.Shape({ addTo: illo, ...opt });
  // ноги и кроссовки
  for (const s of [-1, 1]) {
    sh({ path: [{ x: 22 * s, y: -150 }, { x: 22 * s, y: -10 }], stroke: 13, color: C.dark });
    sh({ path: [{ x: 24 * s, y: 0, z: -8 }, { x: 24 * s, y: 0, z: 26 }], stroke: 34, color: C.shoe });
  }
  // тело-худи
  sh({ path: [{ y: -255 }, { y: -195 }], stroke: 150, color: C.hood });
  sh({ path: [{ x: -22, y: -205, z: 70 }, { x: 22, y: -205, z: 70 }], stroke: 30, color: C.hoodSh });
    // руки
  const arm = (s, ang) => { const a = new Z.Anchor({ addTo: illo, translate: { x: 82 * s, y: -290, z: 10 }, rotate: { z: ang } });
    new Z.Shape({ addTo: a, path: [{ y: 0 }, { y: 105 }], stroke: 32, color: C.hood }); new Z.Shape({ addTo: a, translate: { y: 118 }, stroke: 40, color: C.dark }); };
  arm(-1, o.armL ?? 0.3); arm(1, o.armR ?? -0.3);
  // голова
  const head = new Z.Anchor({ addTo: illo, translate: { y: -440 }, rotate: { z: o.headTilt || 0 } });
  new Z.Shape({ addTo: head, stroke: 236, color: C.skin });
  for (const s of [-1, 1]) for (const dy of [-20, 8]) new Z.Shape({ addTo: head, path: [{ x: 112 * s, y: dy - 20 }, { x: 122 * s, y: dy + 14 }], stroke: 16, color: C.hair });
  new Z.Hemisphere({ addTo: head, diameter: 246, translate: { y: -22 }, rotate: { x: TAU / 4 }, color: C.hat, backface: C.hatSh, stroke: false });
  new Z.Ellipse({ addTo: head, diameter: 246, stroke: 34, color: C.hatSh, translate: { y: -24 }, rotate: { x: TAU / 4 } });
  new Z.Shape({ addTo: head, translate: { y: -160 }, stroke: 56, color: C.hat });
  const mood = o.mood || 'worried', big = mood === 'scared' ? 1.35 : 1;
  for (const s of [-1, 1]) new Z.Ellipse({ addTo: head, width: 20 * big, height: 32 * big, fill: true, stroke: 4, color: C.dark, translate: { x: 40 * s, y: 18, z: 112 } });
  if (mood === 'scared') new Z.Ellipse({ addTo: head, width: 22, height: 28, stroke: 6, color: C.dark, translate: { y: 74, z: 100 } });
  else new Z.Shape({ addTo: head, path: [{ x: -20, y: 82 }, { bezier: [{ x: -8, y: mood === 'happy' ? 96 : 68 }, { x: 8, y: mood === 'happy' ? 96 : 68 }, { x: 20, y: 82 }] }], closed: false, stroke: 6, color: C.dark, translate: { z: 100 } });
  illo.updateRenderGraph();
  return cv;
}
