(() => {
  let theme;
  try { theme = localStorage.getItem('r1ck5-theme'); } catch {}
  document.documentElement.dataset.theme = ['dark', 'light'].includes(theme) ? theme : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
})();
