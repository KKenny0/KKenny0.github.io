# Kenny Ponders: compact paper portfolio

## Theme

A personal maker's index with Kami's ink-on-paper typography. Keep the accepted
compact structure, real work, and one small homepage illustration. Identity and
project names lead; supporting copy and dated metadata follow.

## Palette

Light canvas #f5f4ed, ink #141413, supporting text #504e49, rules #e8e6dc, and
ink-blue links #1B365D. Retain the small vermilion identity mark. Dark mode keeps
the existing warm OKLCH canvas, lighter ink and blue; it is not an inverted image.

## Typography

Chinese: locally hosted TsangerJinKai02, then Charter/Georgia and CJK serif
fallbacks. English: Charter/Georgia with the same CJK fallbacks. Metadata:
JetBrains Mono, then Consolas. Titles and body share the serif family.

- Display: 40-56px homepage, 32-38px subpages, weight 500, line-height 1.2.
- Section and project titles: 22-24px, weight 500.
- Reading: 16px, weight 400, line-height 1.55; supporting copy 14px.
- Metadata and captions: 11-12px; numeric columns use tabular figures.
- No negative tracking on Chinese headings. Use the real 400/500 font files.
- Native small controls retain clear focus outlines and at least 44px height.

## Components

Shared masthead with language and theme controls; four selected projects on the
homepage; project disclosures with categories, sorting, real previews and a
collapsed archive group; plain text GitHub totals with explicit snapshot scope.
No-image projects show an honest text notice and never reuse the last screenshot.
About preserves its timeline, awards, research and photo viewer.

## Layout

One shared stylesheet, no new styling framework. Frame maximum 1096px with
36px desktop padding. The homepage and project index retain their existing
content/sidebar split. Project bodies stay within 65ch; lists are separated by
neutral hairlines. Use 8/16/24/32/48px gaps instead of separate card containers.

## Depth and motion

Flat paper and a quiet background step for the preview. No new shadows or
parallax. Preserve the short pointer disclosure reveal and press feedback.
Keyboard changes and reduced-motion preferences suppress motion.

## Do and don't

- Use repository facts and real artwork; distinguish screenshots, diagrams and historical artwork.
- Keep homepage and both project locales on src/data/projects.ts.
- Show the snapshot date; last push is not proof of ongoing maintenance.
- GitHub stars/forks use all non-fork public repositories. The showcase excludes forks and profile/configuration/site repositories.
- Keep archived projects discoverable and their old fragment links valid.
- Do not fetch GitHub or fonts from third-party services when visitors load pages.
- Keep notes, support and existing case-study routes on their current styles.

## Responsive

At 850px reduce column gaps. At 640px wrap the navigation and use one column;
hide the sidebar and homepage illustration. Keep project names and dates usable
at 375px and 320px without horizontal scrolling. Native disclosures remain usable
without JavaScript; archive links open their parent group when scripting is on.

## Prompt guide

- Extend the project list with a 24px serif title at weight 500, 14px supporting text at line-height 1.55, and #e8e6dc rules on #f5f4ed.
- Add reading copy at 16px serif weight 400 and line-height 1.55, max-width 65ch; use #504e49 for secondary copy and #1B365D for links.
- Keep project metrics inline: 12px JetBrains Mono, tabular numbers, no shadow or colored card; controls retain 44px targets and visible focus.

Reference: https://kami.tw93.fun/index-zh.html, verified 2026-09-30.
