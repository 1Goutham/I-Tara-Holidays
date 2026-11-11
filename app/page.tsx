import { Providers } from '@/components/providers';
import { Boot, Cursor, Grain, Magnetic, ScrollProgress, Toast } from '@/components/effects';
import { SmoothScroll } from '@/components/motion/smooth-scroll';
import { Reveals } from '@/components/motion/reveals';
import { Header } from '@/components/sections/header';
import { Hero } from '@/components/sections/hero';
import { Intro } from '@/components/sections/intro';
import { Journeys } from '@/components/sections/journeys';
import { Experiences } from '@/components/sections/experiences';
import { Panorama } from '@/components/sections/panorama';
import { Destinations } from '@/components/sections/destinations';
import { Flow } from '@/components/sections/flow';
import { Services } from '@/components/sections/services';
import { Stories } from '@/components/sections/stories';
import { Contact } from '@/components/sections/contact';
import { Footer } from '@/components/sections/footer';

export default function HomePage() {
  return (
    <Providers>
      <a className="skip-link" href="#main">Skip to content</a>
      <SmoothScroll />
      <Boot />
      <ScrollProgress />
      <Cursor />
      <Magnetic />
      <Grain />
      <Header />
      <main id="main">
        <Hero />
        <Intro />
        <Journeys />
        <Experiences />
        <Panorama />
        <Destinations />
        <Flow />
        <Services />
        <Stories />
        <Contact />
      </main>
      <Footer />
      <Reveals />
      <Toast />
    </Providers>
  );
}
