# KKenny0.github.io
<a href='http://kkenny0.github.io/'>My Homepage.</a>

The accepted delivery portfolio (designs/kenny-delivery-v2) is implemented in Astro. English routes are `/`,
`/projects/`, and `/about/`; Chinese routes use the `/zh/` prefix. Both versions
share `src/layouts/PortfolioLayout.astro`, `src/styles/portfolio.css`, and
`src/scripts/portfolio.js`. Keep corresponding page copy in sync when editing.
Language and theme choices are remembered locally; project filters and sorting
are preserved in the URL and across language changes. Notes share the portfolio layout, with English at `/notes/` and Chinese at `/zh/notes/`.
Weave, Tracework and Support also use PortfolioLayout, with matching `/zh/` routes.
Project stories share `src/styles/project-story.css`; legacy redirects retain their routes.
Collection filtering is shared through `src/scripts/collection.js`.

The portfolio prioritizes professional credibility and project conversations.
Both layouts use Home / Projects / Notes / About from `src/data/navigation.ts`,
with Chinese labels on Chinese pages. Notes use translated English titles and summaries from `src/data/writings.en.json`; original articles remain Chinese on Zhihu.
Home keeps contact links at the beginning and end; intermediate links lead to
supporting work instead of repeating contact prompts. Projects use inline
disclosures with explicit Expand / Collapse labels and a single-column mobile
index, preserving browsing context and direct project links.

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

Responsive images are checked in under `public/assets/optimized/`, with dimensions
and candidates in `src/data/images.generated.json`. After replacing an original
image or adding project artwork, run `npm run images:build` and commit both outputs.
`ResponsiveImage.astro` uses these dimensions to reserve layout space. About
loads small previews and fetches the original only when enlarged. English pages
use system serif/CJK fallbacks; Chinese pages retain the custom font subsets.

Run `npm run dev` for development. Before release, run `npm run notes:check`,
`npm run build`, and `npm run check:site`. Use `npm run preview` to inspect the
production build. Pushes to `master` deploy through the existing Pages workflow.
