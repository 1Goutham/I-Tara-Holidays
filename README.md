# I Tara — A Holiday Company

Marketing website for I Tara, built with **Next.js 16 (App Router)**, **React 19** and **TypeScript**.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

Production:

```bash
npm run build
npm start
```

Type-check only: `npm run typecheck`

## Project structure

```
app/
  layout.tsx           fonts (next/font), metadata, Open Graph, JSON-LD
  page.tsx             home page composition
  globals.css          design tokens, components, animations, responsive rules
  api/enquiry/route.ts validates enquiries / newsletter sign-ups and forwards them
  sitemap.ts, robots.ts, icon.png, apple-icon.png, not-found.tsx
components/
  providers.tsx        shared state: preloader ready flag, toast, enquiry prefill, modal
  effects.tsx          preloader, scroll progress + parallax, cursor, magnetic buttons
  illustrations.tsx    hand-built SVG art: hero dawn scene, lotus, line icons, footer wave
  ui/                  Reveal, SplitHeading, Counter, Img (next/image with fallback)
  sections/            header, hero, ticker, statement, journeys (pinned horizontal scroll),
                       experiences list, destination arches, flow (scroll-drawn flight path),
                       services, stories, contact, footer
lib/
  site.ts              brand name, phone, email, WhatsApp, socials, nav
  data.ts              packages, destinations, travel styles, services, testimonials, gallery
  motion.ts            useReveal / useScrollProgress hooks + reduced-motion / pointer helpers
  submit.ts            client form submission helper
public/img/            logo assets
```

## Before going live

1. **Contact details** in `lib/site.ts` are placeholders: phone, email, WhatsApp number and social links.
2. **Environment variables**: copy `.env.example` to `.env.local` (or set them in your host):
   - `NEXT_PUBLIC_SITE_URL`: your domain. It is used for the canonical URL, Open Graph tags and the sitemap.
   - `ENQUIRY_WEBHOOK_URL`: any endpoint that accepts JSON POSTs (Formspree, Getform, a Zapier or Make webhook, a CRM).
     Until this is set, `/api/enquiry` returns 503 and the enquiry form opens the visitor's email app instead.
3. **Photos** come from Unsplash through `next/image`. Replace them with your own licensed images in `lib/data.ts`
   (the hero itself is an illustration, so it needs no photo). If you use another image host, add it to `images.remotePatterns` in `next.config.ts`.
4. **Content**: packages, prices, destinations and testimonials are samples in `lib/data.ts`.

## Deploy

Works out of the box on Vercel: import the repo and set the environment variables above.
It runs on any Node 20.9+ host with `npm run build && npm start`.
