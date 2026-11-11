'use client';

import { useState, type FormEvent } from 'react';
import { useSite } from '../providers';
import { PillTabs } from '../ui/pill-tabs';
import { Reveal } from '../ui/reveal';
import { SearchIcon } from '../icons';
import { destinationOptions } from '@/lib/data';
import { prefersReducedMotion } from '@/lib/motion';

const types = [
  { value: 'Holiday', label: 'Holidays' },
  { value: 'Honeymoon', label: 'Honeymoon' },
  { value: 'Group Tour', label: 'Group tours' },
  { value: 'Pilgrimage', label: 'Pilgrimage' },
] as const;
type TripType = (typeof types)[number]['value'];

export function SearchForm() {
  const { prefill, toast } = useSite();
  const [type, setType] = useState<TripType>('Holiday');
  const [destination, setDestination] = useState('');
  const [month, setMonth] = useState('');
  const [travellers, setTravellers] = useState('2 Adults');
  const [budget, setBudget] = useState('Any budget');
  const [invalid, setInvalid] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const dest = destination.trim();
    if (!dest) {
      setInvalid(true);
      document.getElementById('search-dest')?.focus();
      toast('Tell us where you would like to go', true);
      return;
    }
    setInvalid(false);
    const when = month ? new Date(`${month}-01T00:00:00`).toLocaleString('en-IN', { month: 'long', year: 'numeric' }) : 'flexible dates';
    prefill({ destination: dest, date: month, message: `${type} to ${dest} · ${travellers} · ${when} · Budget: ${budget}.` }, true);
    document.getElementById('contact')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    setTimeout(() => document.getElementById('enq-name')?.focus({ preventScroll: true }), 900);
    toast('Great choice! Add your details and we will plan it.');
  };

  return (
    <Reveal as="form" className="search" delay={500} onSubmit={onSubmit} noValidate>
      <PillTabs items={[...types]} value={type} onChange={setType} className="search__tabs" pillClassName="search__pill" label="Trip type" />
      <div className="search__fields">
        <label className={`field${invalid ? ' is-invalid' : ''}`}>
          <span>Destination</span>
          <input
            id="search-dest"
            type="text"
            placeholder="Where to? e.g. Kashmir"
            list="dest-list"
            autoComplete="off"
            value={destination}
            onChange={(e) => { setDestination(e.target.value); setInvalid(false); }}
          />
          <datalist id="dest-list">
            {destinationOptions.map((d) => <option key={d} value={d} />)}
          </datalist>
        </label>
        <label className="field">
          <span>Travel month</span>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
        <label className="field">
          <span>Travellers</span>
          <select value={travellers} onChange={(e) => setTravellers(e.target.value)}>
            {['2 Adults', '1 Adult', '2 Adults, 1 Child', '2 Adults, 2 Children', 'Group (6+)'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Budget / person</span>
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            {['Any budget', 'Under ₹30,000', '₹30,000 – ₹75,000', '₹75,000 – ₹1,50,000', '₹1,50,000+'].map((o) => <option key={o}>{o}</option>)}
          </select>
        </label>
        <button className="btn btn--primary search__btn magnetic" type="submit">
          <span>Find my trip</span>
          <SearchIcon />
        </button>
      </div>
    </Reveal>
  );
}
