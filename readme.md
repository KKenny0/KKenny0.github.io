# KKenny0.github.io
<a href='http://kkenny0.github.io/'>My Homepage.</a>

The homepage is one shared space organized around Online, Taste, AI and Execution.
Astro renders static content and real links; one React root manages scene transitions,
work selection and browsing history. English is the default at `/`; Chinese routes
use the `/zh/` prefix. The shared implementation lives in `src/components/space/`,
`src/layouts/SpaceLayout.astro` and `src/styles/space.css`.
Projects, Notes, Taste artwork and About have direct routes that work on refresh.
Language switching keeps the selected work. Theme defaults to the system appearance;
manual Light/Dark choices are remembered locally.
Weave, Tracework and Support also use PortfolioLayout, with matching `/zh/` routes.
Project stories share `src/styles/project-story.css`; legacy redirects retain their routes.
Notes use translated English titles and summaries from `src/data/writings.en.json`;
original articles remain Chinese. The complete archive extends the Online tuner.
Projects use a searchable work table with a scrolling index; Taste keeps a stable
artwork frame and enlarges the image in place. See `docs/personal-space.md` for
the route and content model, and `docs/home-space-release-check.md` for verification.

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
Image components use these dimensions to reserve layout space. English pages use
local Charter with JinKai for CJK fallback; Chinese pages put JinKai first.
Both languages use actual regular and medium font files.

Run `npm run dev` for development. Before release, run `npm run notes:check`,
`npm run build`, and `npm run check:site`. Use `npm run preview` to inspect the
production build. Pushes to `master` deploy through the existing Pages workflow.
