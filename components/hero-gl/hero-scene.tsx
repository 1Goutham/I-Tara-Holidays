'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, type ReactNode } from 'react';
import { coverFor, PLATE, SceneRenderer, type SceneState } from './renderer';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

export interface SceneHandle {
  state: SceneState;
}

const PLATE_SRC = '/img/hero/plate.webp';
const DEPTH_SRC = '/img/hero/depth.webp';

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
 * Photographic hero rendered in WebGL: a depth map turns one plate into a 3D scene.
 * Two canvases share the same shader — the back one draws the full frame, the front one
 * redraws only the near layers, so `children` (the headline) sits between the hills.
 * Falls back to the static plate when WebGL or motion is unavailable.
 */
export const HeroScene = forwardRef<SceneHandle, { children?: ReactNode }>(function HeroScene({ children }, ref) {
  const wrap = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLCanvasElement>(null);
  const front = useRef<HTMLCanvasElement>(null);
  const plate = useRef<HTMLImageElement>(null);
  const state = useRef<SceneState>({ mouse: [0, 0], scroll: 0, intro: 0, time: 0 });

  useImperativeHandle(ref, () => ({ state: state.current }), []);

  // keep the headline anchored to the ridge line and the fallback image cropped like the shader
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const layout = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const { vis, center } = coverFor(w, h);
      const ridge = 0.5 + ((PLATE.ridge - center[1]) * 1.06) / vis[1];
      el.style.setProperty('--ridge', `${(ridge * h).toFixed(1)}px`);
      const left = center[0] - vis[0] / 2;
      if (plate.current) plate.current.style.objectPosition = `${vis[0] >= 1 ? 50 : (left / (1 - vis[0])) * 100}% 50%`;
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
      // keep the pixel budget sane on very large screens
      const d = Math.min(dpr, 2400 / Math.max(w, 1));
      renderers.forEach((r) => r.resize(w, h, d));
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
        // touch: a slow, breathing camera drift keeps the scene alive
        target[0] = Math.sin(s.time * 0.23) * 0.45;
        target[1] = Math.cos(s.time * 0.19) * 0.25;
      }
      const k = 1 - Math.pow(0.0025, dt); // frame-rate independent easing
      s.mouse[0] += (target[0] - s.mouse[0]) * k;
      s.mouse[1] += (target[1] - s.mouse[1]) * k;
      renderers.forEach((r) => r.render(s));

      // adaptive resolution: drop pixel density if the device struggles
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
      if (!raf && !reduce && renderers.length) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };

    (async () => {
      try {
        const [img, depth] = await Promise.all([load(PLATE_SRC), load(DEPTH_SRC)]);
        if (disposed) return;
        renderers = [new SceneRenderer(back.current!, img, depth, 0), new SceneRenderer(front.current!, img, depth, 1)];
        size();
        if (reduce) state.current.intro = 1;
        renderers.forEach((r) => r.render(state.current));
        el.classList.add('is-live');
        start();
      } catch {
        // keep the static plate
      }
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
      {children}
      <canvas className="scene__gl scene__gl--front" ref={front} aria-hidden="true" />
    </div>
  );
});
