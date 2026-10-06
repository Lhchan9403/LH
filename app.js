/* ============================================================
   ICHIBAN KUJI · KUJI CLUB — app logic (kiosk-faithful UI)
   ============================================================ */
"use strict";

/* ---------------- PRIZE CATALOGS (design layer) ---------------- */
const CATALOG = {
  "Naruto · Hidden Leaf": {
    A:{name:"Naruto Hokage Figure",emoji:"🍥",sub:"1:7 scale · 24 cm"},
    B:{name:"Sasuke Uchiha Figure",emoji:"⚡",sub:"Chidori effect base"},
    C:{name:"Kakashi Acrylic Stand",emoji:"📖",sub:"Icha Icha edition"},
    D:{name:"Ichiraku Ramen Bowl",emoji:"🍜",sub:"Ceramic · 800 ml"},
    E:{name:"Konoha Headband",emoji:"🎗️",sub:"Brushed-metal plate"},
    F:{name:"Chibi Art Sticker Set",emoji:"✨",sub:"12 die-cut stickers"},
    LAST:{name:"Kurama Nine-Tails Plush",emoji:"🦊",sub:"40 cm · only with the last ticket"}
  },
  "Demon Slayer · Dawn Patrol": {
    A:{name:"Tanjiro Kamado Figure",emoji:"⚔️",sub:"Hinokami Kagura pose"},
    B:{name:"Nezuko Kamado Figure",emoji:"🎋",sub:"Bamboo muzzle · 18 cm"},
    C:{name:"Nichirin Letter Opener",emoji:"🗡️",sub:"Die-cast metal"},
    D:{name:"Haori Pattern Blanket",emoji:"🧣",sub:"Checkered fleece"},
    E:{name:"Hashira Acrylic Charm",emoji:"🎴",sub:"9 to collect"},
    F:{name:"Ufotable Art Postcards",emoji:"🏞️",sub:"Set of 6"},
    LAST:{name:"Nezuko Box Plush",emoji:"📦",sub:"Nezuko in her box · 35 cm"}
  },
  "Jujutsu Kaisen · Cursed Energy": {
    A:{name:"Gojo Satoru Figure",emoji:"🕶️",sub:"Unmasked edition"},
    B:{name:"Sukuna Figure",emoji:"👹",sub:"Domain expansion base"},
    C:{name:"Cursed Energy Lamp",emoji:"🟣",sub:"USB-C · glows purple"},
    D:{name:"Tokyo Jujutsu High Tee",emoji:"👕",sub:"Sizes S–XL"},
    E:{name:"Cursed Tool Keychain",emoji:"🔑",sub:"5 to collect"},
    F:{name:"Sorcery Sticker Pack",emoji:"✨",sub:"10 vinyl stickers"},
    LAST:{name:"Prison Realm Replica",emoji:"🧊",sub:"Light-up cube · last one only"}
  },
  "Dragon Ball · Super Saiyans": {
    A:{name:"Super Saiyan Goku Figure",emoji:"🔥",sub:"Aura effect stand"},
    B:{name:"Vegeta Figure",emoji:"💥",sub:"Final Flash pose"},
    C:{name:"4-Star Dragon Ball",emoji:"🟠",sub:"Resin replica · 7.5 cm"},
    D:{name:"Capsule Corp Tee",emoji:"👕",sub:"Sizes S–XL"},
    E:{name:"Shenron Keychain",emoji:"🐉",sub:"Gold-plated"},
    F:{name:"Z-Fighters Sticker Set",emoji:"✨",sub:"12 die-cut stickers"},
    LAST:{name:"Shenron Diorama",emoji:"🐉",sub:"28 cm · only with the last ticket"}
  },
  "Spy × Family · Secret Mission": {
    A:{name:"Anya Forger Figure",emoji:"🌟",sub:"Wakuwaku pose"},
    B:{name:"Loid & Yor Figure Set",emoji:"💼",sub:"Two-piece set"},
    C:{name:"Bond Plush",emoji:"🐕",sub:"25 cm · fluffy"},
    D:{name:"Peanut Tote Bag",emoji:"🥜",sub:"Canvas · Anya approved"},
    E:{name:"Forger Family Standee",emoji:"🎀",sub:"Acrylic · 14 cm"},
    F:{name:"Mission Sticker Pack",emoji:"✨",sub:"10 vinyl stickers"},
    LAST:{name:"Giant Bond Plush",emoji:"🐶",sub:"50 cm · only with the last ticket"}
  }
};
const GACHA_ITEMS = {
  "Pocket Cats":[
    {name:"Mochi · Cream Cat",emoji:"🐱",r:"SSR"},
    {name:"Smokey · Night Cat",emoji:"🐈‍⬛",r:"SR"},
    {name:"Peaches · Calico",emoji:"😺",r:"SR"},
    {name:"Matcha · Grumpy",emoji:"😼",r:"R"},
    {name:"Biscuit · Tabby",emoji:"😸",r:"R"},
    {name:"Sesame · Chonk",emoji:"🙀",r:"R"}
  ],
  "Tiny Garden":[
    {name:"Golden Mushroom",emoji:"🍄",r:"SSR"},
    {name:"Moonflower",emoji:"🌙",r:"SR"},
    {name:"Sunflower Pal",emoji:"🌻",r:"SR"},
    {name:"Baby Cactus",emoji:"🌵",r:"R"},
    {name:"Tulip Twin",emoji:"🌷",r:"R"},
    {name:"Lucky Clover",emoji:"🍀",r:"R"}
  ],
  "Moon Bunnies":[
    {name:"Luna · Star Bunny",emoji:"🌙",r:"SSR"},
    {name:"Comet Chaser",emoji:"☄️",r:"SR"},
    {name:"Mochi Pounder",emoji:"🐰",r:"SR"},
    {name:"Carrot Guard",emoji:"🥕",r:"R"},
    {name:"Cloud Napper",emoji:"🐇",r:"R"},
    {name:"Star Snacker",emoji:"✨",r:"R"}
  ]
};
const TIER_INIT = {A:2,B:4,C:6,D:12,E:20,F:36};
const POINTS_PER_DRAW = 10, POINTS_RARE_BONUS = 50;

/* ---------------- STATE ---------------- */
const LS_KEY = "kuji_redesign_v1";
let S = null;
function freshState(){
  const boxes = {};
  (window.KUJI_DATA||[]).forEach(b=>{
    boxes[b.id] = { ...b, tiers: b.tiers.map(t=>({...t})), avail: [...b.slots] };
  });
  return { boxes, wallet:[], points:1250, draws:0 };
}
function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){ const s = JSON.parse(raw); if(s && s.boxes) return s; }
  }catch(e){}
  return freshState();
}
function save(){ try{ localStorage.setItem(LS_KEY, JSON.stringify(S)); }catch(e){} }
function resetDemo(){
  localStorage.removeItem(LS_KEY);
  S = freshState(); save(); route();
  toast("Demo data reset ✨");
}
S = loadState();

/* ---------------- HELPERS ---------------- */
const $ = s=>document.querySelector(s);
const money = n=>"SGD " + n.toFixed(2);
const boxOf = id=>S.boxes[id];
const catalogOf = b=>CATALOG[b.name]||{};
function toast(msg){
  const t=document.createElement("div");
  t.className="toast"; t.textContent=msg;
  $("#toasts").appendChild(t);
  setTimeout(()=>{t.classList.add("bye"); setTimeout(()=>t.remove(),320);},2100);
}
function go(h){ location.hash = h; }
function lockScroll(on){ document.body.style.overflow = on?"hidden":""; }
function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;"); }

/* ---------------- CONFETTI ---------------- */
function confetti(big){
  const cv=$("#confetti"),ctx=cv.getContext("2d");
  cv.width=innerWidth; cv.height=innerHeight;
  const cols=["#FFE600","#B16DFF","#F08BD8","#8AFF6E","#3FD8C7","#FFE9A0"];
  const ps=Array.from({length:big?200:110},()=>({
    x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.35,
    w:6+Math.random()*8,h:8+Math.random()*10,
    vy:2.4+Math.random()*3.2,vx:-1.5+Math.random()*3,
    r:Math.random()*Math.PI,vr:-.12+Math.random()*.24,
    c:cols[Math.floor(Math.random()*cols.length)]
  }));
  const t0=performance.now();
  (function fr(t){
    ctx.clearRect(0,0,cv.width,cv.height);
    ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);
      ctx.fillStyle=p.c;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();});
    if(t-t0<(big?3200:2300)) requestAnimationFrame(fr);
    else ctx.clearRect(0,0,cv.width,cv.height);
  })(t0);
}

/* ---------------- ROUTER ---------------- */
let tab = "kuji";
window.addEventListener("hashchange", route);
function route(){
  const h = location.hash || "#/";
  closeModal(true);
  document.querySelectorAll(".bnav").forEach(b=>b.classList.toggle("active",
    (h.startsWith("#/wallet")&&b.dataset.nav==="wallet") ||
    (h==="#/gacha"&&b.dataset.nav==="gacha") ||
    ((h==="#/"||h==="")&&b.dataset.nav==="home")));
  if(h.startsWith("#/box/")){ renderDetail(h.slice(6)); }
  else if(h.startsWith("#/wallet")){ renderWallet(); }
  else if(h.startsWith("#/gacha")){ tab="gacha"; renderHome(); }
  else { tab="kuji"; renderHome(); }
  syncTopNav();
  window.scrollTo({top:0});
}
function syncTopNav(){
  $("#pointsVal").textContent = S.points.toLocaleString();
  $("#walletDot").classList.toggle("show", S.wallet.some(w=>w.unseen));
}
function setTab(t){ go(t==="gacha"?"#/gacha":"#/"); }

/* ================= HOME (kiosk box list) ================= */
function renderHome(){
  const boxes = Object.values(S.boxes).filter(b=>b.type===tab);
  $("#view").innerHTML = `
  <div class="kiosk">
    <div class="inst-bar">
      <button class="inst-back" onclick="go('#/')" aria-label="Back">←</button>
      <div class="inst-text">
        Touch the ${tab==="kuji"?"ICHIBAN KUJI":"GACHA MACHINE"} and press the <span>'Start'</span> button.
        <small>You can view the types of products and detailed information about them.</small>
      </div>
    </div>
    <div class="tabs">
      <button class="tab-pill ${tab==="kuji"?"active":""}" onclick="setTab('kuji')">KUJI</button>
      <button class="tab-pill ${tab==="gacha"?"active":""}" onclick="setTab('gacha')">GACHA</button>
    </div>
    ${mvHero(boxes.reduce((a,b)=>(b.remaining/b.total < a.remaining/a.total ? b : a), boxes[0]))}
    <div class="mv-strip-head">🔥 Trending now <span class="jp">急上昇</span></div>
    <div class="mv-strip">
      ${boxes.map((b,i)=>posterCard(b,i)).join("")}
    </div>
    <div class="mv-list-head">ALL ${tab==="kuji"?"LIVE BOXES":"MACHINES"}</div>
    <div class="klist">
      ${boxes.map((b,i)=>boxCard(b,i)).join("") || `<div class="empty-note">No live boxes right now.</div>`}
    </div>
    <div class="watermark">ichibankuji <span class="jp">一番くじ</span></div>
    <div class="hint-line">Real collectibles · a fixed prize pool · every ticket wins something to keep</div>
  </div>`;
}
/* ---- MyVideo-style hero + poster strip ---- */
function mvHero(b){
  if(!b) return "";
  const [fr,ed] = b.name.split(" · ");
  const isGacha = b.type==="gacha";
  return `
  <section class="mv-hero" onclick="go('#/box/${b.id}')">
    <div class="mv-art"><img src="assets/${b.art}.svg" alt="${esc(b.name)}"></div>
    <div class="mv-fire"></div>
    <span class="kc-chip ${isGacha?"gacha":""}" style="position:absolute;top:14px;left:14px;z-index:2">
      <span class="pulse"></span>${isGacha?'GACHA · <span class="jp">ガチャ</span>':'LIVE · <span class="jp">一番くじ</span>'}</span>
    <span class="mv-share" onclick="event.stopPropagation();shareBox('${b.id}')" title="Share">↗</span>
    <div class="mv-content">
      <div class="mv-crumb">KUJIGACHA 首頁 〉 ${isGacha?"ガチャ":"一番くじ"} 〉 <b>LIVE 開抽中</b></div>
      <h1 class="mv-title">《${esc(fr||b.name)}》${ed?` ${esc(ed)}`:""}<span class="jp">決戦、間近。</span></h1>
      <p class="mv-desc">Real collectibles. A fixed prize pool. ${b.remaining}/${b.total} tickets left —
        every draw wins something to keep. ${b.lastOneLive?"★ Last One prize is live!":""}</p>
      <button class="mv-cta">立即開抽 ◆ START</button>
    </div>
  </section>`;
}
function posterCard(b,i){
  const [fr,ed] = b.name.split(" · ");
  const hot = b.remaining/b.total<=0.45;
  return `
  <article class="mv-card" style="animation-delay:${i*55}ms" onclick="go('#/box/${b.id}')">
    <div class="mv-poster">
      ${hot?`<span class="mv-tag">HOT</span>`:""}
      <img src="assets/${b.art}.svg" alt="${esc(b.name)}" loading="lazy">
    </div>
    <b>${esc(fr||b.name)}</b>
    <span class="mv-left">${b.remaining}/${b.total} left · ${money(b.price)}</span>
  </article>`;
}
function shareBox(id){
  const b = boxOf(id);
  const url = location.href.split("#")[0] + "#/box/" + id;
  try{
    navigator.clipboard.writeText(url);
    toast("Link copied — share it! 🔗");
  }catch(e){ toast(url); }
  sfx("click"); fxBurst(innerWidth-90, 90, false);
}
function boxCard(b,i){
  const [fr,ed] = b.name.split(" · ");
  const isGacha = b.type==="gacha";
  const lastHot = b.lastOneLive && b.remaining>0 && b.remaining<=Math.max(10,b.total*0.2);
  return `
  <article class="kcard ${i===0?"featured":""}" style="animation-delay:${i*60}ms" onclick="go('#/box/${b.id}')">
    <div class="art"><img src="assets/${b.art}.svg" alt="${esc(b.name)} artwork" loading="lazy"></div>
    <div class="sheen"></div>
    <div class="kc-top">
      <span class="kc-chip ${isGacha?"gacha":""}"><span class="pulse"></span>${isGacha?'GACHA · <span class="jp">ガチャ</span>':'LIVE BOX · <span class="jp">一番くじ</span>'}</span>
      ${lastHot?`<span class="kc-last">★ LAST ONE LIVE</span>`:""}
    </div>
    ${b.remaining/b.total<=0.45?`<span class="sfx-burst">残り少!</span>`:""}
    <div class="kc-info">
      <div class="kc-title">${esc(fr||b.name)}</div>
      <div class="kc-edition">${esc(ed||"Capsule machine")}</div>
      <div class="kc-remain"><b>${b.remaining}</b>/${b.total} remaining</div>
    </div>
    <div class="kc-side">
      <span class="kc-price"><span class="dia">◆</span>${money(b.price)}</span>
      <span class="kc-start">Start</span>
    </div>
  </article>`;
}

/* ================= BOX DETAIL (prize lineup) ================= */
function renderDetail(id){
  const b = boxOf(id);
  if(!b){ go("#/"); return; }
  if(b.type==="gacha"){ renderGachaDetail(b); return; }
  const cat = catalogOf(b);
  const rows = b.tiers.map((t,i)=>{
    const p = cat[t.label]||{name:"Prize "+t.label,emoji:"🎁",sub:""};
    const init = Math.max(TIER_INIT[t.label]||t.remaining, t.remaining);
    const out = t.remaining===0;
    return `
    <div class="prow ${out?"soldout":""}" style="animation-delay:${i*50}ms">
      <div class="pbadge"><b>${t.label}</b><small>GRADE</small></div>
      <div class="pthumb">${p.emoji}</div>
      <div class="pinfo">
        <b>${p.name}</b><div class="sub">${p.sub}</div>
        <div class="pbar"><i style="width:${init?Math.max(0,t.remaining/init*100):0}%"></i></div>
      </div>
      ${out?`<span class="soldout-stamp">SOLD OUT</span>`:""}
      <div class="pqty"><b>${t.remaining}</b><span>LEFT</span></div>
    </div>`;
  }).join("");
  const last = cat.LAST||{name:"Last One Prize",emoji:"🎁",sub:""};

  $("#view").innerHTML = `
  <div class="kiosk wide">
    <div class="inst-bar">
      <button class="inst-back" onclick="history.back()" aria-label="Back">←</button>
      <div class="inst-text">
        ${esc(b.name)}
        <small>Check the prize lineup, then press <span>'Purchase'</span>.</small>
      </div>
      <div class="inst-count">${b.remaining}<small>/ ${b.total} LEFT</small></div>
    </div>

    <div class="detail-title-wrap"><div class="detail-title">
      <span class="vjp jp">一番くじ</span>
      <span class="detail-price"><span class="dia">◆</span> ${money(b.price)} per draw</span>
    </div></div>

    <div class="plist">
      ${rows}
      ${b.lastOne?`
      <div class="prow lastone" style="animation-delay:${b.tiers.length*50}ms">
        <div class="pbadge pink"><b>LAST</b><small>ONE</small></div>
        <div class="pthumb">${last.emoji}</div>
        <div class="pinfo"><b>${last.name}</b><div class="sub">${last.sub}</div></div>
        <div class="pqty"><b>1</b><span>LEFT</span></div>
      </div>`:""}
      <div class="prow dc-row" style="animation-delay:${(b.tiers.length+1)*50}ms">
        <div class="pbadge dc"><b>DC</b><small>CHANCE</small></div>
        <div class="pthumb">🎯</div>
        <div class="pinfo"><b>Double Chance entry</b><div class="sub">Every draw joins the online double-chance lottery</div></div>
        <div class="pqty"><b>ON</b><span>ACTIVE</span></div>
      </div>
    </div>

    <div class="watermark">ichibankuji <span class="jp">一番くじ</span></div>
    <div class="hint-line">Touch a prize to check its details · sold prizes vanish from the pool</div>

    <div class="purchase-bar">
      <div class="pb-info">
        <b>${money(b.price)} <span style="color:var(--muted);font-size:.76rem">/ draw</span></b>
        <span>${b.remaining} tickets remaining · guaranteed win</span>
      </div>
      <button class="big-cta" ${b.remaining===0?"disabled":""} onclick="openDraw('${b.id}')">
        ${b.remaining===0?"SOLD OUT":"PURCHASE ◆"}
      </button>
    </div>
  </div>`;
}

/* ================= DRAW WIZARD ================= */
let D = null;
function openDraw(boxId){
  const b = boxOf(boxId);
  D = { boxId, step:1, qty:Math.min(1,b.remaining), picked:new Set(), results:[] };
  modalShell(drawHTML());
}
function drawHTML(){
  const b = boxOf(D.boxId);
  const heads = {
    1:{k:"STEP 1 · TICKETS",t:"Pick your tickets"},
    2:{k:"STEP 2 · PAYMENT",t:"Confirm payment"},
    3:{k:"STEP 3 · REVEAL",t:"Reveal your prizes"},
    4:{k:"RESULTS",t:"Your prizes 🎉"}
  };
  const h = heads[D.step];
  return `<div class="modal-head">
      <button class="m-close" onclick="closeModal()" aria-label="Close">✕</button>
      <div class="m-kicker">${h.k}</div><h3>${h.t}</h3>
      <div class="m-sub">${esc(b.name)} · ${money(b.price)}/draw</div>
    </div>
    <div class="modal-body">${drawBody()}</div>`;
}
function drawBody(){
  const b = boxOf(D.boxId);
  if(D.step===1){
    const need = D.qty - D.picked.size;
    return `
      <div class="qty-row">
        <button class="qty-btn" onclick="chQty(-1)" aria-label="Fewer tickets">−</button>
        <div class="qty-val">${D.qty}<small>TICKETS</small></div>
        <button class="qty-btn" onclick="chQty(1)" aria-label="More tickets">+</button>
      </div>
      <div class="board">
        ${Array.from({length:b.total},(_,i)=>{
          const n=i+1;
          const avail = b.avail.includes(n);
          const picked = D.picked.has(n);
          return `<button class="slot ${avail?(picked?"picked":"avail"):"taken"}" ${avail?`onclick="pickSlot(${n})"`:"disabled"}>${n}</button>`;
        }).join("")}
      </div>
      <div class="board-legend">
        <span><i style="background:rgba(255,255,255,.15)"></i>Available</span>
        <span><i style="background:linear-gradient(100deg,#7C8CF8,#F08BD8)"></i>Your pick</span>
        <span><i style="background:#333;opacity:.5"></i>Drawn</span>
      </div>
      <button class="lucky-dip" onclick="luckyDip()">🎲 Lucky dip — pick for me</button>
      <button class="big-cta block" style="margin-top:16px" ${need!==0?"disabled":""} onclick="drawStep(2)">
        ${need>0?`PICK ${need} MORE`:"CONTINUE →"}
      </button>`;
  }
  if(D.step===2){
    const total = D.qty*b.price;
    return `
      <div class="payframe"><div class="payframe-in">
        <div class="pay-banner"><img src="assets/${b.art}.svg" alt=""></div>
        <div class="pay-rows">
          <div class="kf-row"><span class="k">Box</span><span class="v">${esc(b.name)}</span></div>
          <div class="kf-row"><span class="k">Number of tickets</span><span class="v">${D.qty}</span></div>
          <div class="kf-row"><span class="k">Ticket numbers</span><span class="v">No. ${[...D.picked].sort((a,b)=>a-b).join(", ")}</span></div>
          <div class="kf-row"><span class="k">Total amount</span><span class="v total">${money(total)}</span></div>
        </div>
        <div class="sticker-band">
          <span class="sb-smile">☺</span><span class="sb-wave"></span><span class="sb-stripe"></span>
        </div>
      </div></div>
      <div class="pay-methods">
        <span class="pm sel">💳 Card</span><span class="pm">VISA</span><span class="pm">Mastercard</span><span class="pm">PayNow</span><span class="pm">GrabPay</span>
      </div>
      <p class="fine-print">※ Demo checkout — no real payment is processed.</p>
      <button class="big-cta block" id="payBtn" style="margin-top:12px" onclick="pay()">START PAYMENT ◆ ${money(total)}</button>
      <button class="btn-ghost-line" onclick="drawStep(1)">← Back to tickets</button>`;
  }
  if(D.step===3){
    const idx = D.results.length;
    const cur = D.pending[idx];
    return `
      <div class="reveal-stage">
        <div class="reveal-progress">
          ${D.pending.map((_,i)=>`<span class="rp-dot ${i<idx?"done":i===idx?"cur":""}"></span>`).join("")}
        </div>
        <div class="reveal-card" id="revealCard" onclick="flipCard()">
          <div class="rc-inner">
            <div class="rc-face rc-back">
              <span class="flow"></span>
              <span class="dia">◆</span>
              <span class="tt">ICHIBAN KUJI</span>
              <span class="hint">No. ${String(cur.slot).padStart(2,"0")} · TAP TO REVEAL</span>
            </div>
            <div class="rc-face rc-front" id="rcFront"></div>
          </div>
        </div>
        <div id="revealNext"></div>
      </div>`;
  }
  const rare = D.results.some(r=>["A","B","LAST"].includes(r.tier));
  return `
    <div class="result-list">
      ${D.results.map((r,i)=>`
        <div class="result-item ${["A","B","LAST"].includes(r.tier)?"hi":""}" style="animation-delay:${i*70}ms">
          <div class="mini-badge">${r.tier==="LAST"?"★":r.tier}</div>
          <div><b>${r.emoji} ${r.name}</b><div class="sub">${esc(r.box)}</div></div>
          <span class="tno">Ticket<br>No. ${String(r.slot).padStart(2,"0")}</span>
        </div>`).join("")}
    </div>
    ${rare?`<p class="rare-call">★ RARE PULL — congratulations! ★</p>`:""}
    <button class="big-cta block" style="margin-top:14px" onclick="closeModal()">DONE — TO MY WALLET 🎫</button>
    <button class="btn-ghost-line" onclick="again()">Draw again</button>`;
}
function chQty(d){
  const b = boxOf(D.boxId);
  const max = Math.min(10,b.remaining);
  D.qty = Math.max(1, Math.min(max, D.qty+d));
  while(D.picked.size>D.qty){ D.picked.delete([...D.picked].pop()); }
  refreshModal();
}
function pickSlot(n){
  if(D.picked.has(n)) D.picked.delete(n);
  else if(D.picked.size<D.qty) D.picked.add(n);
  else { toast(`Max ${D.qty} ticket${D.qty>1?"s":""} — tap a pick to deselect`); return; }
  refreshModal();
}
function luckyDip(){
  const b = boxOf(D.boxId);
  D.picked = new Set();
  const pool = [...b.avail];
  while(D.picked.size<D.qty && pool.length){
    const i = Math.floor(Math.random()*pool.length);
    D.picked.add(pool.splice(i,1)[0]);
  }
  refreshModal();
}
function drawStep(n){ D.step=n; refreshModal(); }
function pay(){
  const btn = $("#payBtn");
  btn.disabled = true; btn.textContent = "PROCESSING…";
  fxBurstAt(btn, true);
  sfx("flip");
  setTimeout(()=>{
    const b = boxOf(D.boxId);
    const cat = catalogOf(b);
    D.pending = [...D.picked].sort((a,b)=>a-b).map(slot=>{
      const pool = [];
      b.tiers.forEach(t=>{ for(let i=0;i<t.remaining;i++) pool.push(t.label); });
      let tier = pool.length ? pool[Math.floor(Math.random()*pool.length)] : "F";
      b.avail.splice(b.avail.indexOf(slot),1);
      b.remaining--;
      const t = b.tiers.find(x=>x.label===tier);
      if(t) t.remaining--;
      if(b.remaining===0 && b.lastOne) tier = "LAST";
      const p = tier==="LAST" ? (cat.LAST||{name:"Last One Prize",emoji:"🎁"}) : (cat[tier]||{name:"Prize "+tier,emoji:"🎁"});
      return { slot, tier, name:p.name, emoji:p.emoji, box:b.name };
    });
    const st = randFx();
    const K = BREATHS[st];
    kanjiFlash(K.main, K.sub, "fx-"+st);
    uiShake();
    sfx("win");
    D.step = 3; refreshModal();
  }, 1300);
}
function flipCard(){
  const card = $("#revealCard");
  if(!card || card.classList.contains("flip")) return;
  const idx = D.results.length;
  const r = D.pending[idx];
  $("#rcFront").innerHTML = `
    <span class="burst"></span>
    <span class="p-tier">${r.tier==="LAST"?"LAST ONE PRIZE":"TIER "+r.tier}</span>
    <div class="pbadge"><b>${r.tier==="LAST"?"★":r.tier}</b></div>
    <span class="p-emoji">${r.emoji}</span>
    <span class="p-name">${r.name}</span>`;
  card.classList.add("flip");
  sfx("flip");
  const st = randFx();
  fxBurstAt(card, ["A","B","LAST"].includes(r.tier), st);
  if(["A","B","LAST"].includes(r.tier)){ kanjiFlash("大当たり！","BIG WIN", "fx-gold"); uiShake(); sfx("rare"); }
  setTimeout(()=>{
    D.results.push(r);
    S.wallet.unshift({...r, at:Date.now(), unseen:true});
    S.points += POINTS_PER_DRAW + (["A","B","LAST"].includes(r.tier)?POINTS_RARE_BONUS:0);
    S.draws++;
    save(); syncTopNav();
    if(["A","B","LAST"].includes(r.tier)) confetti(true);
    const last = D.results.length===D.pending.length;
    $("#revealNext").innerHTML = last
      ? `<button class="big-cta" onclick="finishDraw()">SEE RESULTS →</button>`
      : `<button class="big-cta" onclick="nextTicket()">NEXT TICKET →</button>`;
  }, 650);
}
function nextTicket(){ D.step=3; refreshModal(); }
function finishDraw(){
  D.step=4; refreshModal();
  renderDetail(D.boxId);
}
function again(){
  const b = boxOf(D.boxId);
  closeModal();
  if(b.remaining>0) openDraw(b.id);
}

/* ================= GACHA ================= */
function renderGachaDetail(b){
  const items = GACHA_ITEMS[b.name]||[];
  $("#view").innerHTML = `
  <div class="kiosk">
    <div class="inst-bar">
      <button class="inst-back" onclick="history.back()" aria-label="Back">←</button>
      <div class="inst-text">
        ${esc(b.name)}
        <small>Capsule machine · 6 to collect · press <span>'Spin'</span>.</small>
      </div>
      <div class="inst-count">${b.remaining}<small>/ ${b.total} LEFT</small></div>
    </div>

    <div class="detail-title-wrap"><div class="detail-title">
      <span class="vjp jp">ガチャ</span>
      <span class="detail-price"><span class="dia">◆</span> ${money(b.price)} per spin</span>
    </div></div>

    <div class="plist">
      ${items.map((it,i)=>`
      <div class="prow" style="animation-delay:${i*50}ms;padding-left:14px">
        <div class="pthumb">${it.emoji}</div>
        <div class="pinfo"><b>${it.name}</b><div class="sub">${it.r==="SSR"?"Ultra rare":it.r==="SR"?"Super rare":"Rare"} capsule</div></div>
        <span class="rarity ${it.r.toLowerCase()}">${it.r}</span>
      </div>`).join("")}
    </div>

    <div class="watermark">gachaclub <span class="jp">ガチャ</span></div>
    <div class="hint-line">Every spin drops one random capsule · no empty spins</div>

    <div class="purchase-bar">
      <div class="pb-info">
        <b>${money(b.price)} <span style="color:var(--muted);font-size:.76rem">/ spin</span></b>
        <span>${b.remaining} capsules remaining</span>
      </div>
      <button class="big-cta" ${b.remaining===0?"disabled":""} onclick="openGacha('${b.id}')">${b.remaining===0?"SOLD OUT":"SPIN ◉"}</button>
    </div>
  </div>`;
}
let G = null;
function openGacha(boxId){
  G = { boxId, phase:"idle", item:null };
  modalShell(gachaHTML());
}
function gachaHTML(){
  const b = boxOf(G.boxId);
  const caps = [["#FF5C8A","12%","18%"],["#FFE600","58%","10%"],["#3FD8C7","30%","58%"],["#B16DFF","66%","55%"],["#4D96FF","16%","62%"],["#FF9F43","48%","32%"]];
  const globe = caps.map(c=>`<span class="caps" style="--c1:${c[0]};left:${c[1]};top:${c[2]}"></span>`).join("");
  let body;
  if(G.phase==="idle"||G.phase==="spin"){
    body = `<div class="gacha-stage">
      <div class="machine ${G.phase==="spin"?"shake":""}">
        <div class="m-globe">${globe}</div>
        <div class="m-base"><div class="m-knob"></div></div>
        <div class="m-slot"></div>
      </div>
      <button class="big-cta" style="margin-top:20px" ${G.phase==="spin"?"disabled":""} onclick="spinGacha()">
        ${G.phase==="spin"?"SPINNING…":`SPIN · ${money(b.price)}`}
      </button>
      <p class="fine-print">※ Demo spin — no real payment.</p>
    </div>`;
  } else if(G.phase==="drop"){
    body = `<div class="gacha-stage">
      <div class="machine"><div class="m-globe">${globe}</div>
      <div class="m-base"><div class="m-knob"></div></div><div class="m-slot"></div></div>
      <p style="margin-top:16px;font-weight:900;color:var(--gold-1);letter-spacing:1px">YOUR CAPSULE ROLLED OUT!</p>
      <div class="drop-caps" style="--c1:${G.capColor}" onclick="crackCapsule()" title="Tap to open"></div>
      <p style="color:var(--muted);font-size:.78rem;font-weight:700;margin-top:8px">Tap the capsule to open it</p>
    </div>`;
  } else {
    const it = G.item;
    body = `<div class="reveal-stage">
      <span class="rarity ${it.r.toLowerCase()}">${it.r} ${it.r==="SSR"?"· ULTRA RARE":it.r==="SR"?"· SUPER RARE":"· RARE"}</span>
      <div class="reveal-card flip" style="height:280px;cursor:default"><div class="rc-inner">
        <div class="rc-face rc-front" style="transform:none">
          <span class="p-emoji" style="font-size:3.8rem">${it.emoji}</span>
          <span class="p-name" style="font-size:1.1rem">${it.name}</span>
          <span class="p-tier">${esc(b.name)}</span>
        </div>
      </div></div>
      <button class="big-cta" onclick="gachaDone()">ADD TO WALLET 🎫</button>
      <button class="btn-ghost-line" onclick="gachaAgain()">Spin again</button>
    </div>`;
  }
  return `<div class="modal-head">
    <button class="m-close" onclick="closeModal()" aria-label="Close">✕</button>
    <div class="m-kicker">GACHA MACHINE</div><h3>${esc(b.name)}</h3>
    <div class="m-sub">${b.remaining} capsules left · ${money(b.price)}/spin</div>
  </div><div class="modal-body">${body}</div>`;
}
function spinGacha(){
  const b = boxOf(G.boxId);
  if(b.remaining<=0) return;
  G.phase="spin"; refreshModal();
  fxBurstAt(document.querySelector(".m-base"), false);
  kanjiFlash("ガチャ","SPIN!");
  sfx("spin");
  setTimeout(()=>{
    const items = GACHA_ITEMS[b.name];
    const roll = Math.random();
    const rar = roll<0.08?"SSR":roll<0.30?"SR":"R";
    const pool = items.filter(i=>i.r===rar);
    G.item = pool[Math.floor(Math.random()*pool.length)];
    G.capColor = rar==="SSR"?"#FF9F43":rar==="SR"?"#B16DFF":"#3FD8C7";
    b.avail.pop(); b.remaining--;
    G.phase="drop"; refreshModal();
  }, 1000);
}
function crackCapsule(){
  const el = document.querySelector(".drop-caps");
  if(el) el.classList.add("open");
  if(G.item.r!=="R"){ confetti(G.item.r==="SSR"); uiShake(); }
  if(G.item.r==="SSR"){ kanjiFlash("大当たり！","SSR GET", "fx-gold"); sfx("rare"); }
  setTimeout(()=>{ G.phase="reveal"; refreshModal(); }, 480);
}
function gachaDone(){
  const b = boxOf(G.boxId);
  S.wallet.unshift({tier:G.item.r, name:G.item.name, emoji:G.item.emoji, box:b.name, slot:"—", at:Date.now(), unseen:true});
  S.points += POINTS_PER_DRAW + (G.item.r!=="R"?POINTS_RARE_BONUS:0);
  S.draws++;
  save(); syncTopNav(); closeModal(); renderGachaDetail(b);
}
function gachaAgain(){
  const b = boxOf(G.boxId);
  S.wallet.unshift({tier:G.item.r, name:G.item.name, emoji:G.item.emoji, box:b.name, slot:"—", at:Date.now(), unseen:true});
  S.points += POINTS_PER_DRAW + (G.item.r!=="R"?POINTS_RARE_BONUS:0);
  S.draws++;
  save(); syncTopNav();
  closeModal();
  if(b.remaining>0) openGacha(b.id); else renderGachaDetail(b);
}

/* ================= WALLET ================= */
function renderWallet(){
  S.wallet.forEach(w=>w.unseen=false); save(); syncTopNav();
  const items = S.wallet.map((w,i)=>`
    <div class="wallet-item" style="animation-delay:${i*45}ms">
      <div class="pbadge ${w.tier==="LAST"?"pink":""}"><b>${w.tier==="LAST"?"★":w.tier}</b></div>
      <div class="pthumb">${w.emoji}</div>
      <div><b>${esc(w.name)}</b><div class="sub">${esc(w.box)} · Ticket No. ${w.slot}</div></div>
      <span class="when">${new Date(w.at).toLocaleDateString("en-SG",{day:"numeric",month:"short"})}<br>${new Date(w.at).toLocaleTimeString("en-SG",{hour:"2-digit",minute:"2-digit"})}</span>
    </div>`).join("");
  $("#view").innerHTML = `
  <div class="kiosk">
    <div class="inst-bar">
      <button class="inst-back" onclick="history.back()" aria-label="Back">←</button>
      <div class="inst-text">My wallet 🎫<small>Everything you've won — shipped after you claim it.</small></div>
    </div>
    <div class="wallet-head" style="margin-top:4px">
      <div class="wallet-stats" style="margin-left:0">
        <div class="w-chip"><b>${S.points.toLocaleString()}</b><span>POINTS</span></div>
        <div class="w-chip"><b>${S.wallet.length}</b><span>PRIZES</span></div>
        <div class="w-chip"><b>${S.draws}</b><span>DRAWS</span></div>
      </div>
    </div>
    <div class="wallet-list">
      ${items || `<div class="wallet-empty">
        <span class="big">🎁</span><h3>No prizes yet</h3>
        <p>Draw your first ticket — every ticket wins something to keep.</p>
        <button class="big-cta" style="margin-top:16px" onclick="go('#/')">◆ Browse live boxes</button>
      </div>`}
    </div>
  </div>`;
}

/* ================= MODAL PLUMBING ================= */
function modalShell(html){
  $("#modalStage").innerHTML = `<div class="modal" id="modal">${html}</div>`;
  $("#overlay").classList.add("open");
  lockScroll(true);
  requestAnimationFrame(()=>requestAnimationFrame(()=>$("#modal").classList.add("show")));
}
function refreshModal(){ if(D||G){ const el=$("#modal"); if(el) el.innerHTML = (D?drawHTML():gachaHTML()); } }
function closeModal(silent){
  $("#overlay").classList.remove("open");
  const md = $("#menuDrawer");
  if(md) md.classList.remove("open");
  const m = $("#modal");
  if(m){ m.classList.remove("show"); setTimeout(()=>{ $("#modalStage").innerHTML=""; }, silent?0:280); }
  lockScroll(false);
  if(!silent){ D=null; G=null; }
}
function onOverlay(){ closeModal(); }
document.addEventListener("keydown", e=>{ if(e.key==="Escape") closeModal(); });

/* ---------------- DEMON-SLAYER CINEMATIC FX ENGINE ----------------
   全呼吸法隨機:日/水/炎/雷/風/岩/蟲/花/霞/音/戀/蛇/獸 — random on every press */
const BREATHS = {
  flame:  {main:"炎ノ呼吸", sub:"FLAME BREATHING",   ring:"#FFB84D", flash:"255,170,60",  ringShape:"circle"},
  sun:    {main:"日ノ呼吸", sub:"SUN BREATHING",     ring:"#FF5A3C", flash:"255,90,50",   ringShape:"circle"},
  water:  {main:"水ノ呼吸", sub:"WATER BREATHING",   ring:"#8FD8FF", flash:"120,200,255", ringShape:"ellipse"},
  thunder:{main:"雷ノ呼吸", sub:"THUNDER BREATHING", ring:"#FFED6E", flash:"255,240,160", ringShape:"circle"},
  wind:   {main:"風ノ呼吸", sub:"WIND BREATHING",    ring:"#A8F5C8", flash:"170,255,205", ringShape:"ellipse"},
  stone:  {main:"岩ノ呼吸", sub:"STONE BREATHING",   ring:"#C9B8A8", flash:"205,185,150", ringShape:"circle"},
  insect: {main:"蟲ノ呼吸", sub:"INSECT BREATHING",  ring:"#D8B4FF", flash:"220,180,255", ringShape:"circle"},
  flower: {main:"花ノ呼吸", sub:"FLOWER BREATHING",  ring:"#FFB8D9", flash:"255,190,220", ringShape:"ellipse"},
  mist:   {main:"霞ノ呼吸", sub:"MIST BREATHING",    ring:"#D9F2EF", flash:"235,250,250", ringShape:"ellipse"},
  sound:  {main:"音ノ呼吸", sub:"SOUND BREATHING",   ring:"#FFD76E", flash:"255,215,110", ringShape:"circle"},
  love:   {main:"戀ノ呼吸", sub:"LOVE BREATHING",    ring:"#FF9FC0", flash:"255,160,200", ringShape:"circle"},
  serpent:{main:"蛇ノ呼吸", sub:"SERPENT BREATHING", ring:"#C8B8FF", flash:"205,185,255", ringShape:"ellipse"},
  beast:  {main:"獸ノ呼吸", sub:"BEAST BREATHING",   ring:"#8FF0E4", flash:"150,240,230", ringShape:"circle"}
};
const FX_STYLES = Object.keys(BREATHS);
let fxLast = null;
function randFx(){
  let s;
  do{ s = FX_STYLES[Math.floor(Math.random()*FX_STYLES.length)]; }while(s===fxLast);
  fxLast = s;
  return s;
}
const FX = { parts:[], rings:[], arcs:[], flashes:[], bolts:[], running:false };
let kfxT = null;
const R = (a,b)=>a+Math.random()*(b-a);
const pick = arr => arr[Math.floor(Math.random()*arr.length)];

function fxBurst(x,y,big,style){
  if(SETTINGS.fx==="off") return;
  const M = SETTINGS.fx==="lite" ? .45 : 1;
  const NN = n=>Math.max(1,Math.round(n*M));
  const st = style || randFx();
  FX.flashes.push({x,y,r:12,a:st==="thunder"?.7:.5,vr:(big?26:15)*(st==="thunder"?1.5:1),st});
  FX.rings.push({x,y,r:6,a:.85,vr:5.2,st});
  if(big) FX.rings.push({x,y,r:2,a:.95,vr:8,st});

  if(st==="flame"||st==="sun"){
    const pal = st==="sun" ? ["190,15,10","255,70,35","255,215,160"] : ["255,60,10","255,150,40","255,235,160"];
    const n = NN(big?16:8);
    for(let i=0;i<n;i++) FX.parts.push({t:"tongue",
      x:x+R(-14,14), y:y+R(-8,8), vx:R(-.9,.9), vy:R(-4.6,-2.2),
      w:R(7,15)*(big?1.35:1), h:R(18,34)*(big?1.35:1), rot:R(-.5,.5), wob:R(0,6.28),
      pal, life:1, decay:R(.011,.02)});
    const e = NN(big?38:14);
    for(let i=0;i<e;i++) FX.parts.push({t:"ember",
      x, y, vx:R(-2.2,2.2), vy:R(-5.5,-1.2), g:-.03,
      col:st==="sun"?"#FF6E4D":"#FFD23F",
      r:R(1.2,2.6), life:1, decay:R(.008,.016), seed:R(0,6.28)});
  }
  else if(st==="water"){
    const a = NN(big?6:3);
    for(let i=0;i<a;i++) FX.arcs.push({
      x, y, r:R(16,26), vr:R(5.5,9)*(big?1.25:1), a0:R(0,6.28), spin:R(-.09,.09),
      span:R(.9,1.5), w:R(6,11), life:1, decay:R(.016,.026)});
    const d = NN(big?44:18);
    for(let i=0;i<d;i++){ const an=R(0,6.28), sp=R(2,6.5);
      FX.parts.push({t:"drop", x, y, px:x, py:y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp-2.4,
        g:.22, r:R(1.6,3.4), life:1, decay:R(.012,.02)}); }
  }
  else if(st==="thunder"){
    /* jagged lightning bolts crackling outward */
    const nb = NN(big?7:4);
    for(let i=0;i<nb;i++){
      const ang=R(0,6.28), len=R(70,big?190:120), segs=6+(Math.random()*4|0);
      const pts=[{x,y}]; let px=x,py=y,a=ang;
      for(let s=0;s<segs;s++){
        a+=R(-.75,.75);
        px+=Math.cos(a)*(len/segs); py+=Math.sin(a)*(len/segs);
        pts.push({x:px,y:py});
      }
      FX.bolts.push({pts, life:1, decay:R(.045,.08), w:R(2,3.4)});
    }
    const e = NN(big?26:12);
    for(let i=0;i<e;i++){ const an=R(0,6.28), sp=R(3,8);
      FX.parts.push({t:"spark", x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp,
        g:.05, r:R(1,2.2), life:1, decay:R(.03,.05)}); }
  }
  else if(st==="wind"){
    const n = NN(big?34:16);
    for(let i=0;i<n;i++) FX.parts.push({t:"wind",
      cx:x, cy:y, ang:R(0,6.28), av:R(.14,.26)*(Math.random()<.5?-1:1),
      rad:R(4,10), radV:R(.45,1.05), rise:0, vy:R(-2.8,-1.5),
      maxH:R(90,big?190:120), w:R(3.5,7), life:1, decay:R(.011,.018)});
    const l = NN(big?12:5);
    for(let i=0;i<l;i++){ const an=R(0,6.28), sp=R(1,3);
      FX.parts.push({t:"leaf", x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp-2,
        g:.1, rot:R(0,6.28), vr:R(-.25,.25), r:R(2.4,4), col:"#7BE8B0", life:1, decay:R(.012,.02)}); }
  }
  else if(st==="stone"){
    /* heavy rock shards + dust */
    const n = NN(big?14:7);
    for(let i=0;i<n;i++) FX.parts.push({t:"rock",
      x, y, vx:R(-3.4,3.4), vy:R(-6,-2), g:.34, r:R(5,11),
      rot:R(0,6.28), vr:R(-.2,.2), col:pick(["#B9A98F","#8F8069","#D8CBB4"]),
      verts:Array.from({length:5},()=>[R(-1,1),R(-1,1)]), life:1, decay:R(.012,.02)});
    for(let i=0;i<4;i++) FX.parts.push({t:"mist",
      x:x+R(-16,16), y:y+R(-10,10), vx:R(-.4,.4), vy:R(-.4,-.1),
      r:R(10,18), vr:R(.4,.8), a:R(.08,.13), col:"210,190,160", life:1, decay:R(.012,.016)});
  }
  else if(st==="insect"){
    /* fluttering butterflies */
    const n = NN(big?7:3);
    for(let i=0;i<n;i++) FX.parts.push({t:"bfly",
      x:x+R(-10,10), y:y+R(-8,8), vx:R(-1.2,1.2), vy:R(-1.9,-.7),
      phase:R(0,6.28), col:pick(["#B98CFF","#E3C8FF","#9E6BF0"]), r:R(4.5,7),
      life:1, decay:R(.008,.013)});
    const l = NN(big?10:5);
    for(let i=0;i<l;i++){ const an=R(0,6.28), sp=R(.6,2.2);
      FX.parts.push({t:"leaf", x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp-1.6,
        g:.06, rot:R(0,6.28), vr:R(-.2,.2), r:R(2,3.4), col:"#D8B4FF", life:1, decay:R(.01,.016)}); }
  }
  else if(st==="flower"){
    /* swirling petals */
    const n = NN(big?26:12);
    for(let i=0;i<n;i++){ const an=R(0,6.28), sp=R(.8,3.4);
      FX.parts.push({t:"leaf", x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp-2.2,
        g:.07, rot:R(0,6.28), vr:R(-.22,.22), r:R(2.4,4.2),
        col:pick(["#FFB8D9","#FF9FC7","#FFD9E8"]), life:1, decay:R(.009,.015)}); }
  }
  else if(st==="mist"){
    /* soft obscuring fog puffs */
    const n = NN(big?12:6);
    for(let i=0;i<n;i++) FX.parts.push({t:"mist",
      x:x+R(-24,24), y:y+R(-16,16), vx:R(-.5,.5), vy:R(-.5,-.1),
      r:R(16,30)*(big?1.25:1), vr:R(.5,1), a:R(.1,.16), col:"235,252,250",
      life:1, decay:R(.007,.011)});
  }
  else if(st==="sound"){
    /* flamboyant musical notes + sparkles + extra rings */
    const n = NN(big?10:5);
    for(let i=0;i<n;i++) FX.parts.push({t:"note",
      x:x+R(-10,10), y:y+R(-6,6), vx:R(-1,1), vy:R(-2.4,-1.1), g:-.008,
      glyph:pick(["♪","♫","♬"]), col:pick(["#FFD76E","#FFF0B0","#FFB84D"]),
      r:R(1.3,2.1), seed:R(0,6.28), life:1, decay:R(.011,.017)});
    const e = NN(big?16:8);
    for(let i=0;i<e;i++){ const an=R(0,6.28), sp=R(2,5);
      FX.parts.push({t:"spark", x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp,
        g:.03, r:R(.8,1.8), col:"#FFF0B0", life:1, decay:R(.025,.04)}); }
    FX.rings.push({x,y,r:14,a:.7,vr:6.6,st});
  }
  else if(st==="love"){
    /* floating hearts */
    const n = NN(big?12:6);
    for(let i=0;i<n;i++) FX.parts.push({t:"heart",
      x:x+R(-10,10), y:y+R(-8,8), vx:R(-.9,.9), vy:R(-2.8,-1.3),
      seed:R(0,6.28), r:R(5,9)*(big?1.2:1),
      col:pick(["#FF9FC0","#FF6FA5","#FFD0E2"]), life:1, decay:R(.011,.017)});
  }
  else if(st==="serpent"){
    /* slithering sine-wave strikes */
    const n = NN(big?7:4);
    for(let i=0;i<n;i++){ const dir=Math.random()<.5?-1:1;
      FX.parts.push({t:"snek", x, y, y0:y, px:x, py:y, vx:dir*R(2.2,4),
        t0:R(0,6.28), amp:R(8,16), fr:R(.18,.3),
        col:pick(["#F0EAFF","#B9A5FF"]), r:R(1.8,2.8), life:1, decay:R(.013,.02)}); }
  }
  else{ /* beast — jagged saw-blade shards */
    const n = NN(big?10:5);
    for(let i=0;i<n;i++){ const an=R(0,6.28), sp=R(2.5,5.5);
      FX.parts.push({t:"saw", x, y, vx:Math.cos(an)*sp, vy:Math.sin(an)*sp-1,
        g:.12, rot:R(0,6.28), vr:R(-.3,.3), r:R(5,9), col:"#8FF0E4",
        life:1, decay:R(.015,.024)}); }
  }
  if(!FX.running){ FX.running=true; requestAnimationFrame(fxLoop); }
}
function fxLoop(){
  const cv=$("#fx"),ctx=cv.getContext("2d");
  cv.width=innerWidth; cv.height=innerHeight;
  ctx.clearRect(0,0,cv.width,cv.height);

  /* radial flashes */
  FX.flashes.forEach(f=>{
    f.r+=f.vr; f.a*=(f.st==="thunder"?.84:.9);
    const g=ctx.createRadialGradient(f.x,f.y,0,f.x,f.y,f.r);
    g.addColorStop(0,`rgba(${BREATHS[f.st].flash},${f.a})`);
    g.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(f.x,f.y,f.r,0,6.29); ctx.fill();
  });
  FX.flashes = FX.flashes.filter(f=>f.a>.03);

  /* rings — color & shape follow the breathing style */
  FX.rings.forEach(g=>{
    g.r+=g.vr; g.a-=.03;
    const B=BREATHS[g.st]||BREATHS.flame;
    ctx.globalAlpha=Math.max(0,g.a);
    ctx.strokeStyle=B.ring;
    ctx.lineWidth=g.st==="flame"||g.st==="sun"?5:g.st==="thunder"?2.4:3;
    ctx.beginPath();
    if(B.ringShape==="circle") ctx.arc(g.x,g.y,g.r,0,6.29);
    else ctx.ellipse(g.x,g.y,g.r,g.r*.42,0,0,6.29);
    ctx.stroke();
  });
  ctx.globalAlpha=1;
  FX.rings = FX.rings.filter(g=>g.a>0);

  /* lightning bolts — flickering jagged strokes */
  FX.bolts.forEach(b=>{
    b.life-=b.decay;
    const flick=.55+.45*Math.random();
    ctx.globalAlpha=Math.max(0,b.life)*flick;
    ctx.lineJoin="round"; ctx.lineCap="round";
    for(let pass=0;pass<2;pass++){
      ctx.strokeStyle=pass? "#FFFFFF":"#FFE93F";
      ctx.lineWidth=pass? b.w : b.w*2.8;
      if(pass) ctx.globalAlpha=Math.max(0,b.life)*flick;
      else ctx.globalAlpha=Math.max(0,b.life)*.4*flick;
      ctx.beginPath();
      b.pts.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
      ctx.stroke();
    }
  });
  ctx.globalAlpha=1;
  FX.bolts = FX.bolts.filter(b=>b.life>0);

  ctx.globalCompositeOperation="lighter";

  /* water arcs — glowing crescents */
  FX.arcs.forEach(a=>{
    a.r+=a.vr; a.a0+=a.spin; a.life-=a.decay;
    const al=Math.max(0,a.life);
    for(let k=0;k<2;k++){
      ctx.globalAlpha=al*(k?.35:.9);
      ctx.strokeStyle=k? "#2E7BF0":"#C9F2FF";
      ctx.lineWidth=a.w*(k?1.9:1)*a.life;
      ctx.lineCap="round";
      ctx.beginPath(); ctx.arc(a.x,a.y,a.r,a.a0,a.a0+a.span); ctx.stroke();
    }
  });
  FX.arcs=FX.arcs.filter(a=>a.life>0);
  ctx.globalAlpha=1;

  /* particles */
  FX.parts.forEach(p=>{
    p.life-=p.decay;
    if(p.t==="tongue"){
      p.wob+=.22; p.x+=p.vx+Math.sin(p.wob)*1.1; p.y+=p.vy; p.vy*=.985;
      p.h*=.985; p.w*=.982;
      const l=Math.max(0,p.life), pal=p.pal||["255,60,10","255,150,40","255,235,160"];
      const grad=ctx.createLinearGradient(p.x,p.y,p.x,p.y-p.h);
      grad.addColorStop(0,`rgba(${pal[0]},${.85*l})`);
      grad.addColorStop(.55,`rgba(${pal[1]},${.9*l})`);
      grad.addColorStop(1,`rgba(${pal[2]},${.95*l})`);
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot+Math.sin(p.wob)*.18);
      ctx.fillStyle=grad;
      ctx.beginPath();
      ctx.moveTo(0,-p.h);
      ctx.quadraticCurveTo(p.w,-p.h*.35,p.w*.5,0);
      ctx.quadraticCurveTo(p.w*.25,p.h*.18,0,p.h*.14);
      ctx.quadraticCurveTo(-p.w*.25,p.h*.18,-p.w*.5,0);
      ctx.quadraticCurveTo(-p.w,-p.h*.35,0,-p.h);
      ctx.fill(); ctx.restore();
    }
    else if(p.t==="ember"){
      p.seed+=.3; p.x+=p.vx*.9+Math.sin(p.seed)*.7; p.y+=p.vy; p.vy+=p.g;
      ctx.globalAlpha=Math.max(0,p.life)*(.6+.4*Math.sin(p.seed*2.2));
      ctx.fillStyle=p.col||"#FFD23F";
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(.4,p.r),0,6.29); ctx.fill();
    }
    else if(p.t==="drop"){
      p.px=p.x; p.py=p.y; p.x+=p.vx; p.y+=p.vy; p.vy+=p.g;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.strokeStyle="#9BEBFF"; ctx.lineWidth=p.r; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(p.px,p.py); ctx.lineTo(p.x,p.y); ctx.stroke();
      ctx.fillStyle="#E6F9FF";
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r*.8,0,6.29); ctx.fill();
    }
    else if(p.t==="spark"){
      p.x+=p.vx; p.y+=p.vy; p.vx*=.94; p.vy*=.94; p.vy+=p.g;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.fillStyle=p.col||"#FFF6B0";
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(.4,p.r),0,6.29); ctx.fill();
    }
    else if(p.t==="mote"){
      p.seed+=.04; p.x+=p.vx+Math.sin(p.seed)*.3; p.y+=p.vy;
      ctx.globalAlpha=Math.max(0,p.life)*(.55+.45*Math.sin(p.seed*3));
      ctx.fillStyle=p.col;
      ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(.3,p.r),0,6.29); ctx.fill();
    }
    else if(p.t==="wind"){
      p.ang+=p.av; p.rad=Math.min(54,p.rad+p.radV); p.rise+=p.vy;
      if(-p.rise>p.maxH) p.life=0;
      const py=p.cy+p.rise;
      const al=Math.max(0,p.life);
      ctx.globalAlpha=al*.85;
      ctx.strokeStyle="#D8FFE8"; ctx.lineWidth=p.w; ctx.lineCap="round";
      ctx.beginPath(); ctx.ellipse(p.cx,py,p.rad,p.rad*.3,0,p.ang-.3,p.ang+.3); ctx.stroke();
      ctx.globalAlpha=al*.4;
      ctx.strokeStyle="#3FD8A0"; ctx.lineWidth=p.w*1.9;
      ctx.beginPath(); ctx.ellipse(p.cx,py,p.rad,p.rad*.3,0,p.ang-.26,p.ang+.26); ctx.stroke();
    }
    else if(p.t==="leaf"){
      p.x+=p.vx+Math.sin(p.rot*2)*.6; p.y+=p.vy; p.vy+=p.g; p.rot+=p.vr;
      ctx.globalAlpha=Math.max(0,p.life)*.9;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.col||"#7BE8B0";
      ctx.beginPath(); ctx.ellipse(0,0,p.r,p.r*.5,0,0,6.29); ctx.fill();
      ctx.restore();
    }
    else if(p.t==="rock"){
      p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.rot+=p.vr;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.col;
      ctx.beginPath();
      p.verts.forEach((v,i)=>{
        const px=v[0]*p.r, py=v[1]*p.r;
        i?ctx.lineTo(px,py):ctx.moveTo(px,py);
      });
      ctx.closePath(); ctx.fill(); ctx.restore();
    }
    else if(p.t==="bfly"){
      p.phase+=.35; p.x+=p.vx+Math.sin(p.phase*.28)*.9; p.y+=p.vy;
      const flap=.25+.75*Math.abs(Math.sin(p.phase));
      ctx.globalAlpha=Math.max(0,p.life)*.95;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(Math.sin(p.phase*.2)*.4);
      ctx.fillStyle=p.col;
      ctx.beginPath(); ctx.ellipse(-p.r*.55,0,p.r*flap,p.r*.66,-.4,0,6.29); ctx.fill();
      ctx.beginPath(); ctx.ellipse(p.r*.55,0,p.r*flap,p.r*.66,.4,0,6.29); ctx.fill();
      ctx.restore();
    }
    else if(p.t==="mist"){
      p.x+=p.vx; p.y+=p.vy; p.r+=p.vr;
      ctx.globalAlpha=p.a*Math.max(0,p.life);
      ctx.fillStyle=`rgba(${p.col||"235,252,250"},1)`;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,6.29); ctx.fill();
    }
    else if(p.t==="note"){
      p.seed+=.09; p.x+=p.vx+Math.sin(p.seed)*.5; p.y+=p.vy; p.vy+=p.g;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.fillStyle=p.col;
      ctx.font=`900 ${Math.round(p.r*9)}px serif`;
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText(p.glyph,p.x,p.y);
    }
    else if(p.t==="heart"){
      p.seed+=.1; p.x+=p.vx+Math.sin(p.seed)*.6; p.y+=p.vy;
      const s=p.r;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.fillStyle=p.col;
      ctx.save(); ctx.translate(p.x,p.y);
      ctx.beginPath();
      ctx.moveTo(0,s*.4);
      ctx.bezierCurveTo(-s*1.15,-s*.4, -s*.45,-s*1.1, 0,-s*.35);
      ctx.bezierCurveTo(s*.45,-s*1.1, s*1.15,-s*.4, 0,s*.4);
      ctx.fill(); ctx.restore();
    }
    else if(p.t==="snek"){
      p.t0+=1; p.px=p.x; p.py=p.y;
      p.x+=p.vx; p.y=p.y0+Math.sin(p.t0*p.fr)*p.amp;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.strokeStyle=p.col; ctx.lineWidth=p.r; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(p.px,p.py); ctx.lineTo(p.x,p.y); ctx.stroke();
    }
    else if(p.t==="saw"){
      p.x+=p.vx; p.y+=p.vy; p.vy+=p.g; p.rot+=p.vr;
      ctx.globalAlpha=Math.max(0,p.life);
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.col;
      ctx.beginPath();
      ctx.moveTo(p.r,0); ctx.lineTo(-p.r*.7,p.r*.62); ctx.lineTo(-p.r*.3,0);
      ctx.lineTo(-p.r*.7,-p.r*.62); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  });
  ctx.globalAlpha=1;
  ctx.globalCompositeOperation="source-over";
  FX.parts=FX.parts.filter(p=>p.life>0 && (p.t!=="tongue"||p.h>2));

  if(FX.parts.length||FX.rings.length||FX.arcs.length||FX.flashes.length||FX.bolts.length){
    requestAnimationFrame(fxLoop);
  }else{ FX.running=false; ctx.clearRect(0,0,cv.width,cv.height); }
}
/* every interactive press triggers a random breathing style */
document.addEventListener("click",e=>{
  const t=e.target.closest("button,.kcard,.prow,.slot,.reveal-card,.drop-caps,.bnav,.chip");
  if(t){ sfx("click"); fxBurst(e.clientX,e.clientY,false); }
});
function fxBurstAt(el,big,style){
  if(!el) return;
  const r = el.getBoundingClientRect();
  fxBurst(r.left+r.width/2, r.top+r.height/2, big, style);
}
/* kanji flash — the anime signature */
function kanjiFlash(main, sub, cls){
  const el=$("#kfx");
  el.className="kfx show "+(cls||"fx-gold");
  el.innerHTML=`<span class="kfx-main">${main}</span>${sub?`<span class="kfx-sub">${sub}</span>`:""}`;
  clearTimeout(kfxT);
  kfxT=setTimeout(()=>el.classList.remove("show"),1050);
}
function uiShake(){
  if(SETTINGS.fx==="off"||SETTINGS.motion==="reduced") return;
  document.body.classList.remove("shake");
  void document.body.offsetWidth;
  document.body.classList.add("shake");
  setTimeout(()=>document.body.classList.remove("shake"),340);
}

/* ---------------- CURSOR TRAIL — breathing style follows the mouse ---------------- */
let trailStyle = FX_STYLES[Math.floor(Math.random()*FX_STYLES.length)];
setInterval(()=>{ trailStyle = randFx(); }, 3500);   /* rotate style every few seconds */
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastTX = -99, lastTY = -99;
document.addEventListener("pointermove", e=>{
  if(reducedMotion || SETTINGS.fx==="off" || SETTINGS.motion==="reduced") return;
  const dx = e.clientX-lastTX, dy = e.clientY-lastTY;
  if(dx*dx+dy*dy < (SETTINGS.fx==="lite"?520:170)) return;          /* spawn every ~13px of movement */
  lastTX = e.clientX; lastTY = e.clientY;
  const x = e.clientX, y = e.clientY;
  const S = trailStyle;
  if(S==="flame") FX.parts.push({t:"ember", x:x+R(-3,3), y:y+R(-3,3), vx:R(-.5,.5), vy:R(-2,-.8), g:-.02, r:R(.9,1.9), col:"#FFD23F", life:.8, decay:R(.03,.045), seed:R(0,6.28)});
  else if(S==="sun") FX.parts.push({t:"ember", x:x+R(-3,3), y:y+R(-3,3), vx:R(-.5,.5), vy:R(-2,-.8), g:-.02, r:R(.9,1.9), col:"#FF6E4D", life:.8, decay:R(.03,.045), seed:R(0,6.28)});
  else if(S==="water") FX.parts.push({t:"drop", x, y, px:x, py:y, vx:R(-.8,.8), vy:R(-.4,.6), g:.07, r:R(1,2), life:.75, decay:R(.035,.05)});
  else if(S==="thunder") FX.parts.push({t:"spark", x, y, vx:R(-1.4,1.4), vy:R(-1.4,1.4), g:.01, r:R(.7,1.5), life:.6, decay:R(.05,.08)});
  else if(S==="wind") FX.parts.push({t:"leaf", x, y, vx:R(-.9,.9), vy:R(-.9,.4), g:.03, rot:R(0,6.28), vr:R(-.18,.18), r:R(1.6,2.8), col:"#7BE8B0", life:.85, decay:R(.03,.045)});
  else if(S==="stone") FX.parts.push({t:"spark", x, y, vx:R(-.8,.8), vy:R(-.6,.2), g:.06, r:R(.8,1.5), col:"#C9B8A8", life:.7, decay:R(.04,.06)});
  else if(S==="insect") FX.parts.push({t:"leaf", x, y, vx:R(-.7,.7), vy:R(-.8,.2), g:.02, rot:R(0,6.28), vr:R(-.2,.2), r:R(1.6,2.6), col:"#D8B4FF", life:.85, decay:R(.03,.045)});
  else if(S==="flower") FX.parts.push({t:"leaf", x, y, vx:R(-.8,.8), vy:R(-.9,.3), g:.025, rot:R(0,6.28), vr:R(-.2,.2), r:R(1.8,2.8), col:"#FFB8D9", life:.85, decay:R(.03,.045)});
  else if(S==="mist") FX.parts.push({t:"mist", x, y, vx:R(-.3,.3), vy:R(-.3,-.05), r:R(5,9), vr:R(.2,.4), a:R(.08,.12), col:"235,252,250", life:.8, decay:R(.02,.03)});
  else if(S==="sound") FX.parts.push({t:"note", x, y, vx:R(-.6,.6), vy:R(-1.4,-.7), g:-.004, glyph:pick(["♪","♫"]), col:"#FFD76E", r:R(.8,1.2), seed:R(0,6.28), life:.8, decay:R(.03,.045)});
  else if(S==="love") FX.parts.push({t:"heart", x, y, vx:R(-.5,.5), vy:R(-1.5,-.8), seed:R(0,6.28), r:R(2.6,4), col:pick(["#FF9FC0","#FF6FA5"]), life:.8, decay:R(.03,.045)});
  else if(S==="serpent") FX.parts.push({t:"snek", x, y, y0:y, px:x, py:y, vx:(Math.random()<.5?-1:1)*R(1.2,2), t0:R(0,6.28), amp:R(4,8), fr:R(.2,.3), col:"#C8B8FF", r:R(1.2,1.8), life:.6, decay:R(.035,.05)});
  else FX.parts.push({t:"spark", x, y, vx:R(-1.2,1.2), vy:R(-1.2,1), g:.04, r:R(.8,1.5), col:"#8FF0E4", life:.7, decay:R(.04,.06)});
  if(!FX.running){ FX.running=true; requestAnimationFrame(fxLoop); }
}, {passive:true});

/* ---------------- THEME: manga ink ↔ anime dark ---------------- */
let theme = "anime";
try{ theme = localStorage.getItem("kuji_theme_v2") || "anime"; }catch(e){}
function applyTheme(){
  document.body.classList.toggle("theme-manga", theme==="manga");
  const b = $("#themeBtn");
  if(b){ b.textContent = theme==="manga" ? "📖" : "✨";
    b.title = theme==="manga" ? "マンガ風 · tap for anime dark" : "アニメ風 · tap for manga ink"; }
}
function toggleTheme(){
  theme = theme==="manga" ? "anime" : "manga";
  try{ localStorage.setItem("kuji_theme_v2", theme); }catch(e){}
  applyTheme();
  toast(theme==="manga" ? "マンガモード 📖" : "アニメモード ✨");
}

/* ambient glowing motes — floating sparks like the movie poster */
if(!reducedMotion){
  setInterval(()=>{
    if(document.hidden || SETTINGS.fx!=="full" || SETTINGS.motion==="reduced") return;
    FX.parts.push({t:"mote",
      x:R(0,innerWidth), y:R(innerHeight*.5, innerHeight+10),
      vx:R(-.15,.15), vy:R(-.55,-.25),
      r:R(1,2.6), col:pick(["#9BEBFF","#7FD8FF","#FFE9A0"]),
      seed:R(0,6.28), life:1, decay:R(.0025,.0045)});
    if(!FX.running){ FX.running=true; requestAnimationFrame(fxLoop); }
  }, 300);
}

/* ---------------- SETTINGS (menu ⚙) ---------------- */
const SETTINGS = { fx:"full", sound:true, motion:"standard" };
try{
  SETTINGS.fx = localStorage.getItem("kuji_fxlevel") || "full";
  SETTINGS.sound = (localStorage.getItem("kuji_sound") || "on") === "on";
  SETTINGS.motion = localStorage.getItem("kuji_motion") || "standard";
}catch(e){}
function saveSettings(){
  try{
    localStorage.setItem("kuji_fxlevel", SETTINGS.fx);
    localStorage.setItem("kuji_sound", SETTINGS.sound ? "on" : "off");
    localStorage.setItem("kuji_motion", SETTINGS.motion);
  }catch(e){}
}
function applyMotion(){
  document.body.classList.toggle("reduce-motion", SETTINGS.motion==="reduced");
}

/* ---------------- SOUND ENGINE (WebAudio, no assets) ---------------- */
let AC = null;
function sfx(kind){
  if(!SETTINGS.sound) return;
  try{
    AC = AC || new (window.AudioContext||window.webkitAudioContext)();
    if(AC.state==="suspended") AC.resume();
  }catch(e){ return; }
  const t0 = AC.currentTime;
  const note=(f,t,d,type,v)=>{
    const o=AC.createOscillator(), g=AC.createGain();
    o.type=type||"triangle"; o.frequency.setValueAtTime(f,t0+t);
    g.gain.setValueAtTime(0,t0+t);
    g.gain.linearRampToValueAtTime(v||.07,t0+t+.012);
    g.gain.exponentialRampToValueAtTime(.0001,t0+t+d);
    o.connect(g); g.connect(AC.destination);
    o.start(t0+t); o.stop(t0+t+d+.02);
  };
  if(kind==="click"){ note(760,0,.07,"triangle",.045); }
  else if(kind==="flip"){ note(420,0,.09,"sine",.06); note(840,.06,.1,"sine",.05); }
  else if(kind==="win"){ [523,659,784].forEach((f,i)=>note(f,i*.07,.16,"triangle",.07)); }
  else if(kind==="rare"){ [523,659,784,1046,1318].forEach((f,i)=>note(f,i*.06,.22,"triangle",.08)); }
  else if(kind==="spin"){ note(300,0,.12,"sawtooth",.028); note(500,.1,.12,"sawtooth",.028); }
}

/* ---------------- MENU ☰ & SETTINGS ⚙ ---------------- */
function openMenu(){
  $("#overlay").classList.add("open");
  $("#menuDrawer").classList.add("open");
  lockScroll(true);
}
function openSettings(){
  $("#menuDrawer").classList.remove("open");
  modalShell(settingsHTML());
}
function settingsHTML(){
  const on=(cur,val)=>cur===val?"on":"";
  return `<div class="modal-head">
    <button class="m-close" onclick="closeModal()" aria-label="Close">✕</button>
    <div class="m-kicker">SETTINGS</div><h3>設定 ⚙️</h3>
    <div class="m-sub">Everything applies instantly and is remembered</div>
  </div>
  <div class="modal-body">
    <div class="set-label">主題 · THEME</div>
    <div class="set-row">
      <button class="set-opt ${on(theme,"anime")}" onclick="setThemeOpt('anime')">✨ 動漫暗黑<br><small>無限城 Anime</small></button>
      <button class="set-opt ${on(theme,"manga")}" onclick="setThemeOpt('manga')">📖 漫畫手稿<br><small>Manga Ink</small></button>
    </div>
    <div class="set-label">特效強度 · EFFECTS</div>
    <div class="set-row">
      <button class="set-opt ${on(SETTINGS.fx,"full")}" onclick="setFxLevel('full')">🔥 全開<br><small>Full</small></button>
      <button class="set-opt ${on(SETTINGS.fx,"lite")}" onclick="setFxLevel('lite')">🍃 輕量<br><small>Lite</small></button>
      <button class="set-opt ${on(SETTINGS.fx,"off")}" onclick="setFxLevel('off')">⛔ 關閉<br><small>Off</small></button>
    </div>
    <div class="set-label">音效 · SOUND</div>
    <div class="set-row">
      <button class="set-opt ${SETTINGS.sound?"on":""}" onclick="setSound(true)">🔊 開啟<br><small>On</small></button>
      <button class="set-opt ${SETTINGS.sound?"":"on"}" onclick="setSound(false)">🔇 靜音<br><small>Muted</small></button>
    </div>
    <div class="set-label">動態 · MOTION</div>
    <div class="set-row">
      <button class="set-opt ${on(SETTINGS.motion,"standard")}" onclick="setMotion('standard')">✨ 標準<br><small>Standard</small></button>
      <button class="set-opt ${on(SETTINGS.motion,"reduced")}" onclick="setMotion('reduced')">🧘 減少<br><small>Reduced</small></button>
    </div>
    <button class="btn-ghost-line" style="margin-top:18px" onclick="resetDemo();closeModal()">🔄 Reset demo data</button>
    <p class="fine-print">KUJIGACHA · KUJI CLUB — 無限城 Edition v1.0</p>
  </div>`;
}
function refreshSettings(){ const el=$("#modal"); if(el) el.innerHTML=settingsHTML(); }
function setThemeOpt(t){ if(t!==theme) toggleTheme(); refreshSettings(); }
function setFxLevel(l){
  SETTINGS.fx=l; saveSettings(); refreshSettings();
  toast(l==="full"?"特效全開 🔥":l==="lite"?"輕量特效 🍃":"特效已關閉");
  if(l!=="off") fxBurst(innerWidth/2, innerHeight*0.42, l==="full");
}
function setSound(v){ SETTINGS.sound=v; saveSettings(); refreshSettings(); if(v) sfx("win"); }
function setMotion(m){ SETTINGS.motion=m; saveSettings(); applyMotion(); refreshSettings(); }
function howToPlay(){
  $("#menuDrawer").classList.remove("open");
  modalShell(`<div class="modal-head">
    <button class="m-close" onclick="closeModal()" aria-label="Close">✕</button>
    <div class="m-kicker">HOW TO PLAY</div><h3>點玩？🎫</h3>
    <div class="m-sub">Three steps to your prize</div></div>
  <div class="modal-body">
    <div class="htp"><b>① Pick a box</b><p>Every box shows exactly which prizes remain — the pool only shrinks as people draw.</p></div>
    <div class="htp"><b>② Pick your tickets</b><p>Tap your lucky numbers on the board, or hit 🎲 Lucky Dip. Every ticket wins something.</p></div>
    <div class="htp"><b>③ Reveal &amp; keep</b><p>Flip your tickets to reveal prizes. Buy the LAST ticket of a box to claim the Last One prize.</p></div>
    <button class="big-cta block" style="margin-top:14px" onclick="closeModal();go('#/')">START ◆</button>
  </div>`);
}

/* ---------------- INIT ---------------- */
applyMotion();
applyTheme();
route();
