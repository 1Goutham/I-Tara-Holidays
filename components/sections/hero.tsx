'use client';

import { useRef } from 'react';
import { useSite } from '../providers';
import { HeroScene, type SceneHandle } from '../hero-gl/hero-scene';
import { gsap, SplitText, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Pinned photographic hero. On scroll the camera dollies into the valley (near layers
 * faster than far), the fog thickens, the headline lifts away and the frame settles
 * into the deep green of the next section.
 */
export function Hero() {
  const { ready } = useSite();
  const root = useRef<HTMLElement>(null);
  const scene = useRef<SceneHandle>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);
      const proxy = { p: 0 };
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: '+=100%', scrub: 1, pin: '.hero__pin' },
      })
        .to(proxy, { p: 1, duration: 1, onUpdate: () => scene.current && (scene.current.state.scroll = proxy.p) }, 0)
        .to(q('.hero__title'), { yPercent: -38, autoAlpha: 0, duration: 0.6, ease: 'power1.in' }, 0)
        .to(q('.hero__bottom'), { autoAlpha: 0, y: 20, duration: 0.3 }, 0)
        .to(q('.hero__shade'), { autoAlpha: 1, duration: 0.4, ease: 'power1.in' }, 0.6);
    },
    { scope: root },
  );

  useGSAP(
    () => {
      if (!ready) return;
      const q = gsap.utils.selector(root);
      gsap.set(q('.hero__title, .hero__bottom'), { visibility: 'visible' });
      const s = scene.current?.state;
      if (prefersReducedMotion()) {
        if (s) s.intro = 1;
        return;
      }
      const split = SplitText.create(q('.hero__title'), { type: 'lines', mask: 'lines', linesClass: 'line' });
      gsap.set(split.lines, { yPercent: 112 });
      const tl = gsap.timeline();
      if (s) tl.to(s, { intro: 1, duration: 3.4, ease: 'power2.out' }, 0);
      tl.to(split.lines, { yPercent: 0, duration: 1.8, stagger: 0.14, ease: 'power4.out' }, 0.45)
        .from(q('.hero__bottom > *'), { autoAlpha: 0, y: 14, duration: 1.3, stagger: 0.1, ease: 'power3.out' }, 1.1);
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section className="hero" ref={root} aria-label="Introduction" data-theme="light">
      <div className="hero__pin">
        <HeroScene ref={scene}>
          <div className="hero__copy">
            <h1 className="hero__title">
              Journeys,<br /> <em>gently</em> guided.
            </h1>
          </div>
        </HeroScene>
        <div className="hero__fade" aria-hidden="true" />
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__bottom">
          <p>Handpicked holidays across India and the world, planned with care and looked after at every step.</p>
          <span className="hero__scroll"><i />Scroll</span>
          <a href="#journeys" className="link">Explore journeys</a>
        </div>
      </div>
    </section>
  );
}
