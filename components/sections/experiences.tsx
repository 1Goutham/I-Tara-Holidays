'use client';

import { useEffect, useRef, useState } from 'react';
import { Img } from '../ui/img';
import { travelStyles } from '@/lib/data';
import { gsap } from '@/lib/gsap';
import { hasFinePointer, prefersReducedMotion } from '@/lib/motion';

/** Editorial index of travel styles; a framed photo follows the cursor and wipes between styles. */
export function Experiences() {
  const [hover, setHover] = useState<number | null>(null);
  const [fine, setFine] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setFine(true);
  }, []);

  useEffect(() => {
    if (!fine || !frame.current) return;
    const xTo = gsap.quickTo(frame.current, 'x', { duration: 0.8, ease: 'power3' });
    const yTo = gsap.quickTo(frame.current, 'y', { duration: 0.8, ease: 'power3' });
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [fine]);

  return (
    <section className="exp section" id="experiences" data-theme="light">
      <div className="container">
        <div className="head">
          <p className="label" data-fade>(03) Ways to travel</p>
          <h2 className="h2" data-split>Choose the kind of journey you want to <em>remember.</em></h2>
        </div>

        <ul className="exp__list" onMouseLeave={() => setHover(null)}>
          {travelStyles.map((s, i) => (
            <li key={s.title} className={`exp__row${hover === i ? ' is-hover' : ''}`} onMouseEnter={() => setHover(i)} data-fade>
              <span className="rule" data-rule />
              <a href="#contact" className="exp__link">
                <span className="exp__n">{String(i + 1).padStart(2, '0')}</span>
                <span className="exp__title">{s.title}</span>
                <span className="exp__text">{s.text}</span>
                <span className="exp__arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      {fine && (
        <div className={`exp__frame${hover !== null ? ' is-on' : ''}`} ref={frame} aria-hidden="true">
          <div className="exp__frame-inner">
            {travelStyles.map((s, i) => (
              <div key={s.title} className={`exp__img${hover === i ? ' is-current' : ''}`}>
                <Img src={s.img} alt="" fill sizes="340px" />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
