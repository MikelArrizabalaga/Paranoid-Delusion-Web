const railTrack = document.querySelector('#rail-track');
const railcars = [...document.querySelectorAll('.railcar')];
const stationLinks = [...document.querySelectorAll('.station-link')];
const routeStatus = document.querySelector('.route-status');
const routeCurrent = document.querySelector('.route-current');
const stationNames = ['INICIO', 'TRÁILER', 'NOTICIAS', 'ESTUDIO'];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let activeIndex = -1;
let scrollScheduled = false;

function updateRouteProgress() {
  const firstDot = stationLinks[0].querySelector('.station-dot').getBoundingClientRect();
  const activeDot = stationLinks[activeIndex].querySelector('.station-dot').getBoundingClientRect();
  const distance = activeDot.left + activeDot.width / 2 - firstDot.left - firstDot.width / 2;
  routeStatus.style.setProperty('--route-progress', `${Math.max(0, distance)}px`);
}

function syncStationFromScroll() {
  const top = railTrack.getBoundingClientRect().top;
  const activationLine = top + Math.min(100, railTrack.clientHeight * .2);
  let nextIndex = 0;
  railcars.forEach((car, index) => {
    if (car.getBoundingClientRect().top <= activationLine) nextIndex = index;
  });
  if (nextIndex === activeIndex) return;
  activeIndex = nextIndex;
  railcars.forEach((car, index) => car.classList.toggle('is-current', index === activeIndex));
  stationLinks.forEach((link, index) => {
    const selected = index === activeIndex;
    link.classList.toggle('is-active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  routeCurrent.textContent = `ESTACIÓN 0${activeIndex + 1} — ${stationNames[activeIndex]}`;
  updateRouteProgress();
}

function scheduleStationSync() {
  if (scrollScheduled) return;
  scrollScheduled = true;
  requestAnimationFrame(() => {
    scrollScheduled = false;
    syncStationFromScroll();
  });
}

function goToStation(index, instant = false) {
  const target = railcars[index];
  if (!target) return;
  // Actual positions also work after images load or the viewport changes.
  const top = target.getBoundingClientRect().top - railTrack.getBoundingClientRect().top + railTrack.scrollTop;
  railTrack.scrollTo({ top, behavior: instant || reducedMotion.matches ? 'instant' : 'smooth' });
}

function followHash(instant = false) {
  const index = railcars.findIndex((car) => `#${car.id}` === location.hash);
  if (index >= 0) goToStation(index, instant);
}

railTrack.addEventListener('scroll', scheduleStationSync, { passive:true });
window.addEventListener('resize', () => {
  scheduleStationSync();
  updateRouteProgress();
}, { passive:true });
window.addEventListener('hashchange', () => followHash());
document.querySelectorAll('a[href^="#station-"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const hash = link.getAttribute('href');
    const index = railcars.findIndex((car) => `#${car.id}` === hash);
    if (index < 0) return;
    event.preventDefault();
    if (location.hash !== hash) history.pushState(null, '', hash);
    goToStation(index);
  });
});
window.addEventListener('load', () => {
  followHash(true);
  syncStationFromScroll();
}, { once:true });
syncStationFromScroll();

// Sections animate on visibility; tall news articles stay readable throughout.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
  }, { root:railTrack, threshold:0 });
  railcars.forEach((car) => observer.observe(car));
  document.body.classList.add('motion-ready');
}

const trailerSources = {
  es:{ src:'Spanish-Trailer.mp4', label:'Tráiler en español de The Next Stop' },
  en:{ src:'English-Trailer.mp4', label:'The Next Stop trailer in English' },
  jp:{ src:'Japanish-Trailer.mp4', label:'The Next Stop 日本語トレーラー' },
};
const trailerVideo = document.querySelector('#trailer-video');
const videoStatus = document.querySelector('#video-status');
const languageButtons = [...document.querySelectorAll('.lang-chip')];
let trailerChange = 0;

languageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.getAttribute('aria-pressed') === 'true') return;
    const trailer = trailerSources[button.dataset.language];
    if (!trailer) return;
    const change = ++trailerChange;
    const wasPlaying = !trailerVideo.paused;
    trailerVideo.pause();
    trailerVideo.src = trailer.src;
    trailerVideo.setAttribute('aria-label', trailer.label);
    languageButtons.forEach((item) => {
      item.classList.toggle('is-active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    videoStatus.textContent = `Idioma seleccionado: ${button.textContent}.`;
    trailerVideo.load();
    if (wasPlaying) {
      trailerVideo.play().catch(() => {
        if (change === trailerChange) videoStatus.textContent = 'Pulsa reproducir para continuar con el tráiler.';
      });
    }
  });
});
trailerVideo.addEventListener('error', () => {
  videoStatus.textContent = 'No se ha podido cargar el tráiler. Prueba otro idioma o vuelve a reproducirlo.';
});
if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting && !trailerVideo.paused) trailerVideo.pause();
  }, { root:railTrack });
  videoObserver.observe(trailerVideo);
}
