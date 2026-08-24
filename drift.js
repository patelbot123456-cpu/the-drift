"use strict";
/* ---- reduced motion (a11y): honor the visitor's OS preference.
   No motes animation, no shake. Determinism of the seeded RNG below is
   untouched — this only gates the decorative canvas and the .shake class. */
var REDUCED_MOTION=false;
try{ REDUCED_MOTION=window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }catch(e){}

/* drifting fireflies over the sea */
const cv=document.getElementById("motes");
if(cv && !REDUCED_MOTION){
  const cx=cv.getContext("2d");
  let W=0,H=0;
  function size(){ W=cv.width=innerWidth; H=cv.height=innerHeight; }
  addEventListener("resize",size); size();
  const motes=[];
  for(let i=0;i<70;i++){
    motes.push({x:Math.random()*W, y:Math.random()*H,
      r:.6+Math.random()*2.2, sp:.12+Math.random()*.5,
      ph:Math.random()*6.28, warm:Math.random()<.3});
  }
  let last=performance.now();
  (function anim(now){
    const dt=Math.min(50,(now-last))/16.7; last=now;
    cx.clearRect(0,0,W,H);
    for(const m of motes){
      m.x += (Math.sin(now*.0004+m.ph)*.3 + m.sp*.4)*dt;
      m.y -= m.sp*.5*dt;
      if(m.y<-10){ m.y=H+10; m.x=Math.random()*W; }
      if(m.x>W+10) m.x=-10;
      const tw=.35+.65*(.5+.5*Math.sin(now*.002+m.ph));
      cx.globalAlpha=tw*.8;
      const g=cx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r*4);
      const col=m.warm?"255,180,84":"140,235,220";
      g.addColorStop(0,`rgba(${col},.9)`); g.addColorStop(1,`rgba(${col},0)`);
      cx.fillStyle=g;
      cx.beginPath(); cx.arc(m.x,m.y,m.r*4,0,7); cx.fill();
    }
    cx.globalAlpha=1;
    requestAnimationFrame(anim);
  })(last);
}

/* ---- mulberry32 (must match tools/driftlib.py exactly) ---- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
const el=id=>document.getElementById(id);

/* ---- weave of fate ---- */
const adjs=["patient","salt-scarred","unmoored","amber-eyed","nine-lantern","tidal","garden-bearing","bridge-singing"];
const nouns=["drift-whale","rope bridge","old lighthouse","orchard","Unraveling","keeper","lantern","map"];
const verbs=["remember","outlast","pull apart","carry","outshine","forgive","cross","outlast"];
const places=["the Orchard","the Ninth Island","the edge of the map","the keeper's room","the far shore","the quiet sea"];
const when=["at the third bell","before the first frost","in the lantern's lowest hour","at the moonless tide","when the fuel runs low","at dawn, uncounted"];
if(el("weave-btn")) el("weave-btn").onclick=()=>{
  const r=mulberry32((Math.random()*1e9)|0);
  const p=a=>a[Math.floor(r()*a.length)];
  el("oracle-out").innerHTML=`The <b>${p(adjs)}</b> ${p(nouns)} will <b>${p(verbs)}</b> ${p(places)} — ${p(when)}.`;
  const c=el("weave-card"); c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake");
};

/* ---- name a place ---- */
const pre=["Vell","Mor","Ash","Cal","Sere","Tarn","Ish","Rune","Bryn","Sol","Kael","Ond"];
const mid=["a","e","or","un","il","ar"];
const suf=["mark","holm","wick","mere","haven","reach","glen","strand","moor","light"];
const epis=["the Unmoored","of the Third Bell","the Garden-Bearer","at the Map's Edge","the Last Held","of Sullen Waters","of the Quiet Sea","the Twice-Named"];
if(el("place-btn")) el("place-btn").onclick=()=>{
  const r=mulberry32((Math.random()*1e9)|0);
  const p=a=>a[Math.floor(r()*a.length)];
  el("place-name").textContent=p(pre)+p(mid)+p(suf);
  el("place-epithet").textContent=p(epis);
  const c=el("place-card"); c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake");
};

/* ---- "since your last visit" (improvement-plan #6) ----
   One localStorage key (drift_last_read) = {no, date}, written on every
   entry page read. If a prior read exists and is older than this entry,
   show one line: "You last read Entry N — M entries since" + a link to it.
   No tracking, no cookies, no external calls; the visitor can clear the
   key and the banner disappears. */
(function(){
  const box=el("lastread");
  if(!box) return;
  const no=parseInt(document.body.getAttribute("data-entry-no"),10);
  const date=document.body.getAttribute("data-entry-date")||"";
  if(!no || !date) return;
  const root=box.getAttribute("data-root")||"";
  const latest=parseInt(box.getAttribute("data-latest"),10)||0;
  const KEY="drift_last_read";
  let prev=null;
  try{ prev=JSON.parse(localStorage.getItem(KEY)||"null"); }catch(e){ prev=null; }
  if(prev && typeof prev.no==="number" && prev.no>0 && prev.no<no){
    const n=no-prev.no;
    box.textContent="You last read Entry "+prev.no.toLocaleString("en-US")+" — "+(n===1?"1 entry":n+" entries")+" since. ";
    const a=document.createElement("a");
    /* entry dirs are entry-YYYYMMDD/ (no dashes); the stored date has dashes */
    const d=String(prev.date||"").replace(/-/g,"");
    a.href=root+"entry-"+d+"/";
    a.textContent="Read it again";
    box.appendChild(a);
    box.classList.add("show");
  }
  try{ localStorage.setItem(KEY, JSON.stringify({no:no, date:date})); }catch(e){}
})();

/* ---- footer ad slot: consent, injection, failure fallback, impression ----
   Config is baked in by the build as window.__driftAds (deterministic).
   No third-party ad script is ever in the initial HTML: it is injected here,
   only after the visitor accepts. Declined -> placeholder forever.
   Failure (script error / no fill within ~2 s) -> placeholder.
   Impression -> one event to the view beacon (if enabled), never blocking. */
(function(){
  const slot=el("ad-slot");
  if(!slot) return;
  const C=window.__driftAds||{provider:"none",client:"",src:"",beacon:false,hosts:[],url:"/view"};
  const KEY="drift_ad_consent_v1";
  const live=el("ad-live");
  const ph=el("ad-placeholder");
  const consent=el("ad-consent");
  const state={provider:C.provider,consent:null,script:"absent",fill:false,impressed:false,impressions:0};
  window.__driftAds={state:()=>({provider:state.provider,consent:state.consent,script:state.script,fill:state.fill,impressed:state.impressed,impressions:state.impressions})};

  if(C.provider==="none"){ slot.classList.add("ads-off"); return; } /* placeholder only, nothing runs */

  function readConsent(){ try{ const v=localStorage.getItem(KEY); return (v==="accepted"||v==="declined")?v:null; }catch(e){ return null; } }
  function setConsent(v){ try{ localStorage.setItem(KEY,v); }catch(e){} }
  function hideConsent(){ if(consent) consent.style.display="none"; }
  function showPlaceholder(){ if(live) live.style.display="none"; if(ph) ph.style.display=""; }
  function showLive(){ if(ph) ph.style.display="none"; if(live) live.style.display=""; }

  /* impression signal -> view beacon (same endpoint as views; carries
     event:"ad_impression" so the receiver can segment it out of views). */
  function impression(){
    if(!C.beacon) return;
    if((C.hosts||[]).length && C.hosts.indexOf(location.hostname)===-1) return;
    state.impressions++;
    let sid;
    try{ sid=localStorage.getItem("drift_sid"); }catch(e){}
    const path=(location.pathname||"/").replace(/\/$/,"")||"/";
    const body=JSON.stringify({ts:new Date().toISOString(),event:"ad_impression",provider:state.provider,path:path,host:location.hostname,session:sid||""});
    try{
      if(navigator.sendBeacon) navigator.sendBeacon(C.url,new Blob([body],{type:"application/json"}));
      else{ const x=new XMLHttpRequest(); x.open("POST",C.url); x.timeout=1000; x.setRequestHeader("Content-Type","application/json"); x.send(body); }
    }catch(e){}
  }

  /* provider script injection + fill/failure handling. Only ever runs
     post-accept. Any error path ends in the honest placeholder. */
  function loadAd(){
    if(state.script!=="absent") return;
    if(C.provider==="custom"){ showLive(); state.script="custom"; state.fill=true; impression(); return; }
    if(!C.src){ /* provider without a script (misconfig) -> stay honest */ showPlaceholder(); state.script="missing"; return; }
    state.script="loading";
    const done=(ok)=>{
      if(state.script==="done") return;
      state.script=ok?"done":"failed";
      if(ok){
        const t=setTimeout(()=>{ /* no fill in ~2.5 s -> honest fallback */ if(state.script==="done" && !state.fill){ state.script="nofill"; showPlaceholder(); } },2500);
        const findFill=()=>{
          if(!live) return null;
          const f=live.querySelector("iframe,object,embed,[data-ad-slot],[data-ad],.ezoic-ad");
          if(f) return f;
          /* provider markup injected into the empty .ad-live (e.g. an ezoic
             container div); skip the baked-in empty <ins> that adsense starts
             from — it is always present, so it is never itself a fill */
          const first=live.firstElementChild;
          if(first && !(first.tagName==="INS" && !first.hasChildNodes())) return first;
          return null;
        };
        const check=()=>{
          if(state.fill) return; /* ad confirmed: stop polling */
          const f=findFill();
          /* while .ad-live is still display:none (the accept path) every
             offsetHeight reads 0, so the DOM structure is the fill signal;
             when visible, require a real height so 1x1 trackers don't count */
          const hidden=live ? getComputedStyle(live).display==="none" : true;
          if(f && (hidden || f.offsetHeight>40)){ state.fill=true; state.impressed=true; clearTimeout(t); showLive(); impression(); return; }
          requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
      } else showPlaceholder();
    };
    const s=document.createElement("script");
    s.async=true; s.crossOrigin="anonymous"; s.src=C.src;
    s.onload=()=>{ if(C.provider==="adsense"){ try{(window.adsbygoogle=window.adsbygoogle||[]).push({});}catch(e){ done(false); return;} } done(true); };
    s.onerror=()=>done(false);
    document.head.appendChild(s);
  }

  state.consent=readConsent();
  if(C.provider==="custom"){ showLive(); state.script="custom"; state.fill=true; impression(); return; } /* self-hosted patron markup: no consent */
  if(state.consent==="declined"){ hideConsent(); showPlaceholder(); return; }
  if(state.consent==="accepted"){ hideConsent(); loadAd(); return; }
  /* first visit: consent banner over the honest placeholder; NO ad script */
  showPlaceholder();
  const acc=el("ad-consent-accept"), dec=el("ad-consent-decline");
  if(acc) acc.onclick=()=>{ setConsent("accepted"); state.consent="accepted"; hideConsent(); loadAd(); };
  if(dec) dec.onclick=()=>{ setConsent("declined"); state.consent="declined"; hideConsent(); showPlaceholder(); };
})();


