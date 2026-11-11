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
