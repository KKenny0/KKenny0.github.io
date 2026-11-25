# Kenny Wu — Director’s Cut & Optical Eraser Loupe

## Approved direction

The **Director’s Cut & Optical Eraser Loupe** borderless editorial layout is the visual and interaction baseline for the personal site (`/` and `/zh/`).
Instead of a traditional sidebar-and-card-grid template, the site unfolds like an avant-garde monograph and 35mm director’s storyboard:
- **Top Editorial Masthead (`StudioShell`)**: A translucent horizontal masthead keeps the wordmark, directory pages (`00–04`), four persona lenses (`01–04`), theme switcher (`System / Light / Dark`), language switcher (`EN / 中`), and contact pill accessible across all pages without caging the canvas inside a left sidebar.
- **Act I — Poster Overprint Hero & 4-Character Horizon Cast**: Monumental serif typography overlaps the uncropped `1:1` fisheye checkerboard portrait (`FRAME 00A`, slightly tilted like a 35mm contact print). Below, the four hand-drawn characters (`online.webp`, `taste.webp`, `ai.webp`, `execution.webp`) stand freely on an open horizon rule with spotlight dimming and speech bubbles.
- **Act II — Scene 01 (`The Eraser Loupe`)**: A borderless widescreen `VideoWipe` stage where moving the pointer sweeps a circular **Optical Eraser Loupe** (`clip-path: circle(...)` with HUD crosshairs) that erases burned-in subtitles in real time, paired with a `LOUPE / CURTAIN` mode switch and an accessible `#cg-comparison` scrub slider.
- **Act III — Scene 02 (`Taste & Typography`)**: An asymmetric desk spread layering `Kami Reader` (`kami.png`) and the tilted `A Thousand Brains` poster (`thousand-brains.png`) with `taste.webp` marginalia and live Obsidian download/star metrics.
- **Act IV — Scene 03 & 04 (`35mm Director’s Storyboard Strip`)**: A 4-cut horizontal contact strip (`CUT 01` → `CUT 04`) connecting `Script-Weaver`, cross-episode identity lock (`1,285s → 24s`), storyboard grading (`≈18% → 9.53%`), and 20-episode bounded recovery, followed by the `Kotaemon` upstream contribution ledger (`#287`, `#341`, `#461`).
- **Act V — Scene 05 (`Observation Ledger & Perched Manuscript`)**: A monumental numbered observation list (`01`–`05`) paired with a tilted folded-corner manuscript sheet where `ai-perch.webp` perches on the top paper edge above the flagship AI essays.

## Typography

Follow Kami’s typography principles. Titles, body and ordinary controls share a serif family within each language. Chinese uses local JinKai W04 / W05, then Charter, Georgia and CJK serif fallbacks. English uses Charter first. Metadata uses JetBrains Mono, Consolas and the page serif fallback. Symbols have a separate system symbol stack. Do not introduce a sans-serif display or control family.

## Surfaces and color tokens

- **Light**: Warm gallery chalk (`#faf9f5`), soft stone mat (`#f1efe8`), folded manuscript sheet (`#f3efe4`), deep carbon ink (`#111318`), muted subtext (`#585e6a`), Cerulean Ink (`#026aa2`), and Film Signal Vermilion (`#d94826`).
- **Dark**: Cinema darkroom obsidian (`#0b0d12`), elevated surface (`#131822`), mat (`#171d29`), warm ivory ink (`#f4f3ee`), muted subtext (`#96a0b5`), luminous cerulean (`#53b1fd`), and signal orange (`#ff6442`).

## Production acceptance

Keep Astro static output, bilingual entry pages and the existing data sources.
Run `npm run notes:check && npm run build && npm run check:site` before deploying to GitHub Pages.
