'use client';

import { useEffect, useRef, useState } from 'react';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { IconChat, IconMap, IconSuitcase, IconTicket } from '../illustrations';
import { steps } from '@/lib/data';
import { useScrollProgress } from '@/lib/motion';

const icons = [IconChat, IconMap, IconTicket, IconSuitcase];

// Authored in a 100 x 1000 box (every number pair is x y); scaled to real pixels so the
// dash length and the plane position share one coordinate system.
const BASE = 'M50 0 C50 60 18 90 18 160 S82 270 82 380 S18 500 18 620 S82 740 82 860 S50 960 50 1000';
const BASE_MOBILE = 'M50 0 C50 60 30 90 30 160 S70 270 70 380 S30 500 30 620 S70 740 70 860 S50 960 50 1000';

function scalePath(d: string, w: number, h: number) {
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (n) => {
    const v = parseFloat(n) * (i++ % 2 === 0 ? w / 100 : h / 1000);
    return v.toFixed(1);
  });
}

/** "How it works": a flight path draws itself on scroll and a plane rides along it. */
export function Flow() {
  const svgWrap = useRef<HTMLDivElement>(null);
  const drawn = useRef<SVGPathElement>(null);
  const plane = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 100, h: 1000, d: BASE });
  const last = useRef(0);

  useEffect(() => {
    const el = svgWrap.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      setBox({ w, h, d: scalePath(window.innerWidth < 900 ? BASE_MOBILE : BASE, w, h) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const place = (p: number) => {
    last.current = p;
    const path = drawn.current;
    if (!path) return;
    const L = path.getTotalLength();
    path.style.strokeDasharray = `${L} ${L}`;
    path.style.strokeDashoffset = String(L * (1 - p));
    const at = path.getPointAtLength(p * L);
    const ahead = path.getPointAtLength(Math.min(L, p * L + 2));
    const behind = path.getPointAtLength(Math.max(0, p * L - 2));
    const angle = (Math.atan2(ahead.y - behind.y, ahead.x - behind.x) * 180) / Math.PI;
    if (plane.current) plane.current.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%,-50%) rotate(${angle + 90}deg)`;
  };

  // re-place after the path is rescaled
  useEffect(() => place(last.current), [box]);

  const ref = useScrollProgress<HTMLDivElement>(place, 'center');

  return (
    <section className="flow section" id="how">
      <div className="container">
        <div className="section-head section-head--center">
          <Reveal as="p" className="kicker">How it works</Reveal>
          <SplitHeading lines={['From first idea to', '*finished* itinerary.']} />
        </div>

        <div className="flow__body" ref={ref}>
          <div className="flow__path" ref={svgWrap} aria-hidden="true">
            <svg viewBox={`0 0 ${box.w} ${box.h}`} width="100%" height="100%">
              <path d={box.d} className="flow__dash" />
              <path d={box.d} className="flow__draw" ref={drawn} />
            </svg>
            <span className="flow__plane" ref={plane}>
              <svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
            </span>
          </div>

          <ol className="flow__steps">
            {steps.map((s, i) => {
              const Icon = icons[i];
              return (
                <Reveal as="li" key={s.title} className={`fstep fstep--${i % 2 ? 'right' : 'left'}`}>
                  <span className="fstep__icon"><Icon /></span>
                  <div>
                    <span className="fstep__n">Step 0{i + 1}</span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
