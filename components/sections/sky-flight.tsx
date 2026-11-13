/*
 * A distant airliner crossing the dawn sky high above the headline, leaving a contrail
 * that spreads and fades. Sits in the sky plane (behind the headline). Animated by hero.tsx.
 */

export const FLIGHT_PATH = 'M -80 250 C 300 150, 760 96, 1120 104 S 1560 150, 1720 190';

export function SkyFlight() {
  return (
    <svg className="sky-flight" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="contrail-fade" gradientUnits="userSpaceOnUse" x1="-80" y1="0" x2="1720" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.9" />
        </linearGradient>
        <filter id="contrail-soft" x="-10%" y="-200%" width="120%" height="500%">
          <feGaussianBlur stdDeviation="3.2" />
        </filter>
        <mask id="contrail-reveal" maskUnits="userSpaceOnUse" x="-200" y="-200" width="2000" height="1300">
          <path className="flight__reveal" d={FLIGHT_PATH} fill="none" stroke="#fff" strokeWidth="40" strokeLinecap="round" />
        </mask>
      </defs>
      {/* contrail: a diffuse plume plus two thin engine trails */}
      <g className="flight__trail" mask="url(#contrail-reveal)" fill="none" strokeLinecap="round">
        <path className="flight__plume" d={FLIGHT_PATH} stroke="url(#contrail-fade)" strokeWidth="7" filter="url(#contrail-soft)" opacity="0.5" />
        <path d={FLIGHT_PATH} stroke="url(#contrail-fade)" strokeWidth="0.9" transform="translate(0 -1.2)" opacity="0.8" />
        <path d={FLIGHT_PATH} stroke="url(#contrail-fade)" strokeWidth="0.9" transform="translate(0 1.2)" opacity="0.8" />
      </g>
      {/* airliner seen from below, nose along +x */}
      <g className="flight__plane">
        <g transform="scale(0.5) translate(-21 -16)" fill="#55635c" fillOpacity="0.72">
          <path d="M2 16 C 2 14.6, 4 14, 8 14 L 38 14.2 C 41 14.3, 43 15, 43 16 C 43 17, 41 17.7, 38 17.8 L 8 18 C 4 18, 2 17.4, 2 16 Z" />
          <path d="M24 14.4 L 17 1.5 L 20.5 1.5 L 31 14.3 Z" />
          <path d="M24 17.6 L 17 30.5 L 20.5 30.5 L 31 17.7 Z" />
          <path d="M6.5 14.4 L 3 8.5 L 5 8.5 L 10.5 14.3 Z" />
          <path d="M6.5 17.6 L 3 23.5 L 5 23.5 L 10.5 17.7 Z" />
        </g>
      </g>
    </svg>
  );
}
