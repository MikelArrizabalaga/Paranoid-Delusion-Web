const railTrack = document.querySelector('#rail-track');
const railcars = [...document.querySelectorAll('.railcar:not(.car-news)')];
const stationLinks = [...document.querySelectorAll('.station-link')];
const routeStatus = document.querySelector('.route-status');
const routeCurrent = document.querySelector('.route-current');
const stationNames = ['PARADA', 'TRAILER', 'NOTICIAS', 'PARANOID DELUSION'];
let activeIndex = 0;

function goToStation(index, instant = false) {
  const target = railcars[Math.max(0, Math.min(index, railcars.length - 1))];
  if (!target) return;
  const top = railcars.slice(0, railcars.indexOf(target)).reduce((sum, car) => sum + car.offsetHeight, 0);
  railTrack.scrollTo({ top, behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
}

const stationObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting || entry.intersectionRatio < 0.55) continue;
    activeIndex = railcars.indexOf(entry.target);
    stationLinks.forEach((link, index) => {
      const isActive = index === activeIndex;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    routeStatus.style.setProperty('--route-progress', `${(activeIndex / (railcars.length - 1)) * 100}%`);
    routeCurrent.innerHTML = `ESTACIÓN 0${activeIndex + 1} <i>—</i> ${stationNames[activeIndex]}`;
  }
}, { root: railTrack, threshold: [0.55, 0.75] });

railcars.forEach((car) => stationObserver.observe(car));

// El indicador sigue siempre al vagón que ocupa el centro de la ventana.
stationObserver.disconnect();
function syncStationFromScroll() {
  const center = railTrack.scrollTop + railTrack.clientHeight * 0.5;
  let nextIndex = 0;
  let accumulated = 0;
  railcars.forEach((car, index) => { if (accumulated <= center) nextIndex = index; accumulated += car.offsetHeight; });
  activeIndex = nextIndex;
  railcars.forEach((car, index) => car.classList.toggle('is-current', index === activeIndex));
  stationLinks.forEach((link, index) => {
    const isActive = index === activeIndex;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  routeStatus.style.setProperty('--route-progress', `${(activeIndex / (railcars.length - 1)) * 100}%`);
  routeCurrent.innerHTML = `ESTACIÓN 0${activeIndex + 1} <i>—</i> ${stationNames[activeIndex]}`;
}
railTrack.addEventListener('scroll', syncStationFromScroll, { passive: true });
syncStationFromScroll();

railTrack.addEventListener('keydown', (event) => {
  if (event.target !== railTrack || !['ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'].includes(event.key)) return;
  event.preventDefault();
  const step = event.key === 'ArrowLeft' || event.key === 'PageUp' ? -1 : 1;
  goToStation(activeIndex + step);
});

const trailerSources = {
  es: { src: 'Spanish-Trailer.mp4', label: 'Tráiler en español', shortLabel: 'ESPAÑOL' },
  en: { src: 'English-Trailer.mp4', label: 'Trailer in English', shortLabel: 'ENGLISH' },
  jp: { src: 'Japanish-Trailer.mp4', label: '日本語トレーラー', shortLabel: '日本語' },
};

const trailerVideo = document.querySelector('#trailer-video');
const languageLabel = document.querySelector('#language-label');
const languageButtons = document.querySelectorAll('.lang-chip');

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const trailer = trailerSources[button.dataset.language];
    if (!trailer) return;

    const wasPlaying = !trailerVideo.paused;
    trailerVideo.pause();
    trailerVideo.src = trailer.src;
    trailerVideo.setAttribute('aria-label', trailer.label);
    languageLabel.textContent = trailer.shortLabel;
    languageButtons.forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle('is-active', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
    trailerVideo.load();
    if (wasPlaying) trailerVideo.play().catch(() => {});
  });
});

const menuToggle = document.querySelector('.menu-toggle');
const stationNav = document.querySelector('.station-nav');

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Abrir menú' : 'Cerrar menú');
  stationNav.classList.toggle('is-open', !isOpen);
});

stationNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    stationNav.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Abrir menú');
  });
});

function stationIndexFromHash() {
  const targetId = window.location.hash;
  return railcars.findIndex((car) => `#${car.id}` === targetId);
}

window.addEventListener('hashchange', () => {
  const targetIndex = stationIndexFromHash();
  if (targetIndex >= 0) goToStation(targetIndex);
});

document.querySelectorAll('a[href^="#station-"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    const targetIndex = railcars.findIndex((car) => `#${car.id}` === targetId);
    if (targetIndex < 0) return;
    event.preventDefault();
    history.replaceState(null, '', targetId);
    goToStation(targetIndex);
  });
});

window.addEventListener('load', () => {
  const targetIndex = stationIndexFromHash();
  if (targetIndex >= 0) goToStation(targetIndex, true);
  else railTrack.scrollTop = 0;
  syncStationFromScroll();
}, { once: true });
