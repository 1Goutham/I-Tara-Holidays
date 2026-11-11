'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import { coverFor, layerTransform, PLATE, plateToScreen, REST_ZOOM, SceneRenderer, type SceneState } from './renderer';
import { FrontRenderer, type FrontFrame, type PropDraw, type TexKey } from './front';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

export interface SceneHandle {
  state: SceneState;
}

const SRC = {
  plate: '/img/hero/plate.webp',
  depth: '/img/hero/depth.webp',
  stump: '/img/hero/stump.webp',
  tent: '/img/hero/tent.webp',
  strip: '/img/hero/grass-strip.webp',
  mountains: '/img/hero/mountains.webp',
};

/* ----------------------------------------------------------------------------
 * Scene layout, in landscape-plate pixels. `d` = depth (0 far → 1 near, >1 camera-side).
 * The tent, stump and grass strips are drawn by WebGL (light wrap, rim light, wind);
 * their DOM copies below are the no-WebGL fallback.
 * -------------------------------------------------------------------------- */
const STUMP = { x: 704, y: 648, w: 618, ratio: 1930 / 537, d: 0.8 };
const TENT = { x: 1188, y: 275, w: 699, ratio: 1398 / 906, d: 0.72 };
const SHADOWS = [
  { x: 760, y: 768, w: 520, h: 44, d: 0.8, o: 0.55 },
  { x: 1260, y: 682, w: 660, h: 52, d: 0.72, o: 0.5 },
];
/*
 * Photographic grass strips (real blades cut from the rock photo) planted along each base.
 * Order is back → front. `shade` < 1 sits further back, in shadow.
 */
const STRIP_RATIO = 9.231;
// clean mountain cut-out that replaces the plate's mid-ground; the headline tucks behind its ridgeline
const MOUNTAINS = { x: -70, y: 300, w: 1900, ratio: 2000 / 667, d: 0.3 };
type Draw = { tex: TexKey; x: number; y: number; w: number; ratio: number; d: number; strip?: boolean; seed?: number; flip?: boolean; shade?: number; wrap?: number };
const DRAWS: Draw[] = [
  // behind the tent and stump: blades rising past their back edges
  { tex: 'strip', x: 1150, y: 654, w: 760, ratio: STRIP_RATIO, d: 0.71, strip: true, seed: 1.7, shade: 0.8 },
  { tex: 'strip', x: 690, y: 742, w: 660, ratio: STRIP_RATIO, d: 0.79, strip: true, seed: 4.1, flip: true, shade: 0.82 },
  { tex: 'tent', x: TENT.x, y: TENT.y, w: TENT.w, ratio: TENT.ratio, d: TENT.d, wrap: 0.55 },
  // tent floor
  { tex: 'strip', x: 1130, y: 676, w: 820, ratio: STRIP_RATIO, d: 0.73, strip: true, seed: 2.9 },
  { tex: 'stump', x: STUMP.x, y: STUMP.y, w: STUMP.w, ratio: STUMP.ratio, d: STUMP.d, wrap: 0.7 },
  // over the stump's base and rocks: hides the cut-out's grass edge in real grass
  { tex: 'strip', x: 650, y: 770, w: 720, ratio: STRIP_RATIO, d: 0.82, strip: true, seed: 6.3 },
  // the near meadow
  { tex: 'strip', x: -80, y: 818, w: 1100, ratio: STRIP_RATIO, d: 0.97, strip: true, seed: 8.2, flip: true },
  { tex: 'strip', x: 900, y: 846, w: 1000, ratio: STRIP_RATIO, d: 1.02, strip: true, seed: 3.3 },
];
const MUG: [number, number] = [1128, 654];
const STEAM_UNIT = 44;

type Item = { kind: 'img' | 'glow' | 'shadow'; x: number; y: number; w: number; h?: number; src?: string; ratio?: number; cls?: string; screen?: boolean };
type Layer = { key: string; d: number; zone: 'back' | 'front'; items: Item[] };
const LAYERS: Layer[] = [
  { key: 'sun', d: 0.0, zone: 'back', items: [{ kind: 'img', src: '/img/hero/sun.webp', x: 830, y: 311, w: 897, ratio: 2000 / 512, cls: 'scene__sun' }] },
  { key: 'stump', d: STUMP.d, zone: 'front', items: [{ kind: 'shadow', x: 760, y: 768, w: 520, h: 44 }, { kind: 'img', src: SRC.stump, ...STUMP, cls: 'scene__fallback' }] },
  {
    key: 'tent', d: TENT.d, zone: 'front',
    items: [
      { kind: 'shadow', x: 1260, y: 682, w: 660, h: 52 },
      { kind: 'img', src: SRC.tent, ...TENT, cls: 'scene__fallback' },
      { kind: 'glow', x: 1405 - 70, y: 402 - 70, w: 140, h: 140, cls: 'glow glow--lantern' },
      { kind: 'glow', x: 1617 - 55, y: 582 - 55, w: 110, h: 110, cls: 'glow glow--inner' },
    ],
  },
  { key: 'bushes', d: 1.3, zone: 'front', items: [{ kind: 'img', src: '/img/hero/bushes.webp', x: 0, y: 0, w: 1, ratio: 2000 / 632, cls: 'scene__bushes', screen: true }] },
  { key: 'branch', d: 1.15, zone: 'front', items: [{ kind: 'img', src: '/img/hero/branch.webp', x: 1330, y: -70, w: 600, ratio: 1309 / 952, cls: 'scene__branch' }] },
];

const emit = (name: string, detail?: unknown) => window.dispatchEvent(new CustomEvent(name, { detail }));

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** A small, softened copy of the landscape: the "light around" props and grass sample it. */
function blurred(img: HTMLImageElement) {
  const c = document.createElement('canvas');
  c.width = 192;
  c.height = 98;
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

/** Screen rect of a plate rect on a layer at depth d, after the camera move. */
function rectFor(s: SceneState, x: number, y: number, w: number, h: number, d: number, W: number, H: number): [number, number, number, number] {
  const k = coverFor(W, H).scale * REST_ZOOM;
  const [sx, sy] = plateToScreen(x, y, W, H);
  const t = layerTransform(s, d, W, H);
  return [W / 2 + (sx - W / 2) * t.m + t.tx, H / 2 + (sy - H / 2) * t.m + t.ty, w * k * t.m, h * k * t.m];
}

export const HeroScene = forwardRef<SceneHandle, { children?: ReactNode }>(function HeroScene({ children }, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const plate = useRef<HTMLImageElement>(null);
  const layerEls = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef<SceneState>({ mouse: [0, 0], scroll: 0, intro: 0, time: 0 });
  const kick = useRef<() => void>(() => {});

  useImperativeHandle(ref, () => ({ state: state.current }), []);

  // DOM placement (fallback props, glows, sun, branch) + headline ridge line
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const layout = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const { scale, vis, center } = coverFor(w, h);
      const k = scale * REST_ZOOM;
      const ridge = 0.5 + ((PLATE.ridge - center[1]) * REST_ZOOM) / vis[1];
      el.style.setProperty('--ridge', `${(ridge * h).toFixed(1)}px`);
      if (plate.current) {
        const left = center[0] - vis[0] / 2;
        plate.current.style.objectPosition = `${vis[0] >= 1 ? 50 : (left / (1 - vis[0])) * 100}% 50%`;
      }
      el.querySelectorAll<HTMLElement>('[data-item]').forEach((node) => {
        const [x, y, iw, ih] = node.dataset.item!.split(',').map(Number);
        const [sx, sy] = plateToScreen(x, y, w, h);
        node.style.left = `${sx.toFixed(1)}px`;
        node.style.top = `${sy.toFixed(1)}px`;
        node.style.width = `${(iw * k).toFixed(1)}px`;
        node.style.height = `${(ih * k).toFixed(1)}px`;
      });
      el.classList.add('is-placed');
      kick.current();
    };
    layout();
    const ro = new ResizeObserver(layout);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = wrap.current;
    if (!el || !back.current || !front.current) return;
    let disposed = false;
    let raf = 0;
    let backR: SceneRenderer | null = null;
    let frontR: FrontRenderer | null = null;
    const reduce = prefersReducedMotion();
    const fine = hasFinePointer();
    const target = [0, 0];
    let visible = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const size = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const d = Math.min(dpr, 2400 / Math.max(w, 1));
      backR?.resize(w, h, d);
      frontR?.resize(w, h, d);
    };

    const frame = () => {
      const s = state.current;
      const W = el.clientWidth;
      const H = el.clientHeight;
      LAYERS.forEach((L, i) => {
        const node = layerEls.current[i];
        if (!node) return;
        const t = layerTransform(s, L.d, W, H);
        node.style.transform = `translate3d(${t.tx.toFixed(2)}px, ${t.ty.toFixed(2)}px, 0) scale(${t.m.toFixed(5)})`;
      });
      const t = layerTransform(s, STUMP.d, W, H);
      const [rx, ry] = plateToScreen(MUG[0], MUG[1], W, H);
      const mug: [number, number] = [W / 2 + (rx - W / 2) * t.m + t.tx, H / 2 + (ry - H / 2) * t.m + t.ty];
      const steamUnit = STEAM_UNIT * coverFor(W, H).scale * REST_ZOOM * t.m;
      backR?.render(s, mug, steamUnit);
      if (frontR) {
        const f: FrontFrame = {
          backdrop: [{ tex: 'mountains', rect: rectFor(s, MOUNTAINS.x, MOUNTAINS.y, MOUNTAINS.w, MOUNTAINS.w / MOUNTAINS.ratio, MOUNTAINS.d, W, H) }],
          draws: DRAWS.map<PropDraw>((d) => ({ tex: d.tex, rect: rectFor(s, d.x, d.y, d.w, d.w / d.ratio, d.d, W, H), strip: d.strip, seed: d.seed, flip: d.flip, shade: d.shade, wrap: d.wrap })),
          shadows: SHADOWS.map((sh) => ({ rect: rectFor(s, sh.x, sh.y, sh.w, sh.h, sh.d, W, H), opacity: sh.o })),
          mug,
          steamUnit,
        };
        frontR.render(s, f);
      }
    };

    const onMove = (e: PointerEvent) => {
      target[0] = (e.clientX / window.innerWidth) * 2 - 1;
      target[1] = (e.clientY / window.innerHeight) * 2 - 1;
    };

    let last = performance.now();
    let frames = 0;
    let slow = 0;
    const tick = (now: number) => {
      raf = 0;
      if (disposed) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;
      s.time += dt;
      if (!fine) {
        target[0] = Math.sin(s.time * 0.23) * 0.45;
        target[1] = Math.cos(s.time * 0.19) * 0.25;
      }
      const k = 1 - Math.pow(0.0025, dt);
      s.mouse[0] += (target[0] - s.mouse[0]) * k;
      s.mouse[1] += (target[1] - s.mouse[1]) * k;
      frame();
      frames++;
      if (dt > 0.026) slow++;
      if (frames === 90) {
        if (slow > 30 && dpr > 0.75) {
          dpr = Math.max(0.75, dpr - 0.5);
          size();
        }
        frames = 0;
        slow = 0;
      }
      if (visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && !reduce) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    kick.current = () => {
      size();
      if (reduce || !raf) frame();
    };

    (async () => {
      // report progress to the loader
      let done = 0;
      const total = 6;
      const track = <T,>(p: Promise<T>) => p.then((v) => (emit('itara:hero-progress', ++done / total), v));
      try {
        const [img, depth, stump, tent, strip, mountains] = await Promise.all(
          [SRC.plate, SRC.depth, SRC.stump, SRC.tent, SRC.strip, SRC.mountains].map((u) => track(loadImage(u))),
        );
        if (disposed) return;
        backR = new SceneRenderer(back.current!, img, depth, 0);
        try {
          frontR = new FrontRenderer(front.current!, { plate: img, depth, blur: blurred(img), stump, tent, strip, mountains });
        } catch (e) {
          console.warn('[hero] front compositor unavailable', e);
        }
        size();
        if (reduce) state.current.intro = 1;
        frame();
        el.classList.add('is-live');
        if (frontR) el.classList.add('is-composited');
      } catch (e) {
        console.warn('[hero] WebGL unavailable, showing the static scene', e);
      }
      emit('itara:hero-ready');
      start();
    })();

    const ro = new ResizeObserver(size);
    ro.observe(el);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
    });
    io.observe(el);
    const onVis = () => !document.hidden && start();
    document.addEventListener('visibilitychange', onVis);
    if (fine) window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      backR?.dispose();
      frontR?.dispose();
    };
  }, []);

  const renderLayer = (L: Layer) => {
    const i = LAYERS.indexOf(L);
    return (
      <div key={L.key} className={`scene__layer scene__layer--${L.key}`} ref={(n) => { layerEls.current[i] = n; }} aria-hidden="true">
        {L.items.map((it, j) => {
          const h = it.h ?? it.w / (it.ratio ?? 1);
          const data = `${it.x},${it.y},${it.w},${h}`;
          if (it.kind === 'img') {
            // eslint-disable-next-line @next/next/no-img-element -- pre-optimised cut-out with alpha
            return <img key={j} data-item={it.screen ? undefined : data} src={it.src} alt="" className={`scene__prop ${it.cls ?? ''}`} decoding="async" />;
          }
          return <span key={j} data-item={data} className={it.kind === 'shadow' ? 'scene__shadow' : it.cls} />;
        })}
      </div>
    );
  };

  return (
    <div className="scene" ref={wrap}>
      {/* eslint-disable-next-line @next/next/no-img-element -- same file the shader samples, so it downloads once */}
      <img
        ref={plate}
        className="scene__plate"
        src={SRC.plate}
        alt="Dawn over misty forested hills, with a canvas tent, lantern, camp chair and a steaming mug on a tree stump"
        fetchPriority="high"
        decoding="async"
      />
      <canvas className="scene__gl scene__gl--back" ref={back} aria-hidden="true" />
      {LAYERS.filter((L) => L.zone === 'back').map(renderLayer)}
      {children}
      <canvas className="scene__gl scene__gl--front" ref={front} aria-hidden="true" />
      {LAYERS.filter((L) => L.zone === 'front').map(renderLayer)}
    </div>
  );
});
