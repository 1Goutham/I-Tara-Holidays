'use client';

import { useRef, useState } from 'react';
import { useSite } from '../providers';
import { Img } from '../ui/img';
import { packages, type Category } from '@/lib/data';
import { inr } from '@/lib/site';
import { gsap, ScrollTrigger, scrollToId, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';

type Filter = 'all' | Category;
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'india', label: 'India' },
  { value: 'world', label: 'International' },
  { value: 'honeymoon', label: 'Honeymoon' },
];
const count = (f: Filter) => packages.filter((p) => f === 'all' || p.cat.includes(f)).length;

/** Pinned horizontal gallery (desktop): vertical scroll moves the track, images drift inside their frames. */
export function Journeys() {
  const { prefill } = useSite();
  const [filter, setFilter] = useState<Filter>('all');
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const list = packages.filter((p) => filter === 'all' || p.cat.includes(filter));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - el.clientWidth;
        const move = gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (s) => gsap.set('.journeys__bar', { scaleX: s.progress }),
          },
        });
        gsap.utils.toArray<HTMLElement>('.journey__media img', el).forEach((img) => {
          gsap.fromTo(img, { xPercent: -8 }, {
            xPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: img.parentElement, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
          });
        });
      });
      // card entrance (any viewport)
      if (!prefersReducedMotion()) {
        gsap.from('.journey', { autoAlpha: 0, y: 32, duration: 1.4, stagger: 0.08, ease: 'power3.out', force3D: true, immediateRender: true, scrollTrigger: { trigger: track.current, start: 'top 88%', once: true } });
      }
      // the pin length changed: re-measure every trigger below this section
      const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(raf);
        mm.revert();
      };
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  );

  const enquire = (title: string, days: string) => {
    prefill({ destination: title, message: `I'm interested in ${title} (${days}). Please share an itinerary and quote.` }, true);
    scrollToId('contact');
  };

  return (
    <section className="journeys" id="journeys" ref={root} data-theme="light">
      <div className="journeys__inner">
        <div className="container journeys__head">
          <div>
            <p className="label" data-fade>Signature journeys</p>
            <h2 className="h2" data-split>Holidays planned to the <em>last</em> detail.</h2>
          </div>
          <div className="tabs" data-fade role="tablist" aria-label="Filter journeys">
            {filters.map((f) => (
              <button key={f.value} role="tab" aria-selected={filter === f.value} className={filter === f.value ? 'is-active' : undefined} onClick={() => setFilter(f.value)}>
                {f.label}<sup>{count(f.value)}</sup>
              </button>
            ))}
          </div>
        </div>

        <div className="journeys__track" ref={track}>
          {list.map((p, i) => (
            <article className="journey" key={p.title}>
              <button className="journey__media" data-cursor="Enquire" onClick={() => enquire(p.title, p.days)} aria-label={`Enquire about ${p.title}`}>
                <Img src={p.img} alt="" fill sizes="(max-width: 1024px) 80vw, 30vw" />
              </button>
              <div className="journey__meta">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span>{p.days}</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.place}</p>
              <div className="journey__foot">
                <span>From <b>{inr(p.price)}</b> pp</span>
                <button className="link link--sm" onClick={() => enquire(p.title, p.days)}>Enquire</button>
              </div>
            </article>
          ))}
          <a href="#contact" className="journey journey--custom">
            <span className="label">Bespoke</span>
            <h3>Have something else <em>in mind?</em></h3>
            <p>Tell us how you like to travel and we will design the journey from a blank page.</p>
            <span className="link">Start a conversation</span>
          </a>
        </div>

        <div className="container journeys__progress" aria-hidden="true"><span className="journeys__bar" /></div>
      </div>
    </section>
  );
}
