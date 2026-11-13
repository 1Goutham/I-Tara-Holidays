'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { useGSAP } from '@gsap/react';
import type Lenis from 'lenis';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, MotionPathPlugin, useGSAP);
  gsap.defaults({ ease: 'power3.out', duration: 1.2 });
  // keep animations on the compositor; avoid sub-pixel text shimmer
  gsap.config({ force3D: true });
  ScrollTrigger.config({ ignoreMobileResize: true });
}

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => (lenis = l);
export const getLenis = () => lenis;

/** Smooth-scroll to an element id (falls back to native scrolling). */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -70, duration: 1.6 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export { gsap, MotionPathPlugin, ScrollTrigger, SplitText, useGSAP };
