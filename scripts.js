gsap.registerPlugin(ScrollTrigger);

const CARD_SPACING = 620;

// ── Global mouse coords ──────────────────────────────────────────────────────
var gMouseX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
var gMouseY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
window.addEventListener('mousemove', function(e) { gMouseX = e.clientX; gMouseY = e.clientY; });

// ── Cursor ───────────────────────────────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const ring   = document.getElementById('cursor-ring');
  if (!cursor || !ring) return;

  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', function(e) {
    gsap.set(cursor, { x: e.clientX, y: e.clientY });
  });

  (function animateRing() {
    ringX += (gMouseX - ringX) * 0.12;
    ringY += (gMouseY - ringY) * 0.12;
    gsap.set(ring, { x: ringX, y: ringY });
    requestAnimationFrame(animateRing);
  })();
})();

// ── Loading ──────────────────────────────────────────────────────────────────
(function initLoading() {
  const loading    = document.getElementById('loading-screen');
  const aaEl       = document.getElementById('loading-aa');
  const heroName   = document.getElementById('hero-name');
  const scrollHint = document.getElementById('scroll-hint');
  if (!loading || !aaEl) return;

  function revealHero() {
    gsap.to(loading, {
      opacity: 0, filter: 'blur(20px)', duration: 0.8, ease: 'power2.inOut',
      onComplete: function() { loading.style.display = 'none'; },
    });
    if (heroName) {
      gsap.fromTo(heroName,
        { opacity: 0, y: 24, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out', delay: 0.2 }
      );
    }
    if (scrollHint) {
      gsap.to(scrollHint, { opacity: 1, duration: 0.55, delay: 1.5 });
      gsap.fromTo(
        scrollHint.querySelector('.scroll-hint-line'),
        { scaleY: 0 },
        { scaleY: 1, duration: 1.2, delay: 1.6, ease: 'power2.out', repeat: -1, repeatDelay: 1 }
      );
    }
  }

  gsap.timeline({ onComplete: revealHero })
    .fromTo(aaEl,
      { opacity: 0, y: 12, filter: 'blur(6px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out' }
    )
    .to(aaEl,
      { opacity: 0, y: -18, filter: 'blur(14px)', duration: 0.55, ease: 'power2.in' },
      '+=0.55'
    );
})();

// ── Hero — pinned scatter + phrase reveal ────────────────────────────────────
(function initHero() {
  const hero       = document.getElementById('hero');
  const heroName   = document.getElementById('hero-name');
  const heroTitle  = document.getElementById('hero-title');
  const typedEl    = document.getElementById('hero-typed');
  const scrollHint = document.getElementById('scroll-hint');
  if (!hero || !heroName || !heroTitle || !typedEl) return;

  const letters = heroName.querySelectorAll('.char');
  const parens  = document.querySelectorAll('.hero-paren');

  gsap.set(heroTitle, { opacity: 0 });
  gsap.set(parens, { opacity: 0 });

  const phrases     = ['Diretora de Arte', 'UX/UI Designer', 'Motion'];
  let phraseIdx     = 0;
  let isCycleActive = false;
  let currentTimeline = null;

  const HOLD_MS = 1.5;
  const CHAR_DUR = 0.05;
  const STAGGER = 0.03;

  function buildLetterSpans(phrase) {
    typedEl.innerHTML = '';
    return phrase.split('').map(function(ch) {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.display = 'inline-block';
      span.style.width = '0px';
      span.style.opacity = '0';
      span.style.overflow = 'hidden';
      span.style.verticalAlign = 'bottom';
      typedEl.appendChild(span);
      return span;
    });
  }

  function runCycle() {
    if (!isCycleActive) return;
    const phrase = phrases[phraseIdx];
    const spans = buildLetterSpans(phrase);

    currentTimeline = gsap.timeline({
      onComplete: function() {
        if (!isCycleActive) return;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        runCycle();
      }
    });

    spans.forEach(function(span, i) {
      currentTimeline.to(span, { width: 'auto', opacity: 0.45, duration: CHAR_DUR, ease: 'expo.out' }, i * STAGGER);
    });

    currentTimeline.to({}, { duration: HOLD_MS });

    const reversedSpans = [...spans].reverse();
    const exitStartTime = (spans.length * STAGGER) + HOLD_MS;

    reversedSpans.forEach(function(span, i) {
      currentTimeline.to(span, { width: '0px', opacity: 0, duration: CHAR_DUR, ease: 'expo.inOut' }, exitStartTime + (i * STAGGER));
    });

    currentTimeline.to({}, { duration: 0.2 });
  }

  function startCycle() {
    if (isCycleActive) return;
    isCycleActive = true;
    phraseIdx = 0;
    gsap.to(parens, { opacity: 0.45, duration: 0.4, ease: 'power2.out' });
    runCycle();
  }

  function stopCycle() {
    isCycleActive = false;
    if (currentTimeline) { currentTimeline.kill(); currentTimeline = null; }
    typedEl.innerHTML = '';
    gsap.set(parens, { opacity: 0 });
    gsap.set(heroTitle, { opacity: 0, y: 0 });
  }

  const tl = gsap.timeline({ paused: true });

  tl.to(letters, {
    opacity: 0, y: -25, filter: 'blur(6px)',
    stagger: { each: 0.04, from: 'random' },
    ease: 'power1.out', duration: 0.6,
  });

  if (scrollHint) tl.to(scrollHint, { opacity: 0, duration: 0.4 }, 0);
  tl.to({}, { duration: 0.4 });

  let titleVisible = false;

  ScrollTrigger.create({
    trigger: hero,
    start: 'top top',
    end: '+=110%',
    pin: true,
    scrub: 1.4,
    animation: tl,
    onUpdate: function(self) {
      const p = self.progress;
      if (p < 0.5) {
        if (titleVisible) { titleVisible = false; stopCycle(); }
        return;
      }
      if (p >= 0.5 && !titleVisible) {
        titleVisible = true;
        gsap.fromTo(heroTitle, { opacity: 0, y: 28 }, {
          opacity: 1, y: 0, duration: 0.55, ease: 'power2.out',
          overwrite: 'auto', onComplete: startCycle,
        });
      }
    },
  });
})();

// ── 3D Spatial Projects ──────────────────────────────────────────────────────
(function initProjects() {
  const outer = document.getElementById('projects-outer');
  const scene = document.getElementById('projects-scene');
  if (!outer || !scene) return;

  const cards  = Array.from(scene.querySelectorAll('.project-card-3d'));
  const n      = cards.length;
  const totalZ = CARD_SPACING * (n - 1);

  let focusedIdx = -1;

  cards.forEach(function(card, i) {
    gsap.set(card, {
      xPercent: -50, yPercent: -50,
      z: -i * CARD_SPACING,
      rotateY: i === 0 ? 0 : 0.8,
      rotateX: i === 0 ? 0 : 0.4,
      opacity: i === 0 ? 1 : Math.max(0.42, 1 - i * 0.14),
      force3D: true,
    });
    const info       = card.querySelector('.card-info-3d');
    const titleInner = card.querySelector('.card-title-3d-inner');
    const catInner   = card.querySelector('.card-category-3d-inner');
    if (info)       gsap.set(info,       { opacity: i === 0 ? 1 : 0 });
    if (titleInner) gsap.set(titleInner, { y: i === 0 ? '0%' : '110%' });
    if (catInner)   gsap.set(catInner,   { y: i === 0 ? '0%' : '110%' });
  });
  focusedIdx = 0;

  const sectionLabel = outer.querySelector('.projects-section-label');
  gsap.to(sectionLabel, {
    opacity: 1, duration: 1,
    scrollTrigger: { trigger: outer, start: 'top 80%' },
  });

  function applyMouseTilt() {
    if (focusedIdx < 0 || focusedIdx >= cards.length) return;
    const card = cards[focusedIdx];
    const cx   = window.innerWidth  / 2;
    const cy   = window.innerHeight / 2;
    const rx   = ((gMouseY - cy) / cy) * -0.7;
    const ry   = ((gMouseX - cx) / cx) *  1.2;
    gsap.to(card, { rotateX: rx, rotateY: ry, duration: 1.1, ease: 'power2.out', overwrite: 'auto' });
  }
  window.addEventListener('mousemove', applyMouseTilt);

  function revealCard(card) {
    const info       = card.querySelector('.card-info-3d');
    const titleInner = card.querySelector('.card-title-3d-inner');
    const catInner   = card.querySelector('.card-category-3d-inner');
    if (info)       gsap.to(info,       { opacity: 1, duration: 0.65, overwrite: 'auto' });
    if (titleInner) gsap.to(titleInner, { y: '0%', duration: 0.7, ease: 'power2.out', overwrite: 'auto' });
    if (catInner)   gsap.to(catInner,   { y: '0%', duration: 0.7, ease: 'power2.out', delay: 0.08, overwrite: 'auto' });
  }

  function hideCard(card) {
    const info       = card.querySelector('.card-info-3d');
    const titleInner = card.querySelector('.card-title-3d-inner');
    const catInner   = card.querySelector('.card-category-3d-inner');
    if (info)       gsap.to(info,       { opacity: 0, duration: 0.45, overwrite: 'auto' });
    if (titleInner) gsap.to(titleInner, { y: '110%', duration: 0.42, overwrite: 'auto' });
    if (catInner)   gsap.to(catInner,   { y: '110%', duration: 0.42, overwrite: 'auto' });
  }

  ScrollTrigger.create({
    trigger: outer,
    start: 'top top',
    end: 'bottom bottom',
    scrub: 1.8,
    onUpdate: function(self) {
      const progress = self.progress;
      const sceneZ   = progress * totalZ;
      gsap.set(scene, { z: sceneZ });

      cards.forEach(function(card, i) {
        const absZ      = sceneZ + (-i * CARD_SPACING);
        const hasPassed = absZ > 220;
        const isFocused = !hasPassed && Math.abs(absZ) < 120;
        const dist      = Math.abs(absZ);

        if (hasPassed) {
          gsap.to(card, { opacity: 0, rotateY: -0.8, rotateX: -0.4, duration: 0.45, overwrite: 'auto' });
          hideCard(card);
          if (focusedIdx === i) focusedIdx = -1;
        } else if (isFocused) {
          gsap.to(card, { opacity: 1, duration: 0.55, overwrite: 'auto' });
          if (focusedIdx !== i) {
            focusedIdx = i;
            gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.4, overwrite: 'auto', onComplete: applyMouseTilt });
            revealCard(card);
          }
        } else {
          const t       = Math.min(dist / (CARD_SPACING * 1.35), 1);
          const opacity = Math.max(0.34, 1 - t * 0.5);
          gsap.to(card, { opacity: opacity, rotateY: 0.8, rotateX: 0.4, duration: 0.55, overwrite: 'auto' });
          hideCard(card);
          if (focusedIdx === i) focusedIdx = -1;
        }
      });

      const dots = Array.from(outer.querySelectorAll('.progress-dot'));
      const step = 1 / Math.max(n - 1, 1);
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', Math.abs(progress - i * step) < step * 0.55);
      });
    },
  });

  // Click handler on the scene container — uses focusedIdx so the hit area
  // always matches the visually-front card, regardless of 3D transforms.
  var sceneEl = document.querySelector('.projects-scene-perspective');
  if (sceneEl) {
    sceneEl.addEventListener('click', function() {
      if (focusedIdx < 0 || focusedIdx >= cards.length) return;
      var card        = cards[focusedIdx];
      var popupTarget = card.getAttribute('data-popup-target');
      var popupUrl    = card.getAttribute('data-popup-url');
      if (popupTarget) openPopup(popupTarget, popupUrl);
    });
  }
})();

// ── Footer ───────────────────────────────────────────────────────────────────
(function initFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  const cta      = footer.querySelector('.footer-cta');
  const greeting = footer.querySelector('.footer-greeting');
  const links    = footer.querySelectorAll('.footer-link');

  const trigger = { trigger: footer, start: 'top 80%' };
  gsap.to(cta,      { opacity: 1, duration: 0.8,                           scrollTrigger: trigger });
  gsap.to(greeting, { opacity: 1, duration: 0.8, delay: 0.1,               scrollTrigger: trigger });
  gsap.to(links,    { opacity: 1, duration: 0.8, delay: 0.2, stagger: 0.1, scrollTrigger: trigger });
})();

// ── Navigation ───────────────────────────────────────────────────────────────
(function initNav() {
  const nav  = document.getElementById('site-nav');
  const hero = document.getElementById('hero');
  if (!nav || !hero) return;

  ScrollTrigger.create({
    trigger: hero,
    start: 'bottom 80%',
    onEnter:     function() { nav.classList.add('nav-visible'); },
    onLeaveBack: function() { nav.classList.remove('nav-visible'); },
  });
})();

// ── Popup System ─────────────────────────────────────────────────────────────
var savedScrollY    = 0;
var currentPopupId  = null;

// URL → popup ID map
var urlPopupMap = {
  '/ipanema-pluma':   'ipanema-pluma-popup',
  '/elev-experience': 'elev-experience-popup',
  '/quinto-andar':    'quinto-andar-popup',
  '/unimed':          'unimed-popup',
  '/kero-faze':       'kero-faze-popup',
  '/museu-da-puc':    'museu-da-puc-popup',
};

function openPopup(popupId, urlPath) {
  // Close any already-open popup without history changes
  if (currentPopupId && currentPopupId !== popupId) {
    var prev = document.getElementById(currentPopupId);
    if (prev) {
      prev.classList.remove('popup-open');
      var prevContent = prev.querySelector('.popup-content');
      if (prevContent) prevContent.scrollTop = 0;
    }
    currentPopupId = null;
  }

  var popup   = document.getElementById(popupId);
  var backBtn = document.getElementById('popup-back-btn');
  if (!popup) return;

  // Save scroll position only when opening from homepage (not switching popups)
  if (!currentPopupId) {
    savedScrollY = window.scrollY;
    document.body.style.overflow = 'hidden';
  }

  popup.classList.add('popup-open');
  if (backBtn) backBtn.classList.add('btn-visible');
  currentPopupId = popupId;

  var content = popup.querySelector('.popup-content');
  if (content) content.scrollTop = 0;

  if (urlPath && window.history && window.history.pushState) {
    window.history.pushState({ popup: popupId, scrollY: savedScrollY }, '', urlPath);
  }
}

function closePopup() {
  if (!currentPopupId) return;

  var popup   = document.getElementById(currentPopupId);
  var backBtn = document.getElementById('popup-back-btn');

  if (popup) popup.classList.remove('popup-open');
  if (backBtn) backBtn.classList.remove('btn-visible');

  document.body.style.overflow = '';
  currentPopupId = null;

  if (window.history && window.history.pushState) {
    window.history.pushState({}, '', '/');
  }

  window.scrollTo({ top: savedScrollY, behavior: 'instant' });
}

(function initPopupSystem() {
  // ── Backdrop clicks (data-close-popup) ──────────────────────────────────
  document.addEventListener('click', function(e) {
    if (e.target.hasAttribute('data-close-popup')) {
      closePopup();
    }
  });

  // ── Back button ──────────────────────────────────────────────────────────
  var backBtn = document.getElementById('popup-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', function() {
      closePopup();
    });
  }

  // ── More Projects cards (mp-card) ────────────────────────────────────────
  document.querySelectorAll('.mp-card[data-popup-target]').forEach(function(card) {
    card.addEventListener('click', function(e) {
      e.preventDefault();
      var target = card.getAttribute('data-popup-target');
      var url    = card.getAttribute('href');
      openPopup(target, url);
    });
  });

  // ── Popup nav cards (inside popups) ─────────────────────────────────────
  document.addEventListener('click', function(e) {
    var card = e.target.closest('.popup-nav-card[data-popup-target]');
    if (!card) return;
    e.preventDefault();
    var target = card.getAttribute('data-popup-target');
    var url    = card.getAttribute('href');
    openPopup(target, url);
  });

  // ── Browser back button ──────────────────────────────────────────────────
  window.addEventListener('popstate', function(e) {
    if (currentPopupId) {
      var popup   = document.getElementById(currentPopupId);
      var backBtn = document.getElementById('popup-back-btn');
      if (popup) popup.classList.remove('popup-open');
      if (backBtn) backBtn.classList.remove('btn-visible');
      document.body.style.overflow = '';
      currentPopupId = null;
      window.scrollTo({ top: savedScrollY, behavior: 'instant' });
    }
  });

  // ── Escape key ───────────────────────────────────────────────────────────
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && currentPopupId) {
      closePopup();
    }
  });

  // ── Open popup if URL matches on page load ───────────────────────────────
  var matchedPopup = urlPopupMap[window.location.pathname];
  if (matchedPopup) {
    openPopup(matchedPopup, window.location.pathname);
  }
})();
