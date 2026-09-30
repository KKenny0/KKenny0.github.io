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
{
// Approved disclosures: URL view state, archive grouping and keyboard feedback.
function node(dataset = {}) {
  return {
    dataset, handlers: {}, attributes: {}, hidden: false,
    addEventListener(name, callback) { this.handlers[name] = callback; },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name]; },
    classList: { contains: value => value === 'project', toggle() {} },
    focus() { this.focused = true; }, scrollIntoView() { this.scrolled = true; }
  };
}
const filters = ['all', 'make', 'research'].map(filter => node({ filter }));
const theme = node(), language = node(), status = node(), archive = node(), archiveSummary = node(), archiveCount = node();
language.setAttribute('href', '/zh/projects/');
const sort = node();
function project(id, practice, stars, pushed) {
  const item = node({ name: id, category: practice, stars, updated: pushed });
  item.id = id;
  item.summary = node();
  item.querySelector = () => item.summary;
  item.closest = () => item.archived ? archive : null;
  return item;
}
const active = [project('new', 'make', '2', '2026-09-30'), project('popular', 'research', '9', '2026-08-01')];
const archived = [project('old', 'make', '1', '2025-01-01')];
archived[0].archived = true;
function list(items, projectList) {
  const result = node({ projectList });
  result.querySelectorAll = () => items;
  result.append = item => { items.splice(items.indexOf(item), 1); items.push(item); };
  return result;
}
const lists = [list(active, 'active'), list(archived, 'archive')];
archive.querySelector = () => archiveSummary;
const elements = { '.theme': theme, '.language': language, '#sort': sort, '.archive-group': archive, '.collection-status': status, '#archive-count': archiveCount };
const all = [...active, ...archived];
const projectLink = node();
projectLink.setAttribute('href', '#old');
const documentEvents = {}, windowEvents = {};
const context = {
  URL, URLSearchParams,
  location: new URL('https://example.test/projects/?filter=research&sort=recent'),
  history: {
    replaceState(_state, _title, url) { context.location = new URL(url, context.location); },
    pushState(_state, _title, url) { context.location = new URL(url, context.location); }
  },
  localStorage: { getItem() { return null; }, setItem() {} },
  document: {
    body: node(), documentElement: { lang: 'en', dataset: {} },
    querySelector: selector => elements[selector] || null,
    querySelectorAll: selector => ({ '[data-filter]': filters, '[data-project-list]': lists, '.project': all, details: all, 'a[href^="#"]': [projectLink] })[selector] || [],
    addEventListener(name, callback) { documentEvents[name] = callback; }
  },
  window: { addEventListener(name, callback) { windowEvents[name] = callback; } }
};
runInNewContext(readFileSync(`${__dirname}/../src/scripts/portfolio.js`, 'utf8'), context);
assert.equal(sort.value, 'recent');
assert.equal(status.textContent, '1 active projects · 0 archived');
assert.equal(archive.hidden, true);
assert.match(language.href, /\?filter=research&sort=recent$/);
filters[0].handlers.click();
assert.equal(status.textContent, '2 active projects · 1 archived');
assert.equal(archive.hidden, false);
assert.equal(context.location.search, '?sort=recent');
sort.value = 'stars'; sort.handlers.change();
assert.equal(active[0].id, 'popular');
assert.equal(context.location.search, '');
context.location.hash = '#old'; windowEvents.hashchange();
assert.equal(archived[0].open, true);
assert.equal(archive.open, true);
assert.equal(archived[0].summary.focused, true);
archived[0].open = false;
let prevented = false;
projectLink.handlers.click({ preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.equal(archived[0].open, true);
theme.handlers.click();
assert.equal(theme.getAttribute('aria-label'), 'Switch to light mode');
documentEvents.keydown(); assert.ok('keyboard' in context.document.body.dataset);
documentEvents.pointerdown(); assert.ok(!('keyboard' in context.document.body.dataset));
console.log('PASS: URL view state, active/archive counts, sorting, archived deep links, theme labels and keyboard mode.');

}
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
const projectSource=readFileSync(path.resolve(__dirname,'../src/data/projects.ts'),'utf8');
const projectRecords=JSON.parse(projectSource.match(/export const projects: Project\[\] = (\[[\s\S]*?\]);/)[1]);
const snapshot=JSON.parse(projectSource.match(/export const githubSnapshot = (\{[\s\S]*?\});/)[1]);
assert.equal(new Set(projectRecords.map(p=>p.slug)).size,projectRecords.length);
assert.ok(projectRecords.every(p=>Number.isInteger(p.stars)&&p.stars>=0&&Number.isInteger(p.forks)&&p.forks>=0&&!Number.isNaN(Date.parse(p.pushedAt))));
assert.ok(!projectRecords.some(p=>['future-agi','ragvizexpander','kotaemon','.github','kkenny0','kkenny0.github.io'].includes(p.slug)));
for (const prefix of ['', 'zh/']) {
  for (const page of ['index.html', 'projects/index.html', 'about/index.html']) {
    const html = readFileSync(path.join(output, prefix, page), 'utf8');
    assert.ok(html.includes(`lang="${prefix ? 'zh-CN' : 'en'}"`));
    assert.ok(html.includes(`data-language="${prefix ? 'en' : 'zh'}"`));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok(!/DESIGN STUDY|localhost:4311|kenny-prototype/.test(html));
  }
  const projectHtml = readFileSync(path.join(output, prefix, 'projects/index.html'), 'utf8');
  const entries=[...projectHtml.matchAll(/<details class="project" id="([^"]+)"([^>]*)>/g)];
  assert.equal(entries.length,projectRecords.length);
  for(const [,slug,attrs] of entries){
    const record=projectRecords.find(p=>p.slug===slug);assert.ok(record,slug);
    assert.ok(attrs.includes(`data-stars="${record.stars}"`));assert.ok(attrs.includes(`data-forks="${record.forks}"`));
    assert.ok(attrs.includes(`data-updated="${record.pushedAt}"`));assert.ok(attrs.includes(`data-archived="${record.archived}"`));
  }
  const stars=entries.filter(([,slug,attrs])=>attrs.includes('data-archived="false"')).map(([,slug,attrs])=>Number(attrs.match(/data-stars="(\d+)"/)[1]));
  assert.deepEqual(stars,[...stars].sort((a,b)=>b-a));
  assert.ok(projectHtml.includes(`datetime="${snapshot.date}"`));
  const home=readFileSync(path.join(output,prefix,'index.html'),'utf8');
  assert.ok(home.includes('id="delivery"'));
  assert.ok(home.includes('9.53%'));
  assert.ok(home.includes('class="case-role"'));
  for(const slug of ['videowipe','script-weaver','obsidian-kami','tracework']){
    const record=projectRecords.find(p=>p.slug===slug);
    assert.ok(home.includes(`/projects/#${slug}`));
  }
  for (const record of projectRecords.filter(project => project.focus)) {
    assert.ok(projectHtml.includes(record.focus.src), record.slug);
    assert.ok(existsSync(path.join(output,record.focus.src)));
  }
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
console.log('PASS: bilingual portfolio, descending stars, project images, awards and language redirects.');
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
