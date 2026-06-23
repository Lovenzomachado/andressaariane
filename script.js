// =============================================================
//  PROJETOS — edite aqui para adicionar / remover projetos
// =============================================================
const IMG_BASE_URL = 'https://raw.githubusercontent.com/Lovenzomachado/andressaariane/main/projects/';

const projects = [
  {
    name: 'Ipanema Pluma',
    tag: 'Identidade Visual',
    description: 'Lorem ipsun dolod its lorem ipsun dolod its. Lorem ipsun dolod its lorem ipsun dolod its lorem ipsun dolod its.',
    images: [
      `${IMG_BASE_URL}ipanema-pluma.avif`,
      `${IMG_BASE_URL}ipanema-pluma-02.avif`,
      `${IMG_BASE_URL}ipanema-pluma-03.avif`,
      `${IMG_BASE_URL}ipanema-pluma-04.avif`,
      `${IMG_BASE_URL}ipanema-pluma-05.avif`,
    ],
  },
  {
    name: 'Quinto Andar',
    tag: 'Branding Digital',
    description: 'Lorem ipsun dolod its lorem ipsun dolod its. Lorem ipsun dolod its lorem ipsun dolod its lorem ipsun dolod its.',
    images: [
      `${IMG_BASE_URL}quintoandar.avif`,
      `${IMG_BASE_URL}quintoandar-02.avif`,
      `${IMG_BASE_URL}quintoandar-03.avif`,
      `${IMG_BASE_URL}quintoandar-04.avif`,
      `${IMG_BASE_URL}quintoandar-05.avif`,
    ],
  },
  {
    name: 'Élev Experience',
    tag: 'Skincare Print',
    description: 'Lorem ipsun dolod its lorem ipsun dolod its. Lorem ipsun dolod its lorem ipsun dolod its lorem ipsun dolod its.',
    images: [
      `${IMG_BASE_URL}elev.avif`,
      `${IMG_BASE_URL}elev-02.avif`,
      `${IMG_BASE_URL}elev-03.avif`,
      `${IMG_BASE_URL}elev-04.avif`,
      `${IMG_BASE_URL}elev-05.avif`,
    ],
  },
  {
    name: 'Unimed VTRP',
    tag: 'Campanha',
    description: 'Lorem ipsun dolod its lorem ipsun dolod its. Lorem ipsun dolod its lorem ipsun dolod its lorem ipsun dolod its.',
    images: [
      `${IMG_BASE_URL}unimed.avif`,
      `${IMG_BASE_URL}unimed-02.avif`,
      `${IMG_BASE_URL}unimed-03.avif`,
      `${IMG_BASE_URL}unimed-04.avif`,
      `${IMG_BASE_URL}unimed-05.avif`,
    ],
  },
  {
    name: 'Kero Fazê',
    tag: 'Social Media',
    description: 'Lorem ipsun dolod its lorem ipsun dolod its. Lorem ipsun dolod its lorem ipsun dolod its lorem ipsun dolod its.',
    images: [
      `${IMG_BASE_URL}kerofaze.avif`,
      `${IMG_BASE_URL}kerofaze-02.avif`,
      `${IMG_BASE_URL}kerofaze-03.avif`,
      `${IMG_BASE_URL}kerofaze-04.avif`,
      `${IMG_BASE_URL}kerofaze-05.avif`,
    ],
  },
  {
    name: 'Museu da PUC',
    tag: 'Editorial',
    description: 'Lorem ipsun dolod its lorem ipsun dolod its. Lorem ipsun dolod its lorem ipsun dolod its lorem ipsun dolod its.',
    images: [
      `${IMG_BASE_URL}puc.avif`,
      `${IMG_BASE_URL}puc-02.avif`,
      `${IMG_BASE_URL}puc-03.avif`,
      `${IMG_BASE_URL}puc-04.avif`,
      `${IMG_BASE_URL}puc-05.avif`,
    ],
  },
];

// =============================================================
//  CONFIGURAÇÃO — velocidades e timings
// =============================================================
const CONFIG = {
  LERP:           0.06,  // suavidade do scroll (0 = nenhuma, 1 = instantâneo)
  WHEEL_SPEED:    0.7,   // multiplicador do evento wheel
  TOUCH_SPEED:    1.1,   // multiplicador do toque (mobile)
  IDLE_MS:        220,   // ms sem scroll para considerar parado
  ENTER_DELAY_MS: 160,   // ms após parar para mostrar a imagem
  ENTER: {
    duration:   250,
    easing:     'cubic-bezier(0.19, 1, 0.22, 1)',
    translateX: '100%',
    stagger:    150,     // delay entre os dois slots de imagem
  },
  MODAL: {
    openDelayMs: 30,     // pequeno delay para garantir a transição de entrada
  },
};

// =============================================================
//  INTERNOS
// =============================================================
const total         = projects.length;
const COPIES        = 9;
const MOBILE_COPIES = 9;

// =============================================================
//  ELEMENTOS DOM
// =============================================================
const track            = document.getElementById('project-track');
const stage            = document.getElementById('image-stage');
const slotTop          = document.getElementById('slot-top');
const slotBot          = document.getElementById('slot-bot');
const counterNum       = document.getElementById('counter-num');
const counterTotal     = document.getElementById('counter-total');
const leftCol          = document.getElementById('left-col');
const mobileCol        = document.getElementById('mobile-col');
const mobileImageStage = document.getElementById('mobile-image-stage');
const mobileTrack      = document.getElementById('project-track-mobile');

const projectModal     = document.getElementById('project-modal');
const modalOverlay     = document.getElementById('modal-overlay');
const modalCloseBtn    = document.getElementById('modal-close');
const modalDescription = document.getElementById('modal-description');
const modalTag         = document.getElementById('modal-tag');
const modalScroll      = document.getElementById('modal-scroll');
const modalGallery     = document.getElementById('modal-gallery');

// =============================================================
//  UTILITÁRIOS
// =============================================================
function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Falha ao carregar: ${url}`));
    img.src = url;
  });
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

// =============================================================
//  MODAL DE PROJETO — sobe da parte inferior
// =============================================================
let modalOpen = false;

function openProjectModal(idx) {
  const p = projects[mod(idx, total)];
  if (!p) return;

  modalDescription.textContent = p.description || '';
  modalTag.innerHTML = `<span class="modal-tag-name">${p.name}</span>${p.tag}`;

  modalGallery.innerHTML = '';
  p.images.forEach((src, i) => {
    const item = document.createElement('div');
    item.className = 'modal-image-item';

    const img = document.createElement('img');
    img.src     = src;
    img.alt     = `${p.name} — ${i + 1}`;
    img.loading = 'lazy';
    img.style.transitionDelay = `${0.26 + i * 0.05}s`;

    item.appendChild(img);
    modalGallery.appendChild(item);
  });
  modalScroll.scrollTop = 0;

  projectModal.classList.remove('closing');
  modalOverlay.classList.remove('closing');
  modalOpen = true;
  document.body.style.overflow = 'hidden';

  // pequeno delay para garantir que a transição de entrada sempre rode,
  // mesmo se a imagem já estiver em cache
  requestAnimationFrame(() => {
    setTimeout(() => {
      projectModal.classList.add('open');
      modalOverlay.classList.add('open');
    }, CONFIG.MODAL.openDelayMs);
  });
}

function closeProjectModal() {
  if (!modalOpen) return;
  modalOpen = false;
  document.body.style.overflow = '';

  // curva de saída diferente da de entrada (ver .project-modal.closing no CSS)
  projectModal.classList.add('closing');
  modalOverlay.classList.add('closing');
  projectModal.classList.remove('open');
  modalOverlay.classList.remove('open');
  setTimeout(() => {
    projectModal.classList.remove('closing');
    modalOverlay.classList.remove('closing');
  }, 420);
}

modalOverlay.addEventListener('click', closeProjectModal);

modalCloseBtn.addEventListener('click', closeProjectModal);

// clique fora da imagem/texto (no fundo do modal) também fecha
projectModal.addEventListener('click', e => {
  if (e.target === projectModal || e.target.classList.contains('modal-header')) {
    closeProjectModal();
  }
});

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modalOpen) closeProjectModal();
});

// =============================================================
//  DESKTOP — GERAÇÃO DO TRACK
// =============================================================
for (let i = 0; i < COPIES; i++) {
  projects.forEach(p => {
    const div = document.createElement('div');
    div.className = 'project-item';
    div.innerHTML = `<span class="label">${p.name}</span><span class="tag">${p.tag}</span>`;
    track.appendChild(div);
  });
}
const allItems = Array.from(track.querySelectorAll('.project-item'));

if (counterTotal) counterTotal.textContent = String(total).padStart(2, '0');

// =============================================================
//  DESKTOP — ALTURA DO ITEM (lida do DOM, não calculada)
// =============================================================
let ITEM_H = 0;

function readItemHeight() {
  if (!allItems[0]) return;
  ITEM_H = allItems[0].getBoundingClientRect().height;
}

// =============================================================
//  DESKTOP — ESTADO DE SCROLL
// =============================================================
let isMobile     = false;
let logicOffset  = Math.floor(COPIES / 2) * total;
let targetOffset = logicOffset;
let prevOffset   = logicOffset;
let isScrolling  = false;
let idleTimer    = null;
let enterTimer   = null;
const stageState = { activeIdx: -1, visible: false };

function getActiveIndex(offset) {
  return mod(Math.round(offset), total);
}

function updateTrackTransform() {
  const center = leftCol.clientHeight / 2 - ITEM_H / 2;
  track.style.transform = `translateY(${Math.round(center - logicOffset * ITEM_H)}px)`;
}

function recycleIfNeeded() {
  const lo = total;
  const hi = (COPIES - 1) * total;
  if (logicOffset < lo) {
    logicOffset  += total;
    targetOffset += total;
    prevOffset   += total;
  } else if (logicOffset > hi) {
    logicOffset  -= total;
    targetOffset -= total;
    prevOffset   -= total;
  }
}

function snapToNearest() {
  targetOffset = Math.round(targetOffset);
}

// =============================================================
//  DESKTOP — IMAGENS
// =============================================================
function hideStage() {
  if (!stageState.visible) return;
  stageState.visible   = false;
  stageState.activeIdx = -1;
  stage.style.transition = 'opacity 0.3s ease';
  stage.style.opacity    = '0';
  setTimeout(() => { slotTop.innerHTML = ''; slotBot.innerHTML = ''; }, 320);
}

async function showProject(idx) {
  if (stageState.activeIdx === idx) return;
  stageState.activeIdx = idx;
  stageState.visible   = true;
  slotTop.innerHTML    = '';
  slotBot.innerHTML    = '';

  const p      = projects[idx];
  const xStart = CONFIG.ENTER.translateX;

  try {
    await preloadImage(p.images[0]);

    const makeSlide = (slot, label) => {
      const slide = document.createElement('div');
      slide.className = 'image-slide';
      slide.innerHTML = `<img src="${p.images[0]}" alt="${p.name}" /><span class="img-label">${label}</span>`;
      slide.style.transform = `translateX(${xStart})`;
      slot.appendChild(slide);
      return slide;
    };

    const s1   = makeSlide(slotBot, `${p.tag} — 01`);
    const s2   = makeSlide(slotTop, `${p.tag} — 02`);
    const anim = { duration: CONFIG.ENTER.duration, easing: CONFIG.ENTER.easing, fill: 'forwards' };

    s1.animate([{ transform: `translateX(${xStart})` }, { transform: 'translateX(0px)' }], anim);
    s2.animate([{ transform: `translateX(${xStart})` }, { transform: 'translateX(0px)' }], { ...anim, delay: CONFIG.ENTER.stagger });

    stage.style.transition = 'opacity 0.2s ease';
    stage.style.opacity    = '1';
  } catch (e) { console.error(e); }
}

// =============================================================
//  DESKTOP — LOOP
// =============================================================
function onIdle() {
  isScrolling = false;
  snapToNearest();
  const idx = getActiveIndex(targetOffset);
  clearTimeout(enterTimer);
  enterTimer = setTimeout(() => showProject(idx), CONFIG.ENTER_DELAY_MS);
}

function handleInput(delta) {
  if (isMobile) { handleMobileInput(delta); return; }
  targetOffset += delta / ITEM_H;
  clearTimeout(enterTimer);
  if (!isScrolling) { isScrolling = true; hideStage(); }
  clearTimeout(idleTimer);
  idleTimer = setTimeout(onIdle, CONFIG.IDLE_MS);
}

function loop() {
  if (!isMobile) {
    logicOffset += (targetOffset - logicOffset) * CONFIG.LERP;
    recycleIfNeeded();
    updateTrackTransform();
    const ai = getActiveIndex(logicOffset);
    counterNum.textContent = String(ai + 1).padStart(2, '0');
    allItems.forEach((el, i) => el.classList.toggle('active', (i % total) === ai));
  }
  requestAnimationFrame(loop);
}

// =============================================================
//  DESKTOP — CLIQUE NOS ITENS (ativo abre o modal, inativo navega)
// =============================================================
track.addEventListener('click', e => {
  const item = e.target.closest('.project-item');
  if (!item) return;

  const itemIndex = allItems.indexOf(item);

  if (item.classList.contains('active')) {
    openProjectModal(itemIndex % total);
    return;
  }

  const currentRounded = Math.round(targetOffset);
  const targetMod      = itemIndex % total;
  const currentMod     = mod(currentRounded, total);

  let diff = targetMod - currentMod;
  // escolhe o caminho mais curto no loop infinito
  if (diff > total / 2)  diff -= total;
  if (diff < -total / 2) diff += total;

  targetOffset = currentRounded + diff;

  clearTimeout(idleTimer);
  clearTimeout(enterTimer);
  if (!isScrolling) { isScrolling = true; hideStage(); }
  idleTimer = setTimeout(onIdle, CONFIG.IDLE_MS);
});

// clique na imagem em destaque (desktop) também abre o modal
stage.addEventListener('click', () => {
  if (stageState.activeIdx >= 0) openProjectModal(stageState.activeIdx);
});

// =============================================================
//  MOBILE — ESTADO
// =============================================================
let mobileItems       = [];
let mobileItemH       = 0;
let mobileLogicOffset = 0;
let mobileTgtOffset   = 0;
let mobilePrevOffset  = 0;
let mobileScrolling   = false;
let mobileIdleTimer   = null;
let mobileEnterTimer  = null;

function readMobileItemHeight() {
  if (!mobileItems[0]) return;
  requestAnimationFrame(() => {
    mobileItemH = mobileItems[0].getBoundingClientRect().height;
  });
}

function initMobile() {
  mobileTrack.innerHTML = '';

  for (let i = 0; i < MOBILE_COPIES; i++) {
    projects.forEach(p => {
      const div = document.createElement('div');
      div.className = 'project-item-mobile';
      div.innerHTML = `<span class="label">${p.name}</span><span class="tag">${p.tag}</span>`;
      mobileTrack.appendChild(div);
    });
  }

  mobileItems = Array.from(mobileTrack.querySelectorAll('.project-item-mobile'));

  mobileLogicOffset = Math.floor(MOBILE_COPIES / 2) * total;
  mobileTgtOffset   = mobileLogicOffset;
  mobilePrevOffset  = mobileLogicOffset;

  readMobileItemHeight();
}

function getMobileActiveIndex(offset) {
  return mod(Math.round(offset), total);
}

function recycleMobileIfNeeded() {
  const lo = total;
  const hi = (MOBILE_COPIES - 1) * total;
  if (mobileLogicOffset < lo) {
    mobileLogicOffset += total; mobileTgtOffset += total; mobilePrevOffset += total;
  } else if (mobileLogicOffset > hi) {
    mobileLogicOffset -= total; mobileTgtOffset -= total; mobilePrevOffset -= total;
  }
}

function snapMobile() { mobileTgtOffset = Math.round(mobileTgtOffset); }

function hideMobileStage() {
  if (mobileImageStage) mobileImageStage.style.opacity = '0';
}

async function showMobileImage(idx) {
  if (!mobileImageStage) return;
  const p = projects[idx];
  mobileImageStage.style.opacity = '0';
  try {
    await preloadImage(p.images[0]);
    mobileImageStage.innerHTML = '';
    const slide = document.createElement('div');
    slide.style.cssText = 'position:absolute;inset:0;';
    slide.innerHTML = `<img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;" /><span class="mobile-img-label">${p.tag}</span>`;
    slide.style.transform = `translateX(${CONFIG.ENTER.translateX})`;
    mobileImageStage.appendChild(slide);
    mobileImageStage.style.opacity = '1';
    slide.animate(
      [{ transform: `translateX(${CONFIG.ENTER.translateX})` }, { transform: 'translateX(0px)' }],
      { duration: CONFIG.ENTER.duration, easing: CONFIG.ENTER.easing, fill: 'forwards' }
    );
  } catch (e) { console.error(e); }
}

function onMobileIdle() {
  mobileScrolling = false;
  snapMobile();
  const idx = getMobileActiveIndex(mobileTgtOffset);
  clearTimeout(mobileEnterTimer);
  mobileEnterTimer = setTimeout(() => showMobileImage(idx), CONFIG.ENTER_DELAY_MS);
}

function handleMobileInput(delta) {
  mobileTgtOffset += delta / mobileItemH;
  clearTimeout(mobileEnterTimer);
  if (!mobileScrolling) { mobileScrolling = true; hideMobileStage(); }
  clearTimeout(mobileIdleTimer);
  mobileIdleTimer = setTimeout(onMobileIdle, CONFIG.IDLE_MS);
}

// =============================================================
//  MOBILE — CLIQUE NOS ITENS (ativo abre o modal, inativo navega)
// =============================================================
mobileTrack.addEventListener('click', e => {
  const item = e.target.closest('.project-item-mobile');
  if (!item) return;

  const itemIndex = mobileItems.indexOf(item);

  if (item.classList.contains('active')) {
    openProjectModal(itemIndex % total);
    return;
  }

  const currentRounded = Math.round(mobileTgtOffset);
  const targetMod      = itemIndex % total;
  const currentMod     = mod(currentRounded, total);

  let diff = targetMod - currentMod;
  // escolhe o caminho mais curto no loop infinito
  if (diff > total / 2)  diff -= total;
  if (diff < -total / 2) diff += total;

  mobileTgtOffset = currentRounded + diff;

  clearTimeout(mobileIdleTimer);
  clearTimeout(mobileEnterTimer);
  if (!mobileScrolling) { mobileScrolling = true; hideMobileStage(); }
  mobileIdleTimer = setTimeout(onMobileIdle, CONFIG.IDLE_MS);
});

// clique na imagem em destaque (mobile) também abre o modal
mobileImageStage.addEventListener('click', () => {
  const idx = getMobileActiveIndex(mobileLogicOffset);
  openProjectModal(idx);
});

// =============================================================
//  MOBILE — LOOP
// =============================================================
function mobileLoop() {
  if (isMobile) {
    mobileLogicOffset += (mobileTgtOffset - mobileLogicOffset) * CONFIG.LERP;
    recycleMobileIfNeeded();
    const container = document.querySelector('.mobile-labels-container');
    if (container) {
      const center = container.clientHeight / 2 - mobileItemH / 2;
      mobileTrack.style.transform = `translateY(${Math.round(center - mobileLogicOffset * mobileItemH)}px)`;
    }
    const ai = getMobileActiveIndex(mobileLogicOffset);
    counterNum.textContent = String(ai + 1).padStart(2, '0');
    if (mobileItems.length) mobileItems.forEach((el, i) => el.classList.toggle('active', (i % total) === ai));
  }
  requestAnimationFrame(mobileLoop);
}

// =============================================================
//  RESPONSIVIDADE
// =============================================================
function checkMobile() {
  isMobile = window.innerWidth <= 768;
  if (isMobile) {
    document.querySelector('.col-right').style.display = 'none';
    leftCol.style.display      = 'none';
    mobileCol.style.display    = 'block';
    mobileCol.style.gridColumn = '1 / 13';
    if (!mobileItems.length) initMobile();
  } else {
    document.querySelector('.col-right').style.display = 'block';
    leftCol.style.display   = 'block';
    mobileCol.style.display = 'none';
  }
}

// =============================================================
//  EVENTOS
// =============================================================
const root = document.getElementById('portfolio-root');

root.addEventListener('wheel', e => {
  if (modalOpen) return;
  e.preventDefault();
  handleInput(e.deltaY * CONFIG.WHEEL_SPEED);
}, { passive: false });

let touchY = null;
root.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
root.addEventListener('touchmove', e => {
  if (modalOpen) return;
  e.preventDefault();
  if (touchY === null) return;
  handleInput((touchY - e.touches[0].clientY) * CONFIG.TOUCH_SPEED);
  touchY = e.touches[0].clientY;
}, { passive: false });

window.addEventListener('resize', () => {
  readItemHeight();
  checkMobile();
});

// =============================================================
//  INICIALIZAÇÃO
// =============================================================
checkMobile();

document.fonts.ready.then(() => {
  readItemHeight();
  updateTrackTransform();
  const idx = getActiveIndex(logicOffset);
  counterNum.textContent = String(idx + 1).padStart(2, '0');
  allItems.forEach((el, i) => el.classList.toggle('active', (i % total) === idx));
  showProject(idx);

  if (isMobile && mobileItems.length) {
    readMobileItemHeight();
  }
});

loop();
mobileLoop();
