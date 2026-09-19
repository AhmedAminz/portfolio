/* ═══════════════════════════════════════════════════════
   Ahmed Amin Portfolio — Interactive Script
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  initNeuralCanvas();
  initTypewriter();
  initScrollReveal();
  initNavbar();
  initAnimatedCounters();
  initClipboard();
});

/* ═══════════════════════════════════════════════════════
   1. NEURAL NETWORK / PARTICLE CANVAS
   ═══════════════════════════════════════════════════════ */
function initNeuralCanvas() {
  const canvas = document.getElementById('neural-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height, particles, mouse, animationId;
  const PARTICLE_COUNT_BASE = 100;
  const CONNECTION_DIST = 150;
  const MOUSE_RADIUS = 200;

  mouse = { x: -9999, y: -9999 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = document.documentElement.scrollHeight;
    canvas.style.height = height + 'px';
  }

  function createParticles() {
    const count = Math.min(PARTICLE_COUNT_BASE, Math.floor((width * height) / 18000));
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECTION_DIST) {
          const opacity = (1 - dist / CONNECTION_DIST) * 0.2;
          ctx.strokeStyle = `rgba(0, 229, 255, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles and handle mouse interaction
    for (const p of particles) {
      // Mouse repulsion / attraction
      const dxMouse = p.x - mouse.x;
      const dyMouse = p.y - mouse.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

      if (distMouse < MOUSE_RADIUS) {
        // Draw connection to mouse
        const mouseOpacity = (1 - distMouse / MOUSE_RADIUS) * 0.4;
        ctx.strokeStyle = `rgba(0, 229, 255, ${mouseOpacity})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();

        // Gentle push away
        const force = (MOUSE_RADIUS - distMouse) / MOUSE_RADIUS * 0.02;
        p.vx += (dxMouse / distMouse) * force;
        p.vy += (dyMouse / distMouse) * force;
      }

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Dampen velocity
      p.vx *= 0.998;
      p.vy *= 0.998;

      // Bounce off edges
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // Keep within bounds
      p.x = Math.max(0, Math.min(width, p.x));
      p.y = Math.max(0, Math.min(height, p.y));

      // Draw particle
      const glow = distMouse < MOUSE_RADIUS
        ? p.opacity + (1 - distMouse / MOUSE_RADIUS) * 0.5
        : p.opacity;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${Math.min(glow, 1)})`;
      ctx.fill();

      // Outer glow for nearby particles
      if (distMouse < MOUSE_RADIUS * 0.5) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${(1 - distMouse / (MOUSE_RADIUS * 0.5)) * 0.08})`;
        ctx.fill();
      }
    }

    animationId = requestAnimationFrame(draw);
  }

  // Track mouse globally (using page coordinates to match canvas)
  document.addEventListener('mousemove', (e) => {
    mouse.x = e.pageX;
    mouse.y = e.pageY;
  });

  document.addEventListener('mouseleave', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  // Touch support
  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    mouse.x = touch.pageX;
    mouse.y = touch.pageY;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    mouse.x = -9999;
    mouse.y = -9999;
  });

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  // Recalculate height when content changes (e.g., reveals)
  const resizeObserver = new ResizeObserver(() => {
    const newHeight = document.documentElement.scrollHeight;
    if (Math.abs(canvas.height - newHeight) > 50) {
      canvas.height = newHeight;
      height = newHeight;
      canvas.style.height = height + 'px';
    }
  });
  resizeObserver.observe(document.body);

  resize();
  createParticles();
  draw();
}

/* ═══════════════════════════════════════════════════════
   2. TYPEWRITER EFFECT
   ═══════════════════════════════════════════════════════ */
function initTypewriter() {
  const element = document.getElementById('typewriter');
  if (!element) return;

  const phrases = [
    'Data Scientist',
    'ML Engineer',
    'Problem Solver',
    'AI Enthusiast',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function type() {
    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
      element.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      element.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 90;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      // Pause at end of word
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 400;
    }

    setTimeout(type, typeSpeed);
  }

  // Start after hero animation
  setTimeout(type, 1200);
}

/* ═══════════════════════════════════════════════════════
   3. SCROLL REVEAL (IntersectionObserver)
   ═══════════════════════════════════════════════════════ */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');

  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Don't unobserve — allows re-triggers if desired, but for performance:
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach((el) => observer.observe(el));
}

/* ═══════════════════════════════════════════════════════
   4. NAVBAR (scroll effects + mobile toggle)
   ═══════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  const links = document.querySelectorAll('.nav-link');

  // Scroll class
  function onScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link highlighting
    const sections = document.querySelectorAll('.section');
    let current = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    links.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      menu.classList.toggle('open');
    });

    // Close menu on link click
    links.forEach((link) => {
      link.addEventListener('click', () => {
        toggle.classList.remove('active');
        menu.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navbar.contains(e.target) && menu.classList.contains('open')) {
        toggle.classList.remove('active');
        menu.classList.remove('open');
      }
    });
  }
}

/* ═══════════════════════════════════════════════════════
   5. ANIMATED COUNTERS
   ═══════════════════════════════════════════════════════ */
function initAnimatedCounters() {
  const counters = document.querySelectorAll('.stat__number');
  if (!counters.length) return;

  let animated = false;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          counters.forEach((counter) => {
            const target = parseFloat(counter.getAttribute('data-target'));
            const isDecimal = counter.hasAttribute('data-decimal');
            const duration = 1500;
            const startTime = performance.now();

            function update(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);

              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = eased * target;

              if (isDecimal) {
                counter.textContent = current.toFixed(1);
              } else {
                counter.textContent = Math.floor(current);
              }

              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                counter.textContent = isDecimal ? target.toFixed(1) : target;
              }
            }

            requestAnimationFrame(update);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  // Observe the stats container
  const statsContainer = document.querySelector('.about__stats');
  if (statsContainer) {
    observer.observe(statsContainer);
  }
}

/* ═══════════════════════════════════════════════════════
   6. CLICK TO COPY & TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════ */
function initClipboard() {
  const copyElements = document.querySelectorAll('[data-copy]');
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toast-message');
  let toastTimeout = null;

  function showToast(message) {
    if (!toast) return;
    if (toastMessage) toastMessage.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  copyElements.forEach((el) => {
    function handleCopy(e) {
      e.preventDefault();
      const text = el.getAttribute('data-copy');
      if (!text) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          triggerSuccess(el, text);
        }).catch(() => {
          fallbackCopy(el, text);
        });
      } else {
        fallbackCopy(el, text);
      }
    }

    function triggerSuccess(element, text) {
      element.classList.add('copied');
      const label = element.querySelector('.contact-btn__label')?.textContent || 'Item';
      showToast(`✓ Copied ${label} (${text}) to clipboard!`);
      setTimeout(() => element.classList.remove('copied'), 2000);
    }

    function fallbackCopy(element, text) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        triggerSuccess(element, text);
      } catch (err) {
        showToast(`Could not copy: ${text}`);
      }
      document.body.removeChild(textarea);
    }

    el.addEventListener('click', handleCopy);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        handleCopy(e);
      }
    });
  });
}

