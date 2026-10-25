// Ananta Constructions & Developers – site interactions
const WHATSAPP_NUMBER = '919112984379';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- Preloader ----------
window.addEventListener('load', () => setTimeout(() => $('#preloader').classList.add('done'), 500));
setTimeout(() => $('#preloader').classList.add('done'), 3500); // safety net

$('#year').textContent = new Date().getFullYear();

// ---------- Navbar: scroll state, mobile menu, active link ----------
const navbar = $('#navbar');
const toTop = $('#toTop');
const hamburger = $('#hamburger');
const navLinks = $('#navLinks');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  navbar.classList.toggle('scrolled', y > 40);
  toTop.classList.toggle('show', y > 700);
}, { passive: true });

toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navLinks.classList.toggle('open');
});
$$('a', navLinks).forEach(a => a.addEventListener('click', () => {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
}));

const sections = $$('section[id]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$('.nav-links a:not(.btn)').forEach(a =>
      a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => sectionObserver.observe(s));

// ---------- Hero slider ----------
const slides = $$('.hero-slide');
const heroDots = $$('#heroDots button');
let slideIdx = 0;
let slideTimer;

function showSlide(i) {
  slides[slideIdx].classList.remove('active');
  heroDots[slideIdx].classList.remove('active');
  slideIdx = (i + slides.length) % slides.length;
  slides[slideIdx].classList.add('active');
  heroDots[slideIdx].classList.add('active');
}
function startSlider() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => showSlide(slideIdx + 1), 6000);
}
heroDots.forEach((d, i) => d.addEventListener('click', () => { showSlide(i); startSlider(); }));
startSlider();

// ---------- Reveal on scroll (with stagger for siblings) ----------
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const siblings = $$(':scope > .reveal', el.parentElement);
    el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 6) * 90}ms`;
    el.classList.add('in');
    revealObserver.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
$$('.reveal').forEach(el => revealObserver.observe(el));

// ---------- Animated counters ----------
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = +el.dataset.target;
    const duration = 1800;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('en-IN');
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.5 });
$$('.counter').forEach(c => counterObserver.observe(c));

// ---------- Rental rate toggle ----------
const rateToggle = $('#rateToggle');
$$('button', rateToggle).forEach(btn => btn.addEventListener('click', () => {
  const mode = btn.dataset.mode;
  $$('button', rateToggle).forEach(b => b.classList.toggle('active', b === btn));
  rateToggle.classList.toggle('day', mode === 'day');

  $$('.fleet-card').forEach(card => {
    const amt = $('.amt', card);
    const per = $('.per', card);
    amt.classList.add('flip');
    setTimeout(() => {
      amt.textContent = amt.dataset[mode];
      if (per.textContent !== '/trip') per.textContent = mode === 'day' ? '/day' : '/hr';
      amt.classList.remove('flip');
    }, 200);
  });
}));

// Hero card JCB / Poclain switcher (auto-rotates until the user picks one)
const machineTabs = $$('#machineTabs button');
const machinePanes = $$('.machine-pane');
function showMachine(name) {
  machineTabs.forEach(b => b.classList.toggle('active', b.dataset.pane === name));
  machinePanes.forEach(p => p.classList.toggle('active', p.dataset.pane === name));
}
let machineTimer = setInterval(() => {
  const current = $('#machineTabs button.active').dataset.pane;
  showMachine(current === 'jcb' ? 'poclain' : 'jcb');
}, 4000);
machineTabs.forEach(b => b.addEventListener('click', () => {
  clearInterval(machineTimer);
  showMachine(b.dataset.pane);
}));

// "Book" buttons → preselect machine in booking form
$$('.book-btn').forEach(btn => btn.addEventListener('click', () => {
  const machine = btn.dataset.machine || btn.closest('.fleet-card').dataset.machine;
  const select = $('#bMachine');
  [...select.options].forEach(o => { if (o.text === machine) o.selected = true; });
  $('#rental-form').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#bName').focus({ preventScroll: true }), 700);
}));

// Booking form → WhatsApp
const bDate = $('#bDate');
bDate.min = new Date().toISOString().split('T')[0];
bDate.value = bDate.min;

$('#bookingForm').addEventListener('submit', e => {
  e.preventDefault();
  const msg =
    `*New Machinery Booking Request*%0A%0A` +
    `Name: ${encodeURIComponent($('#bName').value)}%0A` +
    `Mobile: ${encodeURIComponent($('#bPhone').value)}%0A` +
    `Machine: ${encodeURIComponent($('#bMachine').value)}%0A` +
    `From: ${encodeURIComponent($('#bDate').value)}%0A` +
    `Duration: ${encodeURIComponent($('#bDuration').value)}%0A` +
    `Site: ${encodeURIComponent($('#bLocation').value)}`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
});

// ---------- Project filters ----------
$$('#filters button').forEach(btn => btn.addEventListener('click', () => {
  const f = btn.dataset.filter;
  $$('#filters button').forEach(b => b.classList.toggle('active', b === btn));
  $$('.project').forEach(p => {
    const show = f === 'all' || p.dataset.cat === f;
    p.classList.toggle('hidden', !show);
    p.classList.remove('fade-in');
    if (show) { void p.offsetWidth; p.classList.add('fade-in'); }
  });
}));

// ---------- Testimonials slider ----------
const tTrack = $('#tTrack');
const tCards = $$('.t-card', tTrack);
const tDots = $('#tDots');
let tIdx = 0;
let tTimer;

tCards.forEach((_, i) => {
  const dot = document.createElement('span');
  dot.addEventListener('click', () => { goT(i); restartT(); });
  tDots.appendChild(dot);
});
function goT(i) {
  tIdx = (i + tCards.length) % tCards.length;
  tTrack.style.transform = `translateX(-${tIdx * 100}%)`;
  $$('span', tDots).forEach((d, j) => d.classList.toggle('active', j === tIdx));
}
function restartT() { clearInterval(tTimer); tTimer = setInterval(() => goT(tIdx + 1), 5500); }
$('#tPrev').addEventListener('click', () => { goT(tIdx - 1); restartT(); });
$('#tNext').addEventListener('click', () => { goT(tIdx + 1); restartT(); });
goT(0);
restartT();

// ---------- Contact form ----------
$$('#serviceChips .chip').forEach(chip => chip.addEventListener('click', () => {
  $$('#serviceChips .chip').forEach(c => c.classList.toggle('active', c === chip));
}));

$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const success = $('#formSuccess');
  success.classList.add('show');
  e.target.reset();
  $$('#serviceChips .chip').forEach((c, i) => c.classList.toggle('active', i === 0));
  setTimeout(() => success.classList.remove('show'), 5000);
});
