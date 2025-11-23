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

(function initStarfieldBackground() {
  const canvas = document.getElementById('bg-stage');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const state = {
    lastTime: 0,
    elapsed: 0,
    cssWidth: 0,
    cssHeight: 0,
    dpr: window.devicePixelRatio || 1,
    stars: [],
  };

  function createStar() {
    const baseR = 6 + Math.random() * 6;
    return {
      x: Math.random() * (state.cssWidth || 1),
      y: Math.random() * (state.cssHeight || 1),
      vx: 20 + Math.random() * 40,
      vy: (Math.random() * 2 - 1) * 25,
      baseR,
      r: baseR,
      twinkleSpeed: 1 + Math.random(),
      phaseA: Math.random() * Math.PI * 2,
      phaseB: Math.random() * Math.PI * 2,
      entering: false,
      leaving: false,
    };
  }

  function spawnIncomingStar() {
    const star = createStar();
    star.x = -star.r * 2;
    star.y = star.r + Math.random() * Math.max(1, state.cssHeight - star.r * 2);
    star.vx = 60 + Math.random() * 100;
    star.vy = (Math.random() * 2 - 1) * 40;
    star.entering = true;
    return star;
  }

  function resize() {
    state.cssWidth = window.innerWidth;
    state.cssHeight = window.innerHeight;
    state.width = state.cssWidth * state.dpr;
    state.height = state.cssHeight * state.dpr;

    canvas.width = state.width;
    canvas.height = state.height;
    canvas.style.width = `${state.cssWidth}px`;
    canvas.style.height = `${state.cssHeight}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(state.dpr, state.dpr);
  }

  function update(delta) {
    const leaveRatePerSecond = 0.08;
    const survivors = [];
    let departures = 0;

    for (const star of state.stars) {
      if (!star.leaving && Math.random() < leaveRatePerSecond * delta) {
        star.leaving = true;
        star.vx = Math.abs(star.vx) + 70 + Math.random() * 80;
        star.vy = (Math.random() * 2 - 1) * 45;
      }

      star.x += star.vx * delta;
      star.y += star.vy * delta;

      const twinkle =
        0.2 * Math.sin(state.elapsed * star.twinkleSpeed + star.phaseA) +
        0.1 * Math.sin(state.elapsed * star.twinkleSpeed * 2 + star.phaseB);
      star.r = star.baseR * (1 + twinkle);

      const maxX = state.cssWidth - star.r;
      const maxY = state.cssHeight - star.r;

      if (star.entering && star.x >= star.r * 1.1) {
        star.entering = false;
      }

      if (!star.leaving && !star.entering) {
        if (star.x < star.r || star.x > maxX) {
          star.vx *= -1;
          star.x = Math.max(star.r, Math.min(maxX, star.x));
        }

        if (star.y < star.r || star.y > maxY) {
          star.vy *= -1;
          star.y = Math.max(star.r, Math.min(maxY, star.y));
        }
      }

      const hasExited =
        star.x - star.r > state.cssWidth + 40 ||
        star.y < -star.r * 2 ||
        star.y > state.cssHeight + star.r * 2;

      if (hasExited) {
        departures += 1;
        continue;
      }

      survivors.push(star);
    }

    state.stars = survivors;

    for (let i = 0; i < departures; i += 1) {
      state.stars.push(spawnIncomingStar());
    }
  }

  function draw() {
    ctx.clearRect(0, 0, state.cssWidth, state.cssHeight);

    for (const star of state.stars) {
      const flicker = 0.75 + 0.25 * Math.sin(state.elapsed * star.twinkleSpeed * 3 + star.phaseB);

      ctx.save();
      ctx.globalAlpha = flicker;
      ctx.shadowColor = 'rgba(148, 197, 255, 0.45)';
      ctx.shadowBlur = star.r * 2.8;

      const halo = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.r * 3);
      halo.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
      halo.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r * 3, 0, Math.PI * 2);
      ctx.fill();

      const core = ctx.createRadialGradient(
        star.x,
        star.y,
        star.r * 0.15,
        star.x,
        star.y,
        star.r * 1.1,
      );
      core.addColorStop(0, '#f8fafc');
      core.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = core;
      ctx.shadowBlur = star.r * 1.3;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function loop(timestamp) {
    if (!state.lastTime) state.lastTime = timestamp;
    const delta = (timestamp - state.lastTime) / 1000;
    state.lastTime = timestamp;
    state.elapsed += delta;

    update(delta);
    draw();
    requestAnimationFrame(loop);
  }

  function seedStars(count) {
    for (let i = 0; i < count; i += 1) {
      state.stars.push(createStar());
    }
  }

  seedStars(18);
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(loop);
})();
