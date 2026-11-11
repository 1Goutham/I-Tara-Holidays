'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useSite } from './providers';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/** Branded loading screen; releases the page (and all reveals) once loaded. */
export function Preloader() {
  const { setReady } = useSite();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    document.body.classList.add('is-loading');
    let released = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const release = () => {
      if (released) return;
      released = true;
      setDone(true);
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      timers.push(setTimeout(() => setReady(true), reduce ? 0 : 350));
    };
    const onLoad = () => timers.push(setTimeout(release, reduce ? 0 : 900));
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    timers.push(setTimeout(release, 3200)); // never block on slow images
    return () => {
      window.removeEventListener('load', onLoad);
      timers.forEach(clearTimeout);
    };
  }, [setReady]);

  return (
    <div className={`preloader${done ? ' is-done' : ''}`} aria-hidden="true">
      <div className="preloader__inner">
        <Image src="/img/mark.png" alt="" width={120} height={120} priority />
        <span className="preloader__word">I Tara</span>
        <span className="preloader__bar"><i /></span>
      </div>
    </div>
  );
}

/** Scroll progress bar, parallax layers and the `is-scrolled` body flag. */
export function ScrollEffects() {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      document.body.classList.toggle('is-scrolled', y > 400);
      if (!reduce) {
        document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
          const r = el.parentElement!.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return;
          const offset = (r.top + r.height / 2 - window.innerHeight / 2) * -parseFloat(el.dataset.parallax || '0');
          el.style.transform = `translate3d(0,${offset.toFixed(1)}px,0)`;
        });
      }
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return <div className="progress" ref={bar} aria-hidden="true" />;
}

/** Custom cursor, magnetic buttons (.magnetic) and 3D tilt cards (.tilt) — fine pointers only. */
export function PointerEffects() {
  const cursor = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);

    let cx = -100, cy = -100, tx = -100, ty = -100, raf = 0;
    let magnet: HTMLElement | null = null;
    let tilt: HTMLElement | null = null;

    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      if (cursor.current) cursor.current.style.transform = `translate3d(${cx}px,${cy}px,0)`;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const t = e.target as Element | null;

      const m = t?.closest<HTMLElement>('.magnetic') ?? null;
      if (magnet && magnet !== m) magnet.style.transform = '';
      magnet = m;
      if (m) {
        const r = m.getBoundingClientRect();
        m.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1)}px,${((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1)}px)`;
      }

      const c = t?.closest<HTMLElement>('.tilt') ?? null;
      if (tilt && tilt !== c) tilt.style.transform = '';
      tilt = c;
      if (c) {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-6px)`;
      }
    };
    const onOver = (e: PointerEvent) => {
      const hover = !!(e.target as Element | null)?.closest('a, button, .dcard, .pkg, .style-card, input, select, textarea, label');
      cursor.current?.classList.toggle('is-hover', hover);
    };
    const onLeave = () => {
      if (magnet) magnet.style.transform = '';
      if (tilt) tilt.style.transform = '';
      magnet = tilt = null;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.documentElement.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.documentElement.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  if (!enabled) return null;
  return (
    <div className="cursor" ref={cursor} aria-hidden="true">
      <span />
    </div>
  );
}

export function Toast() {
  const { toastState } = useSite();
  return (
    <div className={`toast${toastState.show ? ' is-show' : ''}${toastState.error ? ' is-error' : ''}`} role="status" aria-live="polite">
      {toastState.msg}
    </div>
  );
}
