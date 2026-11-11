import { services } from '@/lib/data';

export function Services() {
  return (
    <section className="svc section" id="services" data-theme="light">
      <div className="container svc__grid">
        <div className="svc__intro">
          <p className="label" data-fade>What we do</p>
          <h2 className="h2" data-split>Everything, <em>handled.</em></h2>
          <p className="svc__lead" data-fade>One team for the whole trip: planning, bookings, paperwork and someone on call while you travel.</p>
        </div>
        <ol className="svc__list">
          {services.map((s, i) => (
            <li key={s.title} data-fade>
              <span className="rule" data-rule />
              <span className="svc__n">{String(i + 1).padStart(2, '0')}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
