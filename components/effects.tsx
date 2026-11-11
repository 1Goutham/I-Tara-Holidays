'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useSite } from './providers';
import { gsap, getLenis, ScrollTrigger } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/** Counter preloader; the panel lifts away, then the page (and its reveals) is released. */
export function Preloader() {
  const { setReady } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    document.body.classList.add('is-loading');
    const release = () => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      getLenis()?.start();
      setReady(true);
    };
    if (prefersReducedMotion()) {
      setGone(true);
      release();
      return;
    }

    const counter = { v: 0 };
    let loaded = document.readyState === 'complete';
    const onLoad = () => (loaded = true);
    window.addEventListener('load', onLoad, { once: true });

    const tl = gsap.timeline({ paused: true });
    tl.to(counter, {
      v: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate: () => {
        if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, '0');
        if (bar.current) bar.current.style.transform = `scaleX(${counter.v / 100})`;
      },
    })
      .to('.preloader__inner', { autoAlpha: 0, y: -20, duration: 0.6, ease: 'power2.in' }, '+=0.15')
      .to(root.current, { yPercent: -100, duration: 1.2, ease: 'expo.inOut' }, '-=0.2')
      .add(release, '-=0.85')
      .add(() => setGone(true));

    // start once fonts are in (max 1.2s wait) so the first frame is typographically correct
    const start = () => tl.play();
    const t = setTimeout(start, 1200);
    document.fonts?.ready.then(() => {
      clearTimeout(t);
      start();
    });
    // never hold the page longer than 5s on slow images
    const guard = setTimeout(() => {
      if (!loaded) tl.timeScale(2);
    }, 3000);

    return () => {
      clearTimeout(t);
      clearTimeout(guard);
      window.removeEventListener('load', onLoad);
      tl.kill();
    };
  }, [setReady]);

  if (gone) return null;
  return (
    <div className="preloader" ref={root} aria-hidden="true">
      <div className="preloader__inner">
        <Image src="/img/wordmark.png" alt="" width={260} height={76} priority className="preloader__logo" />
        <div className="preloader__foot">
          <span className="preloader__label">Preparing your journey</span>
          <span className="preloader__num" ref={num}>000</span>
        </div>
        <span className="preloader__bar"><span ref={bar} /></span>
      </div>
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
