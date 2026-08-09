import{a_ as o,ac as x}from"./main-BIoil1Wg.js";import{ensureUiStyles as w,el as n,ICONS as f,textSvg as c,numeralSvg as y,glyphSvg as _,REDUCED_MOTION as k}from"./Hud-DP_j4TUv.js";const b=(p,e,i)=>p<e?e:p>i?i:p,F=Math.PI/180;function v(p,e,i=.055,t=0){return[...String(p)].map((s,a)=>{const r=(t+a*i).toFixed(3),h=s===" "?"":_(s,e);return`<span class="hx-w${s===" "?" hx-w-sp":""}" style="animation-delay:${r}s">${h}</span>`}).join("")}function m(p,e="key"){return`<span class="hx-cap hx-cap-${e}">`+c(p,{height:.66,weight:19,tracking:12})+"</span>"}class T{constructor(e){this.ctx=e,this.root=null,this.screen=null,this.index=0,this._navHeld=0,this._navDir=0,this._repeat=0,this._titleT=0,this._ownFreeCam=!1,this._ownFreeze=!1,this._savedFov=null,this._lastP=null,this._device=null,this._sunFocus=0}init(){if(typeof document>"u")return;w(),this._injectStyles(),this.root=n("div","hx hx-menu-root","menu-root"),this.root.id="hx-menu",this._buildTitle(),this._buildPause(),this._buildSunstones(),document.body.appendChild(this.root);const e=this._readUrlScreen();e?(this._pinned=!0,this.open(e)):o.titleOnBoot?this.open("title"):this._applyScreen()}_readUrlScreen(){try{const e=new URLSearchParams(location.search).get("menu");return e==="title"||e==="pause"||e==="sunstones"?e:null}catch{return null}}_buildTitle(){const e=n("div","hx-screen hx-title","menu-title");e.appendChild(n("div","hx-title-scrim","menu-title-scrim"));const i=n("div","hx-title-body","menu-title-body"),t=n("div","hx-title-mark","menu-title-mark",f.bird("var(--paper)")),s=n("div","hx-wordmark","menu-wordmark");s.innerHTML=v("HALCYON",{height:1,weight:o.typeWeightBold+3,pad:8,halo:{color:"rgba(48,20,8,.72)",grow:13}},.062,.1);const a=n("div","hx-title-rule","menu-title-rule"),r=n("div","hx-title-sub","menu-title-sub");r.innerHTML=v("CAPE AURELIA",{height:1,weight:17,pad:6},.026,.62);const h=n("button","hx-cta","menu-cta");h.type="button",h.dataset.index="0",this.ctaCap=n("span","hx-cta-cap","menu-cta-cap");const l=n("span","hx-cta-face","menu-cta-face");l.innerHTML=c("Begin",{height:1,weight:o.typeWeightBold,tracking:o.typeTrackingWide}),h.append(this.ctaCap,l),i.append(t,s,a,r,h),e.appendChild(i),this.root.appendChild(e),this.titleScreen=e,this.titleItems=[h],this._wirePointer(this.titleItems,()=>this._confirm())}_buildPause(){const e=n("div","hx-screen hx-pause","menu-pause");e.appendChild(n("div","hx-blur","menu-blur"));const i=n("div","hx-card","menu-card"),t=n("div","hx-ledger-head hx-rank-gold","menu-card-top"),s=n("div","hx-card-head","menu-card-head");s.innerHTML=c("Paused",{height:1,weight:o.typeWeightBold,tracking:o.typeTrackingWide}),this.pauseTally=n("div","hx-tally","menu-tally"),t.append(s,this.pauseTally),i.appendChild(t),i.appendChild(n("div","hx-rule","menu-rule"));const a=n("nav","hx-list","menu-list");this.pauseSel=n("div","hx-sel","menu-selection"),a.appendChild(this.pauseSel);const r=["Resume","Sunstones","Graphics","Return to title"];this.pauseItems=r.map((h,l)=>{const d=n("button","hx-item","menu-item");return d.type="button",d.dataset.index=String(l),d.innerHTML=`<span class="hx-bullet">${f.sunstone("lit")}</span><span class="hx-item-label">${c(h,{height:1,weight:o.typeWeight+1,tracking:o.typeTracking+10})}</span>`,a.appendChild(d),d}),i.appendChild(a),i.appendChild(n("div","hx-rule hx-rule-faint","menu-rule")),this.pauseHint=n("div","hx-hint","menu-hint"),i.appendChild(this.pauseHint),e.appendChild(i),this.root.appendChild(e),this.pauseScreen=e,this._wirePointer(this.pauseItems,()=>this._confirm())}_buildSunstones(){const e=n("div","hx-screen hx-sunstones","menu-sunstones");e.appendChild(n("div","hx-blur","menu-blur"));const i=n("div","hx-card hx-card-wide","menu-card"),t=n("div","hx-ledger-head hx-rank-gold","menu-ledger-head"),s=n("div","hx-card-head","menu-card-head");s.innerHTML=c("Sunstones",{height:1,weight:o.typeWeightBold,tracking:o.typeTrackingWide}),this.ledgerCount=n("div","hx-ledger-count","menu-ledger-count"),t.append(s,this.ledgerCount),i.appendChild(t),i.appendChild(n("div","hx-rule","menu-rule")),this.grid=n("div","hx-grid","menu-grid"),this.grid.style.setProperty("--cols",String(o.sunstoneColumns)),this.slots=[];for(let a=0;a<x.totalMoons;a++){const r=n("button","hx-slot","menu-slot");r.type="button",r.dataset.index=String(a),r.innerHTML='<span class="hx-slot-gem"></span>',this.grid.appendChild(r),this.slots.push(r)}i.appendChild(this.grid),this.ledgerCaption=n("div","hx-caption","menu-caption"),i.appendChild(this.ledgerCaption),i.appendChild(n("div","hx-rule hx-rule-faint","menu-rule")),this.ledgerHint=n("div","hx-hint","menu-hint"),i.appendChild(this.ledgerHint),e.appendChild(i),this.root.appendChild(e),this.sunScreen=e,this._wirePointer(this.slots,()=>{})}_wirePointer(e,i){e.forEach((t,s)=>{t.addEventListener("pointerenter",()=>{this.screen==="sunstones"?(this._sunFocus=s,this._paintLedgerFocus()):(this.index=s,this._paintFocus())}),t.addEventListener("click",a=>{a.preventDefault(),i()})})}open(e){return this.root?(this.screen=e,this.index=0,e==="sunstones"&&this._paintLedger(),e==="pause"&&this._paintTally(),this._applyScreen(),this._paintHints(),e==="title"&&(this._titleT=0),this):this}close(){return this.screen=null,this._applyScreen(),this}onHudVisibility(e){this._pinned||o.titleDismissOnHudShow&&this.screen&&(this._suppressHudRestore=!e,this._standDown(),this._suppressHudRestore=!1)}_standDown(){this._pinned||(this.screen=null,this._applyScreen())}_applyScreen(){const e={title:this.titleScreen,pause:this.pauseScreen,sunstones:this.sunScreen};for(const s of Object.keys(e)){const a=e[s];if(!a)continue;const r=this.screen===s;a.style.display=r?"":"none",a.classList.toggle("hx-open",r),r&&(a.classList.remove("hx-enter"),a.offsetWidth,a.classList.add("hx-enter"))}this.root.style.pointerEvents=this.screen?"auto":"none";const i=this.ctx?.ui?.hud;i&&(this.screen?i.visible&&(this._hidHud=!0,i.setVisible(!1,{internal:!0})):this._suppressHudRestore?this._hidHud=!1:this._hidHud&&(this._hidHud=!1,i.setVisible(!0,{internal:!0})));const t=this.ctx?.player;t&&(this.screen?(t.frozen=!0,this._ownFreeze=!0):this._ownFreeze&&(t.frozen=!1,this._ownFreeze=!1)),this.screen!=="title"&&this._releaseCamera(),this._paintFocus()}_releaseCamera(){const e=this.ctx;this._ownFreeCam&&e?.debug&&(e.debug.freeCam=!1,this._ownFreeCam=!1);const i=e?.three?.camera;i&&this._savedFov!=null&&(i.fov=this._savedFov,i.updateProjectionMatrix(),this._savedFov=null)}fixedUpdate(e,i){const t=i?.input;if(!(!t||!this.root)){if(t.lastDevice!==this._device&&(this._device=t.lastDevice,this._paintHints()),!this.screen){t.pause?.pressed&&this.open("pause");return}if(this.screen==="title"){(t.jump?.pressed||t.anyPressed||t.pause?.pressed)&&this._confirm();return}if(t.pause?.pressed){this.screen==="sunstones"?this.open("pause"):this.close();return}if(t.crouch?.pressed||t.throwBird?.pressed){this.screen==="sunstones"?this.open("pause"):this.close();return}if(t.jump?.pressed){this._confirm();return}this._navigate(e,t)}}_navigate(e,i){const t=i.move?.y??0,s=i.move?.x??0,a=o.navDeadzone,r=t>a?-1:t<-a?1:0,h=s>a?1:s<-a?-1:0,l=r||h?r*10+h:0;if(l===0){this._navDir=0,this._repeat=0;return}let d=!1;if(l!==this._navDir?(d=!0,this._navDir=l,this._repeat=o.navRepeatDelay):(this._repeat-=e,this._repeat<=0&&(d=!0,this._repeat=o.navRepeatRate)),!!d)if(this.screen==="sunstones"){const u=o.sunstoneColumns;let g=this._sunFocus;h&&(g=b(g+h,0,this.slots.length-1)),r&&(g=b(g+r*u,0,this.slots.length-1)),this._sunFocus=g,this._paintLedgerFocus()}else{const u=this._items();if(!u.length)return;this.index=(this.index+(r||0)+u.length)%u.length,this._paintFocus()}}_items(){return this.screen==="title"?this.titleItems:this.screen==="pause"?this.pauseItems:[]}_confirm(){if(this.screen==="title"){this.close();return}this.screen==="pause"&&(this.index===0?this.close():this.index===1?this.open("sunstones"):this.index===2?this.ctx?.perf?.budget?.openPanel?.():this.open("title"))}_paintFocus(){const e=this._items();if(e.forEach((i,t)=>i.classList.toggle("hx-focus",t===this.index)),this.screen==="pause"&&this.pauseSel&&e[this.index]){const i=e[this.index];this.pauseSel.style.opacity="1",this.pauseSel.style.height=`${i.offsetHeight}px`,this.pauseSel.style.transform=`translateY(${i.offsetTop}px)`}else this.pauseSel&&(this.pauseSel.style.opacity="0")}_counts(){const e=this.ctx?.systems?.progression?.summary?.(),i=this.ctx?.systems?.collectibles?.summary?.(),t=this.ctx?.ui?.hud?.model,s=(a,r)=>{for(const h of[e,i,t]){const l=h?.[a];if(typeof l=="number"&&isFinite(l))return l}return r};return{sunstones:s("sunstones",0),total:s("total",x.totalMoons),coins:s("coins",0)}}_found(){const e=this._counts();return{have:e.sunstones,total:e.total,ids:this.ctx?.systems?.progression?.foundIds??null}}_paintTally(){if(!this.pauseTally)return;const{sunstones:e,total:i,coins:t}=this._counts(),s=a=>y(String(a),{height:.9});this.pauseTally.innerHTML=`<span class="hx-tally-i">${f.sunstone("lit")}</span>${s(`${e}/${i}`)}<span class="hx-tally-i">${f.coin()}</span>${s(t)}`}_paintLedger(){const e=this._found();e.total>0&&e.total!==this.slots.length&&this._rebuildSlots(e.total);const i=`${e.have}/${e.total}`;this.ledgerCount.dataset.k!==i&&(this.ledgerCount.dataset.k=i,this.ledgerCount.innerHTML=y(`${e.have}/${e.total}`,{height:1.06}));for(let t=0;t<this.slots.length;t++){const s=e.ids?e.ids.includes(t):t<e.have,a=this.slots[t];a.dataset.has!==String(s)&&(a.dataset.has=String(s),a.classList.toggle("hx-has",s),a.firstChild.innerHTML=f.sunstone(s?"lit":"dim"))}this._paintLedgerFocus()}_rebuildSlots(e){this.grid.innerHTML="",this.slots=[];for(let i=0;i<e;i++){const t=n("button","hx-slot","menu-slot");t.type="button",t.dataset.index=String(i),t.innerHTML='<span class="hx-slot-gem"></span>',this.grid.appendChild(t),this.slots.push(t)}this._sunFocus=b(this._sunFocus,0,e-1),this._wirePointer(this.slots,()=>{})}_paintLedgerFocus(){this.slots.forEach((t,s)=>t.classList.toggle("hx-focus",s===this._sunFocus));const e=this.slots[this._sunFocus]?.dataset.has==="true",i=e?o.sunstoneNames[this._sunFocus]??"A Sunstone":"Not yet found";this.ledgerCaption.dataset.k!==i&&(this.ledgerCaption.dataset.k=i,this.ledgerCaption.innerHTML=c(i,{height:1,weight:e?o.typeWeight+1:o.typeWeight,tracking:o.typeTracking+8})),this.ledgerCaption.classList.toggle("hx-caption-dim",!e)}_paintHints(){const e=this._device==="gamepad",i=e?m("A","face"):m("Space"),t=e?m("B","face"):m("Ctrl"),s=e?m("Start","face"):m("Esc"),a=e?m("L","face"):m("W S");this.ctaCap&&(this.ctaCap.innerHTML=i);const r=`${a}<span class="hx-hint-label">${c("Move",{height:.56,weight:17,tracking:o.typeTrackingWide})}</span>${i}<span class="hx-hint-label">${c("Select",{height:.56,weight:17,tracking:o.typeTrackingWide})}</span>${t}<span class="hx-hint-label">${c("Back",{height:.56,weight:17,tracking:o.typeTrackingWide})}</span>${s}<span class="hx-hint-label">${c("Resume",{height:.56,weight:17,tracking:o.typeTrackingWide})}</span>`;this.pauseHint&&(this.pauseHint.innerHTML=r),this.ledgerHint&&(this.ledgerHint.innerHTML=r)}update(e,i,t){if(!this.root)return;const s=b(e||0,0,.1),a=t?.player?.position;if(a){const r=this._lastP;if(r&&this.screen){const h=a.x-r.x,l=a.y-r.y,d=a.z-r.z;Math.hypot(h,l,d)>o.titleTeleportEpsilon&&this._standDown()}this._lastP={x:a.x,y:a.y,z:a.z}}!this.screen&&this._ownFreeze&&t?.player&&(t.player.frozen=!1,this._ownFreeze=!1),this.screen==="title"&&this._driftCamera(s,t),this.screen==="sunstones"&&this._paintLedger()}_driftCamera(e,i){const t=i?.three?.camera;if(!t)return;const s=o.titleCam;this._ownFreeCam||(i.debug&&(i.debug.freeCam=!0),this._ownFreeCam=!0,this._savedFov=t.fov),k()||(this._titleT+=e);const a=(s.startDeg+s.speedDeg*this._titleT)*F,r=Math.sin(this._titleT*s.bobHz*Math.PI*2)*s.bobAmp;t.position.set(s.target[0]+Math.cos(a)*s.radius,s.height+r,s.target[2]+Math.sin(a)*s.radius),t.lookAt(s.target[0],s.target[1]+r*.25,s.target[2]),t.fov!==s.fov&&(t.fov=s.fov,t.updateProjectionMatrix())}dispose(){this._releaseCamera(),this._ownFreeze&&this.ctx?.player&&(this.ctx.player.frozen=!1,this._ownFreeze=!1),this.root?.remove(),this.root=null}_injectStyles(){if(document.getElementById("hx-menu-css"))return;const e=document.createElement("style");e.id="hx-menu-css",e.textContent=`
.hx-screen{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;}
.hx-screen.hx-open{pointer-events:auto;}
.hx-screen.hx-enter{animation:hx-screen-in .34s ease-out both;}
@keyframes hx-screen-in{from{opacity:0}to{opacity:1}}

/* ---------------------------------------------------------------- title -- */
/* A scrim, not a curtain. The cape has to stay visible or there is no reason
   to put a slow camera behind the wordmark in the first place: top and bottom
   are darkened so white strokes hold, and the middle is left alone. */
/* Two scrims doing two different jobs. The tight one sits directly under the
   wordmark and buys the contrast the paper strokes need over a sunlit town;
   the wide one darkens only the top and bottom margins so the sea in the
   middle distance stays the colour it actually is. */
.hx-title-scrim{position:absolute;inset:0;
  background:
    radial-gradient(38% 34% at 50% 52%,rgba(9,27,40,.56),rgba(9,27,40,0) 74%),
    radial-gradient(82% 62% at 50% 50%,rgba(10,30,44,.30),rgba(10,30,44,0) 80%),
    linear-gradient(180deg,rgba(8,26,38,.48) 0%,rgba(8,26,38,.06) 26%,
                    rgba(8,26,38,.04) 56%,rgba(8,26,38,.54) 100%);}
.hx-title-body{position:relative;display:flex;flex-direction:column;align-items:center;
  gap:.36em;transform:translateY(-4%);}
.hx-title-mark{width:6.6em;height:3.7em;opacity:.97;margin-bottom:.15em;
  filter:drop-shadow(0 .1em .18em rgba(6,22,34,.6));
  animation:hx-mark-in 1.1s cubic-bezier(.16,1,.3,1) both;}
@keyframes hx-mark-in{from{opacity:0;transform:translate(1.2em,.5em) rotate(-9deg)}
  to{opacity:.97;transform:none}}

.hx-wordmark{display:flex;align-items:flex-end;color:var(--paper);
  font-size:clamp(38px,7.1vw,116px);line-height:1;
  filter:drop-shadow(0 .035em 0 rgba(201,102,58,.9))
         drop-shadow(0 .12em .16em rgba(8,26,38,.55))
         drop-shadow(0 .34em .55em rgba(8,26,38,.35));}
.hx-w{display:inline-block;margin-right:.055em;
  animation:hx-word-in .95s cubic-bezier(.16,1,.3,1) both;}
.hx-w-sp{width:.28em;}
@keyframes hx-word-in{from{opacity:0;transform:translateY(.36em) rotate(-4deg) scale(.94)}
  to{opacity:1;transform:none}}

.hx-title-rule{width:min(44vw,25em);height:.26em;border-radius:.2em;margin:.62em 0 .5em;
  background:linear-gradient(90deg,rgba(255,211,92,0),rgba(255,211,92,.98) 22%,
             rgba(255,240,184,1) 50%,rgba(255,211,92,.98) 78%,rgba(255,211,92,0));
  box-shadow:0 .12em .5em rgba(120,60,10,.6),0 .05em .35em rgba(255,190,60,.6);
  animation:hx-rule-in .9s cubic-bezier(.16,1,.3,1) .48s both;}
@keyframes hx-rule-in{from{opacity:0;transform:scaleX(.3)}to{opacity:1;transform:none}}

.hx-title-sub{display:flex;color:var(--paper);font-size:clamp(11px,1.22vw,20px);
  opacity:.96;filter:drop-shadow(0 .06em .04em rgba(8,26,38,.85))
                     drop-shadow(0 .16em .3em rgba(8,26,38,.7));}
.hx-title-sub .hx-w{margin-right:.42em;}

.hx-cta{
  margin-top:1.6em;padding:.5em 2.0em .5em .6em;cursor:pointer;
  display:flex;align-items:center;gap:.85em;
  border:.17em solid #F0B93A;
  border-top-color:#FFF0B6;
  border-right-color:#FFD463;
  border-bottom-color:#A96C12;
  border-radius:.8em;
  position:relative;isolation:isolate;color:#4A2E12;font:inherit;
  background:linear-gradient(180deg,#FFEDB2 0%,#FFEDB2 20%,var(--gold) 20%,var(--gold) 100%);
  box-shadow:0 .2em 0 rgba(126,74,10,.85),
             0 .38em .06em rgba(20,40,54,.4),
             0 0 2.2em rgba(255,206,90,.30);
  animation:hx-cta-in .8s cubic-bezier(.16,1,.3,1) .78s both;}
.hx-cta::after{content:'';position:absolute;inset:0;border-radius:inherit;
  background-image:var(--hx-grain);background-size:104px 104px;opacity:.22;
  mix-blend-mode:multiply;pointer-events:none;}
.hx-cta-face{display:block;font-size:clamp(14px,1.56vw,25px);}
/* The key cap set into the button, behind a hairline cut into the gold. It is
   the same cap the pause hints use, so "what you press" is one component in
   this interface and not two that happen to look alike. */
.hx-cta-cap{display:flex;align-items:center;padding-right:.85em;
  border-right:.08em solid rgba(140,86,14,.55);
  box-shadow:.08em 0 0 rgba(255,240,182,.75);
  font-size:clamp(12px,1.24vw,20px);}
.hx-cta-cap .hx-cap{box-shadow:0 .09em 0 rgba(112,80,44,.55);}
.hx-cta.hx-focus{animation:hx-cta-breathe 2.6s ease-in-out infinite;}
@keyframes hx-cta-in{from{opacity:0;transform:translateY(.9em) scale(.94)}to{opacity:1;transform:none}}
@keyframes hx-cta-breathe{0%,100%{transform:scale(1);
    box-shadow:inset 0 .1em 0 rgba(255,255,255,.9),inset 0 -.12em 0 rgba(150,88,18,.35),
               0 .16em 0 rgba(150,88,18,.5),0 .9em 1.6em -.45em rgba(20,40,54,.6),
               0 0 2.2em rgba(255,206,90,.34)}
  50%{transform:scale(1.035);
    box-shadow:inset 0 .1em 0 rgba(255,255,255,.9),inset 0 -.12em 0 rgba(150,88,18,.35),
               0 .16em 0 rgba(150,88,18,.5),0 1.1em 1.9em -.45em rgba(20,40,54,.62),
               0 0 3.4em rgba(255,214,110,.62)}}

/* ---------------------------------------------------------------- caps --- */
.hx-cap{display:inline-grid;place-items:center;min-width:2.05em;height:1.55em;
  padding:0 .5em;color:var(--ink);
  border:.11em solid var(--paper-mid);
  border-top-color:var(--paper-hi);
  border-right-color:var(--paper-r);
  border-bottom-color:var(--paper-lo);
  border-radius:.36em;
  background:var(--paper);
  box-shadow:0 .11em 0 rgba(112,80,44,.6),0 .2em .04em rgba(18,40,54,.26);}
.hx-cap-face{border-radius:50%;min-width:1.62em;width:1.62em;height:1.62em;padding:0;}
.hx-hint-label{color:inherit;opacity:.8;margin-right:.35em;}

/* ---------------------------------------------------------------- pause -- */
/* The world keeps moving behind this. It is blurred, not stopped: the sea is
   still breathing under the frosting, which is the whole difference between a
   pause menu and a screenshot. */
/* Warm, not cold. A blue grey frosting over a Mediterranean noon reads as bad
   weather; the tint is pulled towards the sea's own colour and then warmed at
   the top, so the frosted world still looks like the same island. */
.hx-blur{position:absolute;inset:0;
  backdrop-filter:blur(16px) saturate(1.12) brightness(1.03);
  -webkit-backdrop-filter:blur(16px) saturate(1.12) brightness(1.03);
  background:linear-gradient(180deg,rgba(58,74,74,.26),rgba(24,50,64,.40));}

/* THE CARD IS A CHAMFERED SLAB, cut the same way the HUD plates are cut and
   for the same reason: four flat bevel planes as four border colours, a hard
   mitre at every corner, and a solid dark edge under it rather than a soft
   grey blur. A page in this game is a piece of the architecture, not a modal. */
.hx-card{position:relative;isolation:isolate;
  width:min(30em,84vw);padding:1.4em 1.7em 1.1em;
  border:.16em solid var(--paper-mid);
  border-top-color:var(--paper-hi);
  border-right-color:var(--paper-r);
  border-bottom-color:var(--paper-lo);
  border-radius:.95em;
  display:flex;flex-direction:column;gap:.8em;
  background:linear-gradient(180deg,var(--paper-hi) 0%,var(--paper-hi) 9%,
             var(--paper) 9%,var(--paper) 100%);
  box-shadow:0 .18em 0 rgba(96,66,34,.55),
             0 .34em .06em rgba(10,28,40,.34),
             0 1.1em 1.1em -.5em rgba(10,28,40,.42);
  animation:hx-card-in .42s cubic-bezier(.16,1.02,.3,1) both;}
.hx-card::after{content:'';position:absolute;inset:0;border-radius:inherit;
  background-image:var(--hx-grain);background-size:104px 104px;opacity:.36;
  mix-blend-mode:multiply;pointer-events:none;}
.hx-card-wide{width:min(52em,92vw);}
@keyframes hx-card-in{from{opacity:0;transform:translateY(1.2em) scale(.975)}to{opacity:1;transform:none}}

/* The header is the same fired terracotta the HUD plates are made of, chamfer
   for chamfer and gold top edge included, so the front of house and the
   counters are visibly one interface rather than two that happen to share a
   palette. Paper page, glazed plaque set into it. */
.hx-ledger-head{padding:.42em .8em;
  border:var(--bevel) solid var(--chamfer-mid);
  border-top-color:var(--rank-rim);
  border-right-color:var(--chamfer-r);
  border-bottom-color:var(--chamfer-lo);
  border-radius:.5em;
  color:var(--plate-ink);
  background:var(--face-fill);
  box-shadow:var(--hx-face-in),0 .12em 0 rgba(48,17,3,.62),
             0 .24em .05em rgba(20,42,56,.3);}
.hx-card-head{color:var(--plate-ink);font-size:1.42em;}
.hx-rule{height:.13em;border-radius:.13em;background:linear-gradient(90deg,
  rgba(201,102,58,0),rgba(201,102,58,.65) 12%,rgba(201,102,58,.65) 88%,rgba(201,102,58,0));}
.hx-rule-faint{opacity:.45;}

.hx-list{position:relative;display:flex;flex-direction:column;gap:.15em;padding:.2em 0;}
.hx-sel{position:absolute;left:-.55em;right:-.55em;top:0;height:2.6em;
  border:.14em solid #F0B93A;
  border-top-color:#FFEFB0;
  border-right-color:#FFD463;
  border-bottom-color:#B87A18;
  border-radius:.62em;
  background:linear-gradient(180deg,#FFE79C 0%,#FFE79C 22%,#FFCE5A 22%,#FFCE5A 100%);
  box-shadow:0 .13em 0 rgba(132,84,14,.7),0 .26em .05em rgba(20,42,56,.26);
  transition:transform .26s cubic-bezier(.34,1.4,.5,1),height .2s ease,opacity .2s ease;
  z-index:0;opacity:0;}
.hx-item{position:relative;z-index:1;display:flex;align-items:center;gap:.55em;
  border:0;background:none;cursor:pointer;font:inherit;color:var(--ink-2);
  padding:.62em .2em;text-align:left;transition:color .2s ease,transform .2s cubic-bezier(.34,1.4,.5,1);}
.hx-item .hx-bullet{width:1.05em;height:1.05em;opacity:0;transform:scale(.4) rotate(-40deg);
  transition:opacity .24s ease,transform .3s cubic-bezier(.34,1.6,.5,1);}
.hx-item-label{display:block;font-size:1.15em;}
.hx-item.hx-focus{color:var(--ink);transform:translateX(.22em);}
.hx-item.hx-focus .hx-bullet{opacity:1;transform:none;}
.hx-item:focus-visible{outline:.14em solid var(--terra);outline-offset:.2em;border-radius:.5em;}

.hx-hint{display:flex;flex-wrap:wrap;align-items:center;gap:.34em;color:var(--ink-2);
  font-size:.9em;padding-top:.1em;}

.hx-tally{display:flex;align-items:center;gap:.34em;color:var(--plate-ink);}
.hx-tally-i{width:1.35em;height:1.35em;display:block;margin-left:.5em;}
.hx-tally-i:first-child{margin-left:0;}

/* ------------------------------------------------------------- ledger ---- */
.hx-ledger-head{display:flex;align-items:center;justify-content:space-between;gap:1em;}
.hx-ledger-count{color:var(--plate-ink-2);font-size:1.05em;}
.hx-grid{display:grid;grid-template-columns:repeat(var(--cols),1fr);gap:.5em;padding:.4em 0 .1em;}
/* An empty slot is a bed with the stone lifted out of it: pressed into the
   paper, with a highlight on the lower lip. That is what makes a collection
   screen read as a case rather than as a list of missing things. */
.hx-slot{position:relative;aspect-ratio:1;border:0;cursor:pointer;font:inherit;
  border-radius:.7em;padding:.42em;display:grid;place-items:center;
  background:linear-gradient(178deg,rgba(176,150,114,.46),rgba(206,182,146,.24));
  box-shadow:inset 0 .14em .30em rgba(96,70,40,.44),inset 0 -.07em 0 rgba(255,255,255,.72);
  transition:transform .22s cubic-bezier(.34,1.5,.5,1),box-shadow .22s ease;}
.hx-slot .hx-slot-gem{display:block;width:100%;height:100%;opacity:.66;}
.hx-slot.hx-has{background:linear-gradient(178deg,#FFF6DC,#F6E2B2);
  box-shadow:inset 0 .08em 0 rgba(255,255,255,.95),inset 0 0 0 .05em rgba(160,110,40,.3),
             0 .12em 0 rgba(160,116,50,.35),0 .5em .9em -.3em rgba(140,96,30,.4);}
.hx-slot.hx-has .hx-slot-gem{opacity:1;filter:drop-shadow(0 .06em .1em rgba(120,74,16,.4));}
/* The focus state has to be unmistakable from across a room on a television,
   which a 2 px outline is not. Four things at once: the bed lifts clear of the
   grid, it gains a cream separator, a heavy gold band with a terracotta core,
   and a warm halo bleeding onto the page around it. On a paper card the gold
   band is the only value in the palette that cannot be mistaken for the page
   itself, which is why the ring is gold and not terracotta. */
.hx-slot.hx-focus{z-index:2;transform:translateY(-.34em) scale(1.16);
  background:linear-gradient(178deg,#FFFBEC,#FFEFC6);
  box-shadow:0 0 0 .10em rgba(255,252,242,1),
             0 0 0 .26em var(--gold),
             0 0 0 .38em var(--terra),
             0 0 1.6em .18em rgba(255,196,70,.70),
             0 .9em 1.3em -.3em rgba(20,40,54,.6);}
.hx-slot.hx-focus .hx-slot-gem{opacity:1;}
.hx-slot:focus-visible{outline:none;}
.hx-caption{color:var(--ink);font-size:1.05em;min-height:1.5em;padding-top:.2em;}
.hx-caption-dim{color:var(--ink-3);}

@media (prefers-reduced-motion: reduce){
  .hx-cta.hx-focus{animation:none;}
}
`,document.head.appendChild(e)}}export{T as Menus,T as default};
