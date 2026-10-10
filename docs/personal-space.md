# Personal space

Home, Projects, Notes, About, weave, Tracework and Support share PortfolioLayout and portfolio.css in both languages. Project stories share project-story.css; Support uses scoped styles. BaseLayout and personal-space.css are retained as unused legacy source, not loaded by these pages.

Projects and search read src/data/projects.ts; notes and search read the existing writings data, including stable article IDs for fragment links. Continue using notes:merge for article updates. Do not copy prototype article lists into production pages.

The Clipplane interaction is a single-item, in-memory demonstration. It never contacts an extension, storage host or external service. Language and theme preferences are persisted; blocked browser storage must not disable navigation or interactions.

Validation before deployment:

```sh
npm ci
npm run notes:check
npm run build
npm run check:site
```

Also inspect desktop and mobile layouts, themes, language switching and deep links, notes filters, and the Tracework, weave and support pages in the built preview. Automated checks validate local routes/assets/fragments and all article IDs, but do not check remote websites or replace visual inspection.

The existing GitHub Pages workflow deploys pushes to master. Keep site changes scoped; a rollback should revert only the design change so later article updates remain intact.
