'use client';

import type { ElementType } from 'react';
import { useReveal } from '@/lib/motion';

/**
 * Word-by-word masked heading reveal.
 * Each entry in `lines` is a line; wrap a word in *asterisks* to set it in the script face.
 */
export function SplitHeading({ lines, as: Tag = 'h2', className = 'h2' }: { lines: string[]; as?: ElementType; className?: string }) {
  const [ref, state] = useReveal<HTMLElement>({ keep: true });
  const isIn = state !== 'idle';
  let i = 0;

  const word = (w: string) => (
    <span className="w" key={i}>
      <i style={{ ['--i' as string]: i++ }}>{w}</i>
    </span>
  );

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, li) => (
        <span className={`split${isIn ? ' is-in' : ''}`} key={li}>
          {line.split(/(\*[^*]+\*)/).filter(Boolean).flatMap((chunk, ci) => {
            if (chunk.startsWith('*')) {
              return [
                <em className="script" key={`s${ci}`}>
                  {chunk.slice(1, -1).split(/\s+/).filter(Boolean).map(word)}
                </em>,
              ];
            }
            const parts = chunk.split(/(\s+)/).filter(Boolean);
            return parts.map((p, pi) => (/^\s+$/.test(p) ? <span key={`sp${ci}-${pi}`}> </span> : word(p)));
          })}
          {li < lines.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  );
}
