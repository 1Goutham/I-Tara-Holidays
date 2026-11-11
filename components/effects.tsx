'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useSite } from './providers';
import { getLenis, gsap, ScrollTrigger } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/**
 * Minimal loader: the logo mark and a hairline that follows the hero's assets.
 * Releases the page (and the hero's dawn entrance) once fonts and the scene are ready —
 * never later than 6s, so a slow connection still gets the page.
 */
export function Boot() {
  const { setReady } = useSite();
  const [progress, setProgress] = useState(0.08);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let released = false;
    let heroReady = false;
    let fontsReady = false;
    document.body.classList.add('is-loading');
    getLenis()?.stop();
    const timers: ReturnType<typeof setTimeout>[] = [];
    const release = () => {
      if (released) return;
      released = true;
      setProgress(1);
      timers.push(setTimeout(() => {
        setLeaving(true);
        document.body.classList.remove('is-loading');
        document.body.classList.add('is-ready');
        getLenis()?.start();
        setReady(true);
        ScrollTrigger.refresh();
      }, 260));
      timers.push(setTimeout(() => setGone(true), 1400));
    };
    const check = () => heroReady && fontsReady && release();
    const onProgress = (e: Event) => setProgress((p) => Math.max(p, 0.1 + 0.85 * Number((e as CustomEvent).detail || 0)));
    const onReady = () => {
      heroReady = true;
      check();
    };
    window.addEventListener('itara:hero-progress', onProgress);
    window.addEventListener('itara:hero-ready', onReady);
    (document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsReady = true;
      check();
    });
    timers.push(setTimeout(release, 6000));
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('itara:hero-progress', onProgress);
      window.removeEventListener('itara:hero-ready', onReady);
      window.removeEventListener('load', refresh);
    };
  }, [setReady]);

  if (gone) return null;
  return (
    <div className={`loader${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <Image src="/img/mark.png" alt="" width={72} height={72} priority className="loader__mark" />
      <span className="loader__bar"><i style={{ transform: `scaleX(${progress})` }} /></span>
    </div>
  );
}

/** Thin page-progress hairline. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (s) => {
        if (bar.current) bar.current.style.transform = `scaleX(${s.progress})`;
        document.body.classList.toggle('is-scrolled', s.scroll() > 500);
      },
    });
    return () => st.kill();
  }, []);
  return <div className="progress" ref={bar} aria-hidden="true" />;
}

/** Context cursor: only appears as a labelled disc over elements with data-cursor="View". */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [on, setOn] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || !el.current) return;
    const xTo = gsap.quickTo(el.current, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el.current, 'y', { duration: 0.5, ease: 'power3' });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>('[data-cursor]');
      setOn(!!t);
      if (t) setLabel(t.dataset.cursor || '');
    };
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerover', over);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerover', over);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className={`cursor${on ? ' is-on' : ''}`} ref={el} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

/** Subtle magnetic pull for elements with .magnetic (fine pointers only). */
export function Magnetic() {
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    let active: HTMLElement | null = null;
    const move = (e: PointerEvent) => {
      const m = (e.target as Element | null)?.closest<HTMLElement>('.magnetic') ?? null;
      if (active && active !== m) gsap.to(active, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      active = m;
      if (!m) return;
      const r = m.getBoundingClientRect();
      gsap.to(m, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.5, ease: 'power3.out' });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return null;
}

export function Toast() {
  const { toastState } = useSite();
  return (
    <div className={`toast${toastState.show ? ' is-show' : ''}${toastState.error ? ' is-error' : ''}`} role="status" aria-live="polite">
      {toastState.msg}
    </div>
  );
}

/** Film-grain overlay for a tactile, printed feel. */
export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}
