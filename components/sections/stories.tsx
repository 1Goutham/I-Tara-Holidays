'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { gallery, testimonials } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/motion';

export function Stories() {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);
  const n = testimonials.length;

  const stop = () => clearInterval(timer.current);
  const start = useCallback(() => {
    clearInterval(timer.current);
    if (!prefersReducedMotion()) timer.current = setInterval(() => setIndex((i) => (i + 1) % n), 6500);
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
      <div className="container">
        <div className="section-head section-head--center">
          <Reveal as="p" className="eyebrow"><span className="dot" /> Traveller stories</Reveal>
          <SplitHeading lines={['Moments that made the', 'journey feel *personal.*']} />
        </div>
        <Reveal className="quotes" onMouseEnter={stop} onMouseLeave={start} aria-roledescription="carousel">
          <div className="quotes__viewport">
            {testimonials.map((t, i) => (
              <figure className={`quote${i === index ? ' is-active' : ''}`} key={t.name} aria-hidden={i !== index}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption>
                  <span className="avatar">{t.initials}</span>
                  <div><b>{t.name}</b><small>{t.trip}</small></div>
                  <span className="stars" aria-label="5 out of 5">★★★★★</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="quotes__nav">
            <button className="arrow" aria-label="Previous story" onClick={() => go(index - 1)}>←</button>
            <div className="quotes__dots" role="tablist">
              {testimonials.map((t, i) => (
                <button key={t.name} role="tab" aria-selected={i === index} aria-label={`Story ${i + 1}`} className={i === index ? 'is-active' : undefined} onClick={() => go(i)} />
              ))}
            </div>
            <button className="arrow" aria-label="Next story" onClick={() => go(index + 1)}>→</button>
          </div>
        </Reveal>
      </div>

      <div className="marquee" aria-hidden="true">
        <div className="marquee__row">
          {[...gallery, ...gallery].map((src, i) => (
            <Img key={i} src={src} alt="" width={280} height={i % 2 ? 280 : 340} sizes="280px" />
          ))}
        </div>
      </div>
    </section>
  );
}
