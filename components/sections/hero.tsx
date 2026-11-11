'use client';

import { useRef } from 'react';
import { useSite } from '../providers';
import { LandscapeBack, LandscapeFront } from '../illustrations';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/**
 * Pinned hero. The headline sits between mountain layers; on scroll the layers separate
 * at different speeds and the dark foreground rises to become the next section.
 */
export function Hero() {
  const { ready } = useSite();
  const root = useRef<HTMLElement>(null);

  // scroll choreography + pointer parallax
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({
        defaults: { ease: 'none', duration: 1 },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=90%', scrub: 0.8, pin: '.hero__scene' },
      });
      tl.to(q('.hl--sun'), { yPercent: 55 }, 0)
        .to(q('.hl--birds'), { yPercent: -120, xPercent: 30 }, 0)
        .to(q('.hl--far'), { yPercent: -5 }, 0)
        .to(q('.hl--range'), { yPercent: -12 }, 0)
        .to(q('.hero__title'), { yPercent: -45, autoAlpha: 0, ease: 'power1.in' }, 0)
        .to(q('.hl--hills'), { yPercent: -26 }, 0)
        .to(q('.hl--mist'), { yPercent: -40, autoAlpha: 0 }, 0)
        .to(q('.hl--forest'), { yPercent: -48 }, 0)
        .to(q('.hl--front'), { yPercent: -82 }, 0)
        .to(q('.hero__bottom'), { autoAlpha: 0, duration: 0.25 }, 0);

      if (!hasFinePointer()) return;
      const layers = q('.hl__inner');
      const depth = [0.1, 0.2, 0.35, 0.55, 0.8];
      const movers = layers.map((l, i) => ({
        x: gsap.quickTo(l, 'x', { duration: 1.4, ease: 'power3' }),
        d: depth[i] ?? 0.5,
      }));
      const onMove = (e: PointerEvent) => {
        const nx = e.clientX / window.innerWidth - 0.5;
        movers.forEach((m) => m.x(-nx * 60 * m.d));
      };
      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    { scope: root },
  );

  // Dawn entrance: the paper veil lifts like morning light, the sun rises,
  // the ranges settle from back to front and the headline is set line by line.
  useGSAP(
    () => {
      if (!ready) return;
      const q = gsap.utils.selector(root);
      gsap.set(q('.hero__title, .hero__bottom'), { visibility: 'visible' });
      if (prefersReducedMotion()) {
        gsap.set(q('.hero__veil'), { autoAlpha: 0 });
        return;
      }
      const split = SplitText.create(q('.hero__title'), { type: 'lines', mask: 'lines', linesClass: 'line' });
      const tl = gsap.timeline({ defaults: { force3D: true } });
      tl.to(q('.hero__veil'), { autoAlpha: 0, duration: 1.8, ease: 'power2.inOut' }, 0)
        .from(q('.hl--sun'), { yPercent: 50, duration: 3.2, ease: 'power3.out' }, 0.1)
        .from(q('.hl__inner'), { yPercent: 8, duration: 2.8, stagger: 0.1, ease: 'power3.out' }, 0.15)
        .from(split.lines, { yPercent: 112, duration: 1.8, stagger: 0.15, ease: 'power4.out' }, 0.5)
        .from(q('.hero__bottom > *'), { autoAlpha: 0, y: 14, duration: 1.2, stagger: 0.1, ease: 'power3.out' }, 1.2);
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section className="hero" ref={root} aria-label="Introduction" data-theme="light">
      <div className="hero__scene">
        <LandscapeBack />
        <div className="hero__copy">
          <h1 className="hero__title">
            Journeys,<br /> <em>gently</em> guided.
          </h1>
        </div>
        <LandscapeFront />
        <div className="hero__veil" aria-hidden="true" />
        <div className="hero__bottom">
          <p>Handpicked holidays across India and the world, planned with care and looked after at every step.</p>
          <span className="hero__scroll"><i />Scroll</span>
          <a href="#journeys" className="link">Explore journeys</a>
        </div>
      </div>
    </section>
  );
}
