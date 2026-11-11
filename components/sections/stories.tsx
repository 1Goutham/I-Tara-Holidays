'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { testimonials } from '@/lib/data';
import { gsap, SplitText } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';

export function Stories() {
  const [index, setIndex] = useState(0);
  const quote = useRef<HTMLQuoteElement>(null);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const first = useRef(true);
  const n = testimonials.length;
  const t = testimonials[index];

  const start = useCallback(() => {
    clearInterval(timer.current);
    if (!prefersReducedMotion()) timer.current = setInterval(() => setIndex((i) => (i + 1) % n), 8000);
  }, [n]);
  useEffect(() => {
    start();
    return () => clearInterval(timer.current);
  }, [start]);

  // animate each new quote in, line by line
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (!quote.current || prefersReducedMotion()) return;
    const split = SplitText.create(quote.current, { type: 'lines', mask: 'lines' });
    const tw = gsap.from(split.lines, { yPercent: 110, duration: 1.3, stagger: 0.08, ease: 'power4.out', force3D: true });
    return () => {
      tw.kill();
      split.revert();
    };
  }, [index]);

  const go = (i: number) => {
    setIndex((i + n) % n);
    start();
  };

  return (
    <section className="stories section" id="stories" data-theme="light">
      <div className="container stories__grid">
        <p className="label" data-fade>Traveller stories</p>
        <figure className="stories__fig" data-fade onMouseEnter={() => clearInterval(timer.current)} onMouseLeave={start}>
          <blockquote ref={quote} key={index}>“{t.quote}”</blockquote>
          <figcaption>
            <span><b>{t.name}</b> · {t.trip}</span>
            <span className="stories__nav">
              <button aria-label="Previous story" onClick={() => go(index - 1)}>←</button>
              <span>{String(index + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}</span>
              <button aria-label="Next story" onClick={() => go(index + 1)}>→</button>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
