# Kenny Wu — one person, four lenses

## Approved direction

The accepted home-as-one-space prototype is the visual and interaction baseline.
Home introduces Online, Taste, AI and Execution as four states of one character.
Visitors start with the characters, then move closer to explore work. The earlier
Making / Delivery / Attention scheme is superseded.

The default entry is English. Theme defaults to the system color scheme; visitors can explicitly choose Light or Dark.

Home stays immersive. Keep Kenny Wu and Contact at the top and settings at the
edge. Projects, Notes and About belong to the browsing experience. Do not restore
the full horizontal navigation menu.

## Scenes and content

- Online: a tuner. Wheel, swipe, arrow keys and the observation rail change the
  observation. The orbit marker and character follow the selection. Expand into
  Notes without replacing the viewing surface.
- Taste: products first, then individual outputs in a consistent viewing area.
  Preserve each artwork’s aspect ratio. Zoom enlarges the artwork in place;
  close restores focus and the original frame.
- AI: GitHub projects and professional articles are independent work types with
  comparable weight. Use a system surface for projects and a paper surface for
  writing. Initial selections: Script-Weaver, VideoWipe, Agent Memory Systems and
  Claude Code Compact. Keep whitespace and the small hovering character.
- Execution: show work in practice and qualified results, with paths into Projects
  and the complete professional record.
- Projects: one work surface and a browsable index. Preserve search, categories,
  sorting, archived records, source metrics and existing project stories.
- About: portrait, selected experience, and an expandable complete record containing
  all experience, research, awards, photographs, personal material and contact links.

Use the Script-Weaver schematic until Kenny supplies a current screenshot. Never
use the obsolete local workbench screenshot. Label professional diagrams as diagrams.
Keep fixed evaluation sets, internal tests and individual task runs distinguishable.

## Typography

Follow Kami’s typography principles. Titles, body and ordinary controls share a
serif family within each language. Chinese uses local JinKai W04 / W05, then
Charter, Georgia and CJK serif fallbacks. English uses Charter first. Metadata
uses JetBrains Mono, Consolas and the page serif fallback. Symbols have a separate
system symbol stack. Do not introduce a sans-serif display or control family.

Body weight is 400; titles and emphasis use 500. Chinese has genuine separate
weights. Charter uses the supplied Regular outlines for 400–500; disable synthetic
bold and italic. Rebuild local font subsets after changing copy, including the
complete professional content rather than only Home.

## Surfaces and motion

Keep pale paper texture and a linked light field, warm ink, restrained blue and
vermilion accents. Dark mode has its own surface tokens. Existing project stories
and Support keep their content layouts inside the quiet shared frame.

Home follows the approved C playground prototype: tonal clay scenery, four
characters roaming and hopping independently, with a reserved introduction area.
Hover or keyboard focus holds only the current character; collisions cannot
move that target, including its jump height and tilt. Explicit pause remains in
effect across scene navigation and document recreation in the current tab until
the visitor resumes it. Hover styling stays in CSS; motion updates transforms outside
React rendering. Do not animate large background dimensions or blur. Decorative
scenery and light fields must not capture pointer events. Provide a pause control,
respect live reduced-motion preferences, and stop motion while settings are open.

Scene transitions preserve spatial context. Zoom uses transforms and decodes the
image before animating. Return restores selection, filters, scroll and focus.
Every destination has a real URL and an HTML link before JavaScript hydrates.

## Production acceptance

Keep Astro static output, bilingual entry pages and the existing data sources.
No browser Babel, React development build, remote font runtime or new backend.
Verify built routes, assets, legacy fragments, keyboard operation, mobile layouts,
themes, language switching, zoom and browser history. Public deployment follows
review of the complete local production build.
