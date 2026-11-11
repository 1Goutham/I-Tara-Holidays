'use client';

/* Hand-built SVG illustrations in the I Tara palette. */

import { useEffect, useRef, useState, type SVGProps } from 'react';
import { prefersReducedMotion } from '@/lib/motion';

type P = SVGProps<SVGSVGElement>;

/* ---------- Lotus (logo motif) ---------- */
export function Lotus({ className, ...p }: P) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true" {...p}>
      <g fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M60 72 C46 56 46 30 60 8 C74 30 74 56 60 72Z" />
        <path d="M60 72 C40 66 28 48 30 24 C46 32 56 50 60 72Z" />
        <path d="M60 72 C80 66 92 48 90 24 C74 32 64 50 60 72Z" />
        <path d="M60 72 C38 74 18 64 8 46 C26 44 46 54 60 72Z" />
        <path d="M60 72 C82 74 102 64 112 46 C94 44 74 54 60 72Z" />
        <path d="M36 76 H84" />
      </g>
    </svg>
  );
}

/* ---------- Hero scene: Himalayan dawn inside a temple arch ---------- */
const FLIGHT = 'M-20 250 C110 120 300 110 380 200 S540 300 640 150';

export function HeroScene() {
  const root = useRef<SVGSVGElement>(null);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    setMotion(true);
    const svg = root.current;
    if (!svg) return;
    const layers = Array.from(svg.querySelectorAll<SVGGElement>('[data-depth]'));
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    const loop = () => {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const sy = Math.min(window.scrollY, 900);
      layers.forEach((l) => {
        const d = parseFloat(l.dataset.depth || '0');
        l.style.transform = `translate(${(cx * d * 40).toFixed(2)}px, ${(cy * d * 20 + sy * d * 0.12).toFixed(2)}px)`;
      });
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <svg ref={root} viewBox="0 0 600 760" className="scene" role="img" aria-label="Illustration of sunrise over Himalayan peaks and a calm lake with a lotus and a small boat">
      <defs>
        <clipPath id="arch">
          <path d="M0 760 V300 A300 300 0 0 1 600 300 V760 Z" />
        </clipPath>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#dcefe7" />
          <stop offset=".55" stopColor="#f6ecd6" />
          <stop offset="1" stopColor="#f9e3bf" />
        </linearGradient>
        <linearGradient id="lake" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5cc2b3" />
          <stop offset="1" stopColor="#14594a" />
        </linearGradient>
        <linearGradient id="petal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3dca0" />
          <stop offset="1" stopColor="#c9a24a" />
        </linearGradient>
        <radialGradient id="glow">
          <stop offset="0" stopColor="#fff6dc" stopOpacity="1" />
          <stop offset="1" stopColor="#fff6dc" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g clipPath="url(#arch)">
        <rect width="600" height="760" fill="url(#sky)" />

        {/* sun + halo */}
        <g data-depth="0.2">
          <circle cx="300" cy="330" r="230" fill="url(#glow)" />
          <circle className="scene__halo" cx="300" cy="330" r="150" fill="none" stroke="#2bb3a3" strokeWidth="18" strokeOpacity=".45" />
          <circle cx="300" cy="330" r="92" fill="#f3d58f" />
        </g>

        {/* clouds */}
        <g data-depth="0.35" fill="#fff" opacity=".9">
          <g className="scene__cloud">
            <rect x="60" y="190" width="120" height="26" rx="13" />
            <rect x="96" y="172" width="64" height="30" rx="15" />
          </g>
          <g className="scene__cloud scene__cloud--slow">
            <rect x="400" y="250" width="140" height="24" rx="12" />
            <rect x="440" y="234" width="60" height="26" rx="13" />
          </g>
        </g>

        {/* birds */}
        <g data-depth="0.5" fill="none" stroke="#0b3d26" strokeWidth="2" strokeLinecap="round" className="scene__birds">
          <path d="M150 270 q6 -6 12 0 q6 -6 12 0" />
          <path d="M182 252 q5 -5 10 0 q5 -5 10 0" />
          <path d="M126 248 q4 -4 8 0 q4 -4 8 0" />
        </g>

        {/* far peaks */}
        <g data-depth="0.45">
          <path d="M0 470 L70 410 L130 445 L230 325 L320 430 L395 362 L470 432 L540 386 L600 420 V760 H0 Z" fill="#bfdacb" />
          <path d="M230 325 L212 347 L223 343 L231 354 L241 342 L249 348 Z" fill="#fff" />
          <path d="M395 362 L382 378 L392 375 L398 383 L405 375 L410 378 Z" fill="#fff" />
          <path d="M70 410 L60 420 L68 418 L73 424 L78 418 Z" fill="#fff" />
        </g>

        {/* mid hills */}
        <g data-depth="0.65">
          <path d="M0 525 C60 485 115 478 175 505 S285 455 345 492 S462 470 522 500 S582 512 600 506 V760 H0 Z" fill="#76b496" />
          <g fill="#1f7a50">
            <path d="M92 505 l9 -26 l9 26 z" /><path d="M108 509 l7 -20 l7 20 z" />
            <path d="M470 498 l9 -24 l9 24 z" /><path d="M486 503 l7 -18 l7 18 z" />
          </g>
        </g>

        {/* near hills */}
        <g data-depth="0.85">
          <path d="M0 585 C90 545 180 562 262 588 S420 545 600 575 V760 H0 Z" fill="#1f7a50" />
        </g>

        {/* lake */}
        <g data-depth="1">
          <rect y="612" width="600" height="160" fill="url(#lake)" />
          <ellipse cx="300" cy="628" rx="78" ry="6" fill="#f3d58f" opacity=".75" />
          <g stroke="#fff" strokeLinecap="round" strokeWidth="2" opacity=".55" className="scene__shimmer">
            <path d="M250 642 h100" /><path d="M270 656 h60" /><path d="M120 650 h40" /><path d="M440 664 h50" /><path d="M60 690 h30" /><path d="M500 700 h40" />
          </g>

          {/* shikara */}
          <g className="scene__boat">
            <path d="M150 668 q48 14 96 0 l-8 9 q-40 10 -80 0 z" fill="#0b3d26" />
            <path d="M176 668 v-24 h40 v24" fill="none" stroke="#0b3d26" strokeWidth="3" />
            <path d="M170 646 q26 -14 52 0" fill="#c9a24a" />
            <circle cx="232" cy="652" r="4" fill="#0b3d26" />
            <path d="M232 656 v10 M226 648 l26 26" stroke="#0b3d26" strokeWidth="2.4" strokeLinecap="round" />
          </g>

          {/* foreground banks */}
          <path d="M0 650 C40 624 92 628 140 660 C100 690 60 720 0 730 Z" fill="#0b3d26" />
          <path d="M600 640 C556 616 500 626 470 662 C520 690 560 714 600 720 Z" fill="#0b3d26" />
          <g fill="#0b3d26">
            <path d="M44 640 c-4 -30 4 -52 10 -70 c6 18 14 40 10 70 z" />
            <path d="M540 628 c-3 -24 3 -42 8 -56 c5 14 11 32 8 56 z" />
          </g>

          {/* lotus */}
          <g transform="translate(300 742)" className="scene__lotus">
            <ellipse cx="0" cy="6" rx="70" ry="9" fill="#14594a" opacity=".6" />
            <path d="M0 0 C-30 -6 -54 -24 -64 -48 C-40 -46 -16 -28 0 0Z" fill="url(#petal)" stroke="#a9832f" strokeWidth="1.5" />
            <path d="M0 0 C30 -6 54 -24 64 -48 C40 -46 16 -28 0 0Z" fill="url(#petal)" stroke="#a9832f" strokeWidth="1.5" />
            <path d="M0 0 C-22 -12 -30 -40 -22 -70 C-6 -54 2 -30 0 0Z" fill="url(#petal)" stroke="#a9832f" strokeWidth="1.5" />
            <path d="M0 0 C22 -12 30 -40 22 -70 C6 -54 -2 -30 0 0Z" fill="url(#petal)" stroke="#a9832f" strokeWidth="1.5" />
            <path d="M0 0 C-14 -24 -14 -60 0 -92 C14 -60 14 -24 0 0Z" fill="url(#petal)" stroke="#a9832f" strokeWidth="1.5" />
          </g>
        </g>

        {/* flight trail */}
        <g data-depth="0.3">
          <path d={FLIGHT} fill="none" stroke="#0b3d26" strokeWidth="2" strokeDasharray="3 9" strokeLinecap="round" opacity=".55" className="scene__trail" />
          {motion && (
            <g>
              <g transform="rotate(90) scale(1.3) translate(-12 -12)">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#0b3d26" />
              </g>
              <animateMotion dur="14s" repeatCount="indefinite" rotate="auto" path={FLIGHT} />
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}

/* ---------- Line icons (64px, stroke = currentColor) ---------- */
const lineProps = {
  viewBox: '0 0 64 64',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const IconChat = (p: P) => (
  <svg {...lineProps} {...p}><path d="M10 14h36a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H28l-10 9v-9h-8a6 6 0 0 1-6-6V20a6 6 0 0 1 6-6Z" /><path d="M18 26h22M18 33h14" /><circle cx="50" cy="12" r="6" className="accent" /></svg>
);
export const IconMap = (p: P) => (
  <svg {...lineProps} {...p}><path d="M6 16l16-6 20 6 16-6v38l-16 6-20-6-16 6Z" /><path d="M22 10v38M42 16v38" /><path d="M14 36c6-10 14 6 22-4s10-4 14-8" strokeDasharray="2 4" /><circle cx="50" cy="24" r="3" className="accent" /></svg>
);
export const IconTicket = (p: P) => (
  <svg {...lineProps} {...p}><path d="M8 20a4 4 0 0 0 4-4h40a4 4 0 0 0 4 4v6a6 6 0 0 0 0 12v6a4 4 0 0 0-4 4H12a4 4 0 0 0-4-4v-6a6 6 0 0 0 0-12Z" /><path d="M40 18v28" strokeDasharray="3 4" /><path d="M16 28h16M16 36h10" /><path d="M46 28l4 4-4 4" className="accent" /></svg>
);
export const IconSuitcase = (p: P) => (
  <svg {...lineProps} {...p}><rect x="10" y="20" width="44" height="32" rx="5" /><path d="M24 20v-6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6M10 32h44" /><path d="M18 52v4M46 52v4" /><circle cx="32" cy="32" r="4" className="accent" /></svg>
);
export const IconPalace = (p: P) => (
  <svg {...lineProps} {...p}><path d="M32 6v6M24 22c0-6 8-10 8-10s8 4 8 10Z" /><path d="M14 54V30h36v24M8 54h48" /><path d="M24 54V42a8 8 0 0 1 16 0v12" /><path d="M18 30v-4h28v4" /><circle cx="32" cy="6" r="2" className="accent" /></svg>
);
export const IconRings = (p: P) => (
  <svg {...lineProps} {...p}><circle cx="24" cy="38" r="14" /><circle cx="40" cy="38" r="14" /><path d="M28 12l4-6 4 6-4 6Z" className="accent" /></svg>
);
export const IconStupa = (p: P) => (
  <svg {...lineProps} {...p}><path d="M32 4v8M28 12h8l-1 6h-6Z" /><path d="M18 36a14 14 0 0 1 28 0Z" /><path d="M14 36h36v6H14ZM10 42h44v8H10ZM6 58h52" /><path d="M29 50v8h6v-8" /><circle cx="32" cy="4" r="2" className="accent" /></svg>
);
export const IconPeak = (p: P) => (
  <svg {...lineProps} {...p}><path d="M4 54l18-30 10 14 8-10 20 26Z" /><path d="M16 34l6-10 6 8-4 2-2-2-4 4Z" /><circle cx="48" cy="14" r="6" className="accent" /></svg>
);
export const IconFamily = (p: P) => (
  <svg {...lineProps} {...p}><circle cx="20" cy="16" r="6" /><circle cx="44" cy="16" r="6" /><circle cx="32" cy="32" r="4" className="accent" /><path d="M10 50V34a10 10 0 0 1 20 0M34 34a10 10 0 0 1 20 0v16M26 54v-8a6 6 0 0 1 12 0v8" /></svg>
);
export const IconLeaf = (p: P) => (
  <svg {...lineProps} {...p}><path d="M12 52C10 28 26 10 54 10c0 28-16 44-42 42Z" /><path d="M12 52L40 24M26 38h10M32 32v-8" /><circle cx="50" cy="50" r="4" className="accent" /></svg>
);
export const IconCompass = (p: P) => (
  <svg {...lineProps} {...p}><circle cx="32" cy="32" r="24" /><path d="M42 22l-6 14-14 6 6-14Z" /><circle cx="32" cy="32" r="2" className="accent" /><path d="M32 4v4M32 56v4M4 32h4M56 32h4" /></svg>
);
export const IconPlane = (p: P) => (
  <svg {...lineProps} {...p}><path d="M8 36l14 2 10 16h6l-4-16 14 2 4 6h4l-2-10 2-10h-4l-4 6-14 2 4-16h-6L22 34 8 36Z" /><path d="M4 54c8-2 14-2 22 0" strokeDasharray="2 4" className="accent" /></svg>
);
export const IconPassport = (p: P) => (
  <svg {...lineProps} {...p}><rect x="14" y="6" width="36" height="52" rx="4" /><circle cx="32" cy="26" r="9" /><path d="M23 26h18M32 17c-4 5-4 13 0 18M32 17c4 5 4 13 0 18" /><path d="M22 46h20" className="accent" /></svg>
);
export const IconGroup = (p: P) => (
  <svg {...lineProps} {...p}><circle cx="32" cy="18" r="7" /><circle cx="14" cy="24" r="5" /><circle cx="50" cy="24" r="5" /><path d="M20 52V40a12 12 0 0 1 24 0v12M4 50v-6a8 8 0 0 1 12-7M60 50v-6a8 8 0 0 0-12-7" /><path d="M28 6h8" className="accent" /></svg>
);
export const IconBriefcase = (p: P) => (
  <svg {...lineProps} {...p}><rect x="6" y="18" width="52" height="34" rx="5" /><path d="M24 18v-6h16v6M6 32h52" /><rect x="28" y="28" width="8" height="8" rx="2" className="accent" /></svg>
);

/* ---------- Footer wave ---------- */
export function Wave({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path d="M0 60 C240 120 480 0 720 50 S1200 110 1440 40 V120 H0 Z" fill="currentColor" />
    </svg>
  );
}
