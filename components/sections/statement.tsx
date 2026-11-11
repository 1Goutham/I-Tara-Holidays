'use client';

import { useRef } from 'react';
import { useScrollProgress } from '@/lib/motion';
import { Counter } from '../ui/counter';
import { Reveal } from '../ui/reveal';

const TEXT =
  'In Himalayan tradition, Tara watches over every traveller. We took her name because that is our job too: plan with care, carry the worry, and leave you free to simply *arrive.*';

export function Statement() {
  const words = useRef<HTMLSpanElement[]>([]);
  const ref = useScrollProgress<HTMLParagraphElement>((p) => {
    const n = words.current.length;
    const lit = p * 1.6 * n;
    words.current.forEach((w, i) => {
      w.style.opacity = String(0.14 + 0.86 * Math.min(1, Math.max(0, lit - i)));
    });
  }, 'center');

  let k = 0;
  return (
    <section className="statement section" id="statement">
      <div className="container container--narrow">
        <p className="statement__text" ref={ref}>
          {TEXT.split(' ').map((w) => {
            const script = w.startsWith('*');
            const idx = k++;
            return (
              <span
                key={idx}
                className={script ? 'script' : undefined}
                ref={(el) => {
                  if (el) words.current[idx] = el;
                }}
              >
                {w.replace(/\*/g, '')}{' '}
              </span>
            );
          })}
        </p>

        <div className="stats">
          <Reveal className="stat"><b><Counter to={25000} suffix="+" /></b><span>happy travellers</span></Reveal>
          <Reveal className="stat" delay={100}><b><Counter to={120} suffix="+" /></b><span>destinations</span></Reveal>
          <Reveal className="stat" delay={200}><b><Counter to={15} /></b><span>years of care</span></Reveal>
          <Reveal className="stat" delay={300}><b><Counter to={4.9} decimals={1} /></b><span>average rating</span></Reveal>
        </div>
      </div>
    </section>
  );
}
