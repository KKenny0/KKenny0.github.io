// Run after `npm run build`: node scripts/check-collage.mjs
// Guards bilingual collage routes, inline comparison, original links, and artwork.
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const dist=join(root,'dist');
assert.ok(existsSync(join(dist,'index.html')),'dist/ missing — run `npm run build` before this check');

const decode=html=>html.replace(/&amp;/g,'&');
const pages={en:join(dist,'collage','index.html'),zh:join(dist,'zh','collage','index.html')};
for(const [locale,path] of Object.entries(pages))assert.ok(existsSync(path),`dist/${locale==='zh'?'zh/':''}collage/index.html missing`);

const zh=locale=>locale==='zh';
for(const [locale,path] of Object.entries(pages)){
  const prefix=zh(locale)?'/zh':'';
  const html=decode(readFileSync(path,'utf8'));
  const relative=`${prefix}/collage/`;

  assert.match(html,/<html lang="(zh-CN|en)"/,`${relative}: html lang missing`);
  assert.match(html,/meta name="robots" content="noindex"/,`${relative}: must stay noindex`);
  assert.ok(html.includes('kenny-space-theme'),`${relative}: theme bootstrap missing`);
  assert.match(html,/class="collage"/,`${relative}: island root missing`);

  // Every expandable wall object is a button that opens in the current space.
  const openers=[...html.matchAll(/class="cg-pin-face"[^>]*aria-haspopup="dialog"/g)].length;
  assert.equal(openers,1,`${relative}: expected Kami image to remain expandable, found ${openers}`);
  assert.match(html, /id="cg-comparison"[^>]*type="range"/, `${relative}: wall comparison slider missing`);

  // Direct links: the wall itself reaches the real sources.
  for(const url of ['https://github.com/Cinnamon/kotaemon','https://github.com/KKenny0/videowipe',
    'https://github.com/KKenny0/script-weaver','https://github.com/KKenny0/obsidian-kami',
    'https://github.com/Cinnamon/kotaemon/pull/287','https://github.com/Cinnamon/kotaemon/pull/341','https://github.com/Cinnamon/kotaemon/pull/461']){
    assert.ok(html.includes(url),`${relative}: direct source link missing: ${url}`);
  }
  const repoLinks=[...html.matchAll(/<a class="cg-repo-link" href="([^"]+)"/g)].map(match=>match[1]);
  assert.deepEqual(repoLinks,['https://github.com/Cinnamon/kotaemon','https://github.com/KKenny0/obsidian-kami','https://github.com/KKenny0/videowipe','https://github.com/KKenny0/script-weaver'],`${relative}: project title links must point to the four repositories`);
  assert.doesNotMatch(html,/<p class="cg-metric mono">\s*<a\b/,`${relative}: project metrics must not add a separate GitHub link`);
  for(const url of ['https://community.obsidian.md/themes/kami-reader','https://obsidian.md/plugins?id=kami-reader-companion'])assert.ok(html.includes(url),`${relative}: Kami metric link missing: ${url}`);
  const noteLinks=[...html.matchAll(/class="cg-pin-face" href="(https:[^"]+)"/g)].map(match=>match[1]);
  assert.ok(noteLinks.some(url=>/^https:\/\/(zhuanlan\.zhihu\.com|mp\.weixin\.qq\.com)/.test(url)),`${relative}: observation cards must link to the real originals`);
  assert.ok(noteLinks.filter(url=>/^(https:\/\/zhuanlan\.zhihu\.com|https:\/\/mp\.weixin\.qq\.com)/.test(url)).length>=2,`${relative}: both observation cards need original links`);

  // Comparison deep dive ships the real before/after material.
  assert.match(html,/videowipe-before[^"]*\.webp/,`${relative}: before material missing`);
  assert.match(html,/videowipe-after[^"]*\.webp/,`${relative}: after material missing`);

  // Direct entries stay in the isolated collage prototype and have built pages.
  for(const target of ['about/','projects/','notes/','support/','lens/online/','lens/taste/','lens/ai/','lens/execution/']){
    assert.ok(html.includes(`href="${relative}${target}"`),`${relative}: entry to ${target} missing`);
    assert.ok(existsSync(join(dist,prefix,'collage',target,'index.html')),`${relative}${target}: page missing`);
  }

  // Portrait and hand-drawn characters use the real repo artwork.
  for(const asset of ['self-profo','taste','ai','kami']){
    assert.match(html,new RegExp(`/assets/(optimized/space-)?${asset}[^"]*\\.(jpg|png|webp)`),`${relative}: real artwork missing: ${asset}`);
  }

  // Same-origin links only go to assets, the real site sections, or sibling prototypes.
  for(const href of [...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1])){
    if(href.startsWith('#')||/^(https?:)?\/\//.test(href)||href.startsWith('mailto:'))continue;
    assert.match(href,/^(\/(zh)?\/?$|\/(zh\/)?(about|projects|notes|collage|workbench|onepage|studio|assets|_astro)\b)/,`${relative}: unexpected internal link: ${href}`);
  }
}

// The language mirrors must point at each other, with localized wall copy.
const en=decode(readFileSync(pages.en,'utf8'));
const zhHtml=decode(readFileSync(pages.zh,'utf8'));
assert.ok(en.includes('href="/zh/collage/"')&&zhHtml.includes('href="/collage/"'),'collage language mirrors must point at each other');
assert.ok(en.includes('THE COLLAGE WALL · ONE PINBOARD')&&zhHtml.includes('拼贴墙 · 一块软木板'),'localized masthead kickers missing');
assert.ok(en.includes('Drag or use arrow keys to compare')&&zhHtml.includes('拖动或使用方向键比较'),'localized comparison copy missing');
assert.ok(en.includes('EXTERNAL OPEN SOURCE · CONTRIBUTOR')&&zhHtml.includes('外部开源项目 · 贡献者'),'localized contributor attribution missing');
assert.ok(en.includes('Script-Weaver')&&zhHtml.includes('Script-Weaver'),'Script-Weaver missing');

// Check the actual production homepages, independently of the isolated prototypes.
const origin='https://kkenny0.github.io';
for(const locale of ['en','zh']){
  const prefix=locale==='zh'?'/zh':'';
  const html=decode(readFileSync(join(dist,prefix,'index.html'),'utf8'));
  const head=html.match(/<head>[\s\S]*?<\/head>/)?.[0];
  assert.ok(head,`${prefix||'/'}: missing SSR head`);
  assert.match(html,new RegExp(`<html lang="${locale==='zh'?'zh-CN':'en'}"`));
  assert.ok(head.includes(`rel="canonical" href="${origin}${prefix}/"`),`${prefix||'/'}: incorrect canonical`);
  for(const [language,url] of [['en',`${origin}/`],['zh-CN',`${origin}/zh/`],['x-default',`${origin}/`]]){
    assert.ok(head.includes(`rel="alternate" hreflang="${language}" href="${url}"`),`${prefix||'/'}: incorrect ${language} alternate`);
  }
  for(const tag of head.match(/<meta\b[^>]*>/g)||[]){
    if(/name="(?:robots|googlebot)"/i.test(tag))assert.doesNotMatch(tag,/noindex|none/i,`${prefix||'/'}: homepage must be indexable`);
  }
  assert.match(html,/<main\b/,`${prefix||'/'}: missing SSR main`);
  assert.match(html,/class="collage"/,`${prefix||'/'}: missing SSR collage`);
  assert.match(html,/id="cg-comparison"[^>]*type="range"/,`${prefix||'/'}: missing comparison`);
  assert.ok(html.includes(locale==='zh'?'拼贴墙 · 一块软木板':'THE COLLAGE WALL · ONE PINBOARD'),`${prefix||'/'}: localized content missing`);
  assert.ok(html.includes(locale==='zh'?'拖动或使用方向键比较':'Drag or use arrow keys to compare'),`${prefix||'/'}: localized comparison missing`);
  for(const name of ['Script-Weaver','VideoWipe','Kotaemon'])assert.ok(html.toLowerCase().includes(name.toLowerCase()),`${prefix||'/'}: ${name} missing`);
  const hrefs=[...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(match=>match[1]);
  assert.ok(hrefs.includes(locale==='zh'?'/':'/zh/'),`${prefix||'/'}: language switch missing`);
  for(const target of ['about/','projects/','notes/','support/','lens/online/','lens/taste/','lens/ai/','lens/execution/']){
    assert.ok(hrefs.includes(`${prefix}/${target}`),`${prefix||'/'}: missing formal entry ${target}`);
    assert.ok(existsSync(join(dist,prefix,target,'index.html')),`${prefix}/${target}: page missing`);
  }
  for(const href of hrefs.filter(h=>h.startsWith('/')))assert.doesNotMatch(href,/^\/(?:zh\/)?(?:collage|prototype|onepage|studio|workbench)(?:\/|$)/,`${prefix||'/'}: prototype link ${href}`);
  for(const target of ['projects/tracework/','projects/weave/','work/videowipe/','notes/online/goal/','taste/card-skill/thousand-brains/']){
    assert.ok(existsSync(join(dist,prefix,target,'index.html')),`${prefix}/${target}: deep link missing`);
  }
}
console.log('PASS: collage prototypes and production bilingual SSR, SEO, formal entries, deep links and localized content.');
