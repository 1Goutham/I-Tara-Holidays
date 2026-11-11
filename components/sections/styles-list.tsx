'use client';

import { useEffect, useRef, useState } from 'react';
import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { IconFamily, IconLeaf, IconPalace, IconPeak, IconRings, IconStupa } from '../illustrations';
import { travelStyles } from '@/lib/data';
import { hasFinePointer } from '@/lib/motion';

const icons = [IconPalace, IconRings, IconStupa, IconPeak, IconFamily, IconLeaf];

/** Editorial list; on desktop a photo preview follows the cursor. */
export function StylesList() {
  const [hover, setHover] = useState<number | null>(null);
  const preview = useRef<HTMLDivElement>(null);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    if (!hasFinePointer()) return;
    setFine(true);
    let x = 0, y = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const loop = () => {
      cx += (x - cx) * 0.14;
      cy += (y - cy) * 0.14;
      const rot = Math.max(-8, Math.min(8, (x - cx) * 0.08));
      if (preview.current) preview.current.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%) rotate(${rot}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <section className="styles section" id="experiences">
      <div className="container">
        <div className="section-head">
          <Reveal as="p" className="kicker">Ways to travel</Reveal>
          <SplitHeading lines={['Choose the kind of journey', 'you want to *remember.*']} />
        </div>

        <ul className="slist" onMouseLeave={() => setHover(null)}>
          {travelStyles.map((s, i) => {
            const Icon = icons[i];
            return (
              <Reveal as="li" key={s.title} delay={i * 60} className={`slist__row${hover === i ? ' is-hover' : ''}`} onMouseEnter={() => setHover(i)}>
                <a href="#contact" className="slist__link">
                  <span className="slist__n">0{i + 1}</span>
                  <Icon className="slist__icon" />
                  <span className="slist__title">{s.title}</span>
                  <span className="slist__text">{s.text}</span>
                  <span className="slist__arrow" aria-hidden="true">→</span>
                </a>
              </Reveal>
            );
          })}
        </ul>
      </div>

      {fine && (
        <div className={`spreview${hover !== null ? ' is-on' : ''}`} ref={preview} aria-hidden="true">
          {travelStyles.map((s, i) => (
            <div key={s.title} className={`spreview__img${hover === i ? ' is-current' : ''}`}>
              <Img src={s.img} alt="" fill sizes="320px" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
