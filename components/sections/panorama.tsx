'use client';

import { useRef } from 'react';
import { LinePanorama } from '../illustrations';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';

/** Gold line drawing that draws itself as it scrolls through the viewport. */
export function Panorama() {
  const root = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const paths = gsap.utils.toArray<SVGPathElement>('.draw', root.current);
      if (prefersReducedMotion()) return;
      gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 75%', end: 'bottom 40%', scrub: 1 } });
      tl.to(paths, { strokeDashoffset: 0, ease: 'none', stagger: 0.12, duration: 1 })
        .from('.panorama__fade', { opacity: 0, duration: 0.6 }, 0.4);
    },
    { scope: root },
  );
  return (
    <section className="pano" ref={root} aria-label="From the Himalaya to the Indian Ocean" data-theme="light">
      <LinePanorama />
      <p className="pano__caption" data-fade>From the Himalaya to the Indian Ocean, <em>and everywhere between.</em></p>
    </section>
  );
}
