const root = document.documentElement;
const english = root.lang === 'en';
const t = (en, zh) => english ? en : zh;
const languageLink = document.querySelector('[data-language]');
languageLink.addEventListener('click', () => {
  const target = new URL(languageLink.href);
  target.search = location.search;
  target.hash = location.hash;
  languageLink.href = target.href;
  try { localStorage.setItem('kenny-language', languageLink.dataset.language); } catch {}
});
const themeButton = document.querySelector('.theme');
function applyTheme(dark) {
  root.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? t('Switch to light mode', '切换到浅色外观') : t('Switch to dark mode', '切换到深色外观'));
  themeButton.textContent = dark ? '◑' : '◐';
}
try { applyTheme(localStorage.getItem('kenny-space-theme') === 'dark'); } catch { applyTheme(false); }
themeButton.addEventListener('click', () => {
  applyTheme(root.dataset.theme !== 'dark');
  try { localStorage.setItem('kenny-space-theme', root.dataset.theme); } catch {}
});
document.addEventListener('keydown', () => { document.body.dataset.keyboard = ''; });
document.addEventListener('pointerdown', () => { delete document.body.dataset.keyboard; });

const projects = [...document.querySelectorAll('.project')];
const filters = [...document.querySelectorAll('[data-filter]')];
const sort = document.querySelector('#sort');
let category = 'all';
let previewed;
function preview(project) {
  if (!project || previewed === project) return;
  previewed = project;
  document.querySelector('#preview-title').textContent = project.dataset.name;
  document.querySelector('#preview-copy').textContent = project.querySelector('summary p').textContent;
  const stars = document.querySelector('#preview-stars');
  stars.replaceChildren(document.createTextNode(project.dataset.stars));
  const caption = document.createElement('small');
  caption.textContent = 'GitHub Stars';
  stars.append(caption);
  const img = document.querySelector('#preview-image');
  img.src = project.dataset.image;
  img.alt = project.dataset.imageAlt;
  const imageLink = document.querySelector('#preview-image-link');
  imageLink.href = project.dataset.image;
  imageLink.setAttribute('aria-label', t(`View full-size ${project.dataset.name} image (new tab)`, `查看 ${project.dataset.name} 原图（新标签页）`));
  document.querySelector('#preview-caption').textContent = project.dataset.imageCaption;
  document.querySelector('#preview-link').href = `#${project.id}`;
}
function filterProjects() {
  const sorted = [...projects].sort((a, b) => sort.value === 'name'
    ? a.dataset.name.localeCompare(b.dataset.name, 'en')
    : Number(b.dataset.stars) - Number(a.dataset.stars));
  for (const project of sorted) {
    project.hidden = category !== 'all' && project.dataset.category !== category;
    document.querySelector('#project-items').append(project);
  }
  for (const button of filters) button.setAttribute('aria-pressed', String(button.dataset.filter === category));
  const visible = sorted.filter(project => !project.hidden);
  document.querySelector('#project-count').textContent = t(`${visible.length} projects · Select to explore`, `${visible.length} 个项目 · 点击展开详情`);
  preview(visible[0]);
}
for (const button of filters) button.addEventListener('click', () => { category = button.dataset.filter; filterProjects(); });
sort?.addEventListener('change', filterProjects);
for (const project of projects) {
  const summary = project.querySelector('summary');
  summary.addEventListener('pointerenter', () => preview(project));
  summary.addEventListener('focus', () => preview(project));
  summary.addEventListener('click', event => {
    const body = project.querySelector('.project-body');
    body.classList.toggle('pointer-reveal', event.detail > 0 && !project.open);
  });
  project.addEventListener('toggle', () => { if (project.open) preview(project); });
}
function revealHash() {
  const project = projects.find(item => `#${item.id}` === location.hash);
  if (!project) return;
  category = 'all';
  filterProjects();
  project.open = true;
  preview(project);
  project.querySelector('summary').focus({ preventScroll: true });
  project.scrollIntoView({ block: 'start' });
}
if (projects.length) { filterProjects(); revealHash(); window.addEventListener('hashchange', revealHash); }
document.querySelector('#preview-link')?.addEventListener('click', () => {
  // Reopening an already-selected hash does not dispatch hashchange.
  if (location.hash === document.querySelector('#preview-link').hash) revealHash();
});

const save = document.querySelector('#save-quote');
const undo = document.querySelector('#undo-quote');
if (save) {
  const saved = document.querySelector('#demo-saved');
  const quote = document.querySelector('#demo-quote');
  const status = document.querySelector('#demo-status');
  save.addEventListener('click', () => {
    saved.textContent = t(`Saved: ${quote.textContent}`, `已留下：${quote.textContent}`);
    saved.hidden = false;
    quote.hidden = true;
    save.hidden = true;
    undo.hidden = false;
    status.textContent = t('Saved in this demo. You can undo it anytime.', '已收进本次演示，随时可以撤销。');
    undo.focus({ preventScroll: true });
  });
  undo.addEventListener('click', () => {
    saved.hidden = true;
    saved.textContent = '';
    quote.hidden = false;
    save.hidden = false;
    undo.hidden = true;
    status.textContent = t('Undone. You can save it again.', '已撤销，可以重新收集。');
    save.focus({ preventScroll: true });
  });
}
