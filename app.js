(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const fmt = (n) => (Number(n || 0)).toFixed(2).replace(".", ",") + " €";
  const nowISO = () => new Date().toISOString();
  const todayKey = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${yy}-${mm}-${dd}`;
  };
  const todayHuman = () => {
    const d = new Date();
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  };
  const uid = () => Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
  const EPS = 0.005;

  const LS_KEY = "mini-cashier-db-v3";

  const defaultDB = () => ({
    storeName: "Το Μαγαζί Μου",
    ownerPin: "1234",
    currentUserId: null,
    users: [
      { id: uid(), name: "Χρήστης 1", pin: "1111" },
      { id: uid(), name: "Χρήστης 2", pin: "2222" },
    ],
    tables: ["T1","T2","T3","T4","T5","T6","BAR","ΕΞΩ"],
    days: {},
    undo: null
  });

  const loadDB = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultDB();
      const db = JSON.parse(raw);
      if (!db.storeName) db.storeName = "Το Μαγαζί Μου";
      if (!db.ownerPin) db.ownerPin = "1234";
      if (!Array.isArray(db.users) || db.users.length === 0) db.users = defaultDB().users;
      if (!db.currentUserId) db.currentUserId = db.users[0]?.id || null;
      if (!Array.isArray(db.tables) || db.tables.length === 0) db.tables = defaultDB().tables;
      if (!db.days) db.days = {};
      if (!("undo" in db)) db.undo = null;
      return db;
    } catch {
      return defaultDB();
    }
  };
  const saveDB = (db) => localStorage.setItem(LS_KEY, JSON.stringify(db));

  const ensureDay = (db) => {
    const k = todayKey();
    if (!db.days[k]) {
      db.days[k] = { tickets: {}, stats: { productQty: {}, cash:0, card:0, comp:0 } };
    }
    return k;
  };
  const getDay = (db) => db.days[ensureDay(db)];

  const MENU = [
    { cat:"ΚΑΦΕΔΕΣ – ΖΕΣΤΟΙ", items:[
      ["Espresso μονός", 2.60], ["Espresso διπλός", 3.20], ["Espresso macchiato", 2.90],
      ["Americano", 3.20], ["Cappuccino", 3.60], ["Cappuccino διπλός", 4.20],
      ["Latte macchiato", 4.20], ["Flat white", 4.40], ["Mocha", 4.50],
      ["Καφές φίλτρου", 3.00], ["Decaf (+)", 0.30],
    ]},
    { cat:"ΚΑΦΕΔΕΣ – ΚΡΥΟΙ", items:[
      ["Freddo espresso", 3.80], ["Freddo cappuccino", 4.20], ["Iced latte", 4.50],
      ["Cold brew", 4.80], ["Frappe", 3.50],
    ]},
    { cat:"ΤΣΑΪ – ΖΕΣΤΑ ΡΟΦΗΜΑΤΑ", items:[
      ["Τσάι (μαύρο/πράσινο/βότανα)", 3.20], ["Τσάι φρούτων", 3.50], ["Chai latte", 4.30],
    ]},
    { cat:"ΣΟΚΟΛΑΤΕΣ – ΓΑΛΑΚΤΕΡΑ", items:[
      ["Ζεστή σοκολάτα", 4.20], ["Κρύα σοκολάτα", 4.50], ["Λευκή σοκολάτα", 4.50],
      ["Κακάο", 4.00], ["Φυτικό γάλα (+)", 0.50],
    ]},
    { cat:"ΑΝΑΨΥΚΤΙΚΑ – ΝΕΡΑ", items:[
      ["Coca-Cola / Zero / Fanta (0,33l)", 3.40], ["Ice Tea", 3.60], ["Σόδα / Τόνικ", 3.20],
      ["Μεταλλικό νερό (0,33l)", 2.80], ["Μεταλλικό νερό (0,75l)", 5.50],
    ]},
    { cat:"ΧΥΜΟΙ – SMOOTHIES", items:[
      ["Φυσικός χυμός πορτοκάλι", 4.50], ["Χυμός ανάμεικτος", 4.80],
      ["Smoothie φρούτων", 5.80], ["Milkshake", 5.50],
    ]},
    { cat:"ΣΝΑΚ – ΓΛΥΚΑ", items:[
      ["Κρουασάν σκέτο", 2.80], ["Κρουασάν σοκολάτα", 3.20], ["Μάφιν", 3.50],
      ["Κέικ (κομμάτι)", 4.20], ["Cheesecake", 4.80], ["Μπισκότα", 2.50],
      ["Τοστ ζαμπόν-τυρί", 4.50], ["Τοστ vegetarian", 4.80],
    ]},
    { cat:"ΜΠΥΡΕΣ", items:[
      ["Μπύρα βαρελίσια (0,5l)", 5.20], ["Μπύρα εμφιαλωμένη (0,33l)", 4.20],
      ["Weissbier (0,5l)", 5.50], ["Μπύρα χωρίς αλκοόλ", 4.20],
    ]},
    { cat:"ΚΡΑΣΙΑ", items:[
      ["Κρασί ποτήρι", 5.50], ["Κρασί καράφα (0,5l)", 12.00], ["Φιάλη κρασί", 22.00],
      ["Prosecco ποτήρι", 6.50],
    ]},
    { cat:"ΠΟΤΑ (4cl)", items:[
      ["Ουίσκι standard", 8.50], ["Premium ουίσκι", 10.50], ["Βότκα", 8.00],
      ["Ρούμι", 8.50], ["Τζιν", 8.50], ["Ούζο / Τσίπουρο", 7.50], ["Λικέρ", 7.50],
    ]},
    { cat:"ΚΟΚΤΕΪΛ", items:[
      ["Mojito", 9.50], ["Caipirinha", 9.50], ["Margarita", 10.00],
      ["Aperol Spritz", 8.50], ["Gin Tonic", 9.00], ["Negroni", 10.50],
    ]},
  ];

  const buildCatalog = () => {
    const cats = MENU.map(m => m.cat);
    const products = [];
    MENU.forEach(m => m.items.forEach(([name, price]) => {
      products.push({ id:`${m.cat}::${name}`, cat:m.cat, name, price:Number(price) });
    }));
    return { cats, products };
  };
  const CATALOG = buildCatalog();

  const ticketKey = (tableId, userId) => `${tableId}::${userId}`;

  const getTicket = (db, tableId, userId) => {
    const day = getDay(db);
    return day.tickets[ticketKey(tableId, userId)] || null;
  };

  const getOrCreateTicket = (db, tableId) => {
    const day = getDay(db);
    const key = ticketKey(tableId, db.currentUserId);
    if (!day.tickets[key]) {
      day.tickets[key] = { id: uid(), table: tableId, userId: db.currentUserId, openedAt: nowISO(), items: [] };
    }
    return day.tickets[key];
  };

  // ✅ Τώρα το ticket κρατά ΜΟΝΟ απλήρωτα (qty = unpaid)
  const ticketUnpaidTotal = (ticket) => {
    let unpaid = 0;
    for (const it of ticket.items) unpaid += it.qty * it.price;
    return unpaid;
  };

  const addProductToTicket = (ticket, product) => {
    const found = ticket.items.find(it => it.productId === product.id);
    if (found) { found.qty += 1; return; }
    ticket.items.push({
      id: uid(),
      productId: product.id,
      name: product.name,
      cat: product.cat,
      price: product.price,
      qty: 1
    });
  };

  // ✅ Πληρωμή 1 τεμ: μειώνει qty, αν 0 → σβήνει γραμμή, αν άδειο ticket → σβήνει ticket
  const payOneUnit = (db, ticket, itemId, method) => {
    const day = getDay(db);
    const it = ticket.items.find(x => x.id === itemId);
    if (!it) return;
    if (it.qty <= 0) return;

    // Undo
    db.undo = { type:"payOne", table: ticket.table, userId: ticket.userId, itemId, method, price: it.price, when: nowISO() };

    // stats
    if (method === "cash") day.stats.cash += it.price;
    if (method === "card") day.stats.card += it.price;
    if (method === "comp") day.stats.comp += it.price;

    // remove from unpaid list
    it.qty -= 1;
    if (it.qty <= 0) ticket.items = ticket.items.filter(x => x.id !== itemId);

    // if ticket empty -> delete ticket
    if (ticket.items.length === 0) {
      delete day.tickets[ticketKey(ticket.table, ticket.userId)];
    }

    saveDB(db);
  };

  const undoLast = (db) => {
    const u = db.undo;
    if (!u) return false;
    const day = getDay(db);

    if (u.type === "payOne") {
      const key = ticketKey(u.table, u.userId);
      let t = day.tickets[key];
      if (!t) {
        // recreate ticket if it was deleted
        t = { id: uid(), table: u.table, userId: u.userId, openedAt: nowISO(), items: [] };
        day.tickets[key] = t;
      }
      // find item
      let it = t.items.find(x => x.id === u.itemId);
      if (!it) {
        // if item removed, bring it back as qty=1 with price saved; name unknown -> best effort
        it = { id: u.itemId, productId:"", name:"(Undo item)", cat:"", price: u.price, qty: 0 };
        t.items.push(it);
      }
      it.qty += 1;

      // revert stats
      if (u.method === "cash") day.stats.cash -= u.price;
      if (u.method === "card") day.stats.card -= u.price;
      if (u.method === "comp") day.stats.comp -= u.price;

      db.undo = null;
      saveDB(db);
      return true;
    }

    if (u.type === "addProduct") {
      const key = ticketKey(u.table, u.userId);
      const t = day.tickets[key];
      if (!t) { db.undo=null; saveDB(db); return false; }
      const it = t.items.find(x => x.productId === u.productId);
      if (!it) { db.undo=null; saveDB(db); return false; }
      if (it.qty > 1) it.qty -= 1;
      else t.items = t.items.filter(x => x !== it);

      if (t.items.length === 0) delete day.tickets[key];
      if (day.stats.productQty[u.productId]) day.stats.productQty[u.productId] = Math.max(0, day.stats.productQty[u.productId] - 1);

      db.undo = null;
      saveDB(db);
      return true;
    }

    return false;
  };

  // UI
  let db = loadDB();
  ensureDay(db);
  if (!db.currentUserId) db.currentUserId = db.users[0]?.id || null;
  saveDB(db);

  let view = "home";
  let activeTable = null;
  let activeCategory = CATALOG.cats[0];
  let searchText = "";

  const currentUser = () => db.users.find(u => u.id === db.currentUserId) || db.users[0];

  const escapeHtml = (s) => String(s||"")
    .replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")
    .replaceAll('"',"&quot;").replaceAll("'","&#039;");

  const overlay = $("overlay");
  const modalTitle = $("modalTitle");
  const modalBody = $("modalBody");
  const closeModal = () => overlay.classList.remove("on");
  $("modalClose").addEventListener("click", closeModal);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModal(); });

  const showModal = (title, bodyHTML) => {
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;
    overlay.classList.add("on");
  };

  let toastTimer = null;
  const toast = (msg) => {
    clearTimeout(toastTimer);
    const id = "miniToast";
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement("div");
      el.id = id;
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "92px";
      el.style.transform = "translateX(-50%)";
      el.style.padding = "10px 14px";
      el.style.borderRadius = "14px";
      el.style.background = "rgba(0,0,0,.65)";
      el.style.border = "1px solid rgba(255,255,255,.12)";
      el.style.color = "white";
      el.style.fontWeight = "750";
      el.style.zIndex = "99";
      el.style.maxWidth = "92vw";
      el.style.textAlign = "center";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.display = "block";
    toastTimer = setTimeout(() => { el.style.display = "none"; }, 1600);
  };

  const confirmBox = (title, text, onYes) => {
    showModal(title, `
      <div class="field"><div class="label">${escapeHtml(text)}</div></div>
      <div class="row2" style="margin-top:12px">
        <button class="btn ghost" id="mNo">Άκυρο</button>
        <button class="btn ok" id="mYes">Ναι</button>
      </div>
    `);
    $("mNo").onclick = closeModal;
    $("mYes").onclick = () => { closeModal(); onYes?.(); };
  };

  const askPin = (title, label, correctPin, onOk) => {
    showModal(title, `
      <div class="field">
        <div class="label">${escapeHtml(label)}</div>
        <input id="pinIn" inputmode="numeric" pattern="[0-9]*" type="password" placeholder="PIN" />
      </div>
      <div class="row2">
        <button class="btn ghost" id="pCancel">Άκυρο</button>
        <button class="btn primary" id="pOk">ΟΚ</button>
      </div>
    `);
    $("pinIn").focus();
    $("pCancel").onclick = closeModal;
    $("pOk").onclick = () => {
      const v = $("pinIn").value.trim();
      if (v !== String(correctPin)) return toast("Λάθος PIN");
      closeModal();
      onOk?.();
    };
  };

  const setView = (v) => {
    view = v;
    ["home","tables","order","open","summary","fav"].forEach(x => {
      document.querySelector(`[data-view="${x}"]`)?.classList.toggle("on", x === v);
    });
    render();
  };

  const renderTop = () => {
    $("storeName").textContent = db.storeName || "Το Μαγαζί Μου";
    $("storeSub").textContent = `Σήμερα: ${todayHuman()} · Χρήστης: ${currentUser()?.name || "—"}`;
    $("userSelect").innerHTML = db.users.map(u2 =>
      `<option value="${u2.id}" ${u2.id===db.currentUserId?"selected":""}>${escapeHtml(u2.name)}</option>`
    ).join("");
  };

  const renderHome = () => {
    const day = getDay(db);
    const openKeys = Object.keys(day.tickets).filter(k => {
      const t = day.tickets[k];
      return t && t.items && t.items.length > 0 && ticketUnpaidTotal(t) > EPS;
    });
    $("openCount").textContent = openKeys.length;
  };

  const renderTables = () => {
    const day = getDay(db);
    const grid = $("tablesGrid");
    grid.innerHTML = "";

    for (const tname of db.tables) {
      const t = getTicket(db, tname, db.currentUserId);
      const unpaid = t ? ticketUnpaidTotal(t) : 0;
      const isOpen = unpaid > EPS;

      const el = document.createElement("div");
      el.className = "tablebtn" + (activeTable===tname ? " active" : "");
      el.innerHTML = `
        <div class="tname">${escapeHtml(tname)}</div>
        <div class="tmeta">
          <span class="badge"><span class="dot ${isOpen?"open":"paid"}"></span>${isOpen?"Ανοιχτό":"Κλειστό"}</span>
          · <strong>${fmt(unpaid)}</strong>
        </div>
      `;
      el.addEventListener("click", () => { activeTable = tname; setView("order"); });
      grid.appendChild(el);
    }
  };

  const renderCatChips = () => {
    const wrap = $("catChips");
    wrap.innerHTML = "";
    CATALOG.cats.forEach(cat => {
      const b = document.createElement("div");
      b.className = "chipcat" + (cat===activeCategory ? " on" : "");
      b.textContent = cat;
      b.addEventListener("click", () => { activeCategory = cat; renderCatChips(); renderProducts(); });
      wrap.appendChild(b);
    });
  };

  const renderOpenItems = () => {
    const list = $("openItemsList");
    list.innerHTML = "";
    if (!activeTable) return;

    const t = getTicket(db, activeTable, db.currentUserId);
    const unpaid = t ? ticketUnpaidTotal(t) : 0;

    $("orderTitle").textContent = `Τραπέζι: ${activeTable}`;
    $("ticketUnpaid").textContent = fmt(unpaid);

    if (!t || t.items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "row";
      empty.innerHTML = `<div class="main"><div class="title">Δεν έχει προϊόντα ακόμα</div><div class="sub">Διάλεξε κατηγορία και πάτα προϊόν.</div></div>`;
      list.appendChild(empty);
      return;
    }

    t.items.forEach(it => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <div class="main">
          <div class="title">${escapeHtml(it.name)}</div>
          <div class="sub">${escapeHtml(it.cat)} · ${fmt(it.price)} · Υπόλοιπο: ${it.qty}</div>
          <div class="paychips">
            <span class="chip ok" data-pay="cash">Μετ +1</span>
            <span class="chip accent" data-pay="card">Κάρ +1</span>
            <span class="chip warn" data-pay="comp">Κερ +1</span>
          </div>
        </div>

        <div class="qtybox">
          <div class="mini" data-minus="1">−</div>
          <div class="qnum">${it.qty}</div>
          <div class="mini" data-plus="1">+</div>
        </div>
      `;

      row.querySelector('[data-plus]')?.addEventListener("click", () => {
        it.qty += 1;
        saveDB(db);
        renderOpenItems();
      });

      row.querySelector('[data-minus]')?.addEventListener("click", () => {
        if (it.qty <= 1) {
          confirmBox("Αφαίρεση προϊόντος", `Να αφαιρεθεί το “${it.name}”;`, () => {
            const key = ticketKey(activeTable, db.currentUserId);
            const day = getDay(db);
            const ticket = day.tickets[key];
            ticket.items = ticket.items.filter(x=>x.id!==it.id);
            if (ticket.items.length === 0) delete day.tickets[key];
            saveDB(db);
            renderOpenItems();
          });
          return;
        }
        it.qty -= 1;
        saveDB(db);
        renderOpenItems();
      });

      row.querySelectorAll("[data-pay]").forEach(ch => {
        ch.addEventListener("click", () => {
          const method = ch.getAttribute("data-pay");
          const methodName = method==="cash"?"Μετρητά":method==="card"?"Κάρτα":"Κερασμένο";
          confirmBox("Επιβεβαίωση πληρωμής", `Να πληρωθεί 1 τεμ. “${it.name}” ως ${methodName};`, () => {
            const key = ticketKey(activeTable, db.currentUserId);
            const day = getDay(db);
            const ticket = day.tickets[key];
            if (!ticket) return;

            payOneUnit(db, ticket, it.id, method);

            // μετά την πληρωμή ξαναδιάβασε ticket (μπορεί να σβήστηκε)
            const t2 = getTicket(db, activeTable, db.currentUserId);
            const unpaid2 = t2 ? ticketUnpaidTotal(t2) : 0;

            renderOpenItems();

            // ✅ Αν έκλεισε (0) → πήγαινε στα τραπέζια
            if (unpaid2 <= EPS) {
              activeTable = null;
              setView("tables");
            }
          });
        });
      });

      list.appendChild(row);
    });
  };

  const renderProducts = () => {
    const list = $("productList");
    list.innerHTML = "";

    let prods = CATALOG.products.filter(p => p.cat === activeCategory);
    const q = (searchText || "").trim().toLowerCase();
    if (q) prods = prods.filter(p => p.name.toLowerCase().includes(q));

    prods.forEach(p => {
      const row = document.createElement("div");
      row.className = "row";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div class="main">
          <div class="title">${escapeHtml(p.name)}</div>
          <div class="sub">${escapeHtml(p.cat)}</div>
        </div>
        <div class="price">${fmt(p.price)}</div>
      `;
      row.addEventListener("click", () => {
        if (!activeTable) { toast("Διάλεξε πρώτα τραπέζι."); setView("tables"); return; }

        const ticket = getOrCreateTicket(db, activeTable);
        addProductToTicket(ticket, p);

        const day = getDay(db);
        day.stats.productQty[p.id] = (day.stats.productQty[p.id] || 0) + 1;

        db.undo = { type:"addProduct", table: activeTable, userId: db.currentUserId, productId: p.id, when: nowISO() };

        saveDB(db);
        renderOpenItems();
      });
      list.appendChild(row);
    });
  };

  const renderOpen = () => {
    const day = getDay(db);
    const list = $("openTablesList");
    list.innerHTML = "";

    const entries = Object.entries(day.tickets)
      .map(([k,t]) => ({k,t, unpaid: ticketUnpaidTotal(t)}))
      .filter(x => x.unpaid > EPS)
      .sort((a,b) => b.unpaid - a.unpaid);

    if (entries.length === 0) {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<div class="main"><div class="title">Δεν υπάρχουν ανοιχτά</div><div class="sub">Όλα είναι κλειστά.</div></div>`;
      list.appendChild(row);
      return;
    }

    entries.forEach(({t,unpaid}) => {
      const uname = db.users.find(u=>u.id===t.userId)?.name || "—";
      const row = document.createElement("div");
      row.className = "row";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div class="main">
          <div class="title">${escapeHtml(t.table)} · ${escapeHtml(uname)}</div>
          <div class="sub">Απλήρωτο: ${fmt(unpaid)}</div>
        </div>
        <div class="price">→</div>
      `;
      row.addEventListener("click", () => {
        activeTable = t.table;
        db.currentUserId = t.userId;
        saveDB(db);
        setView("order");
      });
      list.appendChild(row);
    });
  };

  const renderSummary = () => {
    const day = getDay(db);
    const list = $("summaryList");
    list.innerHTML = "";

    const byUser = {};
    for (const t of Object.values(day.tickets)) {
      if (!byUser[t.userId]) byUser[t.userId] = { unpaid:0 };
      byUser[t.userId].unpaid += ticketUnpaidTotal(t);
    }

    db.users.forEach(u => {
      const unpaid = byUser[u.id]?.unpaid || 0;
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <div class="main">
          <div class="title">${escapeHtml(u.name)}</div>
          <div class="sub">Απλήρωτο σε ανοιχτά: ${fmt(unpaid)}</div>
        </div>
        <div class="price"> </div>
      `;
      list.appendChild(row);
    });

    const totalRow = document.createElement("div");
    totalRow.className = "row";
    totalRow.innerHTML = `
      <div class="main">
        <div class="title">Σύνολο ημέρας</div>
        <div class="sub">Μετ: ${fmt(day.stats.cash)} · Κάρ: ${fmt(day.stats.card)} · Κερ: ${fmt(day.stats.comp)}</div>
      </div>
      <div class="price">${fmt(day.stats.cash + day.stats.card)}</div>
    `;
    list.appendChild(totalRow);
  };

  const renderFav = () => {
    const day = getDay(db);
    const list = $("favList");
    list.innerHTML = "";

    const pairs = Object.entries(day.stats.productQty || {})
      .map(([pid, qty]) => ({ pid, qty }))
      .sort((a,b)=> b.qty - a.qty)
      .slice(0, 8);

    if (pairs.length === 0) {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<div class="main"><div class="title">Δεν υπάρχουν δεδομένα ακόμα</div><div class="sub">Χτύπα προϊόντα για να εμφανιστούν Top 8.</div></div>`;
      list.appendChild(row);
      return;
    }

    pairs.forEach((p, idx) => {
      const prod = CATALOG.products.find(x=>x.id===p.pid);
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <div class="main">
          <div class="title">${idx+1}. ${escapeHtml(prod?.name || p.pid)}</div>
          <div class="sub">Ποσότητα σήμερα: ${p.qty}</div>
        </div>
        <div class="price">${p.qty}×</div>
      `;
      list.appendChild(row);
    });
  };

  const renderBottom = () => {
    const left = $("btnLeft");
    const mid  = $("btnMid");
    const right= $("btnRight");

    left.textContent = "🏠 Home";
    left.className = "btn primary";
    left.onclick = () => { activeTable = null; setView("home"); };

    if (view === "order") {
      mid.textContent = "↩️ Αναίρεση";
      mid.className = "btn ok";
      mid.onclick = () => { toast(undoLast(db) ? "Έγινε αναίρεση." : "Δεν υπάρχει αναίρεση."); render(); };

      right.textContent = "🗑️ Διαγραφή";
      right.className = "btn bad";
      right.onclick = () => {
        const day = getDay(db);
        const key = ticketKey(activeTable, db.currentUserId);
        const exists = day.tickets[key];
        if (!exists) return toast("Δεν υπάρχει ticket.");
        askPin("Owner PIN", "Διαγραφή ticket μόνο με Owner PIN", db.ownerPin, () => {
          confirmBox("Διαγραφή ticket", `Να διαγραφεί το ticket για τραπέζι ${activeTable};`, () => {
            delete day.tickets[key];
            saveDB(db);
            activeTable = null;
            setView("tables");
          });
        });
      };
    } else {
      mid.textContent = "📌 Τραπέζια";
      mid.className = "btn ok";
      mid.onclick = () => setView("tables");

      right.textContent = "📊 Σύνοψη";
      right.className = "btn";
      right.onclick = () => setView("summary");
    }
  };

  const render = () => {
    renderTop();
    renderBottom();
    if (view === "home") renderHome();
    if (view === "tables") renderTables();
    if (view === "order") { renderCatChips(); renderOpenItems(); renderProducts(); }
    if (view === "open") renderOpen();
    if (view === "summary") renderSummary();
    if (view === "fav") renderFav();
  };

  $("homeNewOrder").addEventListener("click", () => setView("tables"));
  $("homeOpen").addEventListener("click", () => setView("open"));
  $("homeFav").addEventListener("click", () => setView("fav"));
  $("btnSettings").addEventListener("click", () => {
    showModal("Ρυθμίσεις", `
      <div class="field"><div class="label">Απλό mode (θα βάλουμε μετά αναλυτικές ρυθμίσεις)</div></div>
      <div class="row2" style="margin-top:12px">
        <button class="btn ghost" id="mClose">Κλείσιμο</button>
        <button class="btn" id="mStore">Αλλαγή ονόματος</button>
      </div>
    `);
    $("mClose").onclick = closeModal;
    $("mStore").onclick = () => {
      askPin("Owner PIN", "Μόνο ο ιδιοκτήτης αλλάζει όνομα μαγαζιού", db.ownerPin, () => {
        showModal("Όνομα μαγαζιού", `
          <div class="field"><div class="label">Όνομα</div>
            <input id="sName" value="${escapeHtml(db.storeName)}" />
          </div>
          <div class="row2">
            <button class="btn ghost" id="sCancel">Άκυρο</button>
            <button class="btn ok" id="sSave">Αποθήκευση</button>
          </div>
        `);
        $("sCancel").onclick = closeModal;
        $("sSave").onclick = () => {
          db.storeName = $("sName").value.trim() || db.storeName;
          saveDB(db); closeModal(); render();
        };
      });
    };
  });

  $("userSelect").addEventListener("change", () => {
    db.currentUserId = $("userSelect").value;
    saveDB(db);
    activeTable = null;
    setView("home");
  });

  $("productSearch").addEventListener("input", () => {
    searchText = $("productSearch").value || "";
    renderProducts();
  });

  // Idle → Home → Screensaver
  const IDLE_HOME_MS = 35000;
  const IDLE_SAVER_MS = 15000;
  let idleTimer = null;
  let saverTimer = null;

  const screensaver = $("screensaver");
  const screensaverOn = () => screensaver.classList.contains("on");
  const showScreensaver = () => {
    $("ssStore").textContent = db.storeName || "Το Μαγαζί Μου";
    $("ssUser").textContent = `Εν υπηρεσία: ${currentUser()?.name || "—"}`;
    screensaver.classList.add("on");
  };
  const hideScreensaver = () => screensaver.classList.remove("on");

  const scheduleIdle = () => {
    clearTimeout(idleTimer);
    clearTimeout(saverTimer);
    idleTimer = setTimeout(() => {
      activeTable = null;
      setView("home");
      saverTimer = setTimeout(showScreensaver, IDLE_SAVER_MS);
    }, IDLE_HOME_MS);
  };

  const resetIdle = () => {
    if (screensaverOn()) hideScreensaver();
    scheduleIdle();
  };

  ["click","touchstart","keydown","scroll"].forEach(evt => {
    window.addEventListener(evt, resetIdle, { passive:true });
  });
  screensaver.addEventListener("click", resetIdle);
  screensaver.addEventListener("touchstart", resetIdle, { passive:true });

  scheduleIdle();
  render();
})();