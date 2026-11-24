const copy = {
  "en": [
    "ARKOSCOPE app demonstration — English audio",
    "Available on iPhone and Android. Free download; optional paid VISION PRO. Check your store for current offers.",
    "AI-generated English voiceover. SCOPE FEED demo with a sample video; dated and sped-up real ARKO WHALE capture, not live. ARKO WHALE requires VISION PRO."
  ],
  "fr": [
    "Démonstration ARKOSCOPE — voix en anglais",
    "Disponible sur iPhone et Android. Téléchargement gratuit ; VISION PRO payant facultatif. Consultez les offres de votre boutique.",
    "Voix anglaise générée par IA. Démo SCOPE FEED avec une vidéo d’exemple ; capture réelle ARKO WHALE datée et accélérée, pas du direct. ARKO WHALE nécessite VISION PRO."
  ],
  "de": [
    "ARKOSCOPE-App-Demo — englische Tonspur",
    "Für iPhone und Android verfügbar. Kostenloser Download; optionales kostenpflichtiges VISION PRO. Aktuelle Angebote stehen im Store.",
    "KI-generierte englische Stimme. SCOPE-FEED-Demo mit Beispielvideo; datierte, beschleunigte reale ARKO-WHALE-Aufnahme, nicht live. ARKO WHALE erfordert VISION PRO."
  ],
  "es": [
    "Demostración ARKOSCOPE — audio en inglés",
    "Disponible para iPhone y Android. Descarga gratuita; VISION PRO de pago opcional. Consulta las ofertas de tu tienda.",
    "Voz inglesa generada por IA. Demo de SCOPE FEED con un vídeo de ejemplo; captura real de ARKO WHALE fechada y acelerada, no en directo. ARKO WHALE requiere VISION PRO."
  ],
  "nl": [
    "ARKOSCOPE-appdemo — Engelse audio",
    "Beschikbaar voor iPhone en Android. Gratis download; optioneel betaald VISION PRO. Bekijk actuele aanbiedingen in je Store.",
    "AI-gegenereerde Engelse stem. SCOPE FEED-demo met voorbeeldvideo; gedateerde en versnelde echte ARKO WHALE-opname, niet live. ARKO WHALE vereist VISION PRO."
  ]
};
export function storeBadges() { return `<div class="store-badges"><a href="https://apps.apple.com/app/arkoscope/id6792251260"><img src="https://arkoscope.com/assets/badges/apple-app-store-badge-en-us.svg" alt="Download on the App Store" height="48"></a><a href="https://play.google.com/store/apps/details?id=com.arkko.arkoscope"><img src="https://arkoscope.com/assets/badges/google-play-badge-en.svg" alt="Get it on Google Play" height="48"></a></div><p class="store-trademarks">Apple and the Apple logo are trademarks of Apple Inc., registered in the U.S. and other countries and regions. App Store is a service mark of Apple Inc. Google Play and the Google Play logo are trademarks of Google LLC.</p>`; }
export function videoPromo(lang) {
 const [label,availability,notice] = copy[lang] || copy.en;
 return `<section class="video-promo" aria-label="${label}"><div class="video-frame"><video class="app-preview" playsinline controls preload="none" crossorigin="anonymous" poster="https://arkoscope.com/assets/video/arkoscope-en-34s-deux-stores-20261124-poster.jpg" width="540" height="960" aria-label="${label}"><source src="https://arkoscope.com/assets/video/arkoscope-en-34s-deux-stores-20261124.mp4" type="video/mp4"><track kind="captions" src="https://arkoscope.com/assets/video/arkoscope-en-34s-deux-stores-20261124.vtt" srclang="en" label="English"></video></div><div class="video-cta"><h2>${label}</h2>${storeBadges()}<p>${availability}</p><small>${notice}</small></div></section>`;
}
