'use client';

import { useId, useState } from 'react';

export function Accordion({ items }: { items: { title: string; text: string }[] }) {
  const [open, setOpen] = useState(0);
  const uid = useId();
  return (
    <div className="accordion">
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div className={`acc${isOpen ? ' is-open' : ''}`} key={it.title}>
            <button
              className="acc__head"
              aria-expanded={isOpen}
              aria-controls={`${uid}-${i}`}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span className="acc__num">{String(i + 1).padStart(2, '0')}</span>
              {it.title}
              <span className="acc__ico" />
            </button>
            <div className="acc__body" id={`${uid}-${i}`} role="region">
              <p>{it.text}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
