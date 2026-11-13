'use client';

import { useEffect, useRef } from 'react';
import { useSite } from '../providers';
import { HeroScene, type SceneHandle } from '../hero-gl/hero-scene';
import { HeroTitle } from './hero-title';
import { SkyFlight } from './sky-flight';
import { PLATE, plateToScreen } from '../hero-gl/renderer';
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
        .to(q('.sky-flight'), { yPercent: -12, duration: 1 }, 0)
        .fromTo(q('.hero__bottom'), { filter: 'blur(0px)' }, { autoAlpha: 0, y: 20, filter: 'blur(8px)', duration: 0.3 }, 0)
        .to(q('.hero__shade'), { autoAlpha: 1, duration: 0.4, ease: 'power1.in' }, 0.6);
    },
    { scope: root },
  );

  // light the headline from the scene's sun: one field across the serif line, plus a bloom
  // centred on the sun's screen position (both recomputed on resize)
  useEffect(() => {
    const el = root.current;
    const sceneEl = el?.querySelector<HTMLElement>('.scene');
    if (!el || !sceneEl) return;
    const apply = () => {
      const sr = sceneEl.getBoundingClientRect();
      const [sx, sy] = plateToScreen(PLATE.sun[0], PLATE.sun[1], sr.width, sr.height);
      el.querySelectorAll<HTMLElement>('.ht__ink, .ht__glow').forEach((layer) => {
        const lr = layer.getBoundingClientRect();
        layer.querySelectorAll<HTMLElement>('.ht__w').forEach((w) => {
          const wr = w.getBoundingClientRect();
          // offsets ignore the entrance transform: both rects move together
          w.style.setProperty('--fw', `${lr.width.toFixed(1)}px`);
          w.style.setProperty('--fx', `${(lr.left - wr.left).toFixed(1)}px`);
          w.style.setProperty('--sx', `${(sr.left + sx - wr.left).toFixed(1)}px`);
          w.style.setProperty('--sy', `${(sr.top + sy - wr.top).toFixed(1)}px`);
        });
      });
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(sceneEl);
    document.fonts?.ready.then(apply).catch(() => {});
    const t = setTimeout(apply, 3200); // after the entrance has settled
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

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
      tl.fromTo(q('.ht__rule'), { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power3.inOut' }, 0.6);
      // line 2 · the serif rises out of its mask; the sunlight then reaches its edges
      tl.fromTo(q('.ht__in'), { yPercent: 108 }, { yPercent: 0, duration: 1.8, ease: 'power4.out' }, 0.85)
        .fromTo(q('.ht__glow'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 2.6, ease: 'power2.inOut' }, 1.6);

      // a distant airliner crosses the sky, its contrail spreading and fading behind it
      const path = root.current?.querySelector<SVGPathElement>('.flight__reveal');
      const plane = q('.flight__plane')[0];
      const trail = q('.flight__trail')[0];
      if (path && plane && trail) {
        const L = path.getTotalLength();
        const fly = gsap.timeline({ repeat: -1, repeatDelay: 6, delay: 1.4 });
        fly
          .set(path, { strokeDasharray: L, strokeDashoffset: L })
          .set(trail, { autoAlpha: 1, scaleY: 1, transformOrigin: '50% 50%' })
          .set(plane, { autoAlpha: 1 })
          .to(path, { strokeDashoffset: 0, duration: 17, ease: 'none' }, 0)
          .to(plane, { duration: 17, ease: 'none', motionPath: { path: '.flight__reveal', align: '.flight__reveal', alignOrigin: [0.5, 0.5], autoRotate: true } }, 0)
          .to(trail, { autoAlpha: 0, scaleY: 1.6, duration: 9, ease: 'sine.in' }, 12)
          .set(plane, { autoAlpha: 0 }, 17);
      }

      tl.from(q('.hero__bottom > *'), { autoAlpha: 0, y: 14, duration: 1.3, stagger: 0.1, ease: 'power3.out' }, 1.4);
    },
    { scope: root, dependencies: [ready] },
  );

  return (
    <section className="hero" ref={root} aria-label="Introduction" data-theme="light">
      <div className="hero__pin">
        <HeroScene ref={scene}>
          <SkyFlight />
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
