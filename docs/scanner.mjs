import {matchSource, projectSlug} from './scanner-core.mjs';
import {scannerText} from './scanner-text.mjs';
const holder = document.querySelector('[data-scanner]');
const lang = document.documentElement.lang || 'en';
const t = scannerText[lang] || scannerText.en;
const base = new URL('.', import.meta.url);
const play = 'https://play.google.com/store/apps/details?id=com.arkko.arkoscope';
const add = (parent, tag, text, cls) => {const el=document.createElement(tag);if(text)el.textContent=text;if(cls)el.className=cls;parent.append(el);return el;};
const link = (parent,text,href,cls) => {const el=add(parent,'a',text,cls);el.href=href;return el;};
if (holder) {
  const form=holder.querySelector('form'),input=form.querySelector('input'),out=holder.querySelector('[role="status"]'),button=form.querySelector('button');
  let registryPromise;
  const load=()=>registryPromise ||= fetch(new URL('sources.json',base),{credentials:'omit'}).then(r=>{if(!r.ok)throw Error('load');return r.json();}).then(d=>{if(!Array.isArray(d.projects)||d.projects.length!==35)throw Error('data');return d;}).catch(e=>{registryPromise=null;throw e;});
  let serial=0;
  form.addEventListener('submit',async event=>{
    event.preventDefault(); const request=++serial;
    out.replaceChildren();out.className='scan-result';add(out,'p',t.loading);button.disabled=true;
    try {
      const registry=await load(); if(request!==serial)return;
      const result=matchSource(input.value,registry.projects);out.replaceChildren();
      if(!result.project) {out.classList.add('unknown');add(out,'p',t.unknown);link(out,t.app,play,'button');return;}
      const p=result.project,slug=projectSlug(p),page=new URL(lang+'/'+slug+'/',base);
      out.classList.add(result.status==='verified'?'verified':'listed');
      add(out,'p',t[result.status],'result-badge');add(out,'h3',p.project);
      if(result.matchedURL)add(out,'p',result.matchedURL,'matched-url');
      add(out,'p',t.date+': '+p.checkedAt.slice(0,10),'meta');
      add(out,'p',t.limits,'scan-limits');
      const actions=add(out,'div',null,'scan-actions');link(actions,t.card,page.href,'button');link(actions,t.app,play,'text-link');
    }catch{out.replaceChildren();add(out,'p',t.error);}
    finally{button.disabled=false;}
  });
  for(const example of holder.querySelectorAll('[data-example]'))example.addEventListener('click',()=>{input.value=example.dataset.example;form.requestSubmit();});
}
for(const button of document.querySelectorAll('[data-copy-rss]'))button.addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(new URL('feed.xml',base).href);button.textContent=t.copied;}
  catch{button.textContent=t.copyFail;}
});
