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
