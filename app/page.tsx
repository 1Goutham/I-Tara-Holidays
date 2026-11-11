import { Providers } from '@/components/providers';
import { PointerEffects, Preloader, ScrollEffects, Toast } from '@/components/effects';
import { Header } from '@/components/sections/header';
import { Hero } from '@/components/sections/hero';
import { Ticker } from '@/components/sections/ticker';
import { Statement } from '@/components/sections/statement';
import { Journeys } from '@/components/sections/journeys';
import { StylesList } from '@/components/sections/styles-list';
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
      <Preloader />
      <ScrollEffects />
      <PointerEffects />
      <Header />
      <main id="main">
        <Hero />
        <Ticker />
        <Statement />
        <Journeys />
        <StylesList />
        <Destinations />
        <Flow />
        <Services />
        <Stories />
        <Contact />
      </main>
      <Footer />
      <Toast />
    </Providers>
  );
}
