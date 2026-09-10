const themeButton = document.querySelector('#theme-toggle');
function syncThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeButton.setAttribute('aria-label', `切换${dark ? '浅' : '深'}色模式`);
  themeButton.title = `切换${dark ? '浅' : '深'}色模式`;
  themeButton.setAttribute('aria-pressed', String(dark));
}
themeButton.hidden = false;
syncThemeButton();
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('r1ck5-theme', next); } catch {}
  syncThemeButton();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  let saved; try { saved = localStorage.getItem('r1ck5-theme'); } catch {}
  if (!saved) { document.documentElement.dataset.theme = e.matches ? 'dark' : 'light'; syncThemeButton(); }
});
const search = document.querySelector('#post-search');
if (search) {
  document.querySelector('.blog-tools').hidden = false;
  const filters = [...document.querySelectorAll('[data-filter]')], cards = [...document.querySelectorAll('[data-search]')];
  const params = new URLSearchParams(location.search);
  let category = filters.some(f => f.dataset.filter === params.get('category')) ? params.get('category') : '';
  search.value = params.get('q') || '';
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    cards.forEach(card => { card.hidden = !((!category || category === card.dataset.category) && card.dataset.search.toLocaleLowerCase().includes(query)); if (!card.hidden) count++; });
    filters.forEach(button => { const active = button.dataset.filter === category; button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active)); });
    document.querySelector('#no-results').hidden = count > 0;
    document.querySelector('.search-count').textContent = `共 ${count} 篇文章`;
    const url = new URL(location.href);
    if (category) url.searchParams.set('category', category); else url.searchParams.delete('category');
    if (query) url.searchParams.set('q', search.value.trim()); else url.searchParams.delete('q');
    history.replaceState(null, '', url);
  }
  search.addEventListener('input', filter);
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; filter(); }));
  document.querySelector('#reset-search').addEventListener('click', () => { category = ''; search.value = ''; filter(); search.focus(); });
  filter();
}
document.querySelectorAll('.copy-button').forEach(button => {
  button.hidden = false;
  button.addEventListener('click', async () => {
    const status = button.parentElement.querySelector('.copy-status');
    try { await navigator.clipboard.writeText(button.dataset.copy); status.textContent = '已复制！'; }
    catch { status.textContent = '自动复制不可用，请手动复制：' + button.dataset.copy; }
    setTimeout(() => { status.textContent = ''; }, 7000);
  });
});
