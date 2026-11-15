// Run after `npm run build`: node scripts/check-onepage.mjs
// Guards the one-page prototype: both locales build, the four sections and
// anchor navigation are server-rendered into the HTML, the four featured
// projects expand in place with real links, writing rows point at the real
// originals, deep dives stay inside the prototype, and the language mirrors
// match. The official site never loads this file's surface.
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const dist=join(root,'dist');
assert.ok(existsSync(join(dist,'index.html')),'dist/ missing — run `npm run build` before this check');

const decode=html=>html.replace(/&amp;/g,'&');
const pages={en:join(dist,'onepage','index.html'),zh:join(dist,'zh','onepage','index.html')};
for(const [locale,path] of Object.entries(pages))assert.ok(existsSync(path),`dist/${locale==='zh'?'zh/':''}onepage/index.html missing`);

const zh=locale=>locale==='zh';
for(const [locale,path] of Object.entries(pages)){
  const prefix=zh(locale)?'/zh':'';
  const html=decode(readFileSync(path,'utf8'));
  const relative=`${prefix}/onepage/`;

  assert.match(html,/<html lang="(zh-CN|en)"/,`${relative}: html lang missing`);
  assert.match(html,/meta name="robots" content="noindex"/,`${relative}: must stay noindex`);
  assert.ok(html.includes('kenny-space-theme'),`${relative}: theme bootstrap missing`);

  // The four sections and the top anchor navigation, really server-rendered.
  for(const id of ['works','writing','record','about']){
    assert.ok(html.includes(`id="${id}"`),`${relative}: section #${id} missing`);
    assert.ok(html.includes(`href="#${id}"`),`${relative}: anchor link to #${id} missing`);
  }
  assert.match(html,/class="workbench onepage"/,`${relative}: island root missing`);
  assert.match(html,/wb-portrait/,`${relative}: portrait hero missing`);

  // The four featured projects, expandable in place.
  for(const slug of ['videowipe','script-weaver','obsidian-kami','tracework']){
    assert.ok(html.includes(`id="w-${slug}"`),`${relative}: expandable card for ${slug} missing`);
  }
  assert.ok(html.includes('<details class="op-work"'),`${relative}: works do not expand in place`);

  // Real project links: GitHub for all four, homepage where one exists.
  assert.ok(html.includes('https://github.com/KKenny0/videowipe'),`${relative}: videowipe GitHub link missing`);
  assert.ok(html.includes('https://github.com/KKenny0/script-weaver'),`${relative}: script-weaver GitHub link missing`);
  assert.ok(html.includes('https://github.com/KKenny0/obsidian-kami'),`${relative}: obsidian-kami GitHub link missing`);
  assert.ok(html.includes('https://github.com/KKenny0/Tracework'),`${relative}: tracework GitHub link missing`);
  assert.ok(html.includes('https://kkenny0.github.io/videowipe/'),`${relative}: videowipe homepage link missing`);

  // Writing rows go straight to the original articles (five recent).
  const noteRows=[...html.matchAll(/class="op-note"[^>]*href="(https:[^"]+)"/g)].map(match=>match[1]);
  assert.equal(noteRows.length,5,`${relative}: expected five recent writing rows, found ${noteRows.length}`);
  for(const url of noteRows)assert.match(url,/^(https:\/\/zhuanlan\.zhihu\.com|https:\/\/mp\.weixin\.qq\.com)/,`${relative}: writing row outside the real sources: ${url}`);

  // Deep dives stay in the prototype: catalog, archive, story, about, support.
  for(const target of ['/prototype/projects/','/prototype/notes/','/prototype/projects/tracework/','/prototype/about/','/prototype/support/']){
    const path=join(dist,target,'index.html');
    assert.ok(existsSync(path)&&statSync(path).isFile(),`${relative}: prototype target missing: ${target}`);
    assert.ok(html.includes(`href="${prefix}${target}"`)||html.includes(`href="${prefix}${target}?`)||html.includes(`href="${prefix}${target.slice(0,-1)}"`),`${relative}: link to ${prefix}${target} missing`);
  }

  // Same-origin links only go to assets, the compare pages, or the prototype.
  for(const href of [...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1])){
    if(href.startsWith('#')||/^(https?:)?\/\//.test(href)||href.startsWith('mailto:'))continue;
    assert.match(href,/^(\/(zh)?\/?onepage\/?$|\/(zh)?\/?$|\/(zh\/)?(workbench|prototype|assets|_astro)\b|\/assets\/)/,`${relative}: unexpected internal link: ${href}`);
  }
}

// The language mirrors must point at each other and carry localized headings.
const en=decode(readFileSync(pages.en,'utf8'));
const zhHtml=decode(readFileSync(pages.zh,'utf8'));
assert.ok(en.includes('href="/zh/onepage/"')&&zhHtml.includes('href="/onepage/"'),'onepage language mirrors must point at each other');
assert.ok(en.includes('Selected works')&&zhHtml.includes('精选作品'),'localized section headings missing');
assert.ok(zhHtml.includes('工作经历')&&en.includes('Work record'),'localized record headings missing');

console.log('PASS: one-page prototype (en/zh) sections, anchors, expandable works, original-article rows and prototype deep dives verified.');
