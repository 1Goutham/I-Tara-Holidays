'use client';

import { useEffect, useRef, useState } from 'react';
import { useSite } from '../providers';
import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { PillTabs } from '../ui/pill-tabs';
import { HeartIcon } from '../icons';
import { packages, type Category } from '@/lib/data';
import { inr } from '@/lib/site';
import { prefersReducedMotion } from '@/lib/motion';

type Filter = 'all' | Category;
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'india', label: 'India' },
  { value: 'world', label: 'International' },
  { value: 'honeymoon', label: 'Honeymoon' },
];
const FAV_KEY = 'itara:favs';

export function Packages() {
  const { prefill, toast } = useSite();
  const [filter, setFilter] = useState<Filter>('all');
  const [shown, setShown] = useState<Filter>('all');
  const [fading, setFading] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      if (Array.isArray(saved)) setFavs(saved);
    } catch {}
  }, []);

  const changeFilter = (f: Filter) => {
    setFilter(f);
    setFading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setShown(f);
      requestAnimationFrame(() => setFading(false));
    }, prefersReducedMotion() ? 0 : 320);
  };

  const toggleFav = (title: string) => {
    const on = !favs.includes(title);
    const next = on ? [...favs, title] : favs.filter((t) => t !== title);
    setFavs(next);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
    toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist');
  };

  return (
    <section className="packages section section--tint" id="packages">
      <div className="container">
        <div className="section-head">
          <div>
            <Reveal as="p" className="eyebrow"><span className="dot" /> Curated packages</Reveal>
            <SplitHeading lines={['Holidays planned to the', 'last *little* detail.']} />
          </div>
          <Reveal>
            <PillTabs items={filters} value={filter} onChange={changeFilter} className="filters" pillClassName="filters__pill" label="Package category" />
          </Reveal>
        </div>

        <div className="pkg-grid">
          {packages.map((p, i) => {
            const visible = shown === 'all' || p.cat.includes(shown);
            const fav = favs.includes(p.title);
            return (
              <Reveal
                as="article"
                key={p.title}
                delay={(i % 4) * 90}
                className={`pkg${fading ? ' is-out' : ''}`}
                style={visible ? undefined : { display: 'none' }}
              >
                <div className="pkg__media">
                  <Img src={p.img} alt={p.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px" />
                  <span className="pkg__tag">{p.tag}</span>
                  <button
                    type="button"
                    className={`pkg__fav${fav ? ' is-on' : ''}`}
                    aria-pressed={fav}
                    aria-label={`Save ${p.title}`}
                    onClick={() => toggleFav(p.title)}
                  >
                    <HeartIcon />
                  </button>
                  <span className="pkg__days">{p.days}</span>
                </div>
                <div className="pkg__body">
                  <div className="pkg__meta">
                    <span>{p.place}</span>
                    <span className="pkg__rating"><i>★</i> {p.rating} <small>({p.reviews.toLocaleString('en-IN')})</small></span>
                  </div>
                  <h3>{p.title}</h3>
                  <ul className="pkg__perks">{p.perks.map((x) => <li key={x}>{x}</li>)}</ul>
                  <div className="pkg__foot">
                    <div className="pkg__price">
                      <small>Starting from / person</small>
                      <s>{inr(p.was)}</s>
                      <b>{inr(p.price)}</b>
                    </div>
                    <a
                      href="#contact"
                      className="pkg__go"
                      aria-label={`Enquire about ${p.title}`}
                      onClick={() => prefill({ destination: p.title, message: `I'm interested in ${p.title} (${p.days}). Please share an itinerary and quote.` })}
                    >
                      →
                    </a>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="center">
          <a href="#contact" className="btn btn--outline magnetic"><span>Request a custom package</span><i className="btn__arrow">→</i></a>
        </Reveal>
      </div>
    </section>
  );
}
