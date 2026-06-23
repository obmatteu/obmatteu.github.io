(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;

  /* ----- Second cursor glow (fast trailing dot) ----- */
  var g2 = document.getElementById('cursor-glow-2');
  if (g2 && !reduce && fine) {
    window.addEventListener('pointermove', function (e) {
      g2.style.left = e.clientX + 'px';
      g2.style.top = e.clientY + 'px';
      g2.style.opacity = '1';
    });
    window.addEventListener('pointerleave', function () { g2.style.opacity = '0'; });
  }

  /* ----- Particle FX canvas ----- */
  var canvas = document.getElementById('fx-canvas');
  var ctx = canvas ? canvas.getContext('2d') : null;
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  var particles = [];
  var theme = 'cyber';
  var rafId = null;

  function resize() {
    if (!canvas) return;
    W = canvas.width  = Math.floor(window.innerWidth  * dpr);
    H = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width  = window.innerWidth  + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }
  window.addEventListener('resize', resize);
  resize();

  var LEAF_COLORS = ['#C2410C', '#78350F', '#92400E', '#B45309', '#DC2626', '#9A3412', '#A16207'];
  var SUMMER_COLORS = ['#FFD93D', '#FFC93C', '#FFA500', '#FF8C42', '#FFE066'];

  function rand(min, max) { return Math.random() * (max - min) + min; }

  function makeSnow() {
    return {
      x: rand(0, W), y: rand(-H, H),
      r: rand(1.2, 3.6) * dpr,
      vy: rand(0.4, 1.3) * dpr,
      vx: rand(-0.4, 0.4) * dpr,
      sway: rand(0, Math.PI * 2),
      swayS: rand(0.005, 0.02),
      op: rand(0.45, 0.95)
    };
  }
  function makeLeaf() {
    return {
      x: rand(0, W), y: rand(-H, H),
      r: rand(7, 14) * dpr,
      vy: rand(0.6, 1.6) * dpr,
      vx: rand(-0.6, 0.6) * dpr,
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.04, 0.04),
      sway: rand(0, Math.PI * 2),
      swayS: rand(0.008, 0.022),
      op: rand(0.65, 1),
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
    };
  }
  function makeSpark() {
    return {
      x: rand(0, W), y: rand(0, H),
      r: rand(1, 3.5) * dpr,
      vy: rand(-0.7, -0.15) * dpr,
      vx: rand(-0.3, 0.3) * dpr,
      op: rand(0.4, 0.95),
      twinkle: rand(0, Math.PI * 2),
      twS: rand(0.02, 0.06),
      color: SUMMER_COLORS[Math.floor(Math.random() * SUMMER_COLORS.length)]
    };
  }
  function makeFirefly() {
    return {
      x: rand(0, W), y: rand(0, H),
      r: rand(1, 2.4) * dpr,
      vy: rand(-0.25, 0.25) * dpr,
      vx: rand(-0.25, 0.25) * dpr,
      op: rand(0.3, 0.8),
      twinkle: rand(0, Math.PI * 2),
      twS: rand(0.015, 0.04),
      color: Math.random() > 0.5 ? '#00E5FF' : '#7C5CFF'
    };
  }

  function spawn(t) {
    particles.length = 0;
    var count, i;
    if (t === 'snow')        { count = 140; for (i=0;i<count;i++) particles.push(makeSnow()); }
    else if (t === 'autumn') { count = 50;  for (i=0;i<count;i++) particles.push(makeLeaf()); }
    else if (t === 'summer') { count = 90;  for (i=0;i<count;i++) particles.push(makeSpark()); }
    else                     { count = 60;  for (i=0;i<count;i++) particles.push(makeFirefly()); }
  }

  function drawLeaf(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.op;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.moveTo(0, -p.r);
    ctx.bezierCurveTo(p.r * 0.7, -p.r * 0.6, p.r * 0.7, p.r * 0.6, 0, p.r);
    ctx.bezierCurveTo(-p.r * 0.7, p.r * 0.6, -p.r * 0.7, -p.r * 0.6, 0, -p.r);
    ctx.fill();
    ctx.strokeStyle = 'rgba(40,20,10,0.55)';
    ctx.lineWidth = 1 * dpr;
    ctx.beginPath();
    ctx.moveTo(0, -p.r * 0.95);
    ctx.lineTo(0, p.r * 0.95);
    ctx.stroke();
    ctx.restore();
  }

  function tick() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      if (theme === 'snow') {
        p.sway += p.swayS;
        p.x += p.vx + Math.sin(p.sway) * 0.5 * dpr;
        p.y += p.vy;
        if (p.y > H + 10) { p.y = -10; p.x = rand(0, W); }
        if (p.x > W + 10) p.x = -10;
        if (p.x < -10) p.x = W + 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + p.op + ')';
        ctx.shadowColor = 'rgba(225,245,254,0.8)';
        ctx.shadowBlur = 6 * dpr;
        ctx.fill();
        ctx.shadowBlur = 0;

      } else if (theme === 'autumn') {
        p.sway += p.swayS;
        p.x += p.vx + Math.sin(p.sway) * 1.3 * dpr;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > H + 20) { p.y = -20; p.x = rand(0, W); }
        if (p.x > W + 20) p.x = -20;
        if (p.x < -20) p.x = W + 20;
        drawLeaf(p);

      } else if (theme === 'summer') {
        p.twinkle += p.twS;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
        if (p.x > W + 10) p.x = -10;
        if (p.x < -10) p.x = W + 10;
        var alpha = p.op * (0.55 + Math.abs(Math.sin(p.twinkle)) * 0.45);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12 * dpr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

      } else {
        p.twinkle += p.twS;
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > W) p.x = 0; if (p.x < 0) p.x = W;
        if (p.y > H) p.y = 0; if (p.y < 0) p.y = H;
        var a = p.op * (0.4 + Math.abs(Math.sin(p.twinkle)) * 0.6);
        ctx.globalAlpha = a;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10 * dpr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  /* ----- Theme switching ----- */
  var THEME_NAMES = { cyber: 'Cyber', summer: 'Été', snow: 'Neige', autumn: 'Automne' };

  function setTheme(t) {
    if (!THEME_NAMES[t]) t = 'cyber';
    theme = t;
    if (t === 'cyber') document.body.removeAttribute('data-theme');
    else document.body.setAttribute('data-theme', t);
    try { localStorage.setItem('site-theme', t); } catch (e) {}
    var labelEl = document.getElementById('themeLabelName');
    if (labelEl) labelEl.textContent = THEME_NAMES[t];
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-set') === t);
    });
    spawn(t);
  }
  window.__setTheme = setTheme;

  function init() {
    document.querySelectorAll('.theme-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setTheme(btn.getAttribute('data-set'));
      });
    });
    var saved = 'cyber';
    try { saved = localStorage.getItem('site-theme') || 'cyber'; } catch (e) {}
    setTheme(saved);
    if (!reduce) tick();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
