import { FRAG, VERT } from './shader';
import { SPRITE_FRAG, SPRITE_VERT } from './composite';
import { camera, coverFor, PLATE, REST_ZOOM, type SceneState } from './renderer';

export type TexKey = 'stump' | 'tent' | 'strip';
export interface PropDraw {
  tex: TexKey;
  rect: [number, number, number, number]; // CSS px x, y, w, h (already camera-transformed)
  strip?: boolean;  // grass strip: wind + feathered edges
  seed?: number;
  flip?: boolean;
  wrap?: number;
  shade?: number;   // darken (back rows sit in shadow)
}
export interface ShadowDraw { rect: [number, number, number, number]; opacity: number }
export interface FrontFrame {
  /** drawn back to front: hills → shadows → these → steam */
  draws: PropDraw[];
  shadows: ShadowDraw[];
  mug: [number, number];
  steamUnit: number;
}

type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null>; a: Record<string, number> };

/**
 * One WebGL context for everything in front of the headline: near hills, contact shadows,
 * photographic cut-outs (props and wind-driven grass strips) with light wrap, and steam.
 */
export class FrontRenderer {
  private gl: WebGLRenderingContext;
  private land: Prog;
  private sprite: Prog;
  private tri: WebGLBuffer;
  private quad: WebGLBuffer;
  private tex: Record<string, WebGLTexture> = {};
  private cssW = 0;
  private cssH = 0;
  private dpr = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    imgs: { plate: HTMLImageElement; depth: HTMLImageElement; blur: TexImageSource; stump: HTMLImageElement; tent: HTMLImageElement; strip: HTMLImageElement },
  ) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true, depth: false, powerPreference: 'high-performance' });
    if (!gl) throw new Error('webgl unavailable');
    this.gl = gl;

    this.land = this.program(VERT, FRAG, ['aPos'], ['uImg', 'uDepth', 'uRes', 'uDpr', 'uImgRes', 'uCenter', 'uVis', 'uPar', 'uZoom', 'uDolly', 'uTime', 'uScroll', 'uIntro', 'uLayer', 'uSun', 'uMugPx', 'uSteamUnit']);
    this.sprite = this.program(SPRITE_VERT, SPRITE_FRAG, ['aCorner'], ['uTex', 'uBlur', 'uRect', 'uView', 'uCenter', 'uVis', 'uZoom', 'uSunPx', 'uMode', 'uWrap', 'uRim', 'uHaze', 'uOpacity', 'uTime', 'uSeed', 'uShade']);

    this.tri = this.buffer(new Float32Array([-1, -1, 3, -1, -1, 3]));
    this.quad = this.buffer(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]));

    this.tex.plate = this.texture(imgs.plate, false, gl.RGB);
    this.tex.depth = this.texture(imgs.depth, false, gl.RGB);
    this.tex.blur = this.texture(imgs.blur, false, gl.RGB);
    this.tex.stump = this.texture(imgs.stump, true, gl.RGBA);
    this.tex.tent = this.texture(imgs.tent, true, gl.RGBA);
    this.tex.strip = this.texture(imgs.strip, true, gl.RGBA);

    gl.useProgram(this.land.p);
    gl.uniform1i(this.land.u.uImg, 0);
    gl.uniform1i(this.land.u.uDepth, 1);
    gl.uniform2f(this.land.u.uImgRes, PLATE.w, PLATE.h);
    gl.uniform2f(this.land.u.uSun, PLATE.sun[0] / PLATE.w, PLATE.sun[1] / PLATE.h);
  }

  private program(vs: string, fs: string, attrs: string[], unis: string[]): Prog {
    const gl = this.gl;
    const make = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) || 'shader');
      return sh;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, make(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, make(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
    const u: Prog['u'] = {};
    unis.forEach((n) => (u[n] = gl.getUniformLocation(p, n)));
    const a: Prog['a'] = {};
    attrs.forEach((n) => (a[n] = gl.getAttribLocation(p, n)));
    return { p, u, a };
  }

  private buffer(data: Float32Array) {
    const gl = this.gl;
    const b = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    return b;
  }

  private texture(img: TexImageSource, premultiply: boolean, format: number) {
    const gl = this.gl;
    const t = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, premultiply);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(gl.TEXTURE_2D, 0, format, format, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    return t;
  }

  private bind(unit: number, t: WebGLTexture) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
  }

  resize(cssW: number, cssH: number, dpr: number) {
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    this.cssW = cssW;
    this.cssH = cssH;
    if (w === this.canvas.width && h === this.canvas.height) return;
    this.canvas.width = w;
    this.canvas.height = h;
    this.dpr = w / cssW;
    this.gl.viewport(0, 0, w, h);
  }

  render(s: SceneState, f: FrontFrame) {
    const gl = this.gl;
    const W = this.cssW;
    const H = this.cssH;
    const cam = camera(s);
    const { scale, vis, center } = coverFor(W, H);
    const restK = scale * REST_ZOOM;
    const cpx: [number, number] = [center[0] * PLATE.w, center[1] * PLATE.h];
    const sunPx: [number, number] = [W / 2 + (PLATE.sun[0] - cpx[0]) * restK, H / 2 + (PLATE.sun[1] - cpx[1]) * restK];

    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.DEPTH_TEST);

    // 1 · near landscape (hills and meadow that pass in front of the headline)
    this.landPass(s, 1, f);

    // 2 · contact shadows
    this.useSprite(W, H, vis, center, cam.zoom, sunPx);
    gl.uniform1f(this.sprite.u.uTime, s.time);
    for (const sh of f.shadows) this.drawSprite(null, sh.rect, { mode: 1, opacity: sh.opacity });

    // 3 · photographic cut-outs, back to front, composited into the plate's light
    for (const d of f.draws) {
      const r = d.flip ? ([d.rect[0] + d.rect[2], d.rect[1], -d.rect[2], d.rect[3]] as [number, number, number, number]) : d.rect;
      gl.uniform1f(this.sprite.u.uSeed, d.seed ?? 0);
      this.drawSprite(this.tex[d.tex], r, {
        mode: d.strip ? 2 : 0,
        opacity: 1,
        wrap: d.wrap ?? (d.strip ? 0.5 : 0.6),
        rim: d.strip ? 0.7 : 0.55,
        haze: 0.06,
        shade: d.shade ?? 1,
      });
    }
    gl.disableVertexAttribArray(this.sprite.a.aCorner);

    // 6 · steam off the mug
    this.landPass(s, 2, f);
  }

  private landPass(s: SceneState, layer: number, f: FrontFrame) {
    const gl = this.gl;
    const L = this.land;
    const cam = camera(s);
    const { vis, center } = coverFor(this.cssW, this.cssH);
    gl.useProgram(L.p);
    this.bind(0, this.tex.plate);
    this.bind(1, this.tex.depth);
    gl.uniform2f(L.u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(L.u.uDpr, this.dpr);
    gl.uniform2f(L.u.uVis, vis[0], vis[1]);
    gl.uniform2f(L.u.uCenter, center[0], center[1]);
    gl.uniform2f(L.u.uPar, cam.par[0], cam.par[1]);
    gl.uniform1f(L.u.uZoom, cam.zoom);
    gl.uniform1f(L.u.uDolly, cam.dolly);
    gl.uniform1f(L.u.uTime, s.time);
    gl.uniform1f(L.u.uScroll, s.scroll);
    gl.uniform1f(L.u.uIntro, s.intro);
    gl.uniform1f(L.u.uLayer, layer);
    gl.uniform2f(L.u.uMugPx, f.mug[0], f.mug[1]);
    gl.uniform1f(L.u.uSteamUnit, f.steamUnit);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.tri);
    gl.enableVertexAttribArray(L.a.aPos);
    gl.vertexAttribPointer(L.a.aPos, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disableVertexAttribArray(L.a.aPos);
  }

  private useSprite(W: number, H: number, vis: [number, number], center: [number, number], zoom: number, sunPx: [number, number]) {
    const gl = this.gl;
    const S = this.sprite;
    gl.useProgram(S.p);
    gl.uniform2f(S.u.uView, W, H);
    gl.uniform2f(S.u.uCenter, center[0], center[1]);
    gl.uniform2f(S.u.uVis, vis[0], vis[1]);
    gl.uniform1f(S.u.uZoom, zoom);
    gl.uniform2f(S.u.uSunPx, sunPx[0], sunPx[1]);
    gl.uniform1i(S.u.uTex, 0);
    gl.uniform1i(S.u.uBlur, 1);
    this.bind(1, this.tex.blur);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.enableVertexAttribArray(S.a.aCorner);
    gl.vertexAttribPointer(S.a.aCorner, 2, gl.FLOAT, false, 0, 0);
  }

  private drawSprite(t: WebGLTexture | null, rect: [number, number, number, number], o: { mode: number; opacity: number; wrap?: number; rim?: number; haze?: number; shade?: number }) {
    const gl = this.gl;
    const S = this.sprite;
    if (t) this.bind(0, t);
    gl.uniform4f(S.u.uRect, rect[0], rect[1], rect[2], rect[3]);
    gl.uniform1f(S.u.uMode, o.mode);
    gl.uniform1f(S.u.uOpacity, o.opacity);
    gl.uniform1f(S.u.uWrap, o.wrap ?? 0);
    gl.uniform1f(S.u.uRim, o.rim ?? 0);
    gl.uniform1f(S.u.uHaze, o.haze ?? 0);
    gl.uniform1f(S.u.uShade, o.shade ?? 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
