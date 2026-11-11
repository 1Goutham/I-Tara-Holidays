'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import { coverFor, layerTransform, PLATE, plateToScreen, REST_ZOOM, SceneRenderer, type SceneState } from './renderer';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

export interface SceneHandle {
  state: SceneState;
}

const PLATE_SRC = '/img/hero/plate.webp';
const DEPTH_SRC = '/img/hero/depth.webp';

/*
 * Camp props are real cut-outs on their own layers (so they never warp).
 * Everything is placed in landscape-plate pixels; `d` is the layer's depth (0 far → 1 near).
 */
type Item = {
  kind: 'img' | 'glow' | 'shadow' | 'light';
  x: number; y: number; w: number; h?: number;
  src?: string; ratio?: number; cls?: string;
  screen?: boolean; // anchored to the viewport (camera-side foreground) instead of the plate
};
type Layer = { key: string; d: number; zone: 'back' | 'front'; items: Item[] };

const TENT = '/img/hero/tent.webp';
const STUMP = '/img/hero/stump.webp';
const LAYERS: Layer[] = [
  // the sun sits behind the headline and only ever adds light (screen blend)
  { key: 'sun', d: 0.0, zone: 'back', items: [{ kind: 'img', src: '/img/hero/sun.webp', x: 830, y: 311, w: 897, ratio: 2000 / 512, cls: 'scene__sun' }] },
  {
    key: 'stump', d: 0.8, zone: 'front',
    items: [
      { kind: 'shadow', x: 760, y: 790, w: 520, h: 36 },
      { kind: 'img', src: STUMP, x: 704, y: 648, w: 618, ratio: 1930 / 537 },
      { kind: 'light', src: STUMP, x: 704, y: 648, w: 618, ratio: 1930 / 537, cls: 'scene__light scene__light--stump' },
    ],
  },
  {
    key: 'tent', d: 0.72, zone: 'front',
    items: [
      { kind: 'shadow', x: 1300, y: 684, w: 620, h: 44 },
      { kind: 'img', src: TENT, x: 1188, y: 275, w: 699, ratio: 1398 / 906 },
      { kind: 'light', src: TENT, x: 1188, y: 275, w: 699, ratio: 1398 / 906, cls: 'scene__light scene__light--tent' },
      { kind: 'glow', x: 1405 - 70, y: 402 - 70, w: 140, h: 140, cls: 'glow glow--lantern' },
      { kind: 'glow', x: 1617 - 55, y: 582 - 55, w: 110, h: 110, cls: 'glow glow--inner' },
    ],
  },
  // out-of-focus foreground: the nearest planes, strongest parallax
  { key: 'bushes', d: 1.3, zone: 'front', items: [{ kind: 'img', src: '/img/hero/bushes.webp', x: 0, y: 0, w: 1, ratio: 2000 / 632, cls: 'scene__bushes', screen: true }] },
  { key: 'branch', d: 1.15, zone: 'front', items: [{ kind: 'img', src: '/img/hero/branch.webp', x: 1330, y: -70, w: 600, ratio: 1309 / 952, cls: 'scene__branch' }] },
];
const MUG: [number, number] = [1128, 654]; // rim centre, on the stump layer
const MUG_D = 0.8;
const STEAM_UNIT = 44; // plate px

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Photographic hero: a WebGL landscape (depth parallax, fog, sun, steam) with crisp prop layers.
 * Back canvas → headline → near-hills canvas (+ steam) → prop layers.
 */
export const HeroScene = forwardRef<SceneHandle, { children?: ReactNode }>(function HeroScene({ children }, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const plate = useRef<HTMLImageElement>(null);
  const layerEls = useRef<(HTMLDivElement | null)[]>([]);
  const state = useRef<SceneState>({ mouse: [0, 0], scroll: 0, intro: 0, time: 0 });
  const kick = useRef<() => void>(() => {});

  useImperativeHandle(ref, () => ({ state: state.current }), []);

  // place every item for the current viewport; keep the fallback image cropped like the shader
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
    let renderers: SceneRenderer[] = [];
    const reduce = prefersReducedMotion();
    const fine = hasFinePointer();
    const target = [0, 0];
    let visible = true;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const size = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const d = Math.min(dpr, 2400 / Math.max(w, 1));
      renderers.forEach((r) => r.resize(w, h, d));
    };

    const frame = () => {
      const s = state.current;
      const w = el.clientWidth;
      const h = el.clientHeight;
      // prop layers: same projection as the shader, applied as one compositor transform each
      LAYERS.forEach((L, i) => {
        const node = layerEls.current[i];
        if (!node) return;
        const t = layerTransform(s, L.d, w, h);
        node.style.transform = `translate3d(${t.tx.toFixed(2)}px, ${t.ty.toFixed(2)}px, 0) scale(${t.m.toFixed(5)})`;
      });
      // steam follows the mug's projected position
      const t = layerTransform(s, MUG_D, w, h);
      const [rx, ry] = plateToScreen(MUG[0], MUG[1], w, h);
      const mug: [number, number] = [w / 2 + (rx - w / 2) * t.m + t.tx, h / 2 + (ry - h / 2) * t.m + t.ty];
      const unit = STEAM_UNIT * coverFor(w, h).scale * REST_ZOOM * t.m;
      renderers.forEach((r) => r.render(s, mug, unit));
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
      try {
        const [img, depth] = await Promise.all([load(PLATE_SRC), load(DEPTH_SRC)]);
        if (disposed) return;
        renderers = [new SceneRenderer(back.current!, img, depth, 0), new SceneRenderer(front.current!, img, depth, 1)];
        size();
        if (reduce) state.current.intro = 1;
        frame();
        el.classList.add('is-live');
      } catch {
        // static plate + prop layers remain
      }
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
      renderers.forEach((r) => r.dispose());
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
          if (it.kind === 'light') {
            const m = `url(${it.src})`;
            return <span key={j} data-item={data} className={it.cls} style={{ WebkitMaskImage: m, maskImage: m }} />;
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
        src={PLATE_SRC}
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
