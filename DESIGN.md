# Personal field journal

## Theme

An abstract research desk for a personal field journal. Warm editorial materials overlap on one ruled work surface: a volume opens horizontally, filed sheets slide into reading position, and loose records sit at imperfect angles. Utility is secondary to the feeling of encountering an active body of work. Real project artifacts remain the visual anchors.

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

A full-width editorial frame capped at 1280px. The homepage is one continuous ruled desk rather than a stack of sections. Paper objects overlap across the shared 12-column grid, using uneven angles, negative space, and depth to connect adjacent material.

## Components

- Masthead: identity, three routes, Index, theme
- Homepage desk: identity thesis, Issue 00 frontispiece, and a loose contents card
- Current plate: a blue Clipplane folder, an overlapping field note, one full artifact, and two loose related records
- Folio dispatch: the three latest notes appear as filed sheets without copying the full folio controls
- Project library: grouped shelves of book-like volumes; each cover expands into an evidence spread
- Notes folio: a file index beside one focused working-paper sheet, with sequential controls
- About: compact professional record and research archive

## Motion

Only opacity and transform. Project material opens horizontally, note sheets settle into place with a slight rotation, and desktop pointer movement creates a restrained parallax drift between loose objects. Reduced motion disables all three.

## Do

- Use real screenshots and outputs
- Let content determine geometry
- Keep page scans understandable from headings
- Preserve strong light and dark material hierarchy
- Keep the homepage as front matter and routing context; full browsing tools belong on their destination pages
- Let headings, notes, and evidence share one continuous vertical field
- Allow controlled rotation, overlap, and decorative displacement on the homepage

## Do not

- No system diagrams, digital glow gradients, glass, generic dashboards, uniform card grids, or decorative metrics
- No full-width dividers or repeated screen-like section openings on the homepage
- No live GitHub API dependency
- No profile hero repeated on subpages

## Responsive

- 1024px: artifact columns compress without narrowing body copy below 28ch
- 760px: masthead wraps, cases become vertical
- 375px: three primary routes remain visible, all targets remain at least 40px
