const themeButton = document.querySelector('.theme');
const english = document.documentElement.lang === 'en';
const languageLink = document.querySelector('.language');
const languageTarget = languageLink.getAttribute('href');
function syncLanguageLink() {
  languageLink.href = languageTarget + location.search + location.hash;
}
syncLanguageLink();
window.addEventListener('hashchange', syncLanguageLink);
languageLink.addEventListener('click', () => {
  syncLanguageLink();
  try { localStorage.setItem('kenny-language', languageLink.dataset.language); } catch {}
});
document.addEventListener('keydown', () => { document.body.dataset.keyboard = ''; });
document.addEventListener('pointerdown', () => { delete document.body.dataset.keyboard; });
let theme = 'light';
try { theme = localStorage.getItem('kenny-space-theme') === 'dark' ? 'dark' : 'light'; } catch {}
function applyTheme(value) {
  document.documentElement.dataset.theme = value;
  themeButton.setAttribute('aria-pressed', String(value === 'dark'));
  themeButton.textContent = value === 'dark' ? '◑' : '◐';
  themeButton.setAttribute('aria-label', english
    ? `Switch to ${value === 'dark' ? 'light' : 'dark'} mode`
    : `切换到${value === 'dark' ? '浅' : '深'}色外观`);
}
applyTheme(theme);
themeButton.addEventListener('click', () => {
  theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(theme);
  try { localStorage.setItem('kenny-space-theme', theme); } catch {}
});

const filters = [...document.querySelectorAll('[data-filter]')];
const sort = document.querySelector('#sort');
const archiveGroup = document.querySelector('.archive-group');
const query = new URLSearchParams(location.search);
if (sort) {
  const category = filters.some(button => button.dataset.filter === query.get('filter')) ? query.get('filter') : 'all';
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  sort.value = query.get('sort') === 'recent' ? 'recent' : 'stars';
}
function updateProjects() {
  const category = filters.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.filter || 'all';
  let active = 0;
  let archived = 0;
  document.querySelectorAll('[data-project-list]').forEach(list => {
    const items = [...list.querySelectorAll('.project')];
    items.sort((a, b) => sort.value === 'recent' ? b.dataset.updated.localeCompare(a.dataset.updated) : Number(b.dataset.stars) - Number(a.dataset.stars) || a.dataset.name.localeCompare(b.dataset.name, 'en'));
    items.forEach(item => {
      item.hidden = category !== 'all' && item.dataset.category !== category;
      if (!item.hidden) {
        if (list.dataset.projectList === 'archive') archived++;
        else active++;
      }
      list.append(item);
    });
  });
  document.querySelector('.collection-status').textContent = english
    ? `${active} active projects · ${archived} archived`
    : `当前筛选：${active} 个活跃项目 · ${archived} 个归档项目`;
  if (archiveGroup) {
    archiveGroup.hidden = archived === 0;
    document.querySelector('#archive-count').textContent = archived;
  }
}
function saveProjectView() {
  const url = new URL(location.href);
  const category = filters.find(button => button.getAttribute('aria-pressed') === 'true').dataset.filter;
  category === 'all' ? url.searchParams.delete('filter') : url.searchParams.set('filter', category);
  sort.value === 'stars' ? url.searchParams.delete('sort') : url.searchParams.set('sort', sort.value);
  // A filter can hide the current fragment; keep the URL consistent with the view.
  const linked = [...document.querySelectorAll('.project')].find(item => '#' + item.id === url.hash);
  if (linked?.hidden) url.hash = '';
  history.replaceState(null, '', url);
  syncLanguageLink();
}
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
  updateProjects();
  saveProjectView();
}));
sort?.addEventListener('change', () => { updateProjects(); saveProjectView(); });
if (sort) updateProjects();
function openLinkedProject() {
  const item = [...document.querySelectorAll('.project')].find(item => '#' + item.id === location.hash);
  if (item?.classList.contains('project')) {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === 'all')));
    updateProjects();
    saveProjectView();
    item.open = true;
    const archive = item.closest('.archive-group');
    if (archive) archive.open = true;
    item.querySelector('summary').focus({ preventScroll: true });
    item.scrollIntoView({ block: 'start' });
  }
}
window.addEventListener('hashchange', openLinkedProject);
if (sort && location.hash) openLinkedProject();
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button > 0) return;
  const hash = link.getAttribute('href');
  if (!sort || ![...document.querySelectorAll('.project')].some(item => '#' + item.id === hash)) return;
  event.preventDefault();
  if (hash !== location.hash) history.pushState(null, '', hash);
  openLinkedProject();
}));
document.querySelectorAll('details').forEach(details => {
  details.querySelector('summary').addEventListener('click', event => {
    details.classList.toggle('pointer-reveal', event.detail > 0 && !details.open);
  });
});
