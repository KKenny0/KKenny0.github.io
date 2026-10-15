# Personal space

## Runtime

Astro statically renders all entry routes. SpacePage.astro pre-renders the React
SpaceApp and hydrates it with client:load. One interaction root owns Home, lens
views, Projects, Notes, Taste outputs and About. Existing weave, Tracework and
Support retain their contents in PortfolioLayout with a quiet frame and shared
typography principles. Scene CSS is not loaded there.

English is the default at /; explicit Chinese links use /zh/. The explicit URL determines language. Settings
links preserve the selected work. Theme uses kenny-space-theme in localStorage,
with guarded access. Theme defaults to system, follows live system changes, and offers explicit light/dark overrides. Home and legacy project stories share ThemeHead and the same controller. History entries preserve selection, search, filters, scroll
and focus. A guarded sessionStorage fallback handles embedded browsers that recreate
documents during Back/Forward. Blocked storage does not prevent navigation.

## Routes

| Destination | English path (Chinese adds /zh) |
| --- | --- |
| Home | / |
| Lens | /lens/online/, /lens/taste/, /lens/ai/, /lens/execution/ |
| Work collection | /projects/ |
| Selected project | /work/<slug>/ |
| Notes archive | /notes/ |
| Selected observation | /notes/online/<id>/ |
| Professional article | /notes/ai/<id>/ |
| Taste output | /taste/<product>/<stable-work-id>/ |
| About | /about/ |

The complete Notes tuner also has Online-context URLs for the two AI selections;
canonical URLs point to the primary AI view. ?from= retains the originating lens
for project and About links. Existing case stories keep /projects/weave/ and
/projects/tracework/. The historical bare /work/ redirects to About and does not
conflict with selected project paths.

Legacy Projects slug fragments, #note-<id>, Notes ?topic= and About section
fragments remain supported. Historical aliases preserve query and hash.

## Data and assets

- src/data/projects.ts remains authoritative: 23 projects including two archived
  records. The default collection shows 21 active projects. Reviewed copy changes
  preserve stars, forks, update dates and other source fields.
- src/data/writings.json remains authoritative for 16 articles. Continue using
  notes:merge. Do not copy prototype lists into it.
- src/data/space.js joins lens curation, display overrides and two clearly labeled
  WeChat collection observations. Collection URLs are not represented as confirmed
  individual article URLs or inserted into writings.json.
- src/data/space-i18n.js contains reviewed English display copy and artwork labels,
  with the existing writings.en.json as fallback.
- src/data/space-about.json preserves the full former About sections in both
  languages. This is trusted local HTML, not external or user-submitted HTML. Keep
  original outcomes, qualifiers, papers, awards, conference photo and contact links.
- public/assets/space contains approved local assets and fonts. Images use the
  existing Sharp pipeline and images.generated.json. Full originals remain
  available; only assets used by the current scene are rendered.

scripts/subset-space-fonts.py rebuilds both genuine JinKai weights from locally
supplied complete fonts. It checks current source characters and preserves the
previous subset. Charter’s license is in public/assets/space/Charter-LICENSE.txt.

## Validation and release

```sh
npm ci
npm run notes:check
npm run images:build  # when sources change; commit generated assets
npm run build
npm run check:site
npm run preview -- --host 127.0.0.1 --port 4330
```

check:site validates route/locale round trips, stable artwork IDs, legacy links,
local assets and fragments, retained content, bilingual SSR and existing case
interaction checks. It does not check remote websites or replace browser review.
Review zoom, wheel/keyboard switching, history, empty search, archived projects,
language/theme changes and representative phone/wide layouts.

The GitHub Pages workflow deploys pushes to master. Review the complete local
change before publishing. Roll back the migration independently of later content updates.
