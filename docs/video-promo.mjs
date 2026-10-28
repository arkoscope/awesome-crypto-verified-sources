const copy = {
 en: ['Download ARKOSCOPE free on Google Play (Android)', 'iPhone version (iOS 0.7) approved by Apple — public release pending corporate account conversion.', '15-second app preview', 'Free download. Optional paid VISION PRO subscription.'],
 fr: ['Télécharger gratuitement ARKOSCOPE sur Google Play (Android)', 'Version iPhone (iOS 0.7) déjà acceptée par Apple — ouverture publique après le transfert du compte en société.', 'Aperçu de l’application en 15 secondes', 'Téléchargement gratuit. Abonnement VISION PRO payant facultatif.'],
 de: ['ARKOSCOPE kostenlos bei Google Play herunterladen (Android)', 'iPhone-Version (iOS 0.7) von Apple genehmigt — öffentliche Veröffentlichung nach der Umstellung auf das Unternehmenskonto.', '15 Sekunden App-Vorschau', 'Kostenloser Download. Optionales kostenpflichtiges VISION-PRO-Abonnement.'],
 es: ['Descarga ARKOSCOPE gratis en Google Play (Android)', 'Versión para iPhone (iOS 0.7) aprobada por Apple — lanzamiento público tras la conversión de la cuenta a empresa.', 'Vista previa de la app en 15 segundos', 'Descarga gratuita. Suscripción VISION PRO de pago opcional.'],
 nl: ['Download ARKOSCOPE gratis via Google Play (Android)', 'iPhone-versie (iOS 0.7) goedgekeurd door Apple — openbare release na de omzetting naar een bedrijfsaccount.', 'App-voorbeeld van 15 seconden', 'Gratis download. Optioneel betaald VISION PRO-abonnement.']
};
export function videoPromo(lang, base) {
 const [cta, ios, label, pricing] = copy[lang];
 return `<section class="video-promo" aria-label="${label}"><div class="video-frame"><video class="app-preview" autoplay muted loop playsinline controls preload="metadata" width="540" height="960" poster="${base}/assets/video/arkoscope-${lang}-poster.jpg" aria-label="${label}"><source src="${base}/assets/video/arkoscope-${lang}-15s.mp4" type="video/mp4"></video></div><div class="video-cta"><a class="button" href="https://play.google.com/store/apps/details?id=com.arkko.arkoscope">${cta} ↗</a><p>${ios}</p><small>${pricing}</small></div></section>`;
}
