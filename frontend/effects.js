/* ═══════════════════════════════════════════════════════════════
   GALLERY PI SERVER — VISUAL EFFECTS ENGINE
   Lightweight effects optimized for Raspberry Pi 4
   ═══════════════════════════════════════════════════════════════ */

// ─── Configuration ─────────────────────────────────────────────
const CONFIG = {
  particles: {
    count: 15,        // Low count for Pi performance
    color: 'var(--cyan)',
    size: 3,
    speed: 15000,     // ms to float up
  },
  cursorTrail: false, // Disabled for performance
  parallax: true,
};

// ─── Floating Particles ────────────────────────────────────────
function createParticles() {
  const container = document.body;

  for (let i = 0; i < CONFIG.particles.count; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle-decoration';

    const size = Math.random() * 3 + 2;
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = 10 + Math.random() * 15;

    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${left}%;
      bottom: -10px;
      animation: float ${duration}s linear ${delay}s infinite;
      opacity: ${Math.random() * 0.3 + 0.1};
    `;

    // Random color between cyan and purple
    const colors = [
      'rgba(0, 217, 255, 0.3)',
      'rgba(124, 77, 255, 0.3)',
      'rgba(233, 69, 96, 0.2)',
    ];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(particle);
  }
}

// ─── Card Entrance Animations ──────────────────────────────────
function animateCards() {
  const cards = document.querySelectorAll('.card, .timeline-item, .stat-item, .user-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, index * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
}

// ─── Parallax Tilt Effect on Cards ─────────────────────────────
function initParallax() {
  if (!CONFIG.parallax || window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll('.card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / centerY * -2;
      const rotateY = (x - centerX) / centerX * 2;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ─── Glitch Text Effect for Navbar ─────────────────────────────
function initGlitchEffect() {
  const title = document.querySelector('.navbar h1');
  if (!title) return;

  const originalText = title.textContent;
  const chars = '!<>-_\\/[]{}--=+*^?#________';

  title.addEventListener('mouseenter', () => {
    let iterations = 0;
    const interval = setInterval(() => {
      title.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations) return originalText[index];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iterations >= originalText.length) clearInterval(interval);
      iterations += 1 / 2;
    }, 30);
  });

  title.addEventListener('mouseleave', () => {
    title.textContent = originalText;
  });
}

// ─── Input Focus Glow ──────────────────────────────────────────
function initInputEffects() {
  const inputs = document.querySelectorAll('input, textarea, select');

  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      const card = input.closest('.card');
      if (card) {
        card.style.borderColor = 'var(--border-glow-cyan)';
        card.style.boxShadow = 'var(--shadow-glow-cyan), var(--shadow-card)';
      }
    });

    input.addEventListener('blur', () => {
      const card = input.closest('.card');
      if (card) {
        card.style.borderColor = '';
        card.style.boxShadow = '';
      }
    });
  });
}

// ─── Typewriter Effect for Page Title ──────────────────────────
function typewriterEffect(element, text, speed = 50) {
  if (!element) return;
  element.textContent = '';
  element.style.borderRight = '2px solid var(--cyan)';

  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      setTimeout(() => {
        element.style.borderRight = 'none';
      }, 1000);
    }
  }
  type();
}

// ─── Ripple Effect on Button Click ─────────────────────────────
function initRippleEffect() {
  const buttons = document.querySelectorAll('.btn, .btn-primary, .btn-danger, .btn-logout');

  buttons.forEach(button => {
    button.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        pointer-events: none;
        width: 0;
        height: 0;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%);
        animation: rippleExpand 0.6s ease-out forwards;
      `;

      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);

      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// Add ripple keyframes dynamically
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  @keyframes rippleExpand {
    to {
      width: 300px;
      height: 300px;
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);

// ─── Matrix Rain Effect (subtle background) ────────────────────
function initMatrixRain() {
  // Only on login page, very subtle
  const loginSection = document.querySelector('.login-section');
  if (!loginSection) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    opacity: 0.04;
    pointer-events: none;
    border-radius: var(--radius-lg);
  `;
  loginSection.style.position = 'relative';
  loginSection.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = loginSection.offsetWidth;
    height = canvas.height = loginSection.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = '01アイウエオカキクケコ';
  const fontSize = 12;
  let columns = Math.floor(width / fontSize);
  const drops = Array(columns).fill(1);

  function draw() {
    ctx.fillStyle = 'rgba(6, 6, 20, 0.1)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = '#00d9ff';
    ctx.font = fontSize + 'px JetBrains Mono';

    for (let i = 0; i < drops.length; i++) {
      const text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  // Run at lower FPS for Pi performance
  setInterval(draw, 100);
}

// ─── Initialize All Effects ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  animateCards();
  initParallax();
  initGlitchEffect();
  initInputEffects();
  initRippleEffect();
  initMatrixRain();

  // Add stagger animation to nav links
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach((link, i) => {
    link.style.opacity = '0';
    link.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      link.style.transition = 'all 0.3s ease';
      link.style.opacity = '1';
      link.style.transform = 'translateY(0)';
    }, 100 + i * 50);
  });
});
