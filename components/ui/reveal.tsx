'use client';

import type { CSSProperties, ElementType, ReactNode } from 'react';
import { useReveal } from '@/lib/motion';

type Variant = 'up' | 'right' | 'clip';

interface RevealProps {
  as?: ElementType;
  delay?: number;
  variant?: Variant;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  [key: string]: unknown;
}

/** Scroll-triggered entrance. `clip` wipes a curtain off an image block. */
export function Reveal({ as: Tag = 'div', delay = 0, variant = 'up', className = '', style, children, ...rest }: RevealProps) {
  const keep = variant === 'clip';
  const [ref, state] = useReveal<HTMLElement>({ delay, keep });
  const classes = [
    className,
    state !== 'done' && 'reveal',
    state !== 'done' && variant === 'right' && 'reveal--right',
    variant === 'clip' && 'reveal--clip',
    state === 'in' && 'is-in',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} style={{ ...style, ['--d' as string]: `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}
