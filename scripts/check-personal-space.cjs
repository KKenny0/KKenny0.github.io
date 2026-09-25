// Run: node scripts/check-personal-space.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    textContent: '', hidden: false, disabled: false, dataset: {}, handlers: {},
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener(name, callback) { this.handlers[name] = callback; },
    setAttribute() {}, focus() {}, scrollIntoView() {}, contains(node) { return node?.inside === true; }
  });
  return elements.get(id);
}
let selection;
const documentEvents = {};
runInNewContext(readFileSync(`${__dirname}/../src/scripts/capture-demo.js`, 'utf8'), {
  document: { querySelector: element, querySelectorAll: () => [], documentElement: element('root'), addEventListener: (name, callback) => documentEvents[name] = callback },
  window: { getSelection: () => selection }, matchMedia: () => ({ matches: false })
});
const click = id => element(id).handlers.click();
element('#sample-quote').textContent = '值得留下的原句';
click('#capture');
assert.match(element('#selection-status').textContent, /还没选中/);
click('#select-example');
click('#capture');
assert.equal(element('#saved-quote').textContent, '值得留下的原句');
assert.equal(element('#capture').disabled, true);
click('#capture');
assert.equal(element('#count').textContent, '1 条片段');
click('#undo');
assert.equal(element('#capture').disabled, false);
click('#capture');
assert.equal(element('#saved-quote').textContent, '值得留下的原句');
click('#reset');
click('#capture');
assert.match(element('#selection-status').textContent, /还没选中/);
selection = { isCollapsed: false, anchorNode: { inside: true }, focusNode: { inside: true }, toString: () => '<img src=x onerror=alert(1)>' };
documentEvents.selectionchange();
click('#capture');
assert.equal(element('#saved-quote').textContent, '<img src=x onerror=alert(1)>');
click('#undo');
selection.focusNode.inside = false;
documentEvents.selectionchange();
click('#capture');
assert.match(element('#selection-status').textContent, /还没选中/);
assert.equal(element('#count').textContent, '0 条片段');
console.log('PASS: empty selection, capture, duplicate guard, undo, reset, literal text and selection boundary.');
// Shared collection behavior: combined filters, empty state, reset and deep links.
const shared = new Map();
function node(id, text = '') {
  const n = {id, textContent:text, value:'', hidden:false, open:false, dataset:{}, handlers:{}, attrs:{},
    addEventListener(k,f){this.handlers[k]=f;}, setAttribute(k,v){this.attrs[k]=v;},
    focus(){}, scrollIntoView(){}, querySelector(){return {focus(){}};} };
  shared.set(id,n); return n;
}
['#theme','#collection-count','#collection-empty','#clear-filters','#note-search','#random-note'].forEach(id=>node(id));
const records = [node('one','Memory context'),node('two','Agent engineering'),node('three','Memory storage')];
records.forEach((n,i)=>n.dataset.category=['memory context','agents','memory'][i]);
const buttons=['all','memory','agents'].map(k=>{const n=node(k);n.dataset.filter=k;return n;});
const root=node('root');const address={search:'?topic=memory',hash:''};const windowEvents={};
runInNewContext(readFileSync(`${__dirname}/../src/scripts/personal-space.js`,'utf8'),{
  document:{documentElement:root,querySelector:id=>shared.get(id)||null,
    querySelectorAll:s=>s==='[data-entry]'?records:s==='[data-filter]'?buttons:[],addEventListener(){}},
  window:{addEventListener:(k,f)=>windowEvents[k]=f},location:address,URLSearchParams,
  localStorage:{getItem(){throw Error('storage blocked');},setItem(){throw Error('storage blocked');}},
  matchMedia:()=>({matches:false})
});
assert.equal(shared.get('#collection-count').textContent,'2 篇笔记');
shared.get('#note-search').value='not-found';shared.get('#note-search').handlers.input();
assert.equal(shared.get('#random-note').disabled,true);
assert.equal(shared.get('#collection-empty').hidden,false);
shared.get('#clear-filters').handlers.click();
assert.equal(shared.get('#collection-count').textContent,'3 篇笔记');
shared.get('#random-note').handlers.click();
assert.equal(records.filter(n=>n.open).length,1);
buttons[2].handlers.click();assert.equal(records[0].hidden,true);
address.hash='#one';windowEvents.hashchange();
assert.equal(records[0].hidden,false);assert.equal(records[0].open,true);
shared.get('#theme').handlers.click();assert.equal(root.dataset.theme,'dark');
console.log('PASS: collection filtering, empty state, reset, random selection, deep links and blocked storage.');
const {existsSync,readdirSync}=require('node:fs');const path=require('node:path');
const output=path.resolve(__dirname,'../dist');
const pages=readdirSync(output,{recursive:true}).map(file=>file.replaceAll('\\','/')).filter(file=>file.endsWith('.html'));
for(const route of ['index.html','about/index.html','notes/index.html','projects/index.html','projects/tracework/index.html','projects/weave/index.html','support/index.html','background/index.html','work/index.html','writings/index.html','open-source/index.html']) assert.ok(pages.includes(route),route);
for(const page of pages){
  const source=readFileSync(path.join(output,page),'utf8');
  for(const [,url] of source.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:)/.test(url))continue;
    const parsed=new URL(url,'https://local.test/'+page.replace(/index.html$/,''));
    const relative=decodeURIComponent(parsed.pathname).replace(/^\//,'');
    let target=path.resolve(output,relative);
    if(parsed.pathname.endsWith('/'))target=path.join(target,'index.html');
    assert.ok(target.startsWith(output+path.sep));assert.ok(existsSync(target),`${page}: ${url}`);
    if(parsed.hash)assert.ok(readFileSync(target,'utf8').includes(`id="${decodeURIComponent(parsed.hash.slice(1))}"`),`${page}: ${url}`);
  }
}
const writings=JSON.parse(readFileSync(path.resolve(__dirname,'../src/data/writings.json'),'utf8'));
const notes=readFileSync(path.join(output,'notes/index.html'),'utf8');
for(const article of writings.articles) assert.ok(notes.includes(`id="note-${article.id}"`),article.title);
assert.ok(!readFileSync(path.join(output,'index.html'),'utf8').includes('近况草稿'));
console.log(`PASS: ${pages.length} built routes, local links/assets/fragments and all ${writings.articles.length} current notes.`);
// The accepted portfolio ships in both languages with the same project order.
for (const prefix of ['', 'zh/']) {
  for (const page of ['index.html', 'projects/index.html', 'about/index.html']) {
    const html = readFileSync(path.join(output, prefix, page), 'utf8');
    assert.ok(html.includes(`lang="${prefix ? 'zh-CN' : 'en'}"`));
    assert.ok(html.includes(`data-language="${prefix ? 'en' : 'zh'}"`));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok(!/DESIGN STUDY|localhost:4311|kenny-prototype/.test(html));
  }
  const projectHtml = readFileSync(path.join(output, prefix, 'projects/index.html'), 'utf8');
  const stars = [...projectHtml.matchAll(/data-stars="(\d+)"/g)].map(m => Number(m[1]));
  assert.equal(stars.length, 9);
  assert.deepEqual(stars, [...stars].sort((a,b) => b-a));
  const images = [...projectHtml.matchAll(/data-image="([^"]+)"/g)];
  assert.equal(images.length, 9);
  for (const [,image] of images) assert.ok(existsSync(path.join(output,image)));
  const about = readFileSync(path.join(output, prefix, 'about/index.html'), 'utf8');
  assert.ok(about.includes('id="awards"'));
  assert.ok(about.includes('id="experience"'));
}
const localeScript = readFileSync(path.resolve(__dirname, '../src/layouts/PortfolioLayout.astro'), 'utf8').match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
for (const [lang, preference, pathname, expected] of [
  ['en', null, '/', undefined],
  ['en', 'zh', '/projects/?test=1#taku', 'https://local.test/zh/projects/?test=1#taku'],
  ['zh-CN', 'en', '/zh/about/#awards', 'https://local.test/about/#awards'],
  ['en', 'invalid', '/', undefined],
]) {
  let redirected;
  runInNewContext(localeScript, { URL,
    document: { documentElement: { lang, dataset: {} } },
    location: { href: `https://local.test${pathname}`, replace(url) { redirected = url; } },
    localStorage: { getItem(key) { return key === 'kenny-language' ? preference : null; } },
  });
  assert.equal(redirected, expected);
}
console.log('PASS: bilingual portfolio, descending stars, focus images, awards and language redirects.');
// About refresh: both locales retain anonymized experience and accessible photo viewers.
for (const prefix of ['', 'zh/']) {
  const about = readFileSync(path.join(output, prefix, 'about/index.html'), 'utf8');
  const experience = about.match(/id="experience"[\s\S]*?<\/section>/)[0];
  assert.equal((experience.match(/<article /g) || []).length, 5);
  assert.ok(!/爱图仕|冰鉴|蓝月亮|Aputure|Icekredit|Blue Moon/.test(experience));
  assert.ok(about.includes('China AI and Law Challenge'));
  assert.equal((about.match(/class="photo-open"/g) || []).length, 2);
  assert.ok(/id="awards"[\s\S]*?class="archive-photo"/.test(about));
  assert.ok(about.includes('<dialog class="photo-viewer"'));
}
console.log('PASS: About experience, company anonymity, CAIL and photo viewer markup.');
