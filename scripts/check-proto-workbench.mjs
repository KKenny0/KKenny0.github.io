// Run after `npm run build`: node scripts/check-proto-workbench.mjs
// Guards the full-site workbench prototype: every static prototype page exists in
// both locales, its internal links stay inside the prototype (or are real external
// targets), the language mirror is complete, and no page accidentally points into
// the official space paths. The official site never loads this file's surface.
import assert from 'node:assert/strict';
import {existsSync,readdirSync,readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const dist=join(root,'dist');
assert.ok(existsSync(join(dist,'index.html')),'dist/ missing — run `npm run build` before this check');

const decode=html=>html.replace(/&amp;/g,'&');
const pages=[];
const walk=dir=>{for(const entry of readdirSync(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())walk(path);else if(entry.name==='index.html')pages.push(path);}};
walk(join(dist,'prototype'));
walk(join(dist,'zh','prototype'));
assert.ok(pages.length>=100&&pages.length%2===0,`Expected the full prototype tree in dist (both locales), found ${pages.length} pages`);

const inDist=target=>{
  if(target.endsWith('/'))return existsSync(join(dist,target,'index.html'));
  return existsSync(join(dist,target))&&statSync(join(dist,target)).isFile();
};

// Both locales must mirror each other page for page, including workbench homes.
for(const page of pages){
  const relativePage=page.slice(dist.length).replace(/\/index\.html$/,'/');
  const [en,other]=relativePage.startsWith('/zh/')?['/zh'+relativePage.slice(3),relativePage.slice(3)]:[relativePage,'/zh'+relativePage];
  assert.ok(pages.includes(join(dist,other,'index.html')),`Language mirror missing: ${other}`);
  assert.ok(pages.includes(join(dist,en,'index.html')),`Unexpected mirror bookkeeping for ${relativePage}`);
}

// Same-origin links may only leave the prototype for the real home (the compare
// link) or static assets; everything else must stay inside the prototype.
const escapeRe=/^(\/(zh\/)?(prototype|workbench)(\/|$)|\/assets\/|\/_astro\/|\/favicon|\/sitemap\.xml)/;
for(const page of pages){
  const html=decode(readFileSync(page,'utf8'));
  const relativePage=page.slice(dist.length).replace(/\/index\.html$/,'/');
  const zh=relativePage.startsWith('/zh/');
  for(const href of [...html.matchAll(/href="([^"]+)"/g)].map(match=>match[1])){
    if(href.startsWith('#'))continue;
    if(/^(https?:)?\/\//.test(href)||href.startsWith('mailto:')){
      assert.ok(href.startsWith('https://')||href.startsWith('mailto:'),`Insecure external link on ${relativePage}: ${href}`);
      continue;
    }
    assert.ok(href.startsWith('/'),`Non-resolvable link on ${relativePage}: ${href}`);
    const target=href.split('#')[0].split('?')[0];
    if(target==='/'||target==='/zh/')continue; // "compare with the current home"
    assert.match(target,escapeRe,`Prototype page ${relativePage} links into official paths: ${href}`);
    assert.ok(inDist(target),`Missing link target on ${relativePage}: ${href}`);
  }
}

// Key deep pages exist in both locales and are really server-rendered, so deep
// links and NoScript visits land on full content.
const key=['/','/lens/online/','/lens/taste/','/lens/ai/','/lens/execution/','/projects/','/work/script-weaver/','/notes/','/notes/ai/2060032007506334292/','/notes/online/goal/','/taste/card-skill/thousand-brains/','/taste/kami-reader/reading-workbench/','/about/','/support/','/projects/tracework/','/projects/weave/'];
for(const path of key){
  for(const base of ['/prototype','/zh/prototype']){
    const html=readFileSync(join(dist,base,path,'index.html'),'utf8');
    const zh=base==='/zh/prototype';
    if(path==='/'){ // the root only deep-links to the workbench home
      assert.ok(html.includes(`url=${zh?'/zh':''}/workbench/`)&&html.includes(`href="${zh?'/zh':''}/workbench/"`),`Root redirect missing on ${base}${path}`);
      continue;
    }
    assert.match(html,/class="pb-main/,`Static render missing on ${base}${path}`);
    assert.ok(html.includes(`href="${zh?'/zh/':'/'}workbench/"`),`Home return link missing on ${base}${path}`);
    assert.ok(html.includes('kenny-space-theme'),`Theme bootstrap missing on ${base}${path}`);
  }
}

// The workbench home opens all four lens pages; story pages keep their real targets.
for(const base of ['','zh/']){
  const home=readFileSync(join(dist,base,'workbench','index.html'),'utf8');
  // The desk pet and the station caption both enter each lens; count distinct targets.
  const lenses=new Set([...home.matchAll(/href="\/(zh\/)?prototype\/lens\/([a-z]+)\/"/g)].map(match=>match[2]));
  assert.equal(lenses.size,4,`${base}workbench must link all four lens pages`);
}
const trace=readFileSync(join(dist,'prototype','projects','tracework','index.html'),'utf8');
assert.ok(trace.includes('https://github.com/KKenny0/Tracework')&&trace.includes('https://kkenny0.github.io/Tracework/'),'Tracework story must keep its real links');
const weave=readFileSync(join(dist,'prototype','projects','weave','index.html'),'utf8');
assert.ok(weave.includes('https://github.com/KKenny0/weave'),'weave story must keep its real link');
const support=readFileSync(join(dist,'prototype','support','index.html'),'utf8');
assert.ok(support.includes('https://www.paypal.me/Kennywu96')&&support.includes('/assets/img/support/alipay-qr.png'),'Support must keep its real channels');

console.log(`PASS: ${pages.length} prototype pages, links, mirrors, home entries and external targets verified.`);
