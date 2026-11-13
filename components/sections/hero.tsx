'use client';

import { useRef } from 'react';
import { useSite } from '../providers';
import { HeroScene, type SceneHandle } from '../hero-gl/hero-scene';
import { HeroTitle } from './hero-title';
import { gsap, useGSAP } from '@/lib/gsap';
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
        .fromTo(q('.hero__title'), { filter: 'blur(0px)' }, { yPercent: -38, autoAlpha: 0, filter: 'blur(18px)', duration: 0.6, ease: 'power1.in' }, 0)
        .to(q('.hero__flight'), { xPercent: 22, yPercent: -40, duration: 0.6, ease: 'power1.in' }, 0)
        .fromTo(q('.hero__bottom'), { filter: 'blur(0px)' }, { autoAlpha: 0, y: 20, filter: 'blur(8px)', duration: 0.3 }, 0)
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
      const tl = gsap.timeline();
      if (s) tl.to(s, { intro: 1, duration: 3.4, ease: 'power2.out' }, 0);
      tl.from(q('.scene__branch'), { xPercent: 8, yPercent: -10, duration: 2.6, ease: 'power3.out' }, 0.1)
        .from(q('.scene__bushes'), { yPercent: 14, duration: 2.4, ease: 'power3.out' }, 0.1);

      // line 1 · letters rise out of a soft blur, one after another
      tl.fromTo(
        q('.ht__c'),
        { yPercent: 70, autoAlpha: 0, filter: 'blur(10px)' },
        { yPercent: 0, autoAlpha: 1, filter: 'blur(0px)', duration: 1.3, stagger: 0.035, ease: 'power3.out', clearProps: 'filter' },
        0.5,
      );
      // line 2 · the serif rises out of its mask, then sunlight sweeps across it
      tl.fromTo(q('.ht__in'), { yPercent: 108 }, { yPercent: 0, duration: 1.7, ease: 'power4.out' }, 0.85)
        .fromTo(q('.ht__warm, .ht__cool'), { backgroundPosition: '100% 50%' }, { backgroundPosition: '0% 50%', duration: 2.2, ease: 'power2.inOut', stagger: 0.12 }, 1.2);

      // the plane inks its trail in, loops, and settles above the lockup
      const trail = root.current?.querySelector<SVGPathElement>('.flight__trail');
      const reveal = root.current?.querySelector<SVGPathElement>('.flight__reveal');
      const plane = q('.flight__plane')[0];
      if (trail && reveal && plane) {
        const L = reveal.getTotalLength();
        gsap.set(reveal, { strokeDasharray: L, strokeDashoffset: L });
        gsap.set(plane, { autoAlpha: 0 });
        tl.set(plane, { autoAlpha: 1 }, 1.0)
          .to(reveal, { strokeDashoffset: 0, duration: 3.4, ease: 'power2.inOut' }, 1.0)
          .to(plane, { duration: 3.4, ease: 'power2.inOut', motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: true } }, 1.0)
          .add(() => {
            gsap.to(plane, { y: '-=6', rotation: '-=4', duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          });
      }

      tl.from(q('.hero__bottom > *'), { autoAlpha: 0, y: 14, duration: 1.3, stagger: 0.1, ease: 'power3.out' }, 1.4);
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section className="hero" ref={root} aria-label="Introduction" data-theme="light">
      <div className="hero__pin">
        <HeroScene ref={scene}>
          <div className="hero__copy">
            <HeroTitle />
          </div>
        </HeroScene>
        <div className="hero__fade" aria-hidden="true" />
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__bottom">
          <p>Handpicked holidays across India and the world, planned with care and looked after at every step.</p>
          <a href="#journeys" className="link">Explore journeys</a>
        </div>
      </div>
    </section>
  );
}
