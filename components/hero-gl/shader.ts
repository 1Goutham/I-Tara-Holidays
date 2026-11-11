/* Hero scene shader: depth-parallax photograph with procedural atmosphere. */

export const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uImg;     // colour plate
uniform sampler2D uDepth;   // r: sharp depth (occlusion), g: fog mask, b: smooth depth (parallax)
uniform vec2  uRes;         // canvas size (px)
uniform vec2  uImgRes;      // plate size (px)
uniform vec2  uCenter;      // plate uv at screen centre (cover crop focus)
uniform vec2  uVis;         // visible plate fraction at zoom 1
uniform vec2  uMouse;       // smoothed pointer, -1..1
uniform float uTime;
uniform float uScroll;      // 0..1 through the pinned hero
uniform float uIntro;       // 0 → 1 entrance
uniform float uLayer;       // 0 = full frame, 1 = near layer only (drawn over the headline)
uniform vec2  uSun;         // plate uv of the sun
uniform vec2  uMug;         // plate uv of the mug rim
uniform vec2  uLantern;
uniform vec2  uFire;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}

// parallax reads the smooth channel: depth steps become soft warps, so edges never tear
float depthAt(vec2 uv) { return texture2D(uDepth, uv).b; }

void main() {
  vec2 s = gl_FragCoord.xy / uRes;
  s.y = 1.0 - s.y;                                   // top-left origin, like the plate
  vec2 base = (s - 0.5) * uVis;

  // camera: slight overscan for parallax room; scroll dollies in, near layers faster (true depth)
  float zoom = 1.06 + (1.0 - uIntro) * 0.05 + uScroll * 0.08;
  vec2 par = uMouse * vec2(0.013, 0.007);

  vec2 uv = uCenter + base / zoom;
  float d = depthAt(uv);
  for (int i = 0; i < 2; i++) {                      // relief iterations: resolve depth at the displaced point
    uv = uCenter + base / (zoom * (1.0 + uScroll * 0.24 * d)) + par * (d - 0.3);
    d = depthAt(uv);
  }

  uv = clamp(uv, vec2(0.001), vec2(0.999));
  vec3 maps = texture2D(uDepth, uv).rgb;
  float near = smoothstep(0.22, 0.30, maps.r);
  if (uLayer > 0.5 && near < 0.003) discard;        // near-layer pass: only hills, meadow, camp and leaves

  vec3 col = texture2D(uImg, uv).rgb;

  float aspect = uImgRes.x / uImgRes.y;

  // ---- sun: bloom + slow light shafts through the haze ----
  vec2 sv = (uv - uSun) * vec2(aspect, 1.0);
  float sd = length(sv);
  float breathe = 0.92 + 0.08 * sin(uTime * 0.7);
  vec3 sunCol = vec3(1.0, 0.80, 0.52);
  float skyish = 1.0 - smoothstep(0.15, 0.6, maps.r);
  col += sunCol * (0.06 * exp(-sd * 3.5) + 0.22 * exp(-sd * 18.0) + 0.35 * exp(-sd * 60.0)) * breathe;
  float ang = atan(sv.y, sv.x);
  float shafts = pow(0.5 + 0.5 * sin(ang * 11.0 + noise(vec2(ang * 2.5, uTime * 0.05)) * 5.0 + uTime * 0.04), 4.0);
  col += sunCol * shafts * exp(-sd * 2.6) * 0.065 * (0.35 + 0.65 * skyish) * (1.0 + uScroll * 0.8);

  // ---- valley fog: two drifting sheets at different depths (volumetric read) ----
  float fogMask = maps.g;
  vec2 fp = vec2(uv.x * aspect, uv.y);
  float f1 = fbm(fp * vec2(2.2, 7.0) + vec2(uTime * 0.018, 0.0) + uMouse * 0.05);
  float f2 = fbm(fp * vec2(4.0, 11.0) - vec2(uTime * 0.03, uTime * 0.004) - uMouse * 0.09 + 7.3);
  float sheet = smoothstep(0.42, 0.80, f1) * 0.65 + smoothstep(0.50, 0.85, f2) * 0.45;
  float density = 0.55 + uScroll * 0.9 + (1.0 - uIntro) * 0.9;
  float fogA = clamp(fogMask * sheet * density, 0.0, 0.85);
  vec3 fogCol = mix(vec3(0.96, 0.95, 0.93), vec3(1.0, 0.90, 0.76), exp(-sd * 2.0));   // sun-warmed near the sun
  col = mix(col, fogCol, fogA * 0.6);
  // low ground haze over the meadow edge
  col = mix(col, fogCol, smoothstep(0.55, 0.0, abs(uv.y - 0.74) * 6.0) * 0.08 * (1.0 + uScroll * 2.0));

  // ---- coffee steam: two thin, translucent wisps curling off the rim ----
  vec2 st = (uv - uMug) * uImgRes / 40.0;           // ~40 px units, y grows downward
  float h = -st.y;
  if (h > -0.1 && h < 4.5) {
    float steam = 0.0;
    for (int k = 0; k < 2; k++) {
      float fk = float(k);
      float sway = sin(h * 1.7 - uTime * (1.1 + fk * 0.3) + fk * 2.1) * 0.12 * h
                 + sin(h * 0.6 + uTime * 0.5 + fk) * 0.08 * h + uMouse.x * 0.08 * h;
      float x = st.x - sway + (fk - 0.5) * 0.18;
      float w = 0.07 + h * 0.10;
      float n = fbm(vec2(x * 4.0 + fk * 3.7, h * 1.4 - uTime * (0.7 + fk * 0.2)));
      steam += smoothstep(w, 0.0, abs(x)) * smoothstep(0.42, 0.75, n);
    }
    float life = smoothstep(0.0, 0.5, h) * (1.0 - smoothstep(1.4, 4.2, h));
    col = mix(col, vec3(1.0, 0.99, 0.97), clamp(steam, 0.0, 1.0) * life * 0.4);
  }

  // ---- lantern + campfire flicker ----
  float flick = 0.80 + 0.20 * noise(vec2(uTime * 9.0, 1.3)) + 0.08 * sin(uTime * 23.0);
  vec2 lv = (uv - uLantern) * vec2(aspect, 1.0);
  col += vec3(1.0, 0.66, 0.30) * exp(-length(lv) * 34.0) * 0.55 * flick;
  vec2 fv = (uv - uFire) * vec2(aspect, 1.0);
  col += vec3(1.0, 0.55, 0.22) * exp(-length(fv) * 26.0) * 0.45 * (0.75 + 0.25 * noise(vec2(uTime * 7.0, 4.1)));

  // ---- grade: dawn exposure on entrance, gentle vignette, fine grain ----
  col = mix(vec3(0.97, 0.95, 0.90), col, 0.55 + 0.45 * uIntro);
  float vig = smoothstep(1.15, 0.35, length((s - 0.5) * vec2(1.0, 0.85)));
  col *= mix(0.86, 1.0, vig);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.022;

  float a = uLayer > 0.5 ? near : 1.0;
  gl_FragColor = vec4(col * a, a);
}
`;
