// Autoplay is best effort. Respect reduced motion/data preferences and keep native controls.
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const connection = navigator.connection;
function applyPreference() {
 for (const video of document.querySelectorAll('video.app-preview')) {
  video.muted = true;
  if (reducedMotion.matches || connection?.saveData) {
   video.autoplay = false;
   video.pause();
  }
 }
}
applyPreference();
reducedMotion.addEventListener('change', applyPreference);
connection?.addEventListener?.('change', applyPreference);
