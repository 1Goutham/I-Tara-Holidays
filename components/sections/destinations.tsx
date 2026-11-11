'use client';

import { useEffect, useRef } from 'react';
import { useSite } from '../providers';
import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { PinIcon } from '../icons';
import { destinations } from '@/lib/data';
import { inr } from '@/lib/site';
import { prefersReducedMotion } from '@/lib/motion';

export function Destinations() {
  const { prefill } = useSite();
  const track = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);

  // Mouse drag-to-scroll (touch uses native scrolling)
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let down = false, startX = 0, startScroll = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      down = true;
      dragged.current = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 6) {
        dragged.current = true;
        el.classList.add('is-drag');
      }
      el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      el.classList.remove('is-drag');
      setTimeout(() => (dragged.current = false), 50);
    };
    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  const scroll = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('.dcard');
    const step = card ? card.offsetWidth + 22 : 300;
    el.scrollBy({ left: step * dir * (window.innerWidth > 900 ? 2 : 1), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  return (
    <section className="dest section" id="destinations">
      <div className="container section-head">
        <div>
          <Reveal as="p" className="eyebrow"><span className="dot" /> Top destinations</Reveal>
          <SplitHeading lines={['Where will your', 'next story *begin?*']} />
        </div>
        <Reveal className="dest__ctrl">
          <p>From island escapes to cool mountain towns, pick a place and we will plan the rest.</p>
          <div className="arrows">
            <button className="arrow" aria-label="Previous destinations" onClick={() => scroll(-1)}>←</button>
            <button className="arrow" aria-label="Next destinations" onClick={() => scroll(1)}>→</button>
          </div>
        </Reveal>
      </div>
      <div
        className="dest__track"
        ref={track}
        tabIndex={0}
        role="region"
        aria-label="Destinations carousel"
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') track.current?.scrollBy({ left: 300, behavior: 'smooth' });
          if (e.key === 'ArrowLeft') track.current?.scrollBy({ left: -300, behavior: 'smooth' });
        }}
      >
        {destinations.map((d, i) => (
          <Reveal
            as="a"
            href="#contact"
            key={d.name}
            className="dcard"
            delay={Math.min(i, 4) * 90}
            draggable={false}
            onClick={(e: React.MouseEvent) => {
              if (dragged.current) {
                e.preventDefault();
                return;
              }
              prefill({ destination: d.name, message: `I'm interested in a trip to ${d.name}. Please share an itinerary and quote.` });
            }}
          >
            <Img src={d.img} alt={`${d.name}, ${d.region}`} fill sizes="310px" draggable={false} />
            <span className="dcard__price">from <b>{inr(d.from)}</b></span>
            <div className="dcard__body">
              <small><PinIcon /> {d.region}</small>
              <h3>{d.name}</h3>
              <span className="dcard__cta">Plan this trip →</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
