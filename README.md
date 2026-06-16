# Am I Passing?

A mobile-first web app that helps **University of Kurdistan Hewlêr** postgraduate students record
their module marks and instantly see whether they're passing, against the official progression rules
in the **PG Student Handbook 2025–2026**.

It’s an installable, offline-capable PWA. **All data stays in your browser** (localStorage) — there is
no backend and no accounts. Built to be used by any PG department.

## Features

- **3-tab app layout** — *Marks* (enter), *Overview* (results & guidance), *Thesis* (Year 2, secondary).
- **Year 1 focus**: Semester 1 / Semester 2 modules, equal-weight (no credits), simple-mean average.
- **At-a-glance verdict**: a status ring (annual average vs the 70 line) + a plain-language banner that
  answers “am I okay, and what next?”, colour-coded by the handbook status.
- **“What to do now”** guidance generated from your marks, including a re-sit simulator
  (the minimum mark a module needs to lift your average to 70).
- **Download PDF report** — an analysis of your marks + next steps (via the browser’s “Save as PDF”).
- **Light / dark themes**, backup **export/import (JSON)**, and editable thresholds.

## The rules it encodes (UKH PG Handbook 2025–2026)

- Module pass **60**; below 60 → **automatic re-sit** (no limit, §5.i).
- **Annual average ≥ 70** to progress **and** every module passed (§5).
- Passed all modules but average < 70 → may re-sit up to **50% of modules** (not automatic; PG Re-sit
  form to ARO). Still < 70 → year failed (§5.ii).
- Failing a year = **termination**; there is **no retake** in PG (§5.iii).
- A re-sit mark is **final even if lower** and is not capped at 60 (§5.v).
- Dissertation pass **70**; thesis = Written 30 / Oral 20 / Manuscript 40 / Supervisor 10 (§6).
- Cumulative = coursework **66.67%** + dissertation **33.33%**; module marks round at .5, averages
  unrounded (§4.2).

> A planning aid only — always confirm decisions with your department and the Academic Registrar’s Office.

## Tech

Next.js 16 (App Router, static export) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui (base-nova) · lucide-react · next-themes. The rules engine lives in
[`src/lib/rules.ts`](src/lib/rules.ts) and is framework-free and unit-tested in logic.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export to ./out
```

## Deploy (free)

The app is a **static export** (`output: "export"` in [`next.config.ts`](next.config.ts)), so it can be
hosted anywhere static.

- **Vercel** (recommended for a private repo): import the repo → it auto-detects Next.js → deploy. Free Hobby tier supports private repos.
- **Cloudflare Pages**: connect the repo, build command `npm run build`, output dir `out`. Free, supports private repos.
- **GitHub Pages**: works for **public** repos for free (private repos need GitHub Pro). For a project
  sub-path, build with `NEXT_PUBLIC_BASE_PATH="/<repo>" npm run build`.

## Privacy

Your marks never leave your device. Use **≡ → Export backup** to move data between phones/computers.
