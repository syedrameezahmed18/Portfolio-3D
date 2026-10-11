# Portfolio 3D

A cinematic, scroll-driven portfolio for Syed Rameez Ahmed. Dark, editorial, one ember accent, with a cursor-reactive WebGL object behind the hero and pinned scroll choreography through the rest of the page.

## Stack

- React 19 + TypeScript on Vite
- Tailwind CSS v4 for layout and tokens
- React Three Fiber, Drei and Postprocessing for the hero scene
- GSAP ScrollTrigger with Lenis for smooth, scrubbed scroll animation
- TanStack Query + Supabase for content, with local fallbacks for every section
- EmailJS for the contact form

## Content

Hero, about and contact copy come from the `site_content` table, projects from `projects`, and skill meters from `skills`. These are the same tables the original portfolio's admin panel edits, so no new backend is needed. If Supabase is unreachable, misconfigured or empty, the site renders the content in `src/data/fallback.ts` instead.

## Running

```bash
cp .env.example .env   # fill in Supabase and EmailJS values, or leave empty
npm install
npm run dev
```

`npm run build` type-checks and produces `dist/`. The `public/_redirects` file is set up for Netlify.

## Motion notes

- `prefers-reduced-motion` disables the preloader, split-text reveals, the pinned horizontal section and smooth scrolling.
- Below 1024px the projects section becomes a vertical stack.
- On touch devices and narrow screens the hero scene drops transmission and bloom for a lighter material.
