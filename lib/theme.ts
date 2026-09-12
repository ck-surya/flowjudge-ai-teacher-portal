// Runs before the first paint so saved preferences also apply to public pages.
export const themeInitScript = `(() => {
  let theme;
  try { theme = localStorage.getItem('flowjudge-theme'); } catch {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('light', theme === 'light');
})();`
