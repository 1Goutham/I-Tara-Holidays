import { Providers } from '@/components/providers';
import { PointerEffects, Preloader, ScrollEffects, Toast } from '@/components/effects';
import { Header } from '@/components/sections/header';
import { Hero } from '@/components/sections/hero';
import { About, Trust } from '@/components/sections/trust-about';
import { Packages } from '@/components/sections/packages';
import { Destinations } from '@/components/sections/destinations';
import { Process, Services, TravelStyles } from '@/components/sections/experiences';
import { Stories } from '@/components/sections/stories';
import { Contact } from '@/components/sections/contact';
import { Footer } from '@/components/sections/footer';
import { FilmModal } from '@/components/sections/film-modal';

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
        <Trust />
        <About />
        <Packages />
        <Destinations />
        <TravelStyles />
        <Services />
        <Process />
        <Stories />
        <Contact />
      </main>
      <Footer />
      <FilmModal />
      <Toast />
    </Providers>
  );
}
