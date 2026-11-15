'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/*
 * A real airliner climbing across the dawn sky on a continuous loop, behind the headline.
 * It recedes as it flies (smaller, hazier), banks gently, trails contrails from both
 * engines, and answers the pointer with depth parallax and a bank toward it.
 */

// flight path in viewport fractions: in from beyond the left edge, climbing out to the upper right
const PATH = [
  { x: -0.22, y: 0.4 },
  { x: 0.1, y: 0.3 },
  { x: 0.42, y: 0.22 },
  { x: 0.76, y: 0.17 },
  { x: 1.12, y: 0.13 },
];
const DURATION = 24;

export function SkyFlight({ start }: { start: boolean }) {
  const flight = useRef<HTMLDivElement>(null);
  const tilt = useRef<HTMLDivElement>(null);

  // pointer: depth parallax and a bank toward the cursor (desktop)
  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion() || !tilt.current) return;
    const xTo = gsap.quickTo(tilt.current, 'x', { duration: 1.6, ease: 'power3' });
    const yTo = gsap.quickTo(tilt.current, 'y', { duration: 1.6, ease: 'power3' });
    const rTo = gsap.quickTo(tilt.current, 'rotation', { duration: 1.8, ease: 'power3' });
    const move = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      xTo(nx * 46);
      yTo(ny * 30);
      rTo(nx * 7 - ny * 3);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  useEffect(() => {
    const el = flight.current;
    if (!start || !el || prefersReducedMotion()) return;
    const points = () => PATH.map((p) => ({ x: p.x * window.innerWidth, y: p.y * window.innerHeight }));
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 4, delay: 1.2 });
    tl.set(el, { autoAlpha: 0, scale: 1, filter: 'blur(0px)', xPercent: -50, yPercent: -50 })
      .to(el, {
        duration: DURATION,
        ease: 'none',
        motionPath: { path: points(), curviness: 1.25, autoRotate: true },
        immediateRender: true,
      }, 0)
      // receding: smaller and hazier as it climbs away
      .to(el, { scale: 0.32, duration: DURATION, ease: 'power1.in' }, 0)
      .to(el, { filter: 'blur(0.8px)', duration: DURATION * 0.6, ease: 'power1.in' }, DURATION * 0.4)
      .to(el, { autoAlpha: 1, duration: 2.4, ease: 'power2.out' }, 0)
      .to(el, { autoAlpha: 0, duration: 4, ease: 'power1.in' }, DURATION - 4);
    // light turbulence on the inner wrapper
    const bob = gsap.to(el.querySelector('.plane__body'), { y: -5, rotation: -1.2, duration: 3.1, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    const onResize = () => tl.invalidate();
    window.addEventListener('resize', onResize);
    return () => {
      tl.kill();
      bob.kill();
      window.removeEventListener('resize', onResize);
    };
  }, [start]);

  return (
    <div className="sky-flight" aria-hidden="true">
      <div className="plane" ref={flight}>
        <div className="plane__tilt" ref={tilt}>
          {/* the image's nose points ~12° up; counter-rotate so the path tangent leads */}
          <div className="plane__body">
            <div className="plane__orient">
              <span className="plane__trail plane__trail--a" />
              <span className="plane__trail plane__trail--b" />
              {/* eslint-disable-next-line @next/next/no-img-element -- small pre-cut sprite */}
              <img src="/img/hero/plane.webp" alt="" className="plane__img" width={554} height={191} decoding="async" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
