'use client';

import { useState, type FormEvent } from 'react';
import { useSite } from '../providers';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { HeroScene, Lotus } from '../illustrations';
import { destinationOptions } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/motion';

export function Hero() {
  const { prefill, toast } = useSite();
  const [dest, setDest] = useState('');
  const [invalid, setInvalid] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const d = dest.trim();
    if (!d) {
      setInvalid(true);
      document.getElementById('hero-dest')?.focus();
      toast('Tell us where you would like to go', true);
      return;
    }
    prefill({ destination: d, message: `I'd love to plan a trip to ${d}. Please share ideas and a quote.` }, true);
    document.getElementById('contact')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    setTimeout(() => document.getElementById('enq-name')?.focus({ preventScroll: true }), 900);
  };

  return (
    <section className="hero" aria-label="Introduction">
      <div className="container hero__grid">
        <div className="hero__copy">
          <Reveal as="p" className="kicker">
            <Lotus className="kicker__lotus" /> A holiday company
          </Reveal>
          <SplitHeading as="h1" className="display" lines={['Journeys,', '*beautifully*', 'looked after.']} />
          <Reveal as="p" className="hero__lead" delay={350}>
            Handpicked holidays across India and the world, planned slowly and looked after at every step, from the first hello to the flight home.
          </Reveal>

          <Reveal as="form" className={`ask${invalid ? ' is-invalid' : ''}`} delay={450} onSubmit={onSubmit} noValidate>
            <label htmlFor="hero-dest" className="sr-only">Where would you like to go?</label>
            <input
              id="hero-dest"
              type="text"
              list="dest-list"
              autoComplete="off"
              placeholder="Where would you like to go?"
              value={dest}
              onChange={(e) => {
                setDest(e.target.value);
                setInvalid(false);
              }}
            />
            <datalist id="dest-list">
              {destinationOptions.map((d) => <option key={d} value={d} />)}
            </datalist>
            <button type="submit" className="btn btn--dark magnetic">
              <span>Plan it</span>
              <i className="btn__arrow" aria-hidden="true">→</i>
            </button>
          </Reveal>

          <Reveal as="ul" className="hero__meta" delay={550}>
            <li><b>25k+</b> travellers</li>
            <li><b>120+</b> destinations</li>
            <li><b>4.9★</b> rated</li>
          </Reveal>
        </div>

        <Reveal className="hero__art" variant="clip" delay={150}>
          <span className="hero__arch-line" aria-hidden="true" />
          <HeroScene />
          <div className="chip chip--a"><span className="live" /> Travel experts online</div>
          <div className="chip chip--b"><b>Kashmir</b><small>Next departure · 12 Dec</small></div>
        </Reveal>
      </div>

      <a href="#statement" className="scroll-cue" aria-label="Scroll to explore">
        <span />
      </a>
    </section>
  );
}
