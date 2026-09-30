# KKenny0.github.io
<a href='http://kkenny0.github.io/'>My Homepage.</a>

The accepted compact portfolio is implemented in Astro. English routes are `/`,
`/projects/`, and `/about/`; Chinese routes use the `/zh/` prefix. Both versions
share `src/layouts/PortfolioLayout.astro`, `src/styles/portfolio.css`, and
`src/scripts/portfolio.js`. Keep corresponding page copy in sync when editing.
Language and theme choices are remembered locally. Notes, support, case studies,
and legacy redirects retain their existing routes.

Project metadata and account totals use a dated snapshot (2026-09-30), not a live
GitHub request. Update src/data/projects.ts once to keep both languages, homepage
selections, project sorting, archive status and legacy search in sync. The index
shows 21 non-archived projects and 2 archived projects; forks, the site, profile
and shared configuration repositories are omitted. Account stars/forks cover all
26 non-fork repositories, including the omitted profile and archived repositories.
Last push dates are displayed in Asia/Shanghai, and do not imply ongoing maintenance.
Kami typography uses local WOFF2 subsets; see public/assets/fonts/README.md.
Focus images are repository-sourced; BuddyBar artwork is labelled historical,
and weave uses its logo because no interface screenshot was available.

Run `npm run dev` for development. Before release, run `npm run notes:check`,
`npm run build`, and `npm run check:site`. Use `npm run preview` to inspect the
production build. Pushes to `master` deploy through the existing Pages workflow.
