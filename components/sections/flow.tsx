'use client';

import { useEffect, useRef, useState } from 'react';
import { steps } from '@/lib/data';
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion } from '@/lib/motion';

// Authored in a 100 x 1000 box (number pairs are x y), rescaled to real pixels.
const BASE = 'M50 0 C50 40 76 60 76 120 S24 300 24 380 S76 560 76 640 S24 820 24 890 S50 970 50 1000';
const BASE_MOBILE = 'M8 0 C8 120 8 880 8 1000';

function scalePath(d: string, w: number, h: number) {
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (n) => (parseFloat(n) * (i++ % 2 === 0 ? w / 100 : h / 1000)).toFixed(1));
}

/** How it works: a route draws itself with the scroll; a small plane travels its tip; stops light up as it passes. */
export function Flow() {
  const root = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const drawn = useRef<SVGPathElement>(null);
  const plane = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState({ w: 100, h: 1000, d: BASE });

  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w && h) setBox({ w, h, d: scalePath(window.innerWidth < 900 ? BASE_MOBILE : BASE, w, h) });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const path = drawn.current;
      if (!path) return;
      const L = path.getTotalLength();
      if (prefersReducedMotion()) {
        gsap.set(path, { strokeDasharray: 'none' });
        return;
      }
      gsap.set(path, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L });
      const place = (p: number) => {
        path.style.strokeDashoffset = String(L * (1 - p));
        const at = path.getPointAtLength(p * L);
        const a = path.getPointAtLength(Math.max(0, p * L - 2));
        const b = path.getPointAtLength(Math.min(L, p * L + 2));
        const angle = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
        if (plane.current) plane.current.style.transform = `translate(${at.x}px, ${at.y}px) translate(-50%, -50%) rotate(${angle + 90}deg)`;
      };
      const proxy = { p: 0 };
      const st = ScrollTrigger.create({
        trigger: body.current,
        start: 'top 60%',
        end: 'bottom 60%',
        scrub: 0.6,
        animation: gsap.to(proxy, { p: 1, ease: 'none', onUpdate: () => place(proxy.p) }),
      });
      place(0);
      // light each stop as the route reaches it
      gsap.utils.toArray<HTMLElement>('.stop', root.current).forEach((s) => {
        ScrollTrigger.create({ trigger: s, start: 'top 60%', onEnter: () => s.classList.add('is-reached'), onLeaveBack: () => s.classList.remove('is-reached') });
      });
      return () => st.kill();
    },
    { scope: root, dependencies: [box.d], revertOnUpdate: true },
  );

  return (
    <section className="flow section" id="how" ref={root} data-theme="light">
      <div className="container">
        <div className="head head--center">
          <p className="label" data-fade>(05) How it works</p>
          <h2 className="h2" data-split>From first idea to <em>finished</em> itinerary.</h2>
        </div>

        <div className="flow__body" ref={body}>
          <svg className="flow__svg" viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true">
            <path d={box.d} className="flow__ghost" />
            <path d={box.d} className="flow__route" ref={drawn} />
          </svg>
          <span className="flow__plane" ref={plane} aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" /></svg>
          </span>

          <ol className="flow__stops">
            {steps.map((s, i) => (
              <li key={s.title} className={`stop stop--${i % 2 ? 'right' : 'left'}`} data-fade>
                <span className="stop__num">{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
