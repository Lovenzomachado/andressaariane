// =============================================================
//  PROJETOS — edite aqui para adicionar / remover projetos
// =============================================================
const IMG_BASE_URL = 'https://raw.githubusercontent.com/Lovenzomachado/andressaariane/main/projects/';

const projects = [
  { name: 'Ipanema Pluma',   tag: 'Identidade Visual', images: [`${IMG_BASE_URL}ipanema-pluma.avif`] },
  { name: 'Quinto Andar',    tag: 'Branding Digital',  images: [`${IMG_BASE_URL}quintoandar.avif`]   },
  { name: 'Élev Experience', tag: 'Skincare Print',    images: [`${IMG_BASE_URL}elev.avif`]          },
  { name: 'Unimed VTRP',     tag: 'Campanha',          images: [`${IMG_BASE_URL}unimed.avif`]        },
  { name: 'Kero Fazê',       tag: 'Social Media',      images: [`${IMG_BASE_URL}kerofaze.avif`]      },
  { name: 'Museu da PUC',    tag: 'Editorial',         images: [`${IMG_BASE_URL}puc.avif`]           },
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
//  DESKTOP — CLIQUE NOS ITENS INATIVOS
// =============================================================
track.addEventListener('click', e => {
  const item = e.target.closest('.project-item');
  if (!item || item.classList.contains('active')) return;

  const itemIndex      = allItems.indexOf(item);
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
//  MOBILE — CLIQUE NOS ITENS INATIVOS
// =============================================================
mobileTrack.addEventListener('click', e => {
  const item = e.target.closest('.project-item-mobile');
  if (!item || item.classList.contains('active')) return;

  const itemIndex      = mobileItems.indexOf(item);
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
  e.preventDefault();
  handleInput(e.deltaY * CONFIG.WHEEL_SPEED);
}, { passive: false });

let touchY = null;
root.addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
root.addEventListener('touchmove', e => {
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
