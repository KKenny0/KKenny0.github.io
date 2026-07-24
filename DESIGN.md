# Personal field journal

## Theme

Warm editorial material with the density of a working notebook. Real project artifacts are the visual anchors. Layout changes with the evidence instead of forcing every project into one card.

## Palette

- Parchment: `oklch(96% 0.012 88)`
- Paper: `oklch(98.5% 0.006 88)`
- Ink: `oklch(22% 0.018 62)`
- Muted ink: `oklch(48% 0.018 62)`
- Ink blue: `oklch(35% 0.075 252)`
- Vermilion note: `oklch(56% 0.18 32)`

Ink blue carries navigation and structure. Vermilion appears only as marginalia, current-state marks, and small annotations.

## Typography

- Display and reading: Literata, with Songti SC and Noto Serif SC fallbacks
- UI and body: system sans, with PingFang SC and Noto Sans SC fallbacks
- Metadata: JetBrains Mono
- Display tracking: `-0.035em`; CJK never receives negative tracking

## Layout

A full-width editorial frame capped at 1280px. Sections use a 12-column grid on desktop and a single content flow on mobile. Outer whitespace is generous, but evidence blocks remain dense.

## Components

- Masthead: identity, three routes, Index, theme
- Practice switcher: three quiet text tabs with an inline evidence panel
- Flagship cases: three deliberately different layouts
- Project library: grouped shelves of book-like volumes; each cover expands into an evidence spread
- Notes folio: a file index beside one focused working-paper sheet, with sequential controls
- About: compact professional record and research archive

## Motion

Only opacity and transform. Practice panels cross-fade, project spreads open with a short horizontal reveal, and note sheets settle into place. Reduced motion disables all three.

## Do

- Use real screenshots and outputs
- Let content determine geometry
- Keep page scans understandable from headings
- Preserve strong light and dark material hierarchy

## Do not

- No system diagrams, gradients, glass, generic dashboards, uniform card grids, decorative metrics, or pseudo-technical labels
- No live GitHub API dependency
- No profile hero repeated on subpages

## Responsive

- 1024px: artifact columns compress without narrowing body copy below 28ch
- 760px: masthead wraps, cases become vertical
- 375px: three primary routes remain visible, all targets remain at least 40px
