'use client';

import { useEffect, useRef, useState } from 'react';
import { useSite } from '@/components/providers';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

export type RevealState = 'idle' | 'in' | 'done';

/**
 * Observes an element and reports when it scrolls into view (after the preloader has finished).
 * With `keep: false`, the state moves to 'done' once the entrance has played so that the
 * reveal classes can be dropped and hover transitions take over again.
 */
export function useReveal<T extends Element>({ delay = 0, keep = false } = {}) {
  const ref = useRef<T>(null);
  const { ready } = useSite();
  const [state, setState] = useState<RevealState>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!ready || !el || state !== 'idle') return;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      setState('done');
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready, state]);

  useEffect(() => {
    if (state !== 'in' || keep) return;
    const t = setTimeout(() => setState('done'), 1300 + delay);
    return () => clearTimeout(t);
  }, [state, keep, delay]);

  return [ref, state] as const;
}

/**
 * Calls `onProgress` with how far `ref` has travelled through the viewport.
 * mode 'through': 0 when the top enters the bottom of the viewport → 1 when the bottom leaves the top.
 * mode 'pin': 0 when the top hits the viewport top → 1 when the bottom hits the viewport bottom (for sticky scenes).
 * mode 'center': tracks a reading line 60% down the viewport as it moves through the element.
 */
export function useScrollProgress<T extends HTMLElement>(
  onProgress: (p: number) => void,
  mode: 'through' | 'pin' | 'center' = 'through',
) {
  const ref = useRef<T>(null);
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      let p: number;
      if (mode === 'pin') p = -r.top / Math.max(1, r.height - vh);
      else if (mode === 'center') p = (vh * 0.6 - r.top) / Math.max(1, r.height);
      else p = (vh - r.top) / (r.height + vh);
      cb.current(Math.min(1, Math.max(0, p)));
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
  }, [mode]);

  return ref;
}
