import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';
const root = path.dirname(fileURLToPath(import.meta.url));
const pages = ['index.html', 'projects.html', 'about.html', 'index-en.html', 'projects-en.html', 'about-en.html'];
for (const file of pages) {
  const html = await readFile(path.join(root, file), 'utf8');
  const english = file.includes('-en');
  assert.ok(html.includes(`lang="${english ? 'en' : 'zh-CN'}"`));
  assert.ok(html.includes(`href="${file.replace(english ? '-en.html' : '.html', english ? '.html' : '-en.html')}"`), `${file}: language pair`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, `${file}: duplicate IDs`);
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const ref = match[1];
    if (/^(?:https?:|mailto:)/.test(ref)) continue;
    const [target, fragment] = ref.split('#');
    const targetPath = path.resolve(root, target || file);
    assert.ok(targetPath.startsWith(root + path.sep), `${file}: non-portable asset`);
    await access(targetPath);
    if (fragment) {
      const targetHtml = target ? await readFile(targetPath, 'utf8') : html;
      assert.ok(targetHtml.includes(`id="${fragment}"`), `${file}: missing ${ref}`);
    }
  }
}
const projects = await readFile(path.join(root, 'projects.html'), 'utf8');
assert.equal([...projects.matchAll(/class="project"/g)].length, 23);
assert.ok(projects.includes('当前筛选') || projects.includes('23 个项目'));
const home = await readFile(path.join(root, 'index.html'), 'utf8');
for (const scope of ['固定评测集', '一次真实运行', '内部测试', '流程示意']) assert.ok(home.includes(scope), scope);
const css = await readFile(path.join(root, 'style.css'), 'utf8');
for (const match of css.matchAll(/url\('([^']+)'\)/g)) await access(path.join(root, match[1]));
for (const file of ['projects.html', 'projects-en.html']) {
  const html = await readFile(path.join(root, file), 'utf8');
  assert.equal([...html.matchAll(/class="project"/g)].length, 23);
}
assert.ok(css.includes('.cail-entry{grid-template-columns:104px minmax(0,1fr) 144px;gap:24px}'));
console.log('PASS: 6 bilingual pages, paired language links, local assets, fragments, 23 repositories and production awards layout.');

// Same small DOM harness pattern as scripts/check-personal-space.cjs.
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
const theme = node(), language = node(), status = node(), archive = node(), archiveSummary = node();
language.setAttribute('href', 'projects.html');
const sort = node();
function project(id, practice, stars, pushed) {
  const item = node({ name: id, practice, stars, pushed });
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
const elements = { '.theme': theme, '.language': language, '#sort': sort, '.archive-group': archive, '.collection-status': status };
const all = [...active, ...archived];
const projectLink = node();
projectLink.setAttribute('href', '#old');
const documentEvents = {}, windowEvents = {};
const context = {
  URL, URLSearchParams,
  location: new URL('https://example.test/projects-en.html?filter=research&sort=recent'),
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
runInNewContext(await readFile(path.join(root, 'prototype.js'), 'utf8'), context);
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
