'use client';

import { useSite } from '../providers';
import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { destinations } from '@/lib/data';
import { inr } from '@/lib/site';

export function Destinations() {
  const { prefill } = useSite();
  return (
    <section className="dest section" id="destinations">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <Reveal as="p" className="kicker">Top destinations</Reveal>
            <SplitHeading lines={['Where will your', 'next story *begin?*']} />
          </div>
          <Reveal as="p" className="section-head__aside">
            From island escapes to cool mountain towns, pick a place and we will plan the rest.
          </Reveal>
        </div>

        <div className="arches">
          {destinations.map((d, i) => (
            <Reveal
              as="a"
              key={d.name}
              href="#contact"
              className="arch"
              delay={(i % 5) * 80}
              onClick={() => prefill({ destination: d.name, message: `I'm interested in a trip to ${d.name}. Please share an itinerary and quote.` }, true)}
            >
              <span className="arch__frame">
                <Img src={d.img} alt={`${d.name}, ${d.region}`} fill sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 220px" />
              </span>
              <span className="arch__name">{d.name}</span>
              <span className="arch__meta">{d.region} · from {inr(d.from)}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
