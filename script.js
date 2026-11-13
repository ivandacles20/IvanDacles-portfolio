// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

menuToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});
navLinks.querySelectorAll('a').forEach(link =>
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  })
);

// Navbar shrink on scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// Active link highlight
const sections = document.querySelectorAll('main section[id]');
const links = document.querySelectorAll('.nav-links a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

// Scroll reveal
const reveal = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

// Image lightbox (photos and resume)
const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox.querySelector('img');

function openLightbox(src, alt, tall = false) {
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightbox.classList.toggle('tall', tall);
  lightbox.classList.add('open');
  lightbox.scrollTop = 0;
}
function closeLightbox() {
  lightbox.classList.remove('open', 'tall');
}

document.querySelectorAll('.shot img').forEach(img => {
  img.addEventListener('click', () => openLightbox(img.src, img.alt));
});

document.getElementById('resumeBtn').addEventListener('click', e => {
  e.preventDefault();
  openLightbox(e.currentTarget.getAttribute('href'), 'Resume of Ivan Cyrus Dacles', true);
});

lightbox.addEventListener('click', closeLightbox);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeLightbox();
});

// Contact form (opens email app; works without a backend)
const form = document.getElementById('contactForm');
const note = document.getElementById('formNote');
form.addEventListener('submit', e => {
  e.preventDefault();
  const name = encodeURIComponent(form.name.value.trim());
  const email = encodeURIComponent(form.email.value.trim());
  const msg = encodeURIComponent(form.message.value.trim());
  window.location.href =
    `mailto:ivancyrus37@gmail.com?subject=Portfolio message from ${name}&body=${msg}%0A%0AFrom: ${name} (${email})`;
  note.textContent = 'Thank you! Your email app should open now.';
  form.reset();
});
// ===== ID card: drag to stretch (elastic), click to flip =====
const idWrap = document.querySelector('.id-wrap');
const idCard = document.getElementById('idCard');

if (idWrap && idCard) {
  let startX = 0, startY = 0;
  let angle = 0, pull = 0;
  let dragging = false, moved = 0, raf = 0;

  const apply = () => {
    idWrap.style.transform = `rotate(${angle}deg)`;
    idWrap.style.setProperty('--pull', pull.toFixed(1));
  };
  const reset = () => {
    angle = 0; pull = 0;
    idWrap.classList.remove('dragging');
    idWrap.style.transform = '';
    idWrap.style.removeProperty('--pull');
  };

  // Spring back like a rubber band
  const release = () => {
    if (!dragging) return;
    dragging = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { reset(); return; }
    let vA = 0, vP = 0;
    const step = () => {
      vA += -angle * 0.09; vA *= 0.85; angle += vA;
      vP += -pull * 0.14;  vP *= 0.80; pull += vP;
      apply();
      const done = Math.abs(angle) < 0.04 && Math.abs(vA) < 0.02 &&
                   Math.abs(pull) < 0.3 && Math.abs(vP) < 0.1;
      if (done) { reset(); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  // Pivot of the swing = transform-origin in CSS (50% -420px)
  const PIVOT_OFFSET = 420;
  const MAX_PULL = 200;
  const toDeg = r => r * 180 / Math.PI;
  let pivotX = 0, pivotY = 0, a0 = 0, d0 = 1;

  idCard.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    cancelAnimationFrame(raf);
    dragging = true;
    moved = 0;
    startX = e.clientX;
    startY = e.clientY;
    idWrap.classList.add('dragging');
    idCard.setPointerCapture(e.pointerId);

    // Start from rest, then measure where the pivot is on screen
    angle = 0; pull = 0;
    apply();
    const r = idWrap.getBoundingClientRect();
    pivotX = r.left + r.width / 2;
    pivotY = r.top - PIVOT_OFFSET;
    a0 = toDeg(Math.atan2(e.clientX - pivotX, e.clientY - pivotY));
    d0 = Math.hypot(e.clientX - pivotX, e.clientY - pivotY);
  });

  idCard.addEventListener('pointermove', e => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    moved = Math.max(moved, Math.hypot(dx, dy));

    // The card follows the pointer around the pivot
    const px = e.clientX - pivotX;
    const py = e.clientY - pivotY;
    const a = toDeg(Math.atan2(px, py));
    angle = Math.max(-40, Math.min(40, -(a - a0)));   // minus: CSS rotate() is clockwise-positive

    // Stretch the lanyard the farther the pointer is pulled from the pivot
    const raw = Math.hypot(px, py) - d0;
    pull = raw > 0
      ? MAX_PULL * (1 - Math.exp(-raw / MAX_PULL))     // rubber band when pulling away
      : Math.max(raw * 0.15, -24);                      // small squash when pushing up
    apply();
  });

  idCard.addEventListener('pointerup', () => {
    const wasClick = moved < 6;
    release();
    if (wasClick) idCard.classList.toggle('flipped');
  });
  idCard.addEventListener('pointercancel', release);

  // Keyboard: Enter or Space flips the card
  idCard.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      idCard.classList.toggle('flipped');
    }
  });
}

// ===== Cursor: small sun that follows the pointer, with a fire trail =====
(() => {
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduceMotion) return;   // skip on touch screens / reduced motion

  const sun = document.createElement('div');
  sun.className = 'cursor-sun';
  sun.setAttribute('aria-hidden', 'true');

  const canvas = document.createElement('canvas');
  canvas.className = 'cursor-fire';
  canvas.setAttribute('aria-hidden', 'true');

  document.body.append(canvas, sun);
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  window.addEventListener('resize', resize);

  let mx = -100, my = -100;   // real pointer
  let x = -100, y = -100;     // sun position (follows with a delay)
  let visible = false, seen = false, frame = 0;
  const particles = [];
  const MAX_PARTICLES = 120;
  const SUN_RADIUS = 12;

  const emit = (count, spread, boost) => {
    for (let i = 0; i < count; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 0.9,
        vy: -(0.5 + Math.random() * 1.1) - boost,
        size: 3 + Math.random() * 5,
        life: 1,
        decay: 0.018 + Math.random() * 0.02
      });
    }
    while (particles.length > MAX_PARTICLES) particles.shift();
  };

  const loop = () => {
    const px = x, py = y;
    x += (mx - x) * 0.2;
    y += (my - y) * 0.2;
    sun.style.transform = `translate3d(${x - SUN_RADIUS}px, ${y - SUN_RADIUS}px, 0)`;

    const speed = Math.hypot(x - px, y - py);
    frame++;
    if (visible) {
      if (speed > 0.8) emit(1 + Math.min(3, Math.floor(speed / 4)), 8, Math.min(speed * 0.05, 1));
      else if (frame % 2 === 0) emit(1, 8, 0);   // idle flicker
    }

    ctx.clearRect(0, 0, w, h);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx + Math.sin(p.y * 0.08) * 0.25;
      p.y += p.vy;
      p.vy *= 0.99;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }

      const t = p.life;                       // 1 = fresh (yellow), 0 = gone (red)
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.4 + t * 0.6), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${10 + t * 42}, 100%, ${45 + t * 18}%, ${t * 0.85})`;
      ctx.fill();
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    mx = e.clientX;
    my = e.clientY;
    if (!seen) { x = mx; y = my; seen = true; }
    visible = true;
    sun.classList.add('show');
  });
  document.documentElement.addEventListener('mouseleave', () => {
    visible = false;
    sun.classList.remove('show');
  });
  // Little burst of fire on click
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') emit(14, 10, 1.2);
  });
})();