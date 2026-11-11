import { Img } from '../ui/img';
import { Reveal } from '../ui/reveal';
import { SplitHeading } from '../ui/split-heading';
import { PlayIcon } from '../icons';
import { SearchForm } from './search-form';
import { ModalTrigger } from './film-modal';
import { unsplash } from '@/lib/data';

export function Hero() {
  return (
    <section className="hero" aria-label="Introduction">
      <div className="hero__media" data-parallax="0.25">
        <Img src={unsplash('1506905925346-21bda4d32df4')} alt="Sunrise over snow-capped mountain peaks" fill priority sizes="100vw" quality={80} />
      </div>
      <div className="hero__veil" />
      <div className="hero__word" aria-hidden="true"><span>I&nbsp;Tara</span></div>

      <div className="container hero__content">
        <Reveal as="p" className="eyebrow eyebrow--light"><span className="dot" /> Explore · Dream · Discover</Reveal>
        <SplitHeading as="h1" className="hero__title" lines={['Journeys that feel', '*blessed,* not booked.']} />
        <Reveal as="p" className="hero__lead" delay={300}>
          Handpicked holidays across India and the world, planned with care and looked after at every step, from the first call to your trip home.
        </Reveal>
        <Reveal className="hero__cta" delay={400}>
          <a href="#packages" className="btn btn--light magnetic"><span>Explore packages</span><i className="btn__arrow">→</i></a>
          <ModalTrigger id="film" className="play" aria-label="Watch our story">
            <span className="play__ring"><PlayIcon /></span>
            <span>Watch our story</span>
          </ModalTrigger>
        </Reveal>
      </div>

      <Reveal as="aside" className="hero__card" variant="right" delay={600} aria-label="Featured trip">
        <div className="hero__card-img">
          <Img src={unsplash('1537996194471-e657df975ab4')} alt="Temple gate in Bali" fill sizes="260px" />
        </div>
        <div className="hero__card-body">
          <small>Trending this season</small>
          <strong>Bali Blissful Escape</strong>
          <span>6N / 7D · from <b>₹54,999</b></span>
        </div>
      </Reveal>

      <div className="container">
        <SearchForm />
      </div>
    </section>
  );
}
