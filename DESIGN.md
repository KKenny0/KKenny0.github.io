# Kenny Wu — Cerulean Ink Studio

## Approved direction

The **Cerulean Ink Studio (B2)** architectural exhibition layout is the visual and interaction baseline for the personal site (`/` and `/zh/`).
Visitors land on a clear two-column architectural layout: a sticky `296px` left directory rail (`StudioShell`) and a spacious right exhibition stage (`StudioHome` / `SpaceApp`).
Every directory page (`Home`, `About`, `Projects`, `Writing`, `Support`) and the four lenses (`Online`, `Taste`, `AI`, `Execution`) remain one click away with real HTML `<a href>` links before JavaScript hydrates.

The default entry is English (`/`), with full bilingual mirroring under `/zh/`. Theme defaults to the system color scheme; visitors can explicitly choose System, Light or Dark from the rail header.

## Scenes and content

- **Exhibition Home (`StudioHome`)**: Six numbered plates (`N°01`–`N°06`) showcasing `VideoWipe` (interactive before/after slider), `Kami Reader` (`Taste`), `Script-Weaver` (`AI` schematic), `Online` observations, `Execution` delivery evidence, and the four lens characters.
- **Online**: Observation tuner with stepper, observation list, summaries and original-source links, plus full archive access under `/notes/`.
- **Taste**: Products first (`Kami Reader`, `card-skill`), then individual outputs inside `TasteViewer` with aspect-preserving framing and zoom modal.
- **AI**: GitHub projects (`Script-Weaver`, `VideoWipe`) and technical writing (`Agent Memory Systems`, `Claude Code Compact`) presented side by side with comparable weight.
- **Execution**: 4-stage pipeline, bounded recovery and independent evaluation evidence, linked back to the public work record.
- **Projects**: Searchable, filterable and sortable work index (`selected`, `stars`, `updated`, archived toggle), using fresh snapshot counts from `collage-metrics.json` when present.
- **About**: Single-column editorial intro + coordinates strip (no duplicate portrait beside the left rail `FIG. 00`), followed by the complete experience, publications, awards (with 3-column layout for timeline photos) and links in `space-about.json`.
- **Support**: Feedback, sharing and star pathways alongside voluntary contribution QR codes and PayPal inside the shared `StudioShell`.

Use the Script-Weaver schematic until Kenny supplies a current screenshot. Never use the obsolete local workbench screenshot. Label professional diagrams as diagrams. Keep fixed evaluation sets, internal tests and individual task runs distinguishable.

## Typography

Follow Kami’s typography principles. Titles, body and ordinary controls share a serif family within each language. Chinese uses local JinKai W04 / W05, then Charter, Georgia and CJK serif fallbacks. English uses Charter first. Metadata uses JetBrains Mono, Consolas and the page serif fallback. Symbols have a separate system symbol stack. Do not introduce a sans-serif display or control family.

Body weight is 400; titles and emphasis use 500. Chinese has genuine separate weights. Charter uses the supplied Regular outlines for 400–500; disable synthetic bold and italic. Rebuild local font subsets after changing copy, including the complete professional content rather than only Home.

## Surfaces and color tokens (Cerulean Ink · B2)

- **Light**: Pure white canvas (`#ffffff`), cool alabaster rail (`#f7f8fa`), light mat (`#f3f5f9`), ink (`#0f131a`), muted subtext (`#5c6473`), Cerulean Ink accent (`#026aa2`), hairline rules (`rgba(15, 19, 26, 0.09)`), and `2px` chapter datum rules (`#0f131a`).
- **Dark**: Deep ink canvas (`#0b0d12`), rail (`#11141c`), elevated surface (`#141822`), mat (`#1a202d`), light ink (`#f5f7fa`), muted subtext (`#94a0b8`), luminous cerulean accent (`#53b1fd`), hairline rules (`rgba(245, 247, 250, 0.10)`).
- **Portrait**: Left-rail `FIG. 00` displays the full uncropped `1:1` portrait (`object-fit: contain`, `max-height: 240px`).
- **Motion**: Restrained `240ms` view entrances; honor `prefers-reduced-motion`.

## Production acceptance

Keep Astro static output, bilingual entry pages and the existing data sources.
No browser Babel, React development build, remote font runtime or new backend.
Verify built routes, assets, keyboard operation, mobile layouts, themes, language switching, zoom and browser history. Public deployment follows review of the complete local production build.
