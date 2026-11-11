/* Front-layer compositing shader: photographic cut-outs with light wrap, rim light, grade and wind. */

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
uniform float uMode;        // 0 = prop, 1 = contact shadow, 2 = grass strip (wind + feathered ends)
uniform float uTime;
uniform float uSeed;
uniform float uWrap;        // light-wrap strength
uniform float uRim;         // backlight rim strength
uniform float uHaze;
uniform float uOpacity;
uniform float uShade;
varying vec2 vUv;
varying vec2 vScreen;

void main() {
  if (abs(uMode - 1.0) < 0.5) {
    float d = length((vUv - 0.5) * 2.0);
    float a = pow(1.0 - smoothstep(0.0, 1.0, d), 1.6) * uOpacity;
    gl_FragColor = vec4(vec3(0.03, 0.06, 0.03) * a, a);
    return;
  }
  vec2 uv = vUv;
  float feather = 1.0;
  if (uMode > 1.5) {
    // wind: a gust travelling along the strip; tips move, roots stay planted (v = 0 is the top)
    float tip = pow(1.0 - uv.y, 2.2);
    float gust = sin(uv.x * 9.0 - uTime * 1.6 + uSeed) * 0.6 + sin(uv.x * 23.0 - uTime * 2.7 + uSeed * 2.0) * 0.25 + sin(uTime * 0.5 + uSeed) * 0.4;
    uv.x += gust * tip * 0.0045;
    uv.y += abs(gust) * tip * 0.012;
    feather = smoothstep(0.0, 0.09, vUv.x) * smoothstep(1.0, 0.91, vUv.x) * smoothstep(1.0, 0.86, vUv.y);
  }
  vec4 c = texture2D(uTex, uv) * feather;
  if (c.a < 0.003) discard;
  vec3 col = c.rgb / c.a * uShade;

  // how much of the neighbourhood is empty: high at silhouette edges (light wrap)
  vec2 px = 1.0 / uRect.zw;
  float r = 7.0;
  float ab = 0.0;
  for (int i = 0; i < 8; i++) {
    float an = float(i) * 0.785398;
    ab += texture2D(uTex, uv + vec2(cos(an), sin(an)) * px * r).a;
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
  float aSun = texture2D(uTex, uv + toSun * px * 3.5).a * feather;
  float rim = clamp(c.a - aSun, 0.0, 1.0);
  col += vec3(1.0, 0.80, 0.52) * rim * uRim;

  gl_FragColor = vec4(col * c.a, c.a) * uOpacity;
}
`;
