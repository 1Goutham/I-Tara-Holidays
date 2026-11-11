import { FRAG, VERT } from './shader';

export interface SceneState {
  mouse: [number, number];
  scroll: number;
  intro: number;
  time: number;
}

/** Plate-space positions (px in the 1755 × 896 source). */
export const PLATE = {
  w: 1755,
  h: 896,
  sun: [1215, 408],
  mug: [1284, 596],
  lantern: [1495, 336],
  fire: [1715, 606],
  ridge: 0.632, // plate y where the near hills start (headline tucks behind this line)
} as const;

/** Where the cover crop is centred, per viewport shape (portrait keeps sun, mug and tent). */
export function focusFor(w: number, h: number): [number, number] {
  return w / h < 0.8 ? [0.745, 0.5] : w / h < 1.4 ? [0.66, 0.5] : [0.5, 0.5];
}

/** Visible plate fraction and centre for a canvas, matching CSS object-fit: cover. */
export function coverFor(w: number, h: number) {
  const scale = Math.max(w / PLATE.w, h / PLATE.h);
  const vis: [number, number] = [w / (PLATE.w * scale), h / (PLATE.h * scale)];
  const [fx, fy] = focusFor(w, h);
  const c: [number, number] = [
    Math.min(Math.max(fx, vis[0] / 2), 1 - vis[0] / 2),
    Math.min(Math.max(fy, vis[1] / 2), 1 - vis[1] / 2),
  ];
  return { vis, center: c };
}

export class SceneRenderer {
  private gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private u: Record<string, WebGLUniformLocation | null> = {};
  private w = 0;
  private h = 0;

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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); // one oversized triangle
    const loc = gl.getAttribLocation(this.prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    for (const n of ['uImg', 'uDepth', 'uRes', 'uImgRes', 'uCenter', 'uVis', 'uMouse', 'uTime', 'uScroll', 'uIntro', 'uLayer', 'uSun', 'uMug', 'uLantern', 'uFire']) {
      this.u[n] = gl.getUniformLocation(this.prog, n);
    }
    this.texture(0, plate);
    this.texture(1, depth);
    gl.uniform1i(this.u.uImg, 0);
    gl.uniform1i(this.u.uDepth, 1);
    gl.uniform2f(this.u.uImgRes, PLATE.w, PLATE.h);
    const pt = (p: readonly [number, number]) => [p[0] / PLATE.w, p[1] / PLATE.h] as const;
    gl.uniform2f(this.u.uSun, ...pt(PLATE.sun));
    gl.uniform2f(this.u.uMug, ...pt(PLATE.mug));
    gl.uniform2f(this.u.uLantern, ...pt(PLATE.lantern));
    gl.uniform2f(this.u.uFire, ...pt(PLATE.fire));
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
    // non-power-of-two safe sampling
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
    this.canvas.width = w;
    this.canvas.height = h;
    const gl = this.gl;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(this.u.uRes, w, h);
    const { vis, center } = coverFor(cssW, cssH);
    gl.uniform2f(this.u.uVis, vis[0], vis[1]);
    gl.uniform2f(this.u.uCenter, center[0], center[1]);
  }

  render(s: SceneState) {
    const gl = this.gl;
    gl.uniform2f(this.u.uMouse, s.mouse[0], s.mouse[1]);
    gl.uniform1f(this.u.uTime, s.time);
    gl.uniform1f(this.u.uScroll, s.scroll);
    gl.uniform1f(this.u.uIntro, s.intro);
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
