/* ===================================================
   Sakura 二次元个人主页 · 主脚本
   =================================================== */

/* ---- 工具函数 ---- */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ===================================================
   1. 自定义光标（仅限支持精确指针的设备）
   =================================================== */
const cursor = $('#cursor');
const trail = $('#cursorTrail');

// 仅在支持悬停的设备上启用自定义光标
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (supportsHover) {
  let mouseX = 0, mouseY = 0;
  let trailX = 0, trailY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
  });

  // 拖尾效果（平滑跟随）
  (function animateTrail() {
    trailX += (mouseX - trailX) * 0.12;
    trailY += (mouseY - trailY) * 0.12;
    trail.style.left = trailX + 'px';
    trail.style.top = trailY + 'px';
    requestAnimationFrame(animateTrail);
  })();

  // 悬停可点击元素时放大光标
  $$('a, button, .interest-card, .work-card, .social-btn, .badge, .stat').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1.8)';
      cursor.style.background = 'var(--lavender-400)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.background = 'var(--pink-500)';
    });
  });
} else {
  // 在不支持悬停的设备上隐藏自定义光标元素
  cursor.style.display = 'none';
  trail.style.display = 'none';
}

/* ===================================================
   2. 樱花飘落动画
   =================================================== */
const sakuraContainer = $('#sakuraContainer');
const PETALS = ['🌸', '🌺', '✿', '❀', '🌷'];
const PETAL_COUNT = 20;

function createPetal() {
  const petal = document.createElement('span');
  petal.className = 'sakura-petal';
  petal.textContent = PETALS[Math.floor(Math.random() * PETALS.length)];

  const startX = Math.random() * 110 - 5; // -5% to 105%
  const duration = 8 + Math.random() * 10;
  const delay = Math.random() * 15;
  const size = 0.8 + Math.random() * 1.0;

  petal.style.cssText = `
    left: ${startX}%;
    font-size: ${size}rem;
    animation-duration: ${duration}s;
    animation-delay: ${delay}s;
  `;

  sakuraContainer.appendChild(petal);

  // 移除已飘落的花瓣防止 DOM 堆积
  setTimeout(() => petal.remove(), (duration + delay) * 1000);
}

// 初始创建一批
for (let i = 0; i < PETAL_COUNT; i++) createPetal();
// 持续补充
setInterval(createPetal, 800);

/* ===================================================
   3. 导航栏滚动效果
   =================================================== */
const navbar = $('#navbar');
const backToTop = $('#backToTop');
const navLinks = $$('.nav-links a');
const sections = $$('section[id]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // 导航栏透明→毛玻璃
  navbar.classList.toggle('scrolled', scrollY > 50);

  // 回到顶部按钮
  backToTop.classList.toggle('show', scrollY > 400);

  // 高亮当前导航项
  let current = '';
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop - 100) {
      current = sec.id;
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });
}, { passive: true });

// 回到顶部
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===================================================
   4. 汉堡菜单（移动端）
   =================================================== */
const navToggle = $('#navToggle');
const navMenu = $('.nav-links');

navToggle.addEventListener('click', () => {
  navMenu.classList.toggle('open');
});

// 点击菜单项后关闭
navLinks.forEach(link => {
  link.addEventListener('click', () => navMenu.classList.remove('open'));
});

/* ===================================================
   5. 打字机效果（Hero 副标题）
   =================================================== */
const phrases = [
  '二次元文化爱好者 🌸',
  '前端开发 & UI 设计师 💻',
  '插画创作者 🎨',
  '追番不停歇 🎌',
  '用代码书写梦想 ✨',
];

const typewriterEl = $('#typewriter');
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
const TYPE_SPEED = 80;
const DELETE_SPEED = 45;
const PAUSE_FULL = 2000;
const PAUSE_EMPTY = 500;

function typeLoop() {
  const current = phrases[phraseIndex];

  if (!isDeleting) {
    typewriterEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
    if (charIndex === current.length) {
      isDeleting = true;
      setTimeout(typeLoop, PAUSE_FULL);
      return;
    }
    setTimeout(typeLoop, TYPE_SPEED);
  } else {
    typewriterEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeLoop, PAUSE_EMPTY);
      return;
    }
    setTimeout(typeLoop, DELETE_SPEED);
  }
}

typeLoop();

/* ===================================================
   6. Intersection Observer：元素入场动画
   =================================================== */
const revealEls = $$('.reveal');

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => entry.target.classList.add('visible'), Number(delay));
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ===================================================
   7. 技能条动画
   =================================================== */
const skillFills = $$('.skill-fill');

const skillObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const fill = entry.target;
        fill.style.width = fill.dataset.width + '%';
        skillObserver.unobserve(fill);
      }
    });
  },
  { threshold: 0.3 }
);

skillFills.forEach(fill => skillObserver.observe(fill));

/* ===================================================
   8. 数字滚动计数器（关于我统计）
   =================================================== */
const statNums = $$('.stat-num');

function animateCount(el, target, duration = 1800) {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    el.textContent = progress < 1 ? Math.floor(progress * target) : target + '+';
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const target = Number(entry.target.dataset.target);
        animateCount(entry.target, target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

statNums.forEach(el => countObserver.observe(el));

/* ===================================================
   9. 联系表单（演示）
   =================================================== */
const contactForm = $('#contactForm');
const formSuccess = $('#formSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = contactForm.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = true;
  btn.textContent = '发送中… 💫';

  // 模拟发送延迟
  setTimeout(() => {
    contactForm.reset();
    btn.disabled = false;
    btn.textContent = '发送留言 💌';
    formSuccess.classList.add('show');
    setTimeout(() => formSuccess.classList.remove('show'), 4000);
  }, 1200);
});

/* ===================================================
   10. 头像点击特效（散花）
   =================================================== */
const avatarEl = $('#avatar');

avatarEl.addEventListener('click', () => {
  const burst = ['🌸', '✨', '💖', '🌺', '⭐', '🎀'];
  const rect = avatarEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement('span');
    particle.textContent = burst[Math.floor(Math.random() * burst.length)];
    const angle = (i / 10) * 2 * Math.PI;
    const dist = 80 + Math.random() * 60;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;

    Object.assign(particle.style, {
      position: 'fixed',
      left: cx + 'px',
      top: cy + 'px',
      fontSize: (1 + Math.random()) + 'rem',
      pointerEvents: 'none',
      zIndex: '9999',
      transform: 'translate(-50%, -50%)',
      transition: `transform 0.8s ease-out, opacity 0.8s ease-out`,
      willChange: 'transform, opacity',
    });

    document.body.appendChild(particle);

    requestAnimationFrame(() => {
      particle.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
      particle.style.opacity = '0';
    });

    setTimeout(() => particle.remove(), 900);
  }
});

/* ===================================================
   11. 鼠标移动视差（Hero 背景圆）
   =================================================== */
const heroSection = $('#hero');
const circles = $$('.circle');

heroSection.addEventListener('mousemove', (e) => {
  const rect = heroSection.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;

  circles.forEach((circle, i) => {
    const factor = (i + 1) * 15;
    circle.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
  });
});
