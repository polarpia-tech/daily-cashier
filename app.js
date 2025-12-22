/* ===================== STORAGE ===================== */
const LS_DB = "dcash_db_v3";
const LS_USERS = "dcash_users_v3";
const LS_ACTIVE = "dcash_active_user_v3";
const LS_SHOP = "dcash_shop_v3";
const LS_ADMIN_HASH = "dcash_admin_hash_v3";
const LS_FAVS = "dcash_favs_v3";

/* ===================== CONFIG ===================== */
const TODAY = new Date().toISOString().slice(0,10);
const IDLE_HOME_MS = 35000;
const IDLE_SCREENSAVER_EXTRA = 12000;

const TABLES = ["T1","T2","T3","T4","T5","T6","T7","T8","BAR","ΕΞΩ"];

const CATS = [
  {id:"coffee", label:"☕ Καφέδες", allowed:["coffee_hot","coffee_cold","tea","choco","extras"]},
  {id:"snack",  label:"🥐 Σνακ", allowed:["snack"]},
  {id:"drinks", label:"🍺 Ποτά", allowed:["beer","wine","spirit","cocktail"]},
  {id:"soft",   label:"🥤 Αναψυκτικά", allowed:["soft","juice"]},
];

const PRODUCTS = [
  {cat:"coffee_hot", name:"Espresso μονός", price:2.60},
  {cat:"coffee_hot", name:"Espresso διπλός", price:3.20},
  {cat:"coffee_hot", name:"Espresso macchiato", price:2.90},
  {cat:"coffee_hot", name:"Americano", price:3.20},
  {cat:"coffee_hot", name:"Cappuccino", price:3.60},
  {cat:"coffee_hot", name:"Cappuccino διπλός", price:4.20},
  {cat:"coffee_hot", name:"Latte macchiato", price:4.20},
  {cat:"coffee_hot", name:"Flat white", price:4.40},
  {cat:"coffee_hot", name:"Mocha", price:4.50},
  {cat:"coffee_hot", name:"Καφές φίλτρου", price:3.00},
  {cat:"extras", name:"Decaf (+)", price:0.30},

  {cat:"coffee_cold", name:"Freddo espresso", price:3.80},
  {cat:"coffee_cold", name:"Freddo cappuccino", price:4.20},
  {cat:"coffee_cold", name:"Iced latte", price:4.50},
  {cat:"coffee_cold", name:"Cold brew", price:4.80},
  {cat:"coffee_cold", name:"Frappe", price:3.50},

  {cat:"tea", name:"Τσάι (μαύρο, πράσινο, βότανα)", price:3.20},
  {cat:"tea", name:"Τσάι φρούτων", price:3.50},
  {cat:"tea", name:"Chai latte", price:4.30},

  {cat:"choco", name:"Ζεστή σοκολάτα", price:4.20},
  {cat:"choco", name:"Κρύα σοκολάτα", price:4.50},
  {cat:"choco", name:"Λευκή σοκολάτα", price:4.50},
  {cat:"choco", name:"Κακάο", price:4.00},
  {cat:"extras", name:"Φυτικό γάλα (βρώμης/αμυγδάλου) (+)", price:0.50},

  {cat:"soft", name:"Coca-Cola / Zero / Fanta (0,33l)", price:3.40},
  {cat:"soft", name:"Ice Tea", price:3.60},
  {cat:"soft", name:"Σόδα / Τόνικ", price:3.20},
  {cat:"soft", name:"Μεταλλικό νερό (0,33l)", price:2.80},
  {cat:"soft", name:"Μεταλλικό νερό (0,75l)", price:5.50},

  {cat:"juice", name:"Φυσικός χυμός πορτοκάλι", price:4.50},
  {cat:"juice", name:"Χυμός ανάμεικτος", price:4.80},
  {cat:"juice", name:"Smoothie φρούτων", price:5.80},
  {cat:"juice", name:"Milkshake", price:5.50},

  {cat:"snack", name:"Κρουασάν σκέτο", price:2.80},
  {cat:"snack", name:"Κρουασάν σοκολάτα", price:3.20},
  {cat:"snack", name:"Μάφιν", price:3.50},
  {cat:"snack", name:"Κέικ (κομμάτι)", price:4.20},
  {cat:"snack", name:"Cheesecake", price:4.80},
  {cat:"snack", name:"Μπισκότα", price:2.50},
  {cat:"snack", name:"Τοστ ζαμπόν-τυρί", price:4.50},
  {cat:"snack", name:"Τοστ vegetarian", price:4.80},

  {cat:"beer", name:"Μπύρα βαρελίσια (0,5l)", price:5.20},
  {cat:"beer", name:"Μπύρα εμφιαλωμένη (0,33l)", price:4.20},
  {cat:"beer", name:"Weissbier (0,5l)", price:5.50},
  {cat:"beer", name:"Μπύρα χωρίς αλκοόλ", price:4.20},

  {cat:"wine", name:"Κρασί ποτήρι", price:5.50},
  {cat:"wine", name:"Κρασί καράφα (0,5l)", price:12.00},
  {cat:"wine", name:"Φιάλη κρασί (από)", price:22.00},
  {cat:"wine", name:"Prosecco ποτήρι", price:6.50},

  {cat:"spirit", name:"Ουίσκι standard", price:8.50},
  {cat:"spirit", name:"Premium ουίσκι", price:10.50},
  {cat:"spirit", name:"Βότκα", price:8.00},
  {cat:"spirit", name:"Ρούμι", price:8.50},
  {cat:"spirit", name:"Τζιν", price:8.50},
  {cat:"spirit", name:"Ούζο / Τσίπουρο", price:7.50},
  {cat:"spirit", name:"Λικέρ", price:7.50},

  {cat:"cocktail", name:"Mojito", price:9.50},
  {cat:"cocktail", name:"Caipirinha", price:9.50},
  {cat:"cocktail", name:"Margarita", price:10.00},
  {cat:"cocktail", name:"Aperol Spritz", price:8.50},
  {cat:"cocktail", name:"Gin Tonic", price:9.00},
  {cat:"cocktail", name:"Negroni", price:10.50},
];

/* ===================== HELPERS ===================== */
const $ = (id)=>document.getElementById(id);
const fmt = (n)=> (n||0).toLocaleString("el-GR",{minimumFractionDigits:2,maximumFractionDigits:2})+" €";
const uid = ()=> Math.random().toString(36).slice(2)+Date.now().toString(36);
function load(key, fallback){ try{ const raw=localStorage.getItem(key); return raw?JSON.parse(raw):fallback; } catch{ return fallback; } }
function save(key,val){ localStorage.setItem(key, JSON.stringify(val)); }
function toast(t,s){
  $("toastT").textContent=t; $("toastS").textContent=s;
  $("toast").classList.add("show");
  setTimeout(()=>$("toast").classList.remove("show"), 2100);
}
function vibrate(ms){ try{ if(navigator.vibrate) navigator.vibrate(ms);}catch{} }
async function sha256Hex(str){
  const enc=new TextEncoder().encode(str);
  const buf=await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
}
function isPin(p){ return /^\d{4}$/.test(p||""); }

/* ===================== NAV (clean windows) ===================== */
let view="home";
function showView(v){
  view=v;
  $("viewHome").classList.toggle("show", v==="home");
  $("viewTables").classList.toggle("show", v==="tables");
  $("viewTicket").classList.toggle("show", v==="ticket");
  $("ticketBar").classList.toggle("show", v==="ticket"); // bottom bar only in Ticket
}

/* ===================== PIN MODAL (numeric keyboard) ===================== */
let pinResolve = null;
function pinOpen({title="PIN", sub="", cancelText="Άκυρο", okText="ΟΚ"} = {}){
  $("pinTitle").textContent = title;
  $("pinSub").textContent = sub || "";
  $("pinCancel").textContent = cancelText;
  $("pinOk").textContent = okText;
  $("pinInput").value = "";
  $("pinOv").classList.add("show");
  setTimeout(()=>{ $("pinInput").focus(); }, 50);
  return new Promise((resolve)=>{ pinResolve = resolve; });
}
function pinClose(result){
  $("pinOv").classList.remove("show");
  const r = pinResolve;
  pinResolve = null;
  if(r) r(result);
}
$("pinCancel").onclick = ()=> pinClose(null);
$("pinOk").onclick = ()=> pinClose(($("pinInput").value||"").trim());
$("pinInput").addEventListener("keydown",(e)=>{ if(e.key==="Enter") pinClose(($("pinInput").value||"").trim()); });

/* ===================== SCREENSAVER + IDLE ===================== */
function getShopName(){ return load(LS_SHOP,null)?.name || "Το Μαγαζί"; }
function showScreensaver(){
  $("ssLogo").textContent = getShopName();
  $("ssUser").textContent = `Εν υπηρεσία: ${getActiveUser().name}`;
  $("ss").classList.add("show");
}
function hideScreensaver(){ $("ss").classList.remove("show"); }
$("ss").addEventListener("click", ()=>{ hideScreensaver(); resetIdleTimers(); });

let idleTimerHome=null;
let idleTimerSS=null;
function closeAllOverlays(){
  ["settingsOv","summaryOv","userOv","payOv","qpayOv","pinOv"].forEach(id=>$(id).classList.remove("show"));
}
function goHome(){
  closeAllOverlays();
  showView("home");
  renderAll();
}
function resetIdleTimers(){
  hideScreensaver();
  if(idleTimerHome) clearTimeout(idleTimerHome);
  if(idleTimerSS) clearTimeout(idleTimerSS);
  idleTimerHome = setTimeout(()=>{ goHome(); }, IDLE_HOME_MS);
  idleTimerSS = setTimeout(()=>{ showScreensaver(); }, IDLE_HOME_MS + IDLE_SCREENSAVER_EXTRA);
}
["click","touchstart","scroll","keydown","input"].forEach(ev=>{
  document.addEventListener(ev, resetIdleTimers, {capture:true, passive:true});
});
resetIdleTimers();

/* ===================== USERS ===================== */
function ensureUsers(){
  let users=load(LS_USERS,null);
  if(!users || !Array.isArray(users) || users.length===0){
    users=[{id:uid(), name:"Χρήστης 1", pinHash:null}];
    save(LS_USERS, users);
    save(LS_ACTIVE, users[0].id);
  }
  return users;
}
function getActiveUserId(){
  const users=ensureUsers();
  const a=load(LS_ACTIVE,null);
  if(a && users.some(u=>u.id===a)) return a;
  save(LS_ACTIVE, users[0].id);
  return users[0].id;
}
function getActiveUser(){
  const users=ensureUsers();
  return users.find(u=>u.id===getActiveUserId()) || users[0];
}
async function requireUserPinIfExists(user, reason){
  if(!user.pinHash) return true;
  const pin = await pinOpen({
    title: "🔒 PIN",
    sub: `PIN απαιτείται (${reason}).\nΓράψε 4 ψηφία.`,
    cancelText: "Άκυρο",
    okText: "ΟΚ"
  });
  if(!pin) return false;
  if(!isPin(pin)){ alert("Άκυρο PIN."); return false; }
  const h=await sha256Hex(pin);
  if(h!==user.pinHash){ alert("Λάθος PIN."); return false; }
  return true;
}
async function changeUser(newId){
  const users=ensureUsers();
  const u=users.find(x=>x.id===newId);
  if(!u) return;
  const ok=await requireUserPinIfExists(u, "Αλλαγή χρήστη");
  if(!ok){ $("userSelect").value=getActiveUserId(); return; }
  save(LS_ACTIVE, u.id);
  renderAll();
}

/* ===================== ADMIN PIN ===================== */
async function ensureAdminPin(){
  let h = localStorage.getItem(LS_ADMIN_HASH);
  if(h) return h;

  alert("Πρώτη φορά: Όρισε Admin PIN (4 ψηφία).");
  const p1 = await pinOpen({title:"Admin PIN", sub:"Γράψε 4 ψηφία για Admin PIN", cancelText:"Άκυρο", okText:"Συνέχεια"});
  if(!p1) return null;
  if(!isPin(p1)){ alert("Άκυρο PIN."); return null; }
  const p2 = await pinOpen({title:"Admin PIN", sub:"Ξανά Admin PIN (επιβεβαίωση)", cancelText:"Άκυρο", okText:"Αποθήκευση"});
  if(!p2) return null;
  if(p2!==p1){ alert("Δεν ταιριάζουν."); return null; }

  h = await sha256Hex(p1);
  localStorage.setItem(LS_ADMIN_HASH, h);
  return h;
}
async function verifyAdminPin(reason){
  const h = localStorage.getItem(LS_ADMIN_HASH) || await ensureAdminPin();
  if(!h) return false;
  const p = await pinOpen({title:"Admin PIN", sub:`Admin PIN απαιτείται (${reason}).`, cancelText:"Άκυρο", okText:"ΟΚ"});
  if(!p) return false;
  if(!isPin(p)) return false;
  const ph = await sha256Hex(p);
  if(ph!==h){ alert("Λάθος Admin PIN."); return false; }
  return true;
}
function setShopName(name){ save(LS_SHOP,{name}); }

/* ===================== DB ===================== */
function ensureDB(){
  const db=load(LS_DB, {days:{}});
  if(!db.days[TODAY]){
    db.days[TODAY]={
      meta:{ day:TODAY, activeTable:"T1", activeCat:"coffee", showOnlyOpen:true },
      tables:{},
      payments:[],
      undo:[]
    };
    for(const t of TABLES) db.days[TODAY].tables[t]={lines:[]};
    save(LS_DB, db);
  } else {
    for(const t of TABLES){
      if(!db.days[TODAY].tables[t]) db.days[TODAY].tables[t]={lines:[]};
      if(!Array.isArray(db.days[TODAY].tables[t].lines)) db.days[TODAY].tables[t].lines=[];
    }
    if(!Array.isArray(db.days[TODAY].payments)) db.days[TODAY].payments=[];
    if(!Array.isArray(db.days[TODAY].undo)) db.days[TODAY].undo=[];
    if(!db.days[TODAY].meta.activeCat) db.days[TODAY].meta.activeCat="coffee";
    if(typeof db.days[TODAY].meta.showOnlyOpen!=="boolean") db.days[TODAY].meta.showOnlyOpen=true;
  }
  return db;
}
function getLines(db, table){ return db.days[TODAY].tables[table].lines; }
function openLines(lines){ return lines.filter(x=>!x.paid); }
function sumOpen(db, t){ return openLines(getLines(db,t)).reduce((s,x)=>s+x.price,0); }
function cntOpen(db, t){ return openLines(getLines(db,t)).length; }
function dayStats(db){
  let openTables=0, openItems=0;
  for(const t of TABLES){
    const c=cntOpen(db,t);
    if(c>0) openTables++;
    openItems+=c;
  }
  const paidTotal=db.days[TODAY].payments.reduce((s,p)=>s+p.total,0);
  const cash=db.days[TODAY].payments.filter(p=>p.method==="cash").reduce((s,p)=>s+p.total,0);
  const card=db.days[TODAY].payments.filter(p=>p.method==="card").reduce((s,p)=>s+p.total,0);
  const free=db.days[TODAY].payments.filter(p=>p.method==="free").reduce((s,p)=>s+p.total,0);
  return {openTables, openItems, paidTotal, cash, card, free};
}

/* ===================== FAVORITES (Top8) ===================== */
function loadFavs(){ return load(LS_FAVS,{day:TODAY, counts:{}}); }
function saveFavs(f){ save(LS_FAVS,f); }
function bumpFav(name){
  let f=loadFavs();
  if(f.day!==TODAY) f={day:TODAY, counts:{}};
  f.counts[name]=(f.counts[name]||0)+1;
  saveFavs(f);
}
function top8(){
  const f=loadFavs();
  const counts = (f.day===TODAY)? f.counts : {};
  const names = Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0]);
  const arr = names.map(n=>PRODUCTS.find(p=>p.name===n)).filter(Boolean);
  for(const p of PRODUCTS){
    if(arr.length>=8) break;
    if(!arr.some(x=>x.name===p.name) && p.cat!=="extras") arr.push(p);
  }
  return arr.slice(0,8);
}

/* ===================== GROUP OPEN BY PRODUCT ===================== */
function groupOpen(lines){
  const map=new Map();
  for(const l of lines){
    if(l.paid) continue;
    const k=l.name+"||"+l.price.toFixed(2);
    if(!map.has(k)) map.set(k,{name:l.name, price:l.price, ids:[], lastAt:0});
    const g=map.get(k);
    g.ids.push(l.id);
    g.lastAt=Math.max(g.lastAt, l.at||0);
  }
  return [...map.values()].sort((a,b)=>b.lastAt-a.lastAt);
}

/* ===================== ADD/REMOVE ===================== */
function addItem(name, price){
  const db=ensureDB();
  const t=db.days[TODAY].meta.activeTable;
  const line={id:uid(), name, price, at:Date.now(), by:getActiveUser().name, paid:null};
  db.days[TODAY].tables[t].lines.push(line);
  bumpFav(name);
  db.days[TODAY].undo.unshift({type:"add", table:t, line});
  db.days[TODAY].undo=db.days[TODAY].undo.slice(0,25);
  save(LS_DB, db);
}
function removeOne(name, price){
  const db=ensureDB();
  const t=db.days[TODAY].meta.activeTable;
  const lines=db.days[TODAY].tables[t].lines;
  const idx=lines.findIndex(x=>!x.paid && x.name===name && x.price===price);
  if(idx>=0){
    const removed=lines.splice(idx,1)[0];
    db.days[TODAY].undo.unshift({type:"remove", table:t, line:removed});
    db.days[TODAY].undo=db.days[TODAY].undo.slice(0,25);
    save(LS_DB, db);
  }
}
function undo(){
  const db=ensureDB();
  const a=db.days[TODAY].undo.shift();
  if(!a){ toast("Undo","Δεν υπάρχει κάτι."); return; }
  if(a.type==="add"){
    const lines=db.days[TODAY].tables[a.table].lines;
    const i=lines.findIndex(x=>x.id===a.line.id);
    if(i>=0) lines.splice(i,1);
    toast("Undo","Αφαιρέθηκε item.");
  } else if(a.type==="remove"){
    db.days[TODAY].tables[a.table].lines.push(a.line);
    toast("Undo","Επαναφέρθηκε item.");
  } else if(a.type==="pay"){
    const lines=db.days[TODAY].tables[a.table].lines;
    for(const l of lines) if(a.itemIds.includes(l.id)) l.paid=null;
    db.days[TODAY].payments=db.days[TODAY].payments.filter(p=>p.id!==a.paymentId);
    toast("Undo","Αναιρέθηκε πληρωμή.");
  }
  save(LS_DB, db);
  renderAll();
}

/* ===================== PAY (Split + QuickPay) ===================== */
const payState={ ids:new Set() };

function openPay(){
  payState.ids=new Set();
  renderPayList();
  $("payOv").classList.add("show");
}
function closePay(){ $("payOv").classList.remove("show"); }

function renderPayList(){
  const db=ensureDB();
  const t=db.days[TODAY].meta.activeTable;
  const open=openLines(getLines(db,t));
  $("payTitle").textContent = `Πληρωμή — ${t} • Υπόλοιπο ${fmt(sumOpen(db,t))}`;
  const box=$("payList");
  box.innerHTML="";
  for(const l of open){
    const r=document.createElement("div");
    r.style.borderBottom="1px solid rgba(255,255,255,.06)";
    r.style.padding="10px 4px";
    r.style.display="flex";
    r.style.alignItems="center";
    r.style.justifyContent="space-between";
    r.style.gap="10px";
    r.innerHTML=`
      <div style="min-width:0;">
        <div style="font-weight:1000;line-height:1.15;">${l.name}</div>
        <div style="color:var(--muted);font-size:12.5px;line-height:1.2;">${l.by} • ${new Date(l.at).toLocaleTimeString("el-GR",{hour:"2-digit",minute:"2-digit"})}</div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex:0 0 auto;">
        <span class="badge">${fmt(l.price)}</span>
        <input type="checkbox" style="width:22px;height:22px;accent-color:var(--accent)" />
      </div>
    `;
    const cb=r.querySelector("input");
    cb.checked=payState.ids.has(l.id);
    cb.onchange=()=>{ cb.checked ? payState.ids.add(l.id) : payState.ids.delete(l.id); updatePayTotal(); };
    r.onclick=(e)=>{ if(e.target.tagName.toLowerCase()==="input") return; cb.checked=!cb.checked; cb.dispatchEvent(new Event("change")); };
    box.appendChild(r);
  }
  updatePayTotal();
}
function updatePayTotal(){
  const db=ensureDB();
  const t=db.days[TODAY].meta.activeTable;
  const open=openLines(getLines(db,t));
  const sel=open.filter(x=>payState.ids.has(x.id));
  const total=sel.reduce((s,x)=>s+x.price,0);
  $("payTotal").textContent = `Τελικό: ${fmt(total)} (${sel.length} items)`;
}
function selectAllPay(){
  const db=ensureDB();
  const t=db.days[TODAY].meta.activeTable;
  const open=openLines(getLines(db,t));
  if(payState.ids.size===open.length) payState.ids=new Set();
  else payState.ids=new Set(open.map(x=>x.id));
  renderPayList();
}
function confirmPaymentIfNeeded(method,total,count){
  if(method==="free") return confirm(`Επιβεβαίωση ΚΕΡΑΣΜΕΝΑ\nItems: ${count}\nΣύνολο: ${fmt(total)}\nΝα καταχωρηθεί;`);
  if(total>=15 || count>=3) return confirm(`Επιβεβαίωση πληρωμής\nItems: ${count}\nΣύνολο: ${fmt(total)}\nΝα καταχωρηθεί;`);
  return true;
}
function payIds(table, ids, method, fromQuick=false){
  const db=ensureDB();
  const lines=getLines(db,table);
  const now=Date.now();
  const user=getActiveUser().name;

  let total=0;
  const realIds=[];
  for(const l of lines){
    if(ids.includes(l.id) && !l.paid){
      total+=l.price;
      realIds.push(l.id);
    }
  }
  if(realIds.length===0) return;

  if(!confirmPaymentIfNeeded(method,total,realIds.length)) return;

  for(const l of lines) if(realIds.includes(l.id)) l.paid={method, at:now, by:user};

  const pid=uid();
  db.days[TODAY].payments.push({id:pid, at:now, table, user, method, total, itemIds:realIds});
  db.days[TODAY].undo.unshift({type:"pay", paymentId:pid, table, itemIds:realIds});
  db.days[TODAY].undo=db.days[TODAY].undo.slice(0,25);

  save(LS_DB, db);

  if(!fromQuick){
    closePay();
    goHome(); // μετά την πληρωμή -> Home
  } else {
    if(cntOpen(db, table)===0) goHome();
  }
}
function doPay(method){
  const db=ensureDB();
  const t=db.days[TODAY].meta.activeTable;
  const open=openLines(getLines(db,t));
  const sel=open.filter(x=>payState.ids.has(x.id));
  if(sel.length===0){ alert("Διάλεξε items."); return; }
  payIds(t, sel.map(x=>x.id), method, false);
  toast("✅ Πληρωμή", `${t} — ${fmt(sel.reduce((s,x)=>s+x.price,0))}`);
  renderAll();
}

/* Quick pay */
function openQuickPay(table, g, method){
  const label = method==="cash"?"💶 Μετρητά":method==="card"?"💳 Κάρτα":"🎁 Κερασμένα";
  $("qpayTitle").textContent = `${label} — ${g.name}`;
  $("qpaySub").textContent = `Διαθέσιμα: ${g.ids.length} × ${fmt(g.price)}. Διάλεξε πόσα να κλείσουν τώρα.`;

  const box=$("qpayBtns");
  box.innerHTML="";
  const max=g.ids.length;
  const opts = max<=8 ? Array.from({length:max},(_,i)=>i+1) : [1,2,3,4,5,max];
  for(const n of opts){
    const b=document.createElement("button");
    b.className="sheetbtn";
    b.textContent = `${n}`;
    b.onclick=()=>{ payIds(table, g.ids.slice(0,n), method, true); $("qpayOv").classList.remove("show"); renderAll(); };
    box.appendChild(b);
  }
  $("qpayOv").classList.add("show");
}

/* ===================== SUMMARY ===================== */
function paymentsByUser(db){
  const users=ensureUsers();
  const map={};
  for(const u of users) map[u.name]={cash:0,card:0,free:0,count:0,total:0};
  for(const p of db.days[TODAY].payments){
    if(!map[p.user]) map[p.user]={cash:0,card:0,free:0,count:0,total:0};
    map[p.user][p.method]+=p.total;
    map[p.user].count+=1;
    map[p.user].total+=p.total;
  }
  return Object.entries(map).map(([name,v])=>({name,...v})).sort((a,b)=>b.total-a.total);
}
function