import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { Accordion } from './accordion';
import { services, steps, travelStyles, unsplash } from '@/lib/data';

export function TravelStyles() {
  return (
    <section className="styles section section--dark" id="styles">
      <div className="container">
        <div className="section-head section-head--center">
          <Reveal as="p" className="eyebrow eyebrow--light"><span className="dot" /> Ways to travel</Reveal>
          <SplitHeading lines={['Choose the kind of journey', 'you want to *remember.*']} />
        </div>
        <div className="styles__grid">
          {travelStyles.map((s, i) => (
            <Reveal as="article" className="style-card tilt" delay={(i % 3) * 80} key={s.title} tabIndex={0}>
              <Img src={s.img} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px" />
              <div>
                <span>{String(i + 1).padStart(2, '0')}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section className="services section" id="services">
      <div className="container services__grid">
        <div>
          <Reveal as="p" className="eyebrow"><span className="dot" /> What we do</Reveal>
          <SplitHeading lines={['Travel services for', 'every *kind* of escape.']} />
          <Accordion items={services} />
        </div>
        <Reveal variant="clip" className="services__visual">
          <Img src={unsplash('1488646953014-85cb44e25828')} alt="Map, camera and passport laid out for trip planning" fill sizes="(max-width: 1024px) 90vw, 560px" />
          <div className="float-chip float-chip--a"><b>40+</b> visa countries</div>
          <div className="float-chip float-chip--b"><span className="live" /> Experts online now</div>
        </Reveal>
      </div>
    </section>
  );
}

export function Process() {
  return (
    <section className="process section section--tint" id="process">
      <div className="container">
        <div className="section-head section-head--center">
          <Reveal as="p" className="eyebrow"><span className="dot" /> How it works</Reveal>
          <SplitHeading lines={['From first idea to', '*finished* itinerary.']} />
        </div>
        <ol className="steps">
          {steps.map((s, i) => (
            <Reveal as="li" className="step" delay={i * 120} key={s.title}>
              <span className="step__n">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
