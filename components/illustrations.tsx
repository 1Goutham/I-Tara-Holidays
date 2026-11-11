/* Illustration system: layered dawn landscape + gold line-art panorama. */

import type { CSSProperties } from 'react';
import { LANDSCAPE, ridgeLine, ridgePath } from '@/lib/landscape';

const { W, H } = LANDSCAPE;
const VB = `0 0 ${W} ${H}`;

/* Geometry is computed once at module load — identical on server and client. */
const far = ridgePath({ seed: 11, base: 560, amp: 150, roughness: 0.56, peaks: [[0.28, 190], [0.6, 120], [0.84, 95]] });
const range = ridgePath({ seed: 23, base: 650, amp: 120, roughness: 0.54, peaks: [[0.12, 70], [0.47, 60], [0.92, 80]] });
const hills = ridgePath({ seed: 37, base: 735, amp: 90, roughness: 0.5, peaks: [[0.7, 45]] });
const forest = ridgePath({ seed: 41, base: 815, amp: 60, roughness: 0.5, trees: { min: 10, max: 32, density: 0.85 } });
const front = ridgePath({ seed: 53, base: 872, amp: 46, roughness: 0.48, trees: { min: 22, max: 64, density: 0.62 } });

function Layer({ d, fill, className, children, style }: { d: string; fill: string; className: string; children?: React.ReactNode; style?: CSSProperties }) {
  return (
    <div className={`hl ${className}`} style={style} aria-hidden="true">
      <div className="hl__inner">
        <svg viewBox={VB} preserveAspectRatio="xMidYMax slice">
          {children}
          <path d={d} fill={fill} />
        </svg>
      </div>
    </div>
  );
}

/** Background layers (behind the headline). */
export function LandscapeBack() {
  return (
    <>
      <div className="hl hl--sun" aria-hidden="true"><span /></div>
      <svg className="hl hl--birds" viewBox="0 0 200 80" aria-hidden="true">
        <g fill="none" stroke="#0b3d26" strokeWidth="1.3" strokeLinecap="round">
          <path d="M20 40 q6 -6 12 0 q6 -6 12 0" />
          <path d="M60 26 q4.5 -4.5 9 0 q4.5 -4.5 9 0" />
          <path d="M44 58 q3.5 -3.5 7 0 q3.5 -3.5 7 0" />
        </g>
      </svg>
      <Layer className="hl--far" d={far} fill="url(#g-far)">
        <defs>
          <linearGradient id="g-far" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".16" stopColor="#e7efe9" />
            <stop offset=".42" stopColor="#bfd3ca" />
            <stop offset="1" stopColor="#a9c3b8" />
          </linearGradient>
        </defs>
      </Layer>
      <Layer className="hl--range" d={range} fill="url(#g-range)">
        <defs>
          <linearGradient id="g-range" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9fbfb1" />
            <stop offset="1" stopColor="#86ab9b" />
          </linearGradient>
        </defs>
      </Layer>
    </>
  );
}

/** Foreground layers (in front of the headline). */
export function LandscapeFront() {
  return (
    <>
      <Layer className="hl--hills" d={hills} fill="#5f927b" />
      <div className="hl hl--mist" aria-hidden="true" />
      <Layer className="hl--forest" d={forest} fill="#24563f" />
      <Layer className="hl--front" d={front} fill="#062619" />
    </>
  );
}

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
