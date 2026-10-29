// ========== CONFIG ==========
const RECEIVER_EMAIL = 'rohitsaini941145@gmail.com';

// ========== 1. MOBILE MENU ==========
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
if (burger && menu) {
  burger.addEventListener('click', () => menu.classList.toggle('open'));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));
}

// ========== 2. FOOTER YEAR ==========
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ========== 3. COUNT-UP ==========
function countUp(el) {
  if (el.dataset.counted === 'true') return;
  el.dataset.counted = 'true';
  const target = parseFloat(el.dataset.count) || 0;
  const suf = el.dataset.suf || '';
  const pre = el.dataset.pre || '';
  const useComma = el.dataset.comma === 'true';
  const duration = 1800;
  const startTime = performance.now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const ease = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(ease * target);
    el.textContent = pre + (useComma ? current.toLocaleString('en-IN') : current) + (progress === 1 ? suf : '');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = pre + (useComma ? target.toLocaleString('en-IN') : target) + suf;
  }
  requestAnimationFrame(step);
}

// ========== 4. SCROLL REVEAL ==========
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('show');
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    if (e.target.matches('[data-count]')) countUp(e.target);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// ========== 5. PROJECT FILTERS ==========
const buttons = document.querySelectorAll('.filters button');
const projects = document.querySelectorAll('.project');
buttons.forEach(btn => btn.addEventListener('click', () => {
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.f;
  projects.forEach(p => p.classList.toggle('hide', f !== 'all' && p.dataset.c !== f));
}));

// ========== 6. CONTACT FORM (FormSubmit) ==========
const form = document.getElementById('contactForm');
const msg = document.getElementById('formMsg');
if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const d = Object.fromEntries(new FormData(form));
    msg.className = 'formmsg';

    if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || !d.service || !d.message.trim()) {
      msg.textContent = 'Please fill name, a valid email, service and message.';
      msg.classList.add('err');
      return;
    }
    if (d._honey) return; // bot spam

    btn.disabled = true;
    btn.textContent = 'Sending...';
    msg.textContent = 'Sending your message...';

    try {
      const res = await fetch('https://formsubmit.co/ajax/' + RECEIVER_EMAIL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          Name: d.name,
          Email: d.email,
          Service: d.service,
          Subject: d.subject || 'Portfolio Inquiry',
          Message: d.message,
          Page: location.href,
          Time: new Date().toLocaleString('en-IN'),
          _replyto: d.email,
          _subject: `New Portfolio Inquiry: ${d.name} (${d.service})`,
          _autoresponse: `Hi ${d.name}, thanks for contacting me! I received your message about "${d.service}" and will reply within 24 hours. - Aman Saini`,
          _captcha: 'false',
          _template: 'table'
        })
      });
      const data = await res.json().catch(() => ({}));
      console.log('FormSubmit:', res.status, data);

      if (res.ok && String(data.success) === 'true') {
        msg.textContent = '✓ Thanks! Your message has been sent successfully.';
        msg.classList.add('ok');
        form.reset();
      } else {
        throw new Error(data.message || 'Server error');
      }
    } catch (err) {
      console.error(err);
      msg.textContent = 'Failed: ' + (err.message || 'please try again') + ' — or email me directly at ' + RECEIVER_EMAIL;
      msg.classList.add('err');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Message →';
    }
  });
}

// ===== animations.js =====
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Helper elements
  const make = (tag, id, html) => { const e = document.createElement(tag); e.id = id; if (html) e.innerHTML = html; document.body.appendChild(e); return e; };
  const progress = make('div', 'progress');
  const glow = make('div', 'glow');
  const toTop = make('button', 'toTop', '↑'); toTop.setAttribute('aria-label', 'Back to top');
  const lb = make('div', 'lightbox', '<button aria-label="Close">✕</button><img alt="">');
  const lbImg = $('img', lb);

  // 1. Scroll progress, sticky nav, back-to-top, active link
  const nav = $('.nav');
  const links = $$('#menu a[href^="#"]:not(.btn)');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  function onScroll() {
    const h = document.documentElement;
    const y = h.scrollTop;
    progress.style.width = (y / (h.scrollHeight - h.clientHeight || 1)) * 100 + '%';
    nav.classList.toggle('scrolled', y > 30);
    toTop.classList.toggle('show', y > 600);
    let cur = sections[0];
    sections.forEach(s => { if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s; });
    links.forEach(a => a.classList.toggle('active', cur && a.getAttribute('href') === '#' + cur.id));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // 2. Cursor glow
  if (!reduce && matchMedia('(hover:hover)').matches) {
    addEventListener('mousemove', e => {
      document.body.classList.add('has-glow');
      glow.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    });
  }

  // 3. Typing effect on hero title
  const target = $('.hero h2 .grad');
  if (target && !reduce) {
    const words = ['Developer', 'Store Builder', 'Problem Solver'];
    let w = 0, c = words[0].length, del = true;
    target.classList.add('typed');
    function tick() {
      const word = words[w];
      c += del ? -1 : 1;
      target.textContent = word.slice(0, c) || '\u200b';
      let delay = del ? 55 : 95;
      if (!del && c === word.length) { del = true; delay = 1800; }
      else if (del && c === 0) { del = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 2500);
  }

  // 4. Stagger reveal inside grids
  $$('.tiles,.grid4,.grid3,.stats').forEach(g => {
    $$('.reveal', g).forEach((el, i) => {
      el.style.transitionDelay = i * 90 + 'ms';
      setTimeout(() => (el.style.transitionDelay = ''), 2500 + i * 90);
    });
  });

  // 5. 3D tilt on cards + magnetic buttons
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('tilting');
        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => { card.classList.remove('tilting'); card.style.transform = ''; });
    });
    $$('.btn').forEach(b => {
      b.addEventListener('mousemove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.15}px,${(e.clientY - r.top - r.height / 2) * 0.25 - 3}px)`;
      });
      b.addEventListener('mouseleave', () => (b.style.transform = ''));
    });
  }

  // 6. Project images: fallback + lightbox
  $$('.project .thumb').forEach(t => {
    const img = $('img', t);
    if (!img) return;
    const fail = () => t.classList.add('noimg');
    img.addEventListener('error', fail);
    if (img.complete && img.naturalWidth === 0) fail();
    t.addEventListener('click', () => {
      if (t.classList.contains('noimg')) return;
      lbImg.src = img.src; lbImg.alt = img.alt;
      lb.classList.add('open');
    });
  });
  const closeLb = () => lb.classList.remove('open');
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
})();
