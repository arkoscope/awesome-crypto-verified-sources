import {scannerText} from './scanner-text.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function scannerMarkup(lang) {
 const t=scannerText[lang];
 return `<section class="scanner" data-scanner aria-labelledby="scanner-title"><p class="eyebrow">ARKOSCOPE OFFICIAL SOURCE SCANNER</p><h2 id="scanner-title">${esc(t.title)}</h2><p>${esc(t.intro)}</p><form><label for="source-query">${esc(t.label)}</label><div class="scan-input"><input id="source-query" name="source" type="search" maxlength="2048" autocomplete="off" spellcheck="false" required placeholder="${esc(t.placeholder)}"><button class="button" type="submit">${esc(t.check)}</button></div></form><div class="examples">${esc(t.examples)} <button type="button" data-example="$BTC">$BTC</button><button type="button" data-example="Solana">Solana</button><button type="button" data-example="https://x.com/chainlink">x.com/chainlink</button></div><div class="scan-result" role="status" aria-live="polite" aria-atomic="true"></div><noscript><p>${esc(t.error)}</p></noscript></section>`;
}
export function shareMarkup(lang,p,page,base,og) {
 const t=scannerText[lang];
 // The historic app label GRAM is not promoted as the network's current ticker.
 const ticker=p.project==='The Open Network'?'':('$'+p.ticker+' ');
 const tweet=`🔍 ${ticker}(${p.project}) official sources are tracked noise-free in the @ARKOSCOPE Observed Universe.\nVerified card & Android app: ${page}`;
 const intent='https://x.com/intent/tweet?text='+encodeURIComponent(tweet);
 return `<section class="share-card"><a href="${base+'/'+og.asset}"><img src="${base+'/'+og.asset}" width="1200" height="630" loading="lazy" alt="${esc(t.shot+' — '+p.project)}"></a><div><p class="meta">${esc(t.shot)} · ${esc(og.capturedAt.slice(0,10))}</p><a class="button" href="${esc(intent)}" target="_blank" rel="noopener noreferrer">${esc(t.share)} ↗</a></div></section>`;
}
export function feedMarkup(lang,base){const t=scannerText[lang];return `<details class="feed-help"><summary>${esc(t.rss)}</summary><p>${esc(t.rssHelp)}</p><p><a href="${base}/feed.xml">${base}/feed.xml</a></p><button class="button" type="button" data-copy-rss>${esc(t.copy)}</button> · <a href="${base}/feed.json">JSON Feed</a><p class="meta">${esc(t.snapshot)}</p></details>`;}
export function makeFeeds(projects,base,asOf){
 const slug=p=>p.project.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const items=projects.map(p=>({id:base+'/en/'+slug(p)+'/',url:base+'/en/'+slug(p)+'/',title:p.project+' — ARKOSCOPE source references',content_text:`Dated public directory entry, checked ${p.checkedAt.slice(0,10)}. Website: ${p.website}. X evidence: ${p.xEvidence.status}. Not live news or a safety certification. Android: https://play.google.com/store/apps/details?id=com.arkko.arkoscope`,image:base+'/assets/og/'+slug(p)+'.png',date_modified:p.checkedAt}));
 const json={version:'https://jsonfeed.org/version/1.1',title:'ARKOSCOPE — Official Sources Registry',home_page_url:base+'/',feed_url:base+'/feed.json',description:'35 dated public project cards. Static directory snapshot, not a live news feed.',language:'en',authors:[{name:'ARKOSCOPE SRL',url:'https://arkoscope.com'}],items};
 const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>ARKOSCOPE — Official Sources Registry</title><link>${esc(base+'/')}</link><description>35 dated public project cards. Static directory snapshot, not live news.</description><language>en</language><atom:link href="${esc(base+'/feed.xml')}" rel="self" type="application/rss+xml"/>${items.map(i=>`<item><title>${esc(i.title)}</title><link>${esc(i.url)}</link><guid isPermaLink="true">${esc(i.id)}</guid><description>${esc(i.content_text)}</description><pubDate>${new Date(i.date_modified).toUTCString()}</pubDate></item>`).join('')}</channel></rss>\n`;
 return {json,xml};
}
