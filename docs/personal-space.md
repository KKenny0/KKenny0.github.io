# Personal space

The Studio, Projects, Notes and About pages share BaseLayout and personal-space.css. Existing project details, support and redirect routes remain available. Legacy styles are imported into a lower CSS layer so those pages retain their presentation.

Projects and search read src/data/projects.ts; notes and search read the existing writings data, including stable article IDs for fragment links. Continue using notes:merge for article updates. Do not copy prototype article lists into production pages.

The Clipplane interaction is a single-item, in-memory demonstration. It never contacts an extension, storage host or external service. The theme is the only persisted preference; blocked browser storage must not disable navigation or interactions.

Validation before deployment:

```sh
npm ci
npm run notes:check
npm run build
npm run check:site
```

Also inspect desktop and mobile layouts, themes, search and deep links, capture/undo/reset, notes filters, and the existing Tracework, weave and support pages in the built preview. Automated checks validate local routes/assets/fragments and all article IDs, but do not check remote websites or replace visual inspection.

The existing GitHub Pages workflow deploys pushes to master. Keep site changes scoped; a rollback should revert only the design change so later article updates remain intact.
