'use client';

import { useSite } from '../providers';
import { gsap, ScrollTrigger, SplitText, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * Scroll reveals driven by data attributes:
 *   data-split   lines rise out of a mask
 *   data-fade    soft rise + fade (siblings entering together are staggered)
 *   data-img     clip wipe while the image settles
 *   data-rule    hairline draws from the left
 *
 * Smoothness rules:
 *  - every element's start state is applied up front, so nothing is ever visible and then re-hidden;
 *  - transforms are forced onto the GPU (force3D) and only transform/opacity are animated;
 *  - split lines stay split after they land (reverting re-rasterises text and causes a visible snap);
 *    completed splits are only restored when the viewport width actually changes.
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

      const ease = 'power4.out';
      const landed: SplitText[] = [];

      // headings & lead paragraphs
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        if (el.closest('[data-own-motion]')) return;
        const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'line' });
        gsap.set(split.lines, { yPercent: 110, force3D: true });
        gsap.set(el, { visibility: 'visible' });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () =>
            gsap.to(split.lines, {
              yPercent: 0,
              duration: 1.5,
              stagger: 0.11,
              ease,
              delay: parseFloat(el.dataset.delay || '0'),
              onComplete: () => {
                landed.push(split);
              },
            }),
        });
      });

      // blocks: start state first, then batch-animate as they enter
      const fades = gsap.utils.toArray<HTMLElement>('[data-fade]').filter((el) => !el.closest('[data-own-motion]'));
      gsap.set(fades, { autoAlpha: 0, y: 28, force3D: true });
      ScrollTrigger.batch(fades, {
        start: 'top 92%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, { autoAlpha: 1, y: 0, duration: 1.4, ease: 'power3.out', stagger: 0.09, overwrite: true, clearProps: 'transform' }),
      });

      // image frames
      gsap.utils.toArray<HTMLElement>('[data-img]').forEach((el) => {
        const img = el.querySelector('img');
        gsap.set(el, { visibility: 'visible', clipPath: 'inset(100% 0% 0% 0%)' });
        if (img) gsap.set(img, { scale: 1.22, force3D: true });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 86%',
          once: true,
          onEnter: () => {
            gsap.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'power3.inOut' });
            if (img) gsap.to(img, { scale: 1, duration: 2.2, ease: 'power3.out', delay: 0.1 });
          },
        });
      });

      // hairlines
      const rules = gsap.utils.toArray<HTMLElement>('[data-rule]');
      gsap.set(rules, { visibility: 'visible', scaleX: 0, transformOrigin: '0% 50%' });
      ScrollTrigger.batch(rules, {
        start: 'top 94%',
        once: true,
        onEnter: (els) => gsap.to(els, { scaleX: 1, duration: 1.8, ease: 'power3.inOut', stagger: 0.06 }),
      });

      // restore landed splits only when the width changes, so lines can re-wrap
      let lastW = window.innerWidth;
      let t: ReturnType<typeof setTimeout>;
      const onResize = () => {
        clearTimeout(t);
        t = setTimeout(() => {
          if (window.innerWidth === lastW) return;
          lastW = window.innerWidth;
          landed.splice(0).forEach((s) => s.revert());
        }, 200);
      };
      window.addEventListener('resize', onResize);

      ScrollTrigger.refresh();
      return () => {
        clearTimeout(t);
        window.removeEventListener('resize', onResize);
      };
    },
    { dependencies: [ready] },
  );

  return null;
}
