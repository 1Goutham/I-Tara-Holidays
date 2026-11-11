/* Illustration system: gold line-art panorama + lotus mark. */

import { ridgeLine } from '@/lib/landscape';

/* ---------- Line-art panorama (draws on scroll) ---------- */
const lineFar = ridgeLine(5, 300, 110, [[0.3, 120], [0.66, 90]], 0.55);
const lineNear = ridgeLine(9, 370, 70, [[0.82, 50]], 0.5);

export function LinePanorama() {
  return (
    <svg className="panorama" viewBox="0 0 1600 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle className="draw" pathLength={1} cx="1060" cy="190" r="74" stroke="var(--gold)" strokeWidth="1.2" />
        <circle className="draw" pathLength={1} cx="1060" cy="190" r="104" stroke="var(--gold)" strokeWidth=".8" strokeOpacity=".5" />
        <path className="draw" pathLength={1} d={lineFar} stroke="var(--green-900)" strokeWidth="1.2" />
        <path className="draw" pathLength={1} d={lineNear} stroke="var(--green-900)" strokeWidth="1" strokeOpacity=".55" />
        {/* stupa */}
        <path
          className="draw"
          pathLength={1}
          stroke="var(--gold-deep)"
          strokeWidth="1.2"
          d="M380 352 h80 M388 352 v-14 h64 v14 M394 338 c0-26 52-26 52 0 M408 312 h24 M412 312 l2 -12 h12 l2 12 M420 300 v-22 M414 290 h12 M416 282 h8"
        />
        {/* flight */}
        <path className="panorama__fade" d="M120 230 C360 90 700 70 900 150" stroke="var(--green-900)" strokeWidth="1" strokeDasharray="3 8" strokeOpacity=".6" />
        <path className="draw" pathLength={1} d="M1260 120 q8 -8 16 0 q8 -8 16 0 M1300 96 q6 -6 12 0 q6 -6 12 0" stroke="var(--green-900)" strokeWidth="1.1" />
        {/* water lines */}
        <path className="draw" pathLength={1} d="M200 430 h300 M620 450 h220 M960 430 h380 M760 470 h160" stroke="var(--green-900)" strokeWidth=".9" strokeOpacity=".45" />
      </g>
    </svg>
  );
}

/* Lotus mark (from the logo) as a fine line */
export function LotusLine({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 80" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
      <path d="M60 72 C46 56 46 30 60 8 C74 30 74 56 60 72Z" />
      <path d="M60 72 C40 66 28 48 30 24 C46 32 56 50 60 72Z" />
      <path d="M60 72 C80 66 92 48 90 24 C74 32 64 50 60 72Z" />
      <path d="M60 72 C38 74 18 64 8 46 C26 44 46 54 60 72Z" />
      <path d="M60 72 C82 74 102 64 112 46 C94 44 74 54 60 72Z" />
    </svg>
  );
}
