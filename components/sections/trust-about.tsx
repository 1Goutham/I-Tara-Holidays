import Image from 'next/image';
import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { Counter } from '../ui/counter';
import { AwardIcon, HeadsetIcon, ShieldIcon, TagIcon } from '../icons';
import { unsplash } from '@/lib/data';

const trust = [
  { Icon: ShieldIcon, title: 'Secure bookings', text: 'Safe payments & transparent pricing' },
  { Icon: HeadsetIcon, title: '24/7 trip support', text: 'Real people, before, during & after' },
  { Icon: TagIcon, title: 'Best price promise', text: 'No hidden costs, ever' },
  { Icon: AwardIcon, title: 'Handpicked stays', text: 'Every hotel personally vetted' },
];

export function Trust() {
  return (
    <section className="trust container" aria-label="Why travellers trust us">
      {trust.map(({ Icon, title, text }, i) => (
        <Reveal className="trust__item" delay={i * 80} key={title}>
          <span className="trust__ico"><Icon /></span>
          <div><b>{title}</b><small>{text}</small></div>
        </Reveal>
      ))}
    </section>
  );
}

export function About() {
  return (
    <section className="about section" id="about">
      <div className="container about__grid">
        <div className="about__media">
          <Reveal as="figure" variant="clip" className="about__img about__img--a">
            <Img src={unsplash('1503220317375-aaad61436b1b')} alt="Traveller looking out over a valley" fill sizes="(max-width: 1024px) 70vw, 420px" />
          </Reveal>
          <Reveal as="figure" variant="clip" className="about__img about__img--b" delay={200}>
            <Img src={unsplash('1602216056096-3b40cc0c9944')} alt="Houseboat on the Kerala backwaters" fill sizes="(max-width: 1024px) 45vw, 280px" />
          </Reveal>
          <Reveal className="about__badge" delay={400}>
            <svg viewBox="0 0 120 120" className="spin" aria-hidden="true">
              <defs><path id="circ" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text><textPath href="#circ">CRAFTED WITH CARE · SINCE 2010 · </textPath></text>
            </svg>
            <Image src="/img/mark.png" alt="" width={54} height={54} />
          </Reveal>
        </div>
        <div className="about__copy">
          <Reveal as="p" className="eyebrow"><span className="dot" /> Who we are</Reveal>
          <SplitHeading lines={['Inspired by Tara,', 'the guide who *protects*', 'every traveller.']} />
          <Reveal as="p" className="lead">
            In Himalayan tradition, Tara is the protector of journeys. We named our company after her because that is the job we want to do for you: plan carefully, take on the worry, and look after every detail.
          </Reveal>
          <Reveal as="p">
            From a quiet houseboat in Alleppey to a winter week in the Swiss Alps, each itinerary is built by specialists who have been there. You get stays we have checked ourselves, time to rest, and someone to call any hour of the day.
          </Reveal>
          <div className="stats">
            <Reveal className="stat"><b><Counter to={25000} suffix="+" /></b><small>Happy travellers</small></Reveal>
            <Reveal className="stat stat--accent" delay={100}><b><Counter to={120} suffix="+" /></b><small>Destinations</small></Reveal>
            <Reveal className="stat" delay={200}><b><Counter to={4.9} decimals={1} /><i>★</i></b><small>Average rating</small></Reveal>
          </div>
          <Reveal as="a" href="#contact" className="link-arrow">Talk to a travel expert <i>→</i></Reveal>
        </div>
      </div>
    </section>
  );
}
