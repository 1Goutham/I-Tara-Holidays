'use client';

import { useSite } from '../providers';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * One place for scroll reveals, driven by data attributes in the markup:
 *   data-split   headings / lead text: lines rise out of a mask
 *   data-fade    blocks: soft rise + fade (siblings are staggered)
 *   data-img     image frames: clip wipe upward while the image settles from 1.25x
 *   data-rule    hairlines: draw from the left
 */
export function Reveals() {
  const { ready } = useSite();

  useGSAP(
    () => {
      if (!ready) return;
      const all = gsap.utils.toArray<HTMLElement>('[data-split],[data-fade],[data-img],[data-rule]');
      if (prefersReducedMotion()) {
        gsap.set(all, { visibility: 'visible' });
        return;
      }

      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        if (el.closest('[data-own-motion]')) return;
        SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'line',
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { visibility: 'visible' });
            return gsap.from(self.lines, {
              yPercent: 115,
              rotate: 2.5,
              transformOrigin: '0% 100%',
              duration: 1.25,
              stagger: 0.09,
              delay: parseFloat(el.dataset.delay || '0'),
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            });
          },
        });
      });

      gsap.set('[data-fade]', { visibility: 'visible' });
      ScrollTrigger.batch('[data-fade]:not([data-own-motion] [data-fade])', {
        start: 'top 90%',
        once: true,
        onEnter: (els) =>
          gsap.from(els, { autoAlpha: 0, y: 36, duration: 1.2, ease: 'power3.out', stagger: 0.1, overwrite: true }),
      });

      gsap.utils.toArray<HTMLElement>('[data-img]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });
        const img = el.querySelector('img');
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        tl.fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' });
        if (img) tl.fromTo(img, { scale: 1.3 }, { scale: 1, duration: 2, ease: 'expo.out' }, 0.2);
      });

      gsap.utils.toArray<HTMLElement>('[data-rule]').forEach((el) => {
        gsap.set(el, { visibility: 'visible' });
        gsap.from(el, { scaleX: 0, transformOrigin: '0% 50%', duration: 1.6, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
      });

      ScrollTrigger.refresh();
    },
    { dependencies: [ready] },
  );

  return null;
}
