import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { IconBriefcase, IconCompass, IconGroup, IconPassport, IconPlane } from '../illustrations';
import { services } from '@/lib/data';

const icons = [IconCompass, IconPlane, IconPassport, IconGroup, IconBriefcase];

export function Services() {
  return (
    <section className="services section" id="services">
      <div className="container">
        <div className="section-head section-head--split">
          <div>
            <Reveal as="p" className="kicker">What we do</Reveal>
            <SplitHeading lines={['Everything,', '*handled.*']} />
          </div>
          <Reveal as="p" className="section-head__aside">
            One team for the whole trip: planning, bookings, paperwork and support while you travel.
          </Reveal>
        </div>
        <div className="svc">
          {services.map((s, i) => {
            const Icon = icons[i];
            return (
              <Reveal className="svc__item" key={s.title} delay={i * 80}>
                <Icon className="svc__icon" />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
