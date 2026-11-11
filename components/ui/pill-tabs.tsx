'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIso = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

interface Props<T extends string> {
  items: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className: string;
  pillClassName: string;
  label: string;
}

/** Tab row with a pill that slides to the active item. */
export function PillTabs<T extends string>({ items, value, onChange, className, pillClassName, label }: Props<T>) {
  const wrap = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState({ x: 0, w: 0 });

  const sync = useCallback(() => {
    const active = wrap.current?.querySelector<HTMLButtonElement>('button.is-active');
    if (active) setPill({ x: active.offsetLeft, w: active.offsetWidth });
  }, []);

  useIso(sync, [value, sync]);
  useEffect(() => {
    window.addEventListener('resize', sync);
    document.fonts?.ready.then(sync).catch(() => {});
    return () => window.removeEventListener('resize', sync);
  }, [sync]);

  return (
    <div ref={wrap} className={className} role="tablist" aria-label={label}>
      {items.map((it) => (
        <button
          key={it.value}
          type="button"
          role="tab"
          aria-selected={it.value === value}
          className={it.value === value ? 'is-active' : undefined}
          onClick={() => onChange(it.value)}
        >
          {it.label}
        </button>
      ))}
      <span className={pillClassName} aria-hidden="true" style={{ width: pill.w, transform: `translateX(${pill.x}px)` }} />
    </div>
  );
}
