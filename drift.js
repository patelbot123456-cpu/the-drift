"use strict";
/* drifting fireflies over the sea */
const cv=document.getElementById("motes");
if(cv){
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
