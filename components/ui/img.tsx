'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

/** next/image that hides itself on error so the parent's brand gradient shows through. */
export function Img({ className = '', alt, ...props }: ImageProps) {
  const [broken, setBroken] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      className={`${className}${broken ? ' is-broken' : ''}`.trim() || undefined}
      onError={() => setBroken(true)}
    />
  );
}
