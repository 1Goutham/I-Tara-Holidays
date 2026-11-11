import { FRAG, VERT } from './shader';

export interface SceneState {
  mouse: [number, number];
  scroll: number;
  intro: number;
  time: number;
}

/** Landscape plate (px) and fixed points in it. */
export const PLATE = {
  w: 1755,
  h: 896,
  sun: [1215, 408] as [number, number],
  ridge: 0.632, // plate y where the near hills begin (the headline tucks behind it)
};

/** Camera shared by the shader and the DOM prop layers, so everything moves as one scene. */
export const REST_ZOOM = 1.06;
export function camera(s: SceneState) {
  return {
    zoom: REST_ZOOM + (1 - s.intro) * 0.05 + s.scroll * 0.08,
    dolly: s.scroll * 0.12,
    par: [s.mouse[0] * 0.011, s.mouse[1] * 0.006] as [number, number],
  };
}

/** Cover-crop focus per viewport shape (keeps the camp in frame). */
export function focusFor(w: number, h: number): [number, number] {
  const r = w / h;
  return r < 0.8 ? [0.745, 0.5] : r < 1.4 ? [0.68, 0.5] : [0.58, 0.5];
}

export function coverFor(w: number, h: number) {
  const scale = Math.max(w / PLATE.w, h / PLATE.h);
  const vis: [number, number] = [w / (PLATE.w * scale), h / (PLATE.h * scale)];
  const [fx, fy] = focusFor(w, h);
  const center: [number, number] = [
    Math.min(Math.max(fx, vis[0] / 2), 1 - vis[0] / 2),
    Math.min(Math.max(fy, vis[1] / 2), 1 - vis[1] / 2),
  ];
  return { scale, vis, center };
}

/** Rest position (CSS px) of a plate point for a given viewport. */
export function plateToScreen(x: number, y: number, w: number, h: number) {
  const { scale, center } = coverFor(w, h);
  return [w / 2 + (x - center[0] * PLATE.w) * scale * REST_ZOOM, h / 2 + (y - center[1] * PLATE.h) * scale * REST_ZOOM] as const;
}

/** Transform for a DOM layer at depth `d`, matching the shader's projection exactly. */
export function layerTransform(s: SceneState, d: number, w: number, h: number) {
  const { zoom, dolly, par } = camera(s);
  const { scale } = coverFor(w, h);
  const z = zoom * (1 + dolly * d);
  const m = z / REST_ZOOM;
  const tx = -par[0] * (d - 0.3) * PLATE.w * scale * z;
  const ty = -par[1] * (d - 0.3) * PLATE.h * scale * z;
  return { m, tx, ty };
}

export class SceneRenderer {
  private gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private w = 0;
  private h = 0;
  private dpr = 1;

  constructor(
    private canvas: HTMLCanvasElement,
    plate: HTMLImageElement,
    depth: HTMLImageElement,
    private layer: 0 | 1,
  ) {
    const gl = canvas.getContext('webgl', { antialias: false, alpha: layer === 1, premultipliedAlpha: true, powerPreference: 'high-performance' });
    if (!gl) throw new Error('webgl unavailable');
    this.gl = gl;
    this.prog = this.program(VERT, FRAG);
    gl.useProgram(this.prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(this.prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const n of ['uImg', 'uDepth', 'uRes', 'uDpr', 'uImgRes', 'uCenter', 'uVis', 'uPar', 'uZoom', 'uDolly', 'uTime', 'uScroll', 'uIntro', 'uLayer', 'uSun', 'uMugPx', 'uSteamUnit']) {
      this.u[n] = gl.getUniformLocation(this.prog, n);
    }
    this.texture(0, plate);
    this.texture(1, depth);
    gl.uniform1i(this.u.uImg, 0);
    gl.uniform1i(this.u.uDepth, 1);
    gl.uniform2f(this.u.uImgRes, PLATE.w, PLATE.h);
    gl.uniform2f(this.u.uSun, PLATE.sun[0] / PLATE.w, PLATE.sun[1] / PLATE.h);
    gl.uniform1f(this.u.uLayer, layer);
  }

  private program(vs: string, fs: string) {
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
    return p;
  }

  private texture(unit: number, img: HTMLImageElement) {
    const gl = this.gl;
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit);
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }

  resize(cssW: number, cssH: number, dpr: number) {
    const w = Math.round(cssW * dpr);
    const h = Math.round(cssH * dpr);
    if (w === this.w && h === this.h) return;
    this.w = w;
    this.h = h;
    this.dpr = w / cssW;
    this.canvas.width = w;
    this.canvas.height = h;
    const gl = this.gl;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(this.u.uRes, w, h);
    gl.uniform1f(this.u.uDpr, this.dpr);
    const { vis, center } = coverFor(cssW, cssH);
    gl.uniform2f(this.u.uVis, vis[0], vis[1]);
    gl.uniform2f(this.u.uCenter, center[0], center[1]);
  }

  render(s: SceneState, mugPx: [number, number], steamUnit: number) {
    const gl = this.gl;
    const cam = camera(s);
    gl.uniform2f(this.u.uPar, cam.par[0], cam.par[1]);
    gl.uniform1f(this.u.uZoom, cam.zoom);
    gl.uniform1f(this.u.uDolly, cam.dolly);
    gl.uniform1f(this.u.uTime, s.time);
    gl.uniform1f(this.u.uScroll, s.scroll);
    gl.uniform1f(this.u.uIntro, s.intro);
    gl.uniform2f(this.u.uMugPx, mugPx[0], mugPx[1]);
    gl.uniform1f(this.u.uSteamUnit, steamUnit);
    if (this.layer === 1) {
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  dispose() {
    this.gl.getExtension('WEBGL_lose_context')?.loseContext();
  }
}
