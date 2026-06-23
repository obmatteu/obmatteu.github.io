(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.documentElement.classList.add('js-animate');

  document.addEventListener('DOMContentLoaded', function () {

    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
      function openNav() {
        document.body.classList.add('nav-open');
        navToggle.setAttribute('aria-expanded', 'true');
        navToggle.setAttribute('aria-label', 'Fermer le menu');
      }
      function closeNav() {
        document.body.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Ouvrir le menu');
      }
      navToggle.addEventListener('click', function () {
        if (document.body.classList.contains('nav-open')) closeNav();
        else openNav();
      });
      navMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', closeNav);
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
          closeNav();
          navToggle.focus();
        }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth >= 768 && document.body.classList.contains('nav-open')) closeNav();
      });
    }

    var faded = document.querySelectorAll('.fade-in');
    if (reduce || !('IntersectionObserver' in window)) {
      faded.forEach(function (el) { el.classList.add('visible'); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      faded.forEach(function (el) { io.observe(el); });
    }

    var topBtn = document.getElementById('scrollTopBtn');
    if (topBtn) {
      var onScroll = function () {
        if (window.scrollY > 600) topBtn.classList.add('show');
        else topBtn.classList.remove('show');
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      topBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
      onScroll();
    }

    var glow = document.getElementById('cursor-glow');
    if (glow && !reduce && window.matchMedia('(pointer:fine)').matches) {
      var gx = 0, gy = 0, cx = 0, cy = 0, raf = null;
      window.addEventListener('pointermove', function (e) {
        gx = e.clientX; gy = e.clientY;
        glow.style.opacity = '1';
        if (!raf) raf = requestAnimationFrame(loop);
      });
      window.addEventListener('pointerleave', function () { glow.style.opacity = '0'; });
      function loop() {
        cx += (gx - cx) * 0.16; cy += (gy - cy) * 0.16;
        glow.style.left = cx + 'px'; glow.style.top = cy + 'px';
        if (Math.abs(gx - cx) > 0.5 || Math.abs(gy - cy) > 0.5) { raf = requestAnimationFrame(loop); }
        else { raf = null; }
      }
    }

    if (!reduce && window.matchMedia('(pointer:fine)').matches) {
      document.querySelectorAll('.card').forEach(function (card) {
        card.addEventListener('pointermove', function (e) {
          var r = card.getBoundingClientRect();
          card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
          card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
      });
    }

    function animateCount(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      if (isNaN(target)) return;
      var suffix = el.querySelector('.suffix');
      var suffixHTML = suffix ? suffix.outerHTML : '';
      if (reduce) { el.innerHTML = target + suffixHTML; return; }
      var start = null, dur = 1200;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.innerHTML = Math.round(target * eased) + suffixHTML;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    var nums = document.querySelectorAll('.metric-num[data-count]');
    if (nums.length) {
      if (!('IntersectionObserver' in window)) {
        nums.forEach(animateCount);
      } else {
        var io2 = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { animateCount(e.target); io2.unobserve(e.target); }
          });
        }, { threshold: 0.6 });
        nums.forEach(function (el) { io2.observe(el); });
      }
    }

    if (!reduce && 'IntersectionObserver' in window) {
      var bars = document.querySelectorAll('.progress > span');
      bars.forEach(function (b) {
        var final = getComputedStyle(b).width;
        b.style.width = '0';
        b.dataset.final = final;
      });
      var io3 = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var span = e.target.querySelector('.progress > span');
            if (span) { span.style.transition = 'width 1.1s cubic-bezier(.2,.7,.2,1)'; span.style.width = span.dataset.final; }
            io3.unobserve(e.target);
          }
        });
      }, { threshold: 0.4 });
      document.querySelectorAll('.track').forEach(function (t) { io3.observe(t); });
    }

    var shots = document.querySelectorAll('.shot');
    if (shots.length) {
      var lb = document.getElementById('lightbox');
      var lbImg = document.getElementById('lbImg');
      var lbCap = document.getElementById('lbCap');
      var lbClose = document.getElementById('lbClose');

      if (!reduce && window.matchMedia('(pointer:fine)').matches) {
        shots.forEach(function (s) {
          s.addEventListener('pointermove', function (e) {
            var r = s.getBoundingClientRect();
            s.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            s.style.setProperty('--my', (e.clientY - r.top) + 'px');
          });
        });
      }

      function openLb(full, cap) {
        if (!lb || !lbImg) return;
        lbImg.src = full;
        lbImg.alt = cap || '';
        if (lbCap) lbCap.innerHTML = '<b>Capture</b> · ' + (cap || '');
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
      function closeLb() {
        if (!lb) return;
        lb.classList.remove('open');
        document.body.style.overflow = '';
        if (lbImg) lbImg.src = '';
      }

      shots.forEach(function (s) {
        s.setAttribute('tabindex', '0');
        s.setAttribute('role', 'button');
        var t = s.querySelector('.shot-title');
        s.setAttribute('aria-label', 'Agrandir : ' + (t ? t.textContent : 'capture'));
        s.addEventListener('click', function () {
          openLb(s.getAttribute('data-full'), s.getAttribute('data-cap'));
        });
        s.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openLb(s.getAttribute('data-full'), s.getAttribute('data-cap'));
          }
        });
      });
      if (lb) lb.addEventListener('click', function (e) {
        if (e.target === lb || e.target.tagName === 'FIGURE') closeLb();
      });
      if (lbClose) lbClose.addEventListener('click', closeLb);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeLb();
      });
    }

    var form = document.getElementById('contactForm');
    var msg = document.getElementById('formMessage');
    if (form) {
      var ENDPOINT = form.getAttribute('action') || 'https://formspree.io/f/your-id';
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form._gotcha && form._gotcha.value) return;
        var btn = form.querySelector('button[type="submit"]');
        if (btn) { btn.disabled = true; btn.textContent = 'Envoi…'; }
        function show(text, ok) {
          if (!msg) return;
          msg.textContent = text;
          msg.style.display = 'block';
          msg.style.color = ok ? 'var(--cyan)' : 'var(--amber)';
        }
        fetch(ENDPOINT, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).then(function (r) {
          if (r.ok) { form.reset(); show('Message envoyé. Merci, je reviens vers toi vite.', true); }
          else { show('Envoi impossible pour le moment. Réessaie ou passe par GitHub.', false); }
        }).catch(function () {
          show('Erreur réseau. Réessaie ou passe par GitHub.', false);
        }).finally(function () {
          if (btn) { btn.disabled = false; btn.textContent = 'Envoyer'; }
        });
      });
    }

  });
})();
