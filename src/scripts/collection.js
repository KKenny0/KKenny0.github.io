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
  if (counter) counter.textContent = document.documentElement.lang === 'en'
    ? `${count} ${noteInput ? (count === 1 ? 'note' : 'notes') : (count === 1 ? 'tool' : 'tools')}`
    : `${count} ${noteInput ? '篇笔记' : '件工具'}`;
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
randomNote?.addEventListener('click', (event = {}) => {
  const candidates = entries.filter(entry => !entry.hidden);
  if (!candidates.length) return;
  const closed = candidates.filter(entry => !entry.open);
  const pool = closed.length ? closed : candidates;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  picked.open = true;
  picked.querySelector('summary').focus();
  picked.scrollIntoView({block:'center',behavior:event.detail === 0 || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
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
