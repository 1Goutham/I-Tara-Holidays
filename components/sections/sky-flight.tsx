'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';

/*
 * A distant airliner crossing high in the dawn sky, the way one would appear in a real
 * landscape photograph: small, hazed by the air, flying a slow straight line, leaving a
 * long thin contrail. No pointer interaction — it belongs to the scene, not the UI.
 */

// straight climb in viewport fractions, just under the header
const FROM = { x: -0.06, y: 0.215 };
const TO = { x: 1.06, y: 0.125 };
const DURATION = 46;

export function SkyFlight({ start }: { start: boolean }) {
  const plane = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = plane.current;
    if (!start || !el || prefersReducedMotion()) return;
    const pos = (p: { x: number; y: number }) => ({ x: p.x * window.innerWidth, y: p.y * window.innerHeight });
    const angle = () => {
      const a = pos(FROM);
      const b = pos(TO);
      return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    };
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 14, delay: 2 });
    tl.set(el, { xPercent: -50, yPercent: -50, x: () => pos(FROM).x, y: () => pos(FROM).y, rotation: angle, autoAlpha: 0, scale: 1 })
      .to(el, { x: () => pos(TO).x, y: () => pos(TO).y, duration: DURATION, ease: 'none' }, 0)
      .to(el, { scale: 0.82, duration: DURATION, ease: 'none' }, 0)
      .to(el, { autoAlpha: 1, duration: 4, ease: 'sine.out' }, 0)
      .to(el, { autoAlpha: 0, duration: 6, ease: 'sine.in' }, DURATION - 6);
    const onResize = () => tl.invalidate();
    window.addEventListener('resize', onResize);
    return () => {
      tl.kill();
      window.removeEventListener('resize', onResize);
    };
  }, [start]);

  return (
    <div className="sky-flight" aria-hidden="true">
      <div className="plane" ref={plane}>
        <span className="plane__trail" />
        {/* the image's nose points ~12° up; counter-rotated in CSS so it flies level along its line */}
        {/* eslint-disable-next-line @next/next/no-img-element -- small pre-cut sprite */}
        <img src="/img/hero/plane.webp" alt="" className="plane__img" width={554} height={191} decoding="async" />
      </div>
    </div>
  );
}
