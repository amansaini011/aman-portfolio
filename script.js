// Mobile menu
const burger = document.getElementById('burger');
const menu = document.getElementById('menu');
burger.addEventListener('click', () => menu.classList.toggle('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// High-performance smooth Count-Up function
function countUp(el) {
  if (el.dataset.counted === 'true') return;
  el.dataset.counted = 'true';

  const target = parseFloat(el.dataset.count) || 0;
  const suf = el.dataset.suf || '';
  const pre = el.dataset.pre || '';
  const useComma = el.dataset.comma === 'true';
  const duration = 1800; // 1.8 seconds animation
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth easeOutQuad function
    const ease = 1 - (1 - progress) * (1 - progress);
    const current = Math.floor(ease * target);
    
    const formatted = useComma ? current.toLocaleString('en-IN') : current;
    el.textContent = pre + formatted + (progress === 1 ? suf : '');

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      const finalVal = useComma ? target.toLocaleString('en-IN') : target;
      el.textContent = pre + finalVal + suf;
    }
  }
  requestAnimationFrame(step);
}

// Scroll reveal + Counter trigger
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('show');
    
    // Count any element inside having data-count
    e.target.querySelectorAll('[data-count]').forEach(countUp);
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Also trigger hero counters immediately on page load
window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.hero [data-count]').forEach(countUp);
});

// Project filter
const buttons = document.querySelectorAll('.filters button');
const projects = document.querySelectorAll('.project');
buttons.forEach(btn => btn.addEventListener('click', () => {
  buttons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.f;
  projects.forEach(p => p.classList.toggle('hide', f !== 'all' && p.dataset.c !== f));
}));

// Contact form handling
const FORM_ENDPOINT = '';
const MY_EMAIL = 'you@example.com';

const form = document.getElementById('contactForm');
const msg = document.getElementById('formMsg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  msg.className = 'formmsg';

  if (!d.name.trim() || !/^\S+@\S+\.\S+$/.test(d.email) || !d.service || !d.message.trim()) {
    msg.textContent = 'Please fill name, a valid email, service and message.';
    msg.classList.add('err');
    return;
  }

  if (FORM_ENDPOINT) {
    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(d)
      });
      if (!r.ok) throw new Error();
      msg.textContent = 'Thanks! Your message has been sent.';
      msg.classList.add('ok');
      form.reset();
    } catch {
      msg.textContent = 'Something went wrong. Please try again.';
      msg.classList.add('err');
    }
  } else {
    const body = encodeURIComponent(
      `Name: ${d.name}\nEmail: ${d.email}\nService: ${d.service}\nSubject: ${d.subject || '-'}\n\nMessage:\n${d.message}`
    );
    location.href = `mailto:${'amansaini2974@gmail.com'}?subject=${encodeURIComponent((d.subject || 'Portfolio enquiry') + ' - ' + d.service)}&body=${body}`;
    msg.textContent = 'Opening your mail app...';
    msg.classList.add('ok');
  }
});