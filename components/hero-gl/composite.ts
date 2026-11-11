/* Front-layer compositing shaders: cut-out props (light wrap, rim light, grade) and 3D grass. */

export const SPRITE_VERT = /* glsl */ `
attribute vec2 aCorner;
uniform vec4 uRect;      // x, y, w, h in CSS px (top-left origin)
uniform vec2 uView;      // CSS px
varying vec2 vUv;
varying vec2 vScreen;
void main() {
  vUv = aCorner;
  vScreen = uRect.xy + aCorner * uRect.zw;
  gl_Position = vec4(vScreen.x / uView.x * 2.0 - 1.0, 1.0 - vScreen.y / uView.y * 2.0, 0.0, 1.0);
}
`;

export const SPRITE_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uTex;     // premultiplied cut-out
uniform sampler2D uBlur;    // blurred landscape: the light around the prop
uniform vec4  uRect;
uniform vec2  uView;
uniform vec2  uCenter;      // plate uv at screen centre
uniform vec2  uVis;
uniform float uZoom;
uniform vec2  uSunPx;       // sun position, CSS px
uniform float uMode;        // 0 = prop, 1 = contact shadow
uniform float uWrap;        // light-wrap strength
uniform float uRim;         // backlight rim strength
uniform float uHaze;
uniform float uOpacity;
varying vec2 vUv;
varying vec2 vScreen;

void main() {
  if (uMode > 0.5) {
    float d = length((vUv - 0.5) * 2.0);
    float a = pow(1.0 - smoothstep(0.0, 1.0, d), 1.6) * uOpacity;
    gl_FragColor = vec4(vec3(0.03, 0.06, 0.03) * a, a);
    return;
  }
  vec4 c = texture2D(uTex, vUv);
  if (c.a < 0.003) discard;
  vec3 col = c.rgb / c.a;

  // how much of the neighbourhood is empty: high at silhouette edges (light wrap)
  vec2 px = 1.0 / uRect.zw;
  float r = 7.0;
  float ab = 0.0;
  for (int i = 0; i < 8; i++) {
    float an = float(i) * 0.785398;
    ab += texture2D(uTex, vUv + vec2(cos(an), sin(an)) * px * r).a;
  }
  ab /= 8.0;
  float wrap = clamp((1.0 - ab) * 1.6, 0.0, 1.0);

  // the scene light right behind this pixel
  vec2 s = vScreen / uView;
  vec3 bg = texture2D(uBlur, uCenter + (s - 0.5) * uVis / uZoom).rgb;

  // grade into the plate: warm dawn balance, a breath of atmospheric haze
  col = mix(col, col * vec3(1.05, 1.0, 0.9), 0.7);
  col = mix(col, bg, uHaze);
  // light wrap: the bright background bleeds around the silhouette
  col = col + (1.0 - col) * bg * wrap * uWrap;
  // backlight: edges facing the sun catch a warm rim
  vec2 toSun = normalize(uSunPx - vScreen);
  float aSun = texture2D(uTex, vUv + toSun * px * 3.5).a;
  float rim = clamp(c.a - aSun, 0.0, 1.0);
  col += vec3(1.0, 0.80, 0.52) * rim * uRim;

  gl_FragColor = vec4(col * c.a, c.a) * uOpacity;
}
`;

export const GRASS_VERT = /* glsl */ `
attribute vec3 aC;       // blade centre at this level (normalised: x,z in -1..1, y in 0..1)
attribute vec2 aRoot;    // blade root x,z (normalised)
attribute float aSide;   // -1 / +1
attribute float aT;      // 0 base → 1 tip
attribute float aRand;
uniform vec2  uView;
uniform vec2  uAnchor;   // patch centre, plate px
uniform vec3  uScale;    // x spread, blade height, z depth (plate px per normalised unit)
uniform float uWidth;    // half blade width at the base, plate px
uniform float uMirror;
uniform vec2  uZRange;   // draw blades whose root z is inside this range
uniform float uRestK;    // CSS px per plate px at rest
uniform vec2  uCpx;      // plate px at screen centre
uniform float uM;        // layer scale (camera)
uniform vec2  uT;        // layer translate (camera)
uniform float uTime;
uniform float uWind;
uniform vec2  uPointer;  // CSS px
varying float vT;
varying float vRand;
varying vec2  vRootScreen;

vec2 toScreen(vec2 plate) {
  vec2 rest = uView * 0.5 + (plate - uCpx) * uRestK;
  return uView * 0.5 + (rest - uView * 0.5) * uM + uT;
}

void main() {
  if (aRoot.y < uZRange.x || aRoot.y >= uZRange.y) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  // organic patch edge: blades thin out toward the rim of the patch instead of ending in a line
  float edge = length(aRoot * vec2(1.0, 1.15));
  float keep = fract(sin(dot(aRoot, vec2(127.1, 311.7))) * 43758.5453);
  if (keep < smoothstep(0.45, 1.0, edge)) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); return; }
  vec2 rootPlate = uAnchor + vec2(aRoot.x * uMirror * uScale.x, aRoot.y * uScale.z);
  vec2 rootScreen = toScreen(rootPlate);
  vec2 plate = uAnchor + vec2(aC.x * uMirror * uScale.x, aC.z * uScale.z - aC.y * uScale.y);

  // wind: slow swell + quicker flutter, stronger toward the tip
  float sway = sin(uTime * 1.3 + aRoot.x * 7.0 + aRoot.y * 4.0) * 0.6
             + sin(uTime * 2.9 + aRoot.x * 19.0 + aRand * 6.0) * 0.25
             + sin(uTime * 0.45 + aRoot.x * 2.0) * 0.5;
  // blades lean away from the pointer
  vec2 dp = rootScreen - uPointer;
  float push = sign(dp.x) * exp(-length(dp) / 140.0) * 1.4;
  float lean = (sway * uWind + push) * aT * aT * uScale.y * 0.22;
  plate.x += lean;
  plate.y += abs(lean) * 0.18;
  plate.x += aSide * uWidth * (1.0 - aT * 0.9) * (0.7 + aRand * 0.6);

  vec2 scr = toScreen(plate);
  vT = aT;
  vRand = aRand;
  vRootScreen = rootScreen;
  float z = -aRoot.y * 0.9;                 // nearer blades (larger z) win the depth test
  gl_Position = vec4(scr.x / uView.x * 2.0 - 1.0, 1.0 - scr.y / uView.y * 2.0, z, 1.0);
}
`;

export const GRASS_FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uBlur;
uniform vec2  uView;
uniform vec2  uCenter;
uniform vec2  uVis;
uniform float uZoom;
uniform vec2  uSunPx;
varying float vT;
varying float vRand;
varying vec2  vRootScreen;
void main() {
  // each blade takes the meadow colour beneath its root, so it belongs to the photograph
  vec2 s = vRootScreen / uView;
  vec3 ground = texture2D(uBlur, uCenter + (s - 0.5) * uVis / uZoom).rgb;
  vec3 col = mix(ground * 0.74, ground * 1.22 + vec3(0.06, 0.06, -0.01), vT);
  col *= 0.86 + vRand * 0.28;
  col = mix(col, col * vec3(1.08, 1.04, 0.78), step(0.82, vRand) * 0.6);   // a few dry, golden blades
  // translucent tips glow when backlit by the low sun
  float sunNear = exp(-distance(vRootScreen, uSunPx) / (uView.x * 0.55));
  col += vec3(1.0, 0.84, 0.48) * vT * vT * 0.22 * sunNear;
  float a = 1.0 - smoothstep(0.9, 1.0, vT) * 0.7;
  gl_FragColor = vec4(col * a, a);
}
`;
