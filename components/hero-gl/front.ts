import { FRAG, VERT } from './shader';
import { GRASS_FRAG, GRASS_VERT, SPRITE_FRAG, SPRITE_VERT } from './composite';
import { camera, coverFor, PLATE, REST_ZOOM, type SceneState } from './renderer';

export interface PropDraw {
  tex: 'stump' | 'tent';
  rect: [number, number, number, number]; // CSS px x, y, w, h (already camera-transformed)
}
export interface ShadowDraw { rect: [number, number, number, number]; opacity: number }
export interface GrassPatch {
  anchor: [number, number];
  scale: [number, number, number];
  width: number;
  mirror: 1 | -1;
  d: number;
  wind: number;
  /** 'back' blades are drawn before the props (behind them), 'front' after, 'all' after */
  split: 'around' | 'all';
}
export interface FrontFrame {
  props: PropDraw[];
  shadows: ShadowDraw[];
  patches: GrassPatch[];
  mug: [number, number];
  steamUnit: number;
  pointer: [number, number];
}

type Prog = { p: WebGLProgram; u: Record<string, WebGLUniformLocation | null>; a: Record<string, number> };

/**
 * One WebGL context for everything in front of the headline: near hills, contact shadows,
 * 3D grass (behind and in front of each prop), the cut-out props with light wrap, and steam.
 */
export class FrontRenderer {
  private gl: WebGLRenderingContext;
  private land: Prog;
  private sprite: Prog;
  private grass: Prog;
  private tri: WebGLBuffer;
  private quad: WebGLBuffer;
  private grassBuf: WebGLBuffer;
  private grassIdx: WebGLBuffer;
  private grassCount: number;
  private tex: Record<string, WebGLTexture> = {};
  private cssW = 0;
  private cssH = 0;
  private dpr = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    imgs: { plate: HTMLImageElement; depth: HTMLImageElement; blur: TexImageSource; stump: HTMLImageElement; tent: HTMLImageElement },
    grass: ArrayBuffer,
  ) {
    const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, depth: true, powerPreference: 'high-performance' });
    if (!gl) throw new Error('webgl unavailable');
    this.gl = gl;
    gl.getExtension('OES_element_index_uint');

    this.land = this.program(VERT, FRAG, ['aPos'], ['uImg', 'uDepth', 'uRes', 'uDpr', 'uImgRes', 'uCenter', 'uVis', 'uPar', 'uZoom', 'uDolly', 'uTime', 'uScroll', 'uIntro', 'uLayer', 'uSun', 'uMugPx', 'uSteamUnit']);
    this.sprite = this.program(SPRITE_VERT, SPRITE_FRAG, ['aCorner'], ['uTex', 'uBlur', 'uRect', 'uView', 'uCenter', 'uVis', 'uZoom', 'uSunPx', 'uMode', 'uWrap', 'uRim', 'uHaze', 'uOpacity']);
    this.grass = this.program(GRASS_VERT, GRASS_FRAG, ['aC', 'aRoot', 'aSide', 'aT', 'aRand'], ['uView', 'uAnchor', 'uScale', 'uWidth', 'uMirror', 'uZRange', 'uRestK', 'uCpx', 'uM', 'uT', 'uTime', 'uWind', 'uPointer', 'uBlur', 'uCenter', 'uVis', 'uZoom', 'uSunPx']);

    this.tri = this.buffer(new Float32Array([-1, -1, 3, -1, -1, 3]));
    this.quad = this.buffer(new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]));

    this.tex.plate = this.texture(imgs.plate, false, gl.RGB);
    this.tex.depth = this.texture(imgs.depth, false, gl.RGB);
    this.tex.blur = this.texture(imgs.blur, false, gl.RGB);
    this.tex.stump = this.texture(imgs.stump, true, gl.RGBA);
    this.tex.tent = this.texture(imgs.tent, true, gl.RGBA);

    // grass mesh: expand blade centrelines into quad strips
    const dv = new DataView(grass);
    const nb = dv.getUint32(0, true);
    const levels = 7;
    const verts = new Float32Array(nb * levels * 2 * 8);
    const idx = new Uint16Array(nb * (levels - 1) * 6);
    let o = 4;
    let vi = 0;
    let ii = 0;
    for (let b = 0; b < nb; b++) {
      const pts: number[][] = [];
      for (let l = 0; l < levels; l++) {
        pts.push([dv.getInt16(o, true) / 32767, dv.getInt16(o + 2, true) / 32767, dv.getInt16(o + 4, true) / 32767]);
        o += 6;
      }
      const rand = ((Math.sin(b * 12.9898) * 43758.5453) % 1 + 1) % 1;
      const base = b * levels * 2;
      for (let l = 0; l < levels; l++) {
        for (const side of [-1, 1]) {
          verts.set([pts[l][0], pts[l][1], pts[l][2], pts[0][0], pts[0][2], side, l / (levels - 1), rand], vi);
          vi += 8;
        }
        if (l < levels - 1) {
          const a = base + l * 2;
          idx.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], ii);
          ii += 6;
        }
      }
    }
    this.grassBuf = this.buffer(verts);
    this.grassIdx = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.grassIdx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    this.grassCount = idx.length;
    if (nb * levels * 2 > 65535) throw new Error('grass mesh too large for 16-bit indices');

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
    for (const sh of f.shadows) this.drawSprite(null, sh.rect, { mode: 1, opacity: sh.opacity });
    gl.disableVertexAttribArray(this.sprite.a.aCorner);

    // 3 · grass behind the props
    this.grassPass(s, f, 'behind', W, H, restK, cpx, vis, center, cam.zoom, sunPx);

    // 4 · props, composited into the plate's light
    this.useSprite(W, H, vis, center, cam.zoom, sunPx);
    for (const p of f.props) this.drawSprite(this.tex[p.tex], p.rect, { mode: 0, opacity: 1, wrap: p.tex === 'tent' ? 0.55 : 0.7, rim: 0.55, haze: 0.06 });
    gl.disableVertexAttribArray(this.sprite.a.aCorner);

    // 5 · grass in front of the props, and the meadow
    this.grassPass(s, f, 'front', W, H, restK, cpx, vis, center, cam.zoom, sunPx);

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

  private drawSprite(t: WebGLTexture | null, rect: [number, number, number, number], o: { mode: number; opacity: number; wrap?: number; rim?: number; haze?: number }) {
    const gl = this.gl;
    const S = this.sprite;
    if (t) this.bind(0, t);
    gl.uniform4f(S.u.uRect, rect[0], rect[1], rect[2], rect[3]);
    gl.uniform1f(S.u.uMode, o.mode);
    gl.uniform1f(S.u.uOpacity, o.opacity);
    gl.uniform1f(S.u.uWrap, o.wrap ?? 0);
    gl.uniform1f(S.u.uRim, o.rim ?? 0);
    gl.uniform1f(S.u.uHaze, o.haze ?? 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  private grassPass(s: SceneState, f: FrontFrame, phase: 'behind' | 'front', W: number, H: number, restK: number, cpx: [number, number], vis: [number, number], center: [number, number], zoom: number, sunPx: [number, number]) {
    const gl = this.gl;
    const G = this.grass;
    gl.useProgram(G.p);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.uniform2f(G.u.uView, W, H);
    gl.uniform1f(G.u.uRestK, restK);
    gl.uniform2f(G.u.uCpx, cpx[0], cpx[1]);
    gl.uniform1f(G.u.uTime, s.time);
    gl.uniform2f(G.u.uPointer, f.pointer[0], f.pointer[1]);
    gl.uniform1i(G.u.uBlur, 1);
    gl.uniform2f(G.u.uCenter, center[0], center[1]);
    gl.uniform2f(G.u.uVis, vis[0], vis[1]);
    gl.uniform1f(G.u.uZoom, zoom);
    gl.uniform2f(G.u.uSunPx, sunPx[0], sunPx[1]);
    this.bind(1, this.tex.blur);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.grassBuf);
    const stride = 8 * 4;
    const attr = (name: string, size: number, off: number) => {
      gl.enableVertexAttribArray(G.a[name]);
      gl.vertexAttribPointer(G.a[name], size, gl.FLOAT, false, stride, off * 4);
    };
    attr('aC', 3, 0);
    attr('aRoot', 2, 3);
    attr('aSide', 1, 5);
    attr('aT', 1, 6);
    attr('aRand', 1, 7);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.grassIdx);

    const cam = camera(s);
    for (const p of f.patches) {
      let range: [number, number];
      if (phase === 'behind') {
        if (p.split !== 'around') continue;
        range = [-1.01, 0];
      } else {
        range = p.split === 'around' ? [0, 1.01] : [-1.01, 1.01];
      }
      const z = cam.zoom * (1 + cam.dolly * p.d);
      const m = z / REST_ZOOM;
      const scl = coverFor(W, H).scale;
      gl.uniform2f(G.u.uAnchor, p.anchor[0], p.anchor[1]);
      gl.uniform3f(G.u.uScale, p.scale[0], p.scale[1], p.scale[2]);
      gl.uniform1f(G.u.uWidth, p.width);
      gl.uniform1f(G.u.uMirror, p.mirror);
      gl.uniform2f(G.u.uZRange, range[0], range[1]);
      gl.uniform1f(G.u.uM, m);
      gl.uniform2f(G.u.uT, -cam.par[0] * (p.d - 0.3) * PLATE.w * scl * z, -cam.par[1] * (p.d - 0.3) * PLATE.h * scl * z);
      gl.uniform1f(G.u.uWind, p.wind);
      gl.drawElements(gl.TRIANGLES, this.grassCount, gl.UNSIGNED_SHORT, 0);
    }
    ['aC', 'aRoot', 'aSide', 'aT', 'aRand'].forEach((n) => gl.disableVertexAttribArray(G.a[n]));
    gl.disable(gl.DEPTH_TEST);
  }

  dispose() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
