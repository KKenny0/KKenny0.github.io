const theme = document.querySelector('#theme');
const darkPreference = matchMedia('(prefers-color-scheme: dark)');
function applyTheme(dark) {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  try { localStorage.setItem('kenny-space-theme', dark ? 'dark' : 'light'); } catch {}
  theme.setAttribute('aria-pressed', String(dark));
  theme.setAttribute('aria-label', dark ? '切换到浅色外观' : '切换到深色外观');
  theme.innerHTML = dark ? '夜深了 <span aria-hidden="true">◑</span>' : '灯亮着 <span aria-hidden="true">◐</span>';
}
let dark = document.documentElement.dataset.theme === 'dark';
try { const stored = localStorage.getItem('kenny-space-theme'); if (stored) dark = stored === 'dark'; } catch {}
applyTheme(dark);
theme.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme !== 'dark'));
document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => { const dialog = document.getElementById(button.dataset.open); dialog.showModal(); dialog.querySelector('input')?.focus(); });
});
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
});
const searchDialog = document.querySelector('#search-dialog');
const searchInput = document.querySelector('#site-search');
if (searchDialog) {
  const links = [...searchDialog.querySelectorAll('[data-search-item]')];
  const search = () => {
    const query = searchInput.value.trim().toLocaleLowerCase();
    links.forEach(link => { link.hidden = !link.textContent.toLocaleLowerCase().includes(query); });
    const count = links.filter(link => !link.hidden).length;
    document.querySelector('#search-count').textContent = `${count} 个结果`;
    document.querySelector('#search-empty').hidden = count !== 0;
  };
  searchInput.addEventListener('input', search);
  search();
  links.forEach(link => link.addEventListener('click', () => searchDialog.close()));
  document.addEventListener('keydown', event => {
    const typing = event.target.closest('input, textarea, [contenteditable="true"]');
    if (event.key === '/' && !typing && !document.querySelector('dialog[open]')) {
      event.preventDefault();
      searchDialog.showModal();
      searchInput.focus();
    }
  });
}
const entries = [...document.querySelectorAll('[data-entry]')];
const filterButtons = [...document.querySelectorAll('[data-filter]')];
const noteInput = document.querySelector('#note-search');
const randomNote = document.querySelector('#random-note');
let category = 'all';
function filterCollection() {
  const query = noteInput?.value.trim().toLocaleLowerCase() || '';
  entries.forEach(entry => {
    entry.hidden = !(category === 'all' || entry.dataset.category.split(' ').includes(category)) || !entry.textContent.toLocaleLowerCase().includes(query);
  });
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  const count = entries.filter(entry => !entry.hidden).length;
  const counter = document.querySelector('#collection-count');
  if (counter) counter.textContent = `${count} ${noteInput ? '篇笔记' : '件工具'}`;
  const empty = document.querySelector('#collection-empty');
  if (empty) empty.hidden = count !== 0;
  if (randomNote) randomNote.disabled = count === 0;
}
filterButtons.forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  filterCollection();
}));
noteInput?.addEventListener('input', filterCollection);
document.querySelector('#clear-filters')?.addEventListener('click', () => {
  category = 'all'; noteInput.value = ''; filterCollection(); noteInput.focus();
});
randomNote?.addEventListener('click', () => {
  const candidates = entries.filter(entry => !entry.hidden);
  if (!candidates.length) return;
  const closed = candidates.filter(entry => !entry.open);
  const pool = closed.length ? closed : candidates;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  picked.open = true;
  picked.querySelector('summary').focus();
  picked.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
});
function revealDestination() {
  const topic = new URLSearchParams(location.search).get('topic');
  category = filterButtons.some(button => button.dataset.filter === topic) ? topic : 'all';
  if (noteInput) noteInput.value = '';
  let id;
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { id = ''; }
  const target = entries.find(entry => entry.id === id);
  if (target) category = 'all';
  filterCollection();
  if (target) {
    target.open = true;
    target.querySelector('summary').focus({preventScroll:true});
    target.scrollIntoView({block:'start'});
  }
}
revealDestination();
window.addEventListener('hashchange', revealDestination);
