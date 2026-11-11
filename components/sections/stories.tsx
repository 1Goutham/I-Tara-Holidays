'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Reveal } from '../ui/reveal';
import { Lotus } from '../illustrations';
import { testimonials } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/motion';

export function Stories() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const n = testimonials.length;

  const stop = () => clearInterval(timer.current);
  const start = useCallback(() => {
    clearInterval(timer.current);
    if (!prefersReducedMotion()) timer.current = setInterval(() => setIndex((i) => (i + 1) % n), 7000);
  }, [n]);

  useEffect(() => {
    start();
    return stop;
  }, [start]);

  const go = (i: number) => {
    setIndex((i + n) % n);
    start();
  };

  return (
    <section className="stories section" id="stories">
      <div className="container container--narrow">
        <Reveal className="stories__inner" onMouseEnter={stop} onMouseLeave={start} aria-roledescription="carousel" aria-label="Traveller stories">
          <Lotus className="stories__lotus" />
          <div className="stories__viewport">
            {testimonials.map((t, i) => (
              <figure className={`quote${i === index ? ' is-active' : ''}`} key={t.name} aria-hidden={i !== index}>
                <blockquote>{t.quote}</blockquote>
                <figcaption>
                  <b>{t.name}</b>
                  <span>{t.trip}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="stories__nav">
            <button className="round" aria-label="Previous story" onClick={() => go(index - 1)}>←</button>
            <div className="stories__dots" role="tablist">
              {testimonials.map((t, i) => (
                <button key={t.name} role="tab" aria-selected={i === index} aria-label={`Story ${i + 1}`} className={i === index ? 'is-active' : undefined} onClick={() => go(i)} />
              ))}
            </div>
            <button className="round" aria-label="Next story" onClick={() => go(index + 1)}>→</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
