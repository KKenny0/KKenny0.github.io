# KKenny0.github.io
<a href='http://kkenny0.github.io/'>My Homepage.</a>

The accepted compact portfolio is implemented in Astro. English routes are `/`,
`/projects/`, and `/about/`; Chinese routes use the `/zh/` prefix. Both versions
share `src/layouts/PortfolioLayout.astro`, `src/styles/portfolio.css`, and
`src/scripts/portfolio.js`. Keep corresponding page copy in sync when editing.
Language and theme choices are remembered locally. Notes, support, case studies,
and legacy redirects retain their existing routes.

Project stars are a dated snapshot (2026-09-24), not a live GitHub request.
Focus images are repository-sourced; BuddyBar artwork is labelled historical,
and weave uses its logo because no interface screenshot was available.

Run `npm run dev` for development. Before release, run `npm run notes:check`,
`npm run build`, and `npm run check:site`. Use `npm run preview` to inspect the
production build. Pushes to `master` deploy through the existing Pages workflow.
