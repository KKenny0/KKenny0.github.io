# Kenny Ponders: compact paper portfolio

## Audience and intent

The primary audience is potential collaborators. The intended takeaway is that
Kenny can reliably deliver outcomes in his area of expertise. Visitors should
understand his capabilities and know how to contact him. His professional scope
is AI application and systems engineering, including language processing,
information retrieval, and multimodal applications. Reliable delivery means
taking responsibility for agreed outcomes and bringing problems to an
acceptable result, with concrete evidence of quality and stability.

## Theme

Retain the accepted typography and paper palette while strengthening the
presentation of representative work and Kenny's engineering judgment.

A personal engineering portfolio with Kami's ink-on-paper typography. Give
representative delivery work a clear focal point, followed by engineering
judgment, open-source work, and a concrete invitation to collaborate. Retain the
small personal illustration as a supporting identity detail.

## Agreed content direction

- Lead with the AI comics generation system as the delivery case. Use enterprise
  document Q&A as a supporting case to show the breadth of the professional scope.
- Express personality through engineering judgment and trade-offs: how Kenny
  assesses quality, handles failure, and brings work to acceptance.
- Invite collaboration on technical planning and engineering delivery for AI
  applications. Quality and stability improvement are capabilities within this work.

## Proposed page changes

This proposal awaits confirmation of the complete direction before page edits.
The implementation scope is the homepage, Projects, and About in both languages.

- Homepage: a clear professional introduction, a prominent AI comics delivery
  case with a workflow illustration and visible outcomes, a compact enterprise
  Q&A case, concrete engineering judgments, selected open-source work, and a
  collaboration invitation. Break up the repeated text-row rhythm with differing
  section proportions and a visible visual focal point.
- Projects: distinguish featured work from the complete repository index, show
  real previews more directly, and keep key previews available on mobile.
  GitHub metrics support the work rather than leading its presentation. Retain
  existing project data, filtering, sorting, archive links, and no-image states.
- About: surface representative outcomes before expandable technical detail.
  Keep the complete experience, research, awards, personal photos, and interests.
  Describe collaboration in the agreed professional scope.

Use existing public work descriptions for professional cases and label workflow
illustrations as diagrams. Preserve Kenny's actual role and the conditions of
each result: fixed-set quality measurements, internal tests, and individual task
runs must remain distinguishable. Use real existing screenshots for open-source
work; professional diagrams and project screenshots have different meanings.

Acceptance: the main pages make the professional scope, a concrete delivery
result, and a contact route clear. Representative evidence is visible without
opening a disclosure. Desktop and mobile both retain meaningful work visuals.
The established typography, paper palette, dark mode, and bilingual navigation
remain coherent. Existing behavior checks and a final full build must pass.

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

Shared masthead with language and theme controls; representative delivery cases
and four selected open-source projects on the homepage; project disclosures with
categories, sorting, real previews and a collapsed archive group; plain text
GitHub totals with explicit snapshot scope.
No-image projects show an honest text notice and never reuse the last screenshot.
About preserves its timeline, awards, research and photo viewer.

## Layout

One shared stylesheet, no new styling framework. Frame maximum 1096px with
36px desktop padding. Vary section proportions to distinguish representative
delivery cases, engineering judgments, and repository lists. Project bodies stay
within 65ch; lists are separated by neutral hairlines. Use 8/16/24/32/48px gaps
instead of separate card containers.

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
stack supporting experience and work previews instead of losing meaningful
evidence. The small homepage illustration may be hidden. Keep project names and
dates usable at 375px and 320px without horizontal scrolling. Native disclosures
remain usable without JavaScript; archive links open their parent group when
scripting is on.

## Prompt guide

- Extend the project list with a 24px serif title at weight 500, 14px supporting text at line-height 1.55, and #e8e6dc rules on #f5f4ed.
- Add reading copy at 16px serif weight 400 and line-height 1.55, max-width 65ch; use #504e49 for secondary copy and #1B365D for links.
- Keep project metrics inline: 12px JetBrains Mono, tabular numbers, no shadow or colored card; controls retain 44px targets and visible focus.

Reference: https://kami.tw93.fun/index-zh.html, verified 2026-09-30.
