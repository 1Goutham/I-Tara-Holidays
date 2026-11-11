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
  layout.tsx           fonts (Instrument Serif + Inter Tight via next/font), metadata, JSON-LD
  page.tsx             home page composition
  globals.css          design tokens, type scale, layout, components, responsive rules
  api/enquiry/route.ts validates enquiries / newsletter sign-ups and forwards them
components/
  motion/              smooth-scroll.tsx (Lenis synced to the GSAP ticker), reveals.tsx (data-attribute reveals)
  effects.tsx          counter preloader, progress hairline, context cursor, magnetic buttons, grain
  hero-gl/             WebGL hero: depth-parallax plate with fog, sun shafts, mug steam,
                       lantern/fire flicker and leaf sway in one shader (no 3D library)
  illustrations.tsx    gold line-art panorama
  sections/            hero (pinned parallax), intro, journeys (pinned horizontal), experiences,
                       panorama, destinations, flow (scroll-drawn route), services, stories, contact, footer
lib/
  landscape.ts         seeded ridge generator (deterministic, so SSR and client match)
  gsap.ts              GSAP + ScrollTrigger + SplitText registration, Lenis handle, scrollToId
  site.ts · data.ts    brand/contact details · content
public/img/            logo mark and wordmarks (dark + light)
public/img/hero/       plate.webp + depth.webp (landscape), sun/tent/stump/bushes/branch.webp (cut-out layers)
```

### Hero scene
Two canvases share one camera (`camera()` and `layerTransform()` in `components/hero-gl/renderer.ts`):

- **Back canvas** (`shader.ts`): renders the landscape plate with depth parallax, fog, sun shafts and grade.
- **Front canvas** (`front.ts` + `composite.ts`), drawn in this order:
  1. The mountain cut-out (`mountains.webp`), which replaces the plate's mid-ground. It is drawn in front of the headline so the text tucks behind its ridgeline.
  2. The plate's near meadow, redrawn over the cut-out's lower edge.
  2. Contact shadows.
  3. Photographic cut-outs from back to front (`DRAWS` in `hero-scene.tsx`): grass strips behind the props, the tent, grass along the tent floor, the stump, grass over its base, and the near meadow. Each one gets light wrap, a sun rim light, a grade and haze.
  4. Mug steam.
- **Grass:** `public/img/hero/grass-strip.webp` is built from real blades cut out of the rock photo, layered in three rows. The shader adds wind: a gust travels along the strip, the tips move while the roots stay planted, and the strip ends feather out.
- **DOM layers:** sun (screen-blended), branch (swaying), bushes (defocused foreground) and lantern glows. DOM copies of the tent and stump are the fallback when WebGL is unavailable.
- **Loader:** a minimal logo loader waits for fonts and the hero assets (at most 6 s).

### Motion conventions
Add these attributes to markup and `components/motion/reveals.tsx` animates them:
`data-split` (lines rise out of a mask), `data-fade` (soft rise, siblings staggered),
`data-img` (clip wipe and settle) and `data-rule` (hairline draws in).
All motion is disabled for visitors who prefer reduced motion.

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

### Vercel 404 (`NOT_FOUND`)
If the Vercel project was first created while this repo was a static HTML site, its Framework Preset may still be
"Other", with an output directory, so Vercel serves raw files instead of the Next.js app. `vercel.json` pins
`"framework": "nextjs"`. Also check **Project Settings → Build & Deployment**: the Framework Preset should be Next.js
and the Output Directory and Root Directory overrides should be empty. Then redeploy.
