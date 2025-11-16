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

(function setupContactForm() {
  const form = document.querySelector('#contact form');
  if (!form) return;

  const statusEl = form.querySelector('[data-form-status]');
  const submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!submitBtn) return;

    setStatus('info', 'Sending...');
    submitBtn.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.ok) {
        form.reset();
        setStatus('success', 'Message sent! I\'ll get back to you soon.');
      } else {
        const error = payload.error || 'Unable to send your message right now.';
        setStatus('error', error);
      }
    } catch (error) {
      setStatus('error', 'Network error — please try again.');
    } finally {
      submitBtn.disabled = false;
    }
  });

  function setStatus(state, message) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.remove('is-error', 'is-success');
    if (state === 'success') {
      statusEl.classList.add('is-success');
    } else if (state === 'error') {
      statusEl.classList.add('is-error');
    }
  }
})();
