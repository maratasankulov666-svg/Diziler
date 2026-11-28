// Общий движок: мультяшный свет + «живой» контур от руки (линии чуть дрожат 8 раз в секунду),
// бумажное зерно и виньетка. Сцена рисуется в 3 прохода: цвет, нормали, итог.
import * as THREE from 'three';
export { THREE };
export const W = 1280, H = 720;

export const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H); document.body.appendChild(renderer.domElement);

const grad = new THREE.DataTexture(new Uint8Array([95, 95, 95, 255, 175, 175, 175, 255, 255, 255, 255, 255]), 3, 1);
grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
export const toon = (c, em = 0, ei = 1) => new THREE.MeshToonMaterial({ color: c, gradientMap: grad, emissive: em || 0, emissiveIntensity: ei });

// примитивы
export function boxer(parent) {
  return (w, h, d, c, x, y, z, em, ei) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon(c, em, ei)); o.position.set(x, y, z); parent.add(o); return o; };
}
export function cyl(parent, rt, rb, h, c, x, y, z, seg = 20) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), toon(c)); o.position.set(x, y, z); parent.add(o); return o; }
export function shadowBlob(parent, r = 0.55) {
  const o = new THREE.Mesh(new THREE.CircleGeometry(r, 32), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35, depthWrite: false }));
  o.rotation.x = -Math.PI / 2; parent.add(o); return o;
}

const rtC = new THREE.WebGLRenderTarget(W, H, { depthTexture: new THREE.DepthTexture(W, H) });
const rtN = new THREE.WebGLRenderTarget(W, H);
const nMat = new THREE.MeshNormalMaterial();
const U = { tC: { value: rtC.texture }, tD: { value: rtC.depthTexture }, tN: { value: rtN.texture }, px: { value: new THREE.Vector2(1.7 / W, 1.7 / H) },
  ink: { value: new THREE.Color(0x0c0d14) }, tb: { value: 0 }, near: { value: 0.1 }, far: { value: 100 } };
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: U,
  vertexShader: 'varying vec2 v; void main(){ v=uv; gl_Position=vec4(position,1.); }',
  fragmentShader: `uniform sampler2D tC,tD,tN; uniform vec2 px; uniform vec3 ink; uniform float tb,near,far; varying vec2 v;
    float ld(vec2 u){ float z=texture2D(tD,u).r*2.-1.; return (2.*near*far)/(far+near-z*(far-near)); }
    float h(vec2 p){ return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453); }
    void main(){
      // дрожание линии: смещение выборки по плавному шуму, меняется ступеньками (tb)
      vec2 j = vec2(sin(v.y*70.+tb*7.1)+sin(v.x*33.+tb*3.7), cos(v.x*61.+tb*5.3)+sin(v.y*29.+tb*2.9))*px*0.55;
      vec2 u = v + j;
      float d=ld(u); vec3 n=texture2D(tN,u).rgb; float e=0.;
      for(int i=0;i<4;i++){ vec2 o = i==0?vec2(px.x,0.):i==1?vec2(-px.x,0.):i==2?vec2(0.,px.y):vec2(0.,-px.y);
        float dd=ld(u+o); vec3 nn=texture2D(tN,u+o).rgb;
        e=max(e, step(0.03*d, abs(dd-d))); e=max(e, step(0.33, distance(n,nn))); }
      vec3 c=texture2D(tC,v).rgb;
      c = mix(c, ink, e*0.9);
      c += (h(v*vec2(1280.,720.)+tb)-.5)*0.035;                    // зерно бумаги
      float vg = smoothstep(0.95, 0.35, distance(v, vec2(.5)));     // виньетка
      c *= mix(0.55, 1., vg);
      gl_FragColor=vec4(c,1.);
      #include <colorspace_fragment>
    }` }));
const post = new THREE.Scene(); post.add(quad); const oc = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export function draw(scene, cam, t) {
  U.tb.value = Math.floor(t * 8);            // «кипение» линии 8 раз в секунду, как в рисованной анимации
  U.near.value = cam.near; U.far.value = cam.far;
  renderer.setRenderTarget(rtC); renderer.render(scene, cam);
  const bg = scene.background, fog = scene.fog;
  scene.overrideMaterial = nMat; scene.background = new THREE.Color(0x8080ff); scene.fog = null;
  renderer.setRenderTarget(rtN); renderer.render(scene, cam);
  scene.overrideMaterial = null; scene.background = bg; scene.fog = fog;
  renderer.setRenderTarget(null); renderer.render(post, oc);
}

export const ease = u => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, u)));
export const lerp = (a, b, u) => a + (b - a) * u;
export const lerpV = (a, b, u) => new THREE.Vector3(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));

// моргание: возвращает 0..1 (1 = глаз открыт)
export function blinkAt(t, times) { for (const b of times) { const d = t - b; if (d >= 0 && d < 0.16) return Math.abs(d - 0.08) / 0.08 * 0.9 + 0.1; } return 1; }
