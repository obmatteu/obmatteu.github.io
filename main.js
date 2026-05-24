// Active les animations seulement si JS est présent (progressive enhancement)
document.documentElement.classList.add('js-animate');

// Scroll to top
const btn = document.getElementById('scrollTopBtn');
if (btn) {
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 400);
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Fade in on scroll
const fadeEls = document.querySelectorAll('.fade-in');
if ('IntersectionObserver' in window) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  fadeEls.forEach(el => obs.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

// Contact form
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const msg = document.getElementById('formMessage');
    try {
      const res = await fetch('https://formspree.io/f/xgvyjlwe', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(e.target)
      });
      msg.style.display = 'block';
      msg.textContent = res.ok ? 'Message envoyé.' : "Erreur d'envoi. Réessayez.";
      if (res.ok) e.target.reset();
    } catch {
      msg.style.display = 'block';
      msg.textContent = 'Erreur réseau.';
    }
  });
}

// Active nav link
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 80) current = s.id;
  });
  navLinks.forEach(a => {
    a.style.color = a.getAttribute('href') === '#' + current ? 'var(--white)' : '';
  });
});
