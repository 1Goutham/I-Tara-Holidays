'use client';

import { useEffect, useRef, useState } from 'react';
import { useSite } from './providers';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/**
 * No loading screen: release the page as soon as the web fonts are ready (max 700ms) so the
 * first animated frame is typographically final, then refresh scroll positions once
 * everything (fonts, images) has settled.
 */
export function Boot() {
  const { setReady } = useSite();
  useEffect(() => {
    let done = false;
    const release = () => {
      if (done) return;
      done = true;
      document.body.classList.add('is-ready');
      setReady(true);
    };
    const t = setTimeout(release, 700);
    document.fonts?.ready.then(release).catch(release);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener('load', refresh);
    };
  }, [setReady]);
  return null;
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
