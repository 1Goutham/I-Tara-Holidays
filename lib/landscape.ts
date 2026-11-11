/*
 * Deterministic landscape geometry. Ridgelines come from seeded midpoint displacement,
 * so the server and the browser render identical paths (no hydration mismatch).
 */

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fractal ridge heights across `width`, 2^depth + 1 samples. */
function ridge(seed: number, depth: number, amp: number, roughness: number, peaks: [number, number][] = []) {
  const rand = mulberry32(seed);
  const n = 2 ** depth;
  const ys = new Array<number>(n + 1).fill(0);
  ys[0] = (rand() - 0.5) * amp;
  ys[n] = (rand() - 0.5) * amp;
  let step = n;
  let scale = amp;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < n; i += step) {
      ys[i] = (ys[i - half] + ys[i + half]) / 2 + (rand() - 0.5) * scale;
    }
    step = half;
    scale *= roughness;
  }
  // optional massifs: gaussian bumps at [position 0..1, height]
  return ys.map((y, i) => {
    const t = i / n;
    let bump = 0;
    for (const [c, h] of peaks) bump += h * Math.exp(-((t - c) ** 2) / 0.006);
    return y - bump;
  });
}

const W = 1600;
const H = 1000;

export interface RidgeOptions {
  seed: number;
  base: number; // baseline y in a 1600 x 1000 box
  amp: number;
  roughness?: number;
  depth?: number;
  peaks?: [number, number][];
  trees?: { min: number; max: number; density: number } | null;
}

/** Closed silhouette path for one mountain layer. */
export function ridgePath({ seed, base, amp, roughness = 0.52, depth = 8, peaks = [], trees = null }: RidgeOptions) {
  const ys = ridge(seed, depth, amp, roughness, peaks);
  const n = ys.length - 1;
  const pts: [number, number][] = ys.map((y, i) => [(i / n) * W, base + y]);

  let d = `M0 ${H} L0 ${pts[0][1].toFixed(1)}`;
  if (!trees) {
    for (const [x, y] of pts) d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  } else {
    // conifer silhouettes riding the ridge
    const rand = mulberry32(seed * 7 + 3);
    const yAt = (x: number) => {
      const f = (x / W) * n;
      const i = Math.min(n - 1, Math.floor(f));
      return pts[i][1] + (pts[i + 1][1] - pts[i][1]) * (f - i);
    };
    let x = 0;
    while (x < W) {
      const w = 6 + rand() * 8;
      const y = yAt(x + w / 2);
      if (rand() < trees.density) {
        const h = trees.min + rand() * (trees.max - trees.min);
        d += ` L${x.toFixed(1)} ${(y + 2).toFixed(1)} L${(x + w * 0.5).toFixed(1)} ${(y - h).toFixed(1)} L${(x + w).toFixed(1)} ${(y + 2).toFixed(1)}`;
      } else {
        d += ` L${(x + w).toFixed(1)} ${yAt(x + w).toFixed(1)}`;
      }
      x += w * (0.55 + rand() * 0.3);
    }
  }
  d += ` L${W} ${H} Z`;
  return d;
}

/** Open ridgeline (no fill) for line-art drawings. */
export function ridgeLine(seed: number, base: number, amp: number, peaks: [number, number][] = [], roughness = 0.5) {
  const ys = ridge(seed, 7, amp, roughness, peaks);
  const n = ys.length - 1;
  return ys.map((y, i) => `${i ? 'L' : 'M'}${((i / n) * W).toFixed(1)} ${(base + y).toFixed(1)}`).join(' ');
}

export const LANDSCAPE = { W, H };
