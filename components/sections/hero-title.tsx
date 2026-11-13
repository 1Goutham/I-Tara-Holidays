/*
 * Hero headline lockup: a medium geometric-sans line over a bold serif line in two
 * gradient tones, with a hand-drawn paper plane flying its dashed pen trail around it.
 * The parent hero animates the pieces (see hero.tsx); this file is markup only.
 */

const LINE_1 = 'Every journey,';

// Trail in a 1000 × 520 box laid over the headline: in from the lower left, a loose
// loop (the logo's flight path), across the top of the lockup, out toward the sun.
export const TRAIL =
  'M-30 430 C 60 400, 110 330, 150 250 C 185 180, 150 120, 105 135 C 60 150, 70 215, 130 220 C 260 230, 420 70, 640 62 C 780 58, 880 95, 965 150';

export function HeroTitle() {
  return (
    <h1 className="hero__title" aria-label="Every journey, watched over.">
      <span className="ht ht--sans" aria-hidden="true">
        {Array.from(LINE_1).map((c, i) =>
          c === ' ' ? (
            <span key={i} className="ht__sp"> </span>
          ) : (
            <span key={i} className="ht__c">{c}</span>
          ),
        )}
      </span>
      <span className="ht ht--serif" aria-hidden="true">
        <span className="ht__in">
          <em className="ht__warm">watched</em> <span className="ht__cool">over.</span>
        </span>
      </span>

      <svg className="hero__flight" viewBox="0 0 1000 520" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <defs>
          <mask id="trail-reveal" maskUnits="userSpaceOnUse" x="-100" y="-100" width="1200" height="720">
            <path className="flight__reveal" d={TRAIL} fill="none" stroke="#fff" strokeWidth="14" strokeLinecap="round" />
          </mask>
        </defs>
        {/* pen trail: dashed, with a faint second pass for a hand-inked feel */}
        <g mask="url(#trail-reveal)" fill="none" strokeLinecap="round">
          <path className="flight__trail" d={TRAIL} stroke="currentColor" strokeWidth="2.4" strokeDasharray="1 11" />
          <path d={TRAIL} stroke="currentColor" strokeWidth="1" strokeDasharray="6 14" strokeOpacity="0.35" transform="translate(1.5 2)" />
        </g>
        {/* hand-drawn paper plane, nose pointing +x so autoRotate follows the trail */}
        <g className="flight__plane">
          <g transform="scale(1.7) translate(-26 -18)" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 17 L52 2 L30 34 L23 23 Z" fill="#fbf6ea" stroke="currentColor" strokeWidth="2.2" />
            <path d="M23 23 L52 2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M23 23 L21 33 L30 34" fill="#e9dfc9" stroke="currentColor" strokeWidth="1.8" />
            <path d="M3.5 18.5 C 14 16, 30 9, 50 3.5" fill="none" stroke="currentColor" strokeWidth="0.8" strokeOpacity="0.5" />
          </g>
        </g>
      </svg>
    </h1>
  );
}
