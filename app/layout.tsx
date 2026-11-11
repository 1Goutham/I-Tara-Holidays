import type { Metadata, Viewport } from 'next';
import { DM_Serif_Display, Jost } from 'next/font/google';
import { site } from '@/lib/site';
import './globals.css';

const display = DM_Serif_Display({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
const body = Jost({ subsets: ['latin'], weight: ['300', '400', '500'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.legalName} | Curated Tours, Honeymoons & Holiday Packages`,
    template: `%s | ${site.legalName}`,
  },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: site.legalName,
    title: site.legalName,
    description: 'Tailored journeys, handpicked stays and 24/7 care — holidays designed around you.',
    images: [{ url: '/img/logo.webp', width: 640, height: 583, alt: site.legalName }],
    locale: 'en_IN',
  },
  twitter: { card: 'summary_large_image', title: site.legalName, description: site.description, images: ['/img/logo.webp'] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0b3d26',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'TravelAgency',
  name: site.legalName,
  url: site.url,
  logo: `${site.url}/img/logo.webp`,
  telephone: site.phoneHref.replace('tel:', ''),
  email: site.email,
  address: { '@type': 'PostalAddress', addressCountry: 'IN' },
  priceRange: '₹₹–₹₹₹₹',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`} suppressHydrationWarning>
      <head>
        {/* Enables reveal styles only when JS runs, so content stays visible without it */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
