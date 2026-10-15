// Run: node scripts/check-personal-space.cjs
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const lock = JSON.parse(readFileSync(`${__dirname}/../package-lock.json`, 'utf8'));
const incompletePackages = Object.entries(lock.packages).filter(([path, pkg]) => path && !pkg.version);
assert.equal(incompletePackages.length, 0, `Lockfile entries need versions: ${incompletePackages.map(([path]) => path).join(', ')}`);
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
runInNewContext(readFileSync(`${__dirname}/../src/scripts/personal-space.js`,'utf8') + '\n' + readFileSync(`${__dirname}/../src/scripts/collection.js`,'utf8'),{
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
    querySelectorAll: selector => ({ '.repository-index [data-filter]': filters, '[data-project-list]': lists, '.project': all, details: all, 'a[href^="#"]': [projectLink] })[selector] || [],
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

documentEvents.keydown(); assert.ok('keyboard' in context.document.body.dataset);
documentEvents.pointerdown(); assert.ok(!('keyboard' in context.document.body.dataset));
console.log('PASS: URL view state, active/archive counts, sorting, archived deep links and keyboard mode.');

}
const {existsSync,readdirSync}=require('node:fs');
const path=require('node:path');
const output=path.resolve(__dirname,'../dist');
const pages=readdirSync(output,{recursive:true}).map(file=>file.replaceAll('\\','/')).filter(file=>file.endsWith('.html'));
const projectSource=readFileSync(path.resolve(__dirname,'../src/data/projects.ts'),'utf8');
const projectRecords=JSON.parse(projectSource.match(/export const projects: Project\[\] = (\[[\s\S]*?\]);/)[1]);
const writings=JSON.parse(readFileSync(path.resolve(__dirname,'../src/data/writings.json'),'utf8'));
const expectedRoutes=['index.html','projects/index.html','notes/index.html','about/index.html','support/index.html','projects/weave/index.html','projects/tracework/index.html'];
for(const prefix of ['', 'zh/']){
  for(const route of expectedRoutes){
    assert.ok(pages.includes(prefix+route),prefix+route);
    const html=readFileSync(path.join(output,prefix,route),'utf8');
    assert.ok(html.includes(`lang="${prefix?'zh-CN':'en'}"`));
    assert.ok(html.includes('hreflang="x-default"'));
    assert.ok(!/babel\.min|react\.development|KENNY_DATA|DESIGN STUDY|kenny-proto-|noindex/.test(html));
  }
  const home=readFileSync(path.join(output,prefix,'index.html'),'utf8');
  for(const lens of ['online','taste','ai','execution'])assert.ok(home.includes(`href="/${prefix}lens/${lens}/"`));
  const ai=readFileSync(path.join(output,prefix,'lens/ai/index.html'),'utf8');
  assert.ok(ai.includes('script-weaver')&&ai.includes('videowipe'));
  assert.ok(!ai.includes('videowipe.jpg')&&!ai.includes('portrait.webp'));
  const notes=readFileSync(path.join(output,prefix,'notes/index.html'),'utf8');
  for(const article of writings.articles){
    assert.ok(notes.includes(`id="note-${article.id}"`),article.title);
    const kind=['2060032007506334292','2031687123431051328'].includes(article.id)?'ai':'online';
    assert.ok(pages.includes(`${prefix}notes/${kind}/${article.id}/index.html`));
  }
  for(const project of projectRecords){
    assert.ok(pages.includes(`${prefix}work/${project.slug}/index.html`));
    const html=readFileSync(path.join(output,prefix,`work/${project.slug}/index.html`),'utf8');
    assert.ok(html.includes(project.name));
    assert.ok(html.includes(project.url));
  }
  const about=readFileSync(path.join(output,prefix,'about/index.html'),'utf8');
  for(const section of ['experience','research','awards','questions','outside','enterprise'])assert.ok(about.includes(`id="${section}"`));
  assert.equal((about.match(/class="timeline(?: cail-entry)?"/g)||[]).length,8);
  for(const fact of ['9.53%','1285','Qwen2.5-7B','90%','conference.jpg','q9Z8cmIAAAAJ']){
    // Scholar remains available in the professional links; numerical claims stay qualified in content.
    if(fact==='q9Z8cmIAAAAJ')continue;
    assert.ok(about.includes(fact),fact);
  }
  assert.ok(about.includes('self-profo'));
}

// Every generated local link and asset must work on GitHub Pages without a rewrite server.
for(const page of pages){
  const html=readFileSync(path.join(output,page),'utf8');
  for(const [,url] of html.matchAll(/(?:href|src)="([^"]+)"/g)){
    if(/^(https?:|mailto:|data:)/.test(url))continue;
    const parsed=new URL(url.replaceAll('&amp;','&'),'https://local.test/'+page.replace(/index.html$/,''));
    const relative=decodeURIComponent(parsed.pathname).replace(/^\//,'');
    let target=path.resolve(output,relative);
    if(parsed.pathname.endsWith('/'))target=path.join(target,'index.html');
    assert.ok(target.startsWith(output+path.sep));
    assert.ok(existsSync(target),`${page}: ${url}`);
    if(parsed.hash)assert.ok(readFileSync(target,'utf8').includes(`id="${decodeURIComponent(parsed.hash.slice(1))}"`),`${page}: ${url}`);
  }
  for(const [tag] of html.matchAll(/<img[^>]*srcset="[^"]+"[^>]*>/g)){
    assert.match(tag,/width="[1-9][0-9]*"/);assert.match(tag,/height="[1-9][0-9]*"/);
    for(const candidate of tag.match(/srcset="([^"]+)"/)[1].split(','))assert.ok(existsSync(path.join(output,candidate.trim().split(/\s+/)[0])));
  }
}
console.log(`PASS: ${pages.length} static routes, bilingual SSR, ${projectRecords.length} projects, ${writings.articles.length} source articles, full About and all local links/assets.`);

// Test the actual route implementation with the authoritative data, independently of browser state.
const routeSource=readFileSync(path.resolve(__dirname,'../src/lib/space-routes.js'),'utf8').replace(/^import .*;\r?\n/gm,'').replaceAll('export ','');
const routeContext={URL,projects:projectRecords,notes:[...writings.articles,{id:'goal',primary:'online'},{id:'context-sep',primary:'online'}],lensInfo:{online:{},taste:{},ai:{},execution:{}},aiWritingIds:['2060032007506334292','2031687123431051328'],localizedNote:n=>n};
routeContext.notes=routeContext.notes.map(n=>({...n,primary:routeContext.aiWritingIds.includes(n.id)?'ai':'online'}));
runInNewContext(readFileSync(path.resolve(__dirname,'../src/data/taste.js'),'utf8').replace('export const tasteProducts=','this.tasteProducts='),routeContext);
runInNewContext(routeSource+'\nthis.routes={routePath,parseRoute,spaceEntries};',routeContext);
const {routePath,parseRoute,spaceEntries}=routeContext.routes;
for(const locale of ['en','zh'])for(const {route} of spaceEntries()){
  const parsed=parseRoute(new URL(routePath(route,locale),'https://example.test'));
  assert.equal(parsed.view,route.view);assert.equal(parsed.arg,route.arg);
  if(route.item)assert.equal(parsed.item,route.item);
  if(route.work!==undefined)assert.equal(parsed.work,route.work);
}
for(const slug of ['script-weaver','taku','loom-skills'])assert.equal(parseRoute(new URL(`https://local.test/zh/projects/#${slug}`)).item,slug);
assert.equal(parseRoute(new URL('https://local.test/notes/#note-2060032007506334292')).arg,'ai');
assert.equal(parseRoute(new URL('https://local.test/zh/notes/?topic=memory')).topic,'memory');
assert.equal(parseRoute(new URL('https://local.test/lens/unknown/')).view,'home');
assert.equal(parseRoute(new URL('https://local.test/taste/card-skill/999/')).view,'home');
assert.equal(parseRoute(new URL('https://local.test/work/videowipe/?from=ai')).arg,'ai');
assert.equal(routePath({view:'notes',arg:'online',item:'goal',topic:'memory'},'zh'),'/zh/notes/online/goal/?topic=memory');
console.log('PASS: all route/locale round trips, stable artwork IDs, legacy fragments, archived project links and topic queries.');

// Both rendering frames use the same pre-paint system default and controller.
const themeCode=readFileSync(path.resolve(__dirname,'../src/lib/theme.js'),'utf8').replaceAll('export ','');
const themeBoot=readFileSync(path.resolve(__dirname,'../src/components/ThemeHead.astro'),'utf8').match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
for(const [stored,systemDark,expected] of [[null,true,'dark'],[null,false,'light'],['system',true,'dark'],['light',true,'light'],['dark',false,'dark'],['invalid',true,'dark']]){
  const root={dataset:{}};
  runInNewContext(themeBoot,{document:{documentElement:root},matchMedia:()=>({matches:systemDark}),localStorage:{getItem(){return stored;}}});
  assert.equal(root.dataset.theme,expected);
  assert.equal(root.dataset.themeMode,stored==='light'||stored==='dark'?stored:'system');
}
for(const blocked of [false,true]){
  const root={dataset:{}},listeners=new Map(),writes=[];
  const scheme={matches:true,addEventListener(k,f){listeners.set(k,f)},removeEventListener(k){listeners.delete(k)}};
  const ctx={document:{documentElement:root},matchMedia:()=>scheme,localStorage:{getItem(){if(blocked)throw Error('blocked');return null},setItem(k,v){if(blocked)throw Error('blocked');writes.push(v)}}};
  runInNewContext(themeCode+'\nthis.controller=createThemeController();',ctx);
  assert.equal(root.dataset.theme,'dark');assert.equal(root.dataset.themeMode,'system');assert.equal(writes.length,0);
  scheme.matches=false;listeners.get('change')();assert.equal(root.dataset.theme,'light');
  ctx.controller.set('dark');assert.equal(root.dataset.themeMode,'dark');
  listeners.get('change')();assert.equal(root.dataset.theme,'dark');
  ctx.controller.set('system');assert.equal(root.dataset.theme,'light');
  scheme.matches=true;listeners.get('change')();assert.equal(root.dataset.theme,'dark');
  ctx.controller.destroy();assert.equal(listeners.size,0);
}
assert.equal(parseRoute(new URL('https://local.test/notes/?topic=ai')).topic,'ai');
console.log('PASS: shared pre-paint theme, system default and live updates, explicit override, blocked storage, cleanup and AI topic deep link.');
