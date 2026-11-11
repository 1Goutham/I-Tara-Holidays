'use client';

import { useState } from 'react';
import { useSite } from '../providers';
import { Img } from '../ui/img';
import { destinations } from '@/lib/data';
import { inr } from '@/lib/site';
import { scrollToId } from '@/lib/gsap';

/** Destination index: hovering (or tapping) a name wipes its photograph into the frame. */
export function Destinations() {
  const { prefill } = useSite();
  const [active, setActive] = useState(0);
  const d = destinations[active];

  const plan = (name: string) => {
    prefill({ destination: name, message: `I'm interested in a trip to ${name}. Please share an itinerary and quote.` }, true);
    scrollToId('contact');
  };

  return (
    <section className="dest section" id="destinations" data-theme="light">
      <div className="container">
        <div className="head head--split">
          <div>
            <p className="label" data-fade>(04) Destinations</p>
            <h2 className="h2" data-split>Where will your next story <em>begin?</em></h2>
          </div>
          <p className="head__aside" data-fade>From island escapes to cool mountain towns. Choose a place and we will plan everything else.</p>
        </div>

        <div className="dest__grid">
          <ol className="dest__list">
            {destinations.map((x, i) => (
              <li key={x.name} data-fade>
                <button
                  className={`dest__name${i === active ? ' is-active' : ''}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => (i === active ? plan(x.name) : setActive(i))}
                  aria-pressed={i === active}
                >
                  <span className="dest__idx">{String(i + 1).padStart(2, '0')}</span>
                  <span className="dest__label">{x.name}</span>
                  <span className="dest__region">{x.region}</span>
                </button>
              </li>
            ))}
          </ol>

          <div className="dest__stage">
            <div className="dest__frame" data-img data-cursor="Plan">
              {destinations.map((x, i) => (
                <button
                  key={x.name}
                  className={`dest__img${i === active ? ' is-current' : ''}`}
                  onClick={() => plan(x.name)}
                  tabIndex={-1}
                  aria-hidden={i !== active}
                >
                  <Img src={x.img} alt={`${x.name}, ${x.region}`} fill sizes="(max-width: 900px) 100vw, 50vw" />
                </button>
              ))}
            </div>
            <div className="dest__info" key={d.name}>
              <p>{d.line}</p>
              <div>
                <span>From <b>{inr(d.from)}</b> pp</span>
                <button className="link" onClick={() => plan(d.name)}>Plan {d.name}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
