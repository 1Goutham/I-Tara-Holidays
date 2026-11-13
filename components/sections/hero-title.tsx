/*
 * Hero headline: a spaced-caps masthead line over a large serif line that is lit by the
 * scene — one light field brightening toward the sun, plus a sun bloom wrapping the glyph
 * edges nearest it (positioned at runtime by hero.tsx). Markup only.
 */

const LINE_1 = 'Every journey,';

function SerifWords() {
  return (
    <>
      <em className="ht__w ht__warm">watched</em> <span className="ht__w ht__cool">over.</span>
    </>
  );
}

export function HeroTitle() {
  return (
    <h1 className="hero__title" aria-label="Every journey, watched over.">
      <span className="ht ht--sans" aria-hidden="true">
        <span className="ht__rule" />
        <span className="ht__caps">
          {Array.from(LINE_1).map((c, i) =>
            c === ' ' ? (
              <span key={i} className="ht__sp"> </span>
            ) : (
              <span key={i} className="ht__c">{c}</span>
            ),
          )}
        </span>
        <span className="ht__rule" />
      </span>
      <span className="ht ht--serif" aria-hidden="true">
        <span className="ht__in">
          <span className="ht__ink"><SerifWords /></span>
          {/* sunlight wrapping the letter edges nearest the sun */}
          <span className="ht__glow"><SerifWords /></span>
        </span>
      </span>
    </h1>
  );
}
