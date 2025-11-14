(function setupThemeToggle() {
  const root = document.documentElement;
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  const STORAGE_KEY = 'preferred-theme';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem(STORAGE_KEY);
  const initial = saved || (prefersDark ? 'dark' : 'light');

  applyTheme(initial);

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  });

  function applyTheme(theme) {
    root.dataset.theme = theme;          // hook for CSS: [data-theme="dark"]
    toggle.setAttribute('aria-pressed', theme === 'dark');
  }
})();
