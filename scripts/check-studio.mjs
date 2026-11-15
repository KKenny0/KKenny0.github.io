// Run after `npm run build`: node scripts/check-studio.mjs
// Guards the studio-wall prototype: both locales build, the wall renders the
// four-practice rail as a real tablist with one visible panel, the easel
// server-renders all four focus objects (inactive ones hidden; the noscript
// style stacks them), artworks/observations/writing rows and records link to
// real sources or prototype deep dives, and the language mirrors point at
// each other. The official site never loads this file's surface.
import assert from 'node:assert/strict';
import {existsSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const dist=join(root,'dist');
assert.ok(existsSync(join(dist,'index.html')),'dist/ missing — run `npm run build` before this check');

const decode=html=>html.replace(/&amp;/g,'&');
const pages={en:join(dist,'studio','index.html'),zh:join(dist,'zh','studio','index.html')};
for(const [locale,path] of Object.entries(pages))assert.ok(existsSync(path),`dist/${locale==='zh'?'zh/':''}studio/index.html missing`);

const zh=locale=>locale==='zh';
for(const [locale,path] of Object.entries(pages)){
  const prefix=zh(locale)?'/zh':'';
  const html=decode(readFileSync(path,'utf8'));
  const relative=`${prefix}/studio/`;

  assert.match(html,/<html lang="(zh-CN|en)"/,`${relative}: html lang missing`);
  assert.match(html,/meta name="robots" content="noindex"/,`${relative}: must stay noindex`);
  assert.ok(html.includes('kenny-space-theme'),`${relative}: theme bootstrap missing`);
  assert.match(html,/class="workbench studio"/,`${relative}: island root missing`);

  // The rail is a real tablist: four tabs, one selected, roving tabindex.
  assert.match(html,/role="tablist"/,`${relative}: rail tablist missing`);
  assert.equal([...html.matchAll(/role="tab"/g)].length,4,`${relative}: expected four rail tabs`);
  for(const id of ['online','taste','ai','execution']){
    assert.ok(html.includes(`id="st-tab-${id}"`),`${relative}: tab st-tab-${id} missing`);
    assert.ok(html.includes(`id="st-panel-${id}"`),`${relative}: panel st-panel-${id} missing`);
  }
  const tastePanel=html.match(/<div[^>]*id="st-panel-taste"[^>]*>/);
  assert.ok(tastePanel&&!tastePanel[0].includes('hidden'),`${relative}: taste must be the visible default panel`);
  const onlinePanel=html.match(/<div[^>]*id="st-panel-online"[^>]*>/);
  assert.ok(onlinePanel&&onlinePanel[0].includes('hidden'),`${relative}: non-default panels must render hidden`);

  // No-JS visitors still get every focus object stacked by the noscript style.
  assert.ok(html.includes('.st-easel-body[hidden]{display:block}'),`${relative}: noscript stacking style missing`);

  // Taste (default): real artwork with real product links.
  assert.match(html,/\/assets\/(optimized\/space-)?thousand-brains/,`${relative}: light-table artwork missing`);
  assert.ok(html.includes('https://github.com/KKenny0/card-skill'),`${relative}: card-skill product link missing`);
  assert.ok(html.includes('https://github.com/KKenny0/obsidian-kami'),`${relative}: obsidian-kami product link missing`);

  // Online: the five-stop observation route, straight to the real originals.
  const stopLinks=[...html.matchAll(/class="st-stop"[^>]*href="(https:[^"]+)"/g)].map(match=>match[1]);
  assert.equal(stopLinks.length,5,`${relative}: expected five observation-route stops, found ${stopLinks.length}`);
  for(const url of stopLinks)assert.match(url,/^(https:\/\/zhuanlan\.zhihu\.com|https:\/\/mp\.weixin\.qq\.com)/,`${relative}: route stop outside the real sources: ${url}`);

  // AI: Script-Weaver with its repository and prototype project page, plus the memory note.
  assert.ok(html.includes('https://github.com/KKenny0/script-weaver'),`${relative}: script-weaver GitHub link missing`);
  assert.ok(html.includes(`${prefix}/prototype/work/script-weaver/`),`${relative}: script-weaver prototype page link missing`);
  assert.ok(html.includes(`href="${prefix}/prototype/notes/ai/2060032007506334292/"`),`${relative}: memory-note link missing`);

  // Execution: the real delivery figures, server-rendered.
  assert.ok(html.includes('9.53%')&&html.includes('24s'),`${relative}: delivery ledger figures missing`);

  // Writing strip: four rows, straight to the originals.
  const noteRows=[...html.matchAll(/class="st-note-row"[^>]*href="(https:[^"]+)"/g)].map(match=>match[1]);
  assert.equal(noteRows.length,4,`${relative}: expected four latest-writing rows, found ${noteRows.length}`);
  for(const url of noteRows)assert.match(url,/^(https:\/\/zhuanlan\.zhihu\.com|https:\/\/mp\.weixin\.qq\.com)/,`${relative}: writing row outside the real sources: ${url}`);

  // Deep dives stay inside the prototype: archive, about, support.
  for(const target of ['/prototype/notes/','/prototype/about/','/prototype/support/']){
    const path=join(dist,target,'index.html');
    assert.ok(existsSync(path)&&statSync(path).isFile(),`${relative}: prototype target missing: ${target}`);
    assert.ok(html.includes(`href="${prefix}${target}"`),`${relative}: link to ${prefix}${target} missing`);
  }

  // Same-origin links only go to assets, the compare pages, or the prototype.
  for(const href of [...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1])){
    if(href.startsWith('#')||/^(https?:)?\/\//.test(href)||href.startsWith('mailto:'))continue;
    assert.match(href,/^(\/(zh)?\/?studio\/?$|\/(zh)?\/?$|\/(zh\/)?(workbench|onepage|prototype|assets|_astro)\b|\/assets\/)/,`${relative}: unexpected internal link: ${href}`);
  }
}

// The language mirrors must point at each other and carry localized easel copy.
const en=decode(readFileSync(pages.en,'utf8'));
const zhHtml=decode(readFileSync(pages.zh,'utf8'));
assert.ok(en.includes('href="/zh/studio/"')&&zhHtml.includes('href="/studio/"'),'studio language mirrors must point at each other');
assert.ok(en.includes('LIGHT TABLE')&&zhHtml.includes('灯桌'),'localized easel kickers missing');
assert.ok(en.includes('AI comics & storyboard generation')&&zhHtml.includes('AI 漫剧生成系统'),'localized ledger records missing');
assert.ok(en.includes('Why does the same model behave differently across Agent platforms?')&&zhHtml.includes('同样的模型，为什么在不同 Agent 平台上表现不同？'),'localized route stops missing');

console.log('PASS: studio-wall prototype (en/zh) tablist rail, four server-rendered focus objects, real artwork/observation/writing links and prototype deep dives verified.');
