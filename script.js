(function () {
  'use strict';

  // ==========================================
  // MOUSE TRACKING (for parallax floaters)
  // ==========================================
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Parallax floating assets
  const floats = document.querySelectorAll('.float');
  const floatOffsets = Array.from(floats).map(() => ({
    x: (Math.random() - 0.5) * 30,
    y: (Math.random() - 0.5) * 20,
    speed: 0.3 + Math.random() * 0.7
  }));

  function animateFloats() {
    floats.forEach((el, i) => {
      const o = floatOffsets[i];
      const px = mx * o.speed * 25 + o.x;
      const py = my * o.speed * 15 + o.y;
      el.style.transform = `translate(${px}px, ${py}px)`;
    });
    requestAnimationFrame(animateFloats);
  }
  if (floats.length) animateFloats();

  // ==========================================
  // GSAP ANIMATIONS
  // ==========================================
  window.addEventListener('load', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ----- Hero title reveal -----
    const heroLines = document.querySelectorAll('.hero-line');
    heroLines.forEach((line, i) => {
      gsap.fromTo(line,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.8, delay: 0.2 + i * 0.1, ease: 'power3.out' }
      );
    });

    // Hero sticker pop
    gsap.from('.hero-sticker', { scale: 0, rotation: -20, opacity: 0, duration: 0.6, delay: 0.1, ease: 'back.out(1.7)' });

    // Hero bottom fade
    gsap.from('.hero-bottom', { y: 30, opacity: 0, duration: 0.7, delay: 0.7, ease: 'power2.out' });

    // Product frame entrance
    gsap.from('.product-frame', { y: 60, opacity: 0, rotation: 5, duration: 0.9, delay: 0.5, ease: 'power3.out' });
    gsap.from('.product-label', { y: 20, opacity: 0, duration: 0.6, delay: 0.9, ease: 'power2.out' });

    // ----- Scroll-triggered reveals -----
    // Menu title
    gsap.from('.menu-title', {
      y: 80, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.menu-header', start: 'top 85%' }
    });

    gsap.from('.menu-header .sticker', {
      scale: 0, rotation: -15, opacity: 0, duration: 0.5, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: '.menu-header', start: 'top 85%' }
    });

    // Menu cards stagger
    gsap.from('.menu-card', {
      y: 50, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out',
      scrollTrigger: { trigger: '.menu-grid', start: 'top 85%' }
    });

    // Story section
    gsap.from('.story .sticker', {
      scale: 0, rotation: 10, opacity: 0, duration: 0.5, ease: 'back.out(1.7)',
      scrollTrigger: { trigger: '.story', start: 'top 80%' }
    });

    gsap.from('.story-title', {
      y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.story', start: 'top 80%' }
    });

    gsap.from('.story-title--outline', {
      y: 60, opacity: 0, duration: 0.8, delay: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: '.story', start: 'top 80%' }
    });

    gsap.from('.story-text', {
      y: 30, opacity: 0, duration: 0.7, delay: 0.2, ease: 'power2.out',
      scrollTrigger: { trigger: '.story', start: 'top 75%' }
    });

    // Story stats
    gsap.from('.stat-block', {
      y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.story-stats', start: 'top 85%' }
    });

    // Find us
    gsap.from('.find-title', {
      y: 60, opacity: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.find-us', start: 'top 85%' }
    });

    gsap.from('.find-card', {
      y: 40, opacity: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.find-grid', start: 'top 85%' }
    });

    // Footer
    gsap.from('.footer-signup h2', {
      y: 40, opacity: 0, duration: 0.7, ease: 'power3.out',
      scrollTrigger: { trigger: '.footer-signup', start: 'top 85%' }
    });

    gsap.from('.signup-form', {
      y: 20, opacity: 0, duration: 0.6, delay: 0.1, ease: 'power2.out',
      scrollTrigger: { trigger: '.signup-form', start: 'top 90%' }
    });

    // ----- Count-up stats -----
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          const duration = 1200;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(eased * target);
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      });
    });
  });

  // ==========================================
  // MENU CARD EXPAND
  // ==========================================
  document.querySelectorAll('.menu-card').forEach((card) => {
    const flavor = card.dataset.flavor;
    const flavorEl = card.querySelector('.card-flavor');
    if (flavorEl && flavor) flavorEl.textContent = flavor;

    card.addEventListener('click', () => {
      const wasExpanded = card.classList.contains('is-expanded');
      // Close all first
      document.querySelectorAll('.menu-card.is-expanded').forEach((c) => c.classList.remove('is-expanded'));
      // Toggle this one
      if (!wasExpanded) card.classList.add('is-expanded');
    });
  });

  // ==========================================
  // EMAIL SIGNUP VALIDATION
  // ==========================================
  const signupBtn = document.getElementById('signupBtn');
  const signupEmail = document.getElementById('signupEmail');
  const signupStatus = document.getElementById('signupStatus');

  if (signupBtn && signupEmail && signupStatus) {
    signupBtn.addEventListener('click', () => {
      const email = signupEmail.value.trim();
      signupStatus.className = 'signup-status';

      if (!email) {
        signupStatus.textContent = '↑ DROP YOUR EMAIL FIRST.';
        signupStatus.classList.add('is-error');
        signupEmail.focus();
        shakeElement(signupEmail);
        return;
      }

      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        signupStatus.textContent = '↑ THAT DOESN\'T LOOK RIGHT. TRY AGAIN.';
        signupStatus.classList.add('is-error');
        shakeElement(signupEmail);
        return;
      }

      signupStatus.textContent = 'YOU\'RE IN. FIRST DIBS = SECURED. 🔥';
      signupStatus.classList.add('is-success');
      signupEmail.value = '';
      // Celebration pulse
      signupBtn.style.background = '#5B8C3A';
      signupBtn.textContent = '✓ DONE';
      setTimeout(() => {
        signupBtn.style.background = '';
        signupBtn.textContent = 'SEND IT →';
      }, 2000);
    });

    signupEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') signupBtn.click();
    });
  }

  function shakeElement(el) {
    el.style.transition = 'transform 0.08s';
    el.style.transform = 'translateX(-6px)';
    setTimeout(() => { el.style.transform = 'translateX(6px)'; }, 80);
    setTimeout(() => { el.style.transform = 'translateX(-4px)'; }, 160);
    setTimeout(() => { el.style.transform = 'translateX(4px)'; }, 240);
    setTimeout(() => { el.style.transform = 'translateX(0)'; }, 320);
  }

  // ==========================================
  // NAV SCROLL STATE
  // ==========================================
  let lastScroll = 0;
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 100 && y > lastScroll) {
      nav.style.transform = 'translateY(-100%)';
    } else {
      nav.style.transform = 'translateY(0)';
    }
    lastScroll = y;
  }, { passive: true });
  nav.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';

})();
