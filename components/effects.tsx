'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useSite } from './providers';
import { getLenis, gsap, ScrollTrigger } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/**
 * Opening sequence: the logo is unveiled behind a soft wipe while a fine gold line follows
 * the hero's assets; when everything is in, the logo lifts away and a widening iris opens
 * onto the dawn scene. Never holds the page longer than 6s.
 */
export function Boot() {
  const { setReady } = useSite();
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    let released = false;
    let heroReady = false;
    let fontsReady = false;
    let introDone = reduce;
    document.body.classList.add('is-loading');
    getLenis()?.stop();
    const q = gsap.utils.selector(el);
    const shown = { p: 0 };
    let target = 0.06;
    const pct = q('.loader__pct')[0];
    const line = q('.loader__line i')[0];
    const render = () => {
      if (line) line.style.transform = `scaleX(${shown.p.toFixed(4)})`;
      if (pct) pct.textContent = String(Math.round(shown.p * 100)).padStart(2, '0');
    };
    const follow = gsap.ticker.add(() => {
      shown.p += (target - shown.p) * 0.08;
      if (target === 1 && shown.p > 0.995) shown.p = 1;
      render();
    });

    const open = () => {
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      getLenis()?.start();
      setReady(true);
      ScrollTrigger.refresh();
    };
    const exit = () => {
      if (reduce) {
        open();
        setGone(true);
        return;
      }
      gsap
        .timeline({ onComplete: () => setGone(true) })
        .to(q('.loader__inner'), { autoAlpha: 0, y: -18, filter: 'blur(6px)', duration: 0.7, ease: 'power2.in' })
        .add(open, '-=0.15')
        .fromTo(el, { '--r': '0vmax' }, { '--r': '150vmax', duration: 1.5, ease: 'power3.inOut' }, '-=0.2');
    };
    const tryRelease = () => {
      if (released || !introDone) return;
      if (!(heroReady && fontsReady)) return;
      released = true;
      target = 1;
      gsap.delayedCall(0.55, exit);
    };

    // intro: the logo is unveiled left to right, the line and figures fade in
    if (!reduce) {
      gsap
        .timeline({ onComplete: () => { introDone = true; tryRelease(); } })
        .fromTo(q('.loader__logo'), { clipPath: 'inset(0 100% 0 0)', y: 8 }, { clipPath: 'inset(0 0% 0 0)', y: 0, duration: 1.3, ease: 'power3.inOut' })
        .fromTo(q('.loader__meta'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, 0.5);
    }

    const onProgress = (e: Event) => { target = Math.max(target, 0.08 + 0.84 * Number((e as CustomEvent).detail || 0)); };
    const onReady = () => { heroReady = true; tryRelease(); };
    window.addEventListener('itara:hero-progress', onProgress);
    window.addEventListener('itara:hero-ready', onReady);
    (document.fonts?.ready ?? Promise.resolve()).then(() => { fontsReady = true; tryRelease(); });
    const cap = setTimeout(() => { heroReady = fontsReady = introDone = true; tryRelease(); }, 6000);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    return () => {
      clearTimeout(cap);
      gsap.ticker.remove(follow);
      window.removeEventListener('itara:hero-progress', onProgress);
      window.removeEventListener('itara:hero-ready', onReady);
      window.removeEventListener('load', refresh);
    };
  }, [setReady]);

  if (gone) return null;
  return (
    <div className="loader" ref={root} aria-hidden="true">
      <div className="loader__inner">
        <Image src="/img/logo-h.webp" alt="" width={720} height={208} priority sizes="340px" className="loader__logo" />
        <div className="loader__meta">
          <span className="loader__line"><i /></span>
          <span className="loader__row">
            <span>Preparing your journey</span>
            <span className="loader__pct">00</span>
          </span>
        </div>
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
