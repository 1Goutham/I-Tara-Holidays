/* Landscape shader: depth-parallax plate with procedural atmosphere. Props are separate DOM layers. */

export const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uImg;     // landscape plate (no props)
uniform sampler2D uDepth;   // r: sharp depth (occlusion), g: fog mask, b: smooth depth (parallax)
uniform vec2  uRes;         // canvas size (device px)
uniform float uDpr;
uniform vec2  uImgRes;      // plate size (px)
uniform vec2  uCenter;      // plate uv at screen centre
uniform vec2  uVis;         // visible plate fraction at zoom 1
uniform vec2  uPar;         // parallax vector in plate uv (pointer * strength)
uniform float uZoom;        // camera zoom (shared with the DOM prop layers)
uniform float uDolly;       // extra depth-weighted push-in while scrolling
uniform float uTime;
uniform float uScroll;
uniform float uIntro;
uniform float uLayer;       // 0 = full frame, 1 = near layer + steam only
uniform vec2  uSun;         // plate uv of the sun
uniform vec2  uMugPx;       // mug rim, CSS px from the scene's top-left (follows its layer)
uniform float uSteamUnit;   // CSS px per steam unit

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
float depthAt(vec2 uv) { return texture2D(uDepth, uv).b; }

float steamAt(vec2 px) {
  vec2 st = (px - uMugPx) / uSteamUnit;              // y grows downward
  float h = -st.y;
  if (h < -0.1 || h > 4.6) return 0.0;
  float steam = 0.0;
  for (int k = 0; k < 2; k++) {
    float fk = float(k);
    float sway = sin(h * 1.7 - uTime * (1.1 + fk * 0.3) + fk * 2.1) * 0.12 * h
               + sin(h * 0.6 + uTime * 0.5 + fk) * 0.08 * h + uPar.x * 6.0 * h;
    float x = st.x - sway + (fk - 0.5) * 0.18;
    float w = 0.10 + h * 0.13;
    float n = fbm(vec2(x * 3.2 + fk * 3.7, h * 1.4 - uTime * (0.7 + fk * 0.2)));
    steam += smoothstep(w, 0.0, abs(x)) * smoothstep(0.36, 0.72, n);
  }
  float life = smoothstep(0.0, 0.5, h) * (1.0 - smoothstep(1.4, 4.4, h));
  return clamp(steam, 0.0, 1.0) * life * 0.62;
}

void main() {
  vec2 s = gl_FragCoord.xy / uRes;
  s.y = 1.0 - s.y;
  vec2 cssPx = s * uRes / uDpr;

  // near-layer pass: steam belongs to the mug layer, so it is evaluated in screen space
  float steamA = uLayer > 0.5 ? steamAt(cssPx) : 0.0;

  vec2 base = (s - 0.5) * uVis;
  vec2 uv = uCenter + base / uZoom;
  float d = depthAt(uv);
  for (int i = 0; i < 2; i++) {
    uv = uCenter + base / (uZoom * (1.0 + uDolly * d)) + uPar * (d - 0.3);
    d = depthAt(uv);
  }
  uv = clamp(uv, vec2(0.001), vec2(0.999));
  vec3 maps = texture2D(uDepth, uv).rgb;
  float near = smoothstep(0.22, 0.30, maps.r);
  if (uLayer > 0.5 && near < 0.003 && steamA < 0.003) discard;

  vec3 col = texture2D(uImg, uv).rgb;
  float aspect = uImgRes.x / uImgRes.y;

  // sun: bloom + slow light shafts
  vec2 sv = (uv - uSun) * vec2(aspect, 1.0);
  float sd = length(sv);
  float breathe = 0.92 + 0.08 * sin(uTime * 0.7);
  vec3 sunCol = vec3(1.0, 0.80, 0.52);
  float skyish = 1.0 - smoothstep(0.15, 0.6, maps.r);
  col += sunCol * (0.06 * exp(-sd * 3.5) + 0.22 * exp(-sd * 18.0) + 0.35 * exp(-sd * 60.0)) * breathe;
  float ang = atan(sv.y, sv.x);
  float shafts = pow(0.5 + 0.5 * sin(ang * 11.0 + noise(vec2(ang * 2.5, uTime * 0.05)) * 5.0 + uTime * 0.04), 4.0);
  col += sunCol * shafts * exp(-sd * 2.6) * 0.065 * (0.35 + 0.65 * skyish) * (1.0 + uScroll * 0.8);

  // valley fog: two drifting sheets at different depths
  vec2 fp = vec2(uv.x * aspect, uv.y);
  float f1 = fbm(fp * vec2(2.2, 7.0) + vec2(uTime * 0.018, 0.0) + uPar * 4.0);
  float f2 = fbm(fp * vec2(4.0, 11.0) - vec2(uTime * 0.03, uTime * 0.004) - uPar * 7.0 + 7.3);
  float sheet = smoothstep(0.42, 0.80, f1) * 0.65 + smoothstep(0.50, 0.85, f2) * 0.45;
  float density = 0.55 + uScroll * 0.9 + (1.0 - uIntro) * 0.9;
  float fogA = clamp(maps.g * sheet * density, 0.0, 0.85);
  vec3 fogCol = mix(vec3(0.96, 0.95, 0.93), vec3(1.0, 0.90, 0.76), exp(-sd * 2.0));
  col = mix(col, fogCol, fogA * 0.6);

  // grade: dawn exposure on entrance, vignette, grain
  col = mix(vec3(0.97, 0.95, 0.90), col, 0.55 + 0.45 * uIntro);
  float vig = smoothstep(1.15, 0.35, length((s - 0.5) * vec2(1.0, 0.85)));
  col *= mix(0.86, 1.0, vig);
  col += (hash(gl_FragCoord.xy + fract(uTime) * 91.0) - 0.5) * 0.022;

  if (uLayer < 0.5) { gl_FragColor = vec4(col, 1.0); return; }
  // premultiplied output: the near landscape, with steam composited over it
  float a = near + steamA * (1.0 - near);
  vec3 pm = col * near * (1.0 - steamA) + vec3(1.0, 0.99, 0.97) * steamA;
  gl_FragColor = vec4(pm, a);
}
`;
