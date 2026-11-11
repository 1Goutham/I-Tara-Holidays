'use client';

import { useEffect, useRef, useState } from 'react';
import { useSite } from '../providers';
import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { HeartIcon } from '../icons';
import { packages, type Category } from '@/lib/data';
import { inr } from '@/lib/site';
import { prefersReducedMotion, useScrollProgress } from '@/lib/motion';

type Filter = 'all' | Category;
const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'india', label: 'India' },
  { value: 'world', label: 'World' },
  { value: 'honeymoon', label: 'Honeymoon' },
];
const FAV_KEY = 'itara:favs';

/** Vertical scroll drives a horizontal track while the section is pinned (desktop). */
export function Journeys() {
  const { prefill, toast } = useSite();
  const [filter, setFilter] = useState<Filter>('all');
  const [favs, setFavs] = useState<string[]>([]);
  const [pinned, setPinned] = useState(false);
  const [height, setHeight] = useState<number | undefined>();
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const distance = useRef(0);

  const list = packages.filter((p) => filter === 'all' || p.cat.includes(filter));

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      if (Array.isArray(saved)) setFavs(saved);
    } catch {}
  }, []);

  // Decide whether to pin, and size the section so the scroll distance equals the track overflow.
  useEffect(() => {
    const measure = () => {
      const el = track.current;
      if (!el) return;
      const can = window.innerWidth >= 1024 && !prefersReducedMotion();
      setPinned(can);
      if (!can) {
        setHeight(undefined);
        el.style.transform = '';
        return;
      }
      distance.current = Math.max(0, el.scrollWidth - el.clientWidth);
      setHeight(window.innerHeight + distance.current);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [list.length]);

  const section = useScrollProgress<HTMLElement>((p) => {
    if (bar.current) bar.current.style.transform = `scaleX(${pinned ? p : 1})`;
    if (!pinned || !track.current) return;
    track.current.style.transform = `translate3d(${(-p * distance.current).toFixed(1)}px,0,0)`;
  }, 'pin');

  const toggleFav = (title: string) => {
    const on = !favs.includes(title);
    const next = on ? [...favs, title] : favs.filter((t) => t !== title);
    setFavs(next);
    try { localStorage.setItem(FAV_KEY, JSON.stringify(next)); } catch {}
    toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist');
  };

  return (
    <section className={`journeys${pinned ? ' is-pinned' : ''}`} id="journeys" ref={section} style={{ height }}>
      <div className="journeys__stick">
        <div className="container journeys__head">
          <div>
            <Reveal as="p" className="kicker">Signature journeys</Reveal>
            <SplitHeading lines={['Holidays planned to the', 'last *little* detail.']} />
          </div>
          <Reveal className="chips" role="tablist" aria-label="Filter journeys">
            {filters.map((f) => (
              <button
                key={f.value}
                role="tab"
                aria-selected={filter === f.value}
                className={filter === f.value ? 'is-active' : undefined}
                onClick={() => {
                  setFilter(f.value);
                  window.dispatchEvent(new Event('scroll'));
                }}
              >
                {f.label}
              </button>
            ))}
          </Reveal>
        </div>

        <div className="journeys__viewport">
          <div className="journeys__track" ref={track}>
            {list.map((p, i) => {
              const fav = favs.includes(p.title);
              return (
                <Reveal as="article" className="journey" key={p.title} delay={Math.min(i, 4) * 90}>
                  <div className="journey__media">
                    <Img src={p.img} alt={p.title} fill sizes="(max-width: 1024px) 78vw, 360px" />
                    <span className="journey__tag">{p.tag}</span>
                    <button
                      type="button"
                      className={`journey__fav${fav ? ' is-on' : ''}`}
                      aria-pressed={fav}
                      aria-label={`Save ${p.title}`}
                      onClick={() => toggleFav(p.title)}
                    >
                      <HeartIcon />
                    </button>
                  </div>
                  <div className="journey__body">
                    <small>{p.place}</small>
                    <h3>{p.title}</h3>
                    <div className="journey__foot">
                      <span>{p.days} · <b>{inr(p.price)}</b></span>
                      <a
                        href="#contact"
                        className="journey__go"
                        aria-label={`Enquire about ${p.title}`}
                        onClick={() => prefill({ destination: p.title, message: `I'm interested in ${p.title} (${p.days}). Please share an itinerary and quote.` }, true)}
                      >
                        →
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}
            <a href="#contact" className="journey journey--custom">
              <span className="journey--custom__ring" aria-hidden="true">+</span>
              <h3>Something <em className="script">else</em> in mind?</h3>
              <p>Tell us your dream and we will design it from scratch.</p>
            </a>
          </div>
        </div>

        <div className="container journeys__progress" aria-hidden="true">
          <span ref={bar} />
        </div>
      </div>
    </section>
  );
}
