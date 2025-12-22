(() => {
  "use strict";

  // ---------------------------
  // Helpers
  // ---------------------------
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

  // ---------------------------
  // Storage DB
  // ---------------------------
  const LS_KEY = "mini-cashier-db-v1";

  const defaultDB = () => ({
    storeName: "Το Μαγαζί Μου",
    ownerPin: "1234", // άλλαξέ το από Ρυθμίσεις (με PIN)
    currentUserId: null,
    users: [
      { id: uid(), name: "Χρήστης 1", pin: "1111" },
      { id: uid(), name: "Χρήστης 2", pin: "2222" },
    ],
    tables: ["T1","T2","T3","T4","T5","T6","BAR","ΕΞΩ"],

    // dayKey -> data
    days: {
      // "2025-12-21": { tickets: {...}, stats: {...} }
    },

    // undo stack (last action)
    undo: null
  });

  const loadDB = () => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return defaultDB();
      const db = JSON.parse(raw);
      // basic migrations / defaults
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

  // ---------------------------
  // Menu (από αυτά που έδωσες)
  // ---------------------------
  const MENU = [
    { cat:"ΚΑΦΕΔΕΣ – ΖΕΣΤΟΙ", items:[
      ["Espresso μονός", 2.60],
      ["Espresso διπλός", 3.20],
      ["Espresso macchiato", 2.90],
      ["Americano", 3.20],
      ["Cappuccino", 3.60],
      ["Cappuccino διπλός", 4.20],
      ["Latte macchiato", 4.20],
      ["Flat white", 4.40],
      ["Mocha", 4.50],
      ["Καφές φίλτρου", 3.00],
      ["Decaf (+)", 0.30], // σαν προϊόν/extra
    ]},
    { cat:"ΚΑΦΕΔΕΣ – ΚΡΥΟΙ", items:[
      ["Freddo espresso", 3.80],
      ["Freddo cappuccino", 4.20],
      ["Iced latte", 4.50],
      ["Cold brew", 4.80],
      ["Frappe", 3.50],
    ]},
    { cat:"ΤΣΑΪ – ΖΕΣΤΑ ΡΟΦΗΜΑΤΑ", items:[
      ["Τσάι (μαύρο/πράσινο/βότανα)", 3.20],
      ["Τσάι φρούτων", 3.50],
      ["Chai latte", 4.30],
    ]},
    { cat:"ΣΟΚΟΛΑΤΕΣ – ΓΑΛΑΚΤΕΡΑ", items:[
      ["Ζεστή σοκολάτα", 4.20],
      ["Κρύα σοκολάτα", 4.50],
      ["Λευκή σοκολάτα", 4.50],
      ["Κακάο", 4.00],
      ["Φυτικό γάλα (+)", 0.50],
    ]},
    { cat:"ΑΝΑΨΥΚΤΙΚΑ – ΝΕΡΑ", items:[
      ["Coca-Cola / Zero / Fanta (0,33l)", 3.40],
      ["Ice Tea", 3.60],
      ["Σόδα / Τόνικ", 3.20],
      ["Μεταλλικό νερό (0,33l)", 2.80],
      ["Μεταλλικό νερό (0,75l)", 5.50],
    ]},
    { cat:"ΧΥΜΟΙ – SMOOTHIES", items:[
      ["Φυσικός χυμός πορτοκάλι", 4.50],
      ["Χυμός ανάμεικτος", 4.80],
      ["Smoothie φρούτων", 5.80],
      ["Milkshake", 5.50],
    ]},
    { cat:"ΣΝΑΚ – ΓΛΥΚΑ", items:[
      ["Κρουασάν σκέτο", 2.80],
      ["Κρουασάν σοκολάτα", 3.20],
      ["Μάφιν", 3.50],
      ["Κέικ (κομμάτι)", 4.20],
      ["Cheesecake", 4.80],
      ["Μπισκότα", 2.50],
      ["Τοστ ζαμπόν-τυρί", 4.50],
      ["Τοστ vegetarian", 4.80],
    ]},
    { cat:"ΜΠΥΡΕΣ", items:[
      ["Μπύρα βαρελίσια (0,5l)", 5.20],
      ["Μπύρα εμφιαλωμένη (0,33l)", 4.20],
      ["Weissbier (0,5l)", 5.50],
      ["Μπύρα χωρίς αλκοόλ", 4.20],
    ]},
    { cat:"ΚΡΑΣΙΑ", items:[
      ["Κρασί ποτήρι", 5.50],
      ["Κρασί καράφα (0,5l)", 12.00],
      ["Φιάλη κρασί", 22.00], // base (αν θες range, το κάνουμε μετά)
      ["Prosecco ποτήρι", 6.50],
    ]},
    { cat:"ΠΟΤΑ (4cl)", items:[
      ["Ουίσκι standard", 8.50],
      ["Premium ουίσκι", 10.50],
      ["Βότκα", 8.00],
      ["Ρούμι", 8.50],
      ["Τζιν", 8.50],
      ["Ούζο / Τσίπουρο", 7.50],
      ["Λικέρ", 7.50],
    ]},
    { cat:"ΚΟΚΤΕΪΛ", items:[
      ["Mojito", 9.50],
      ["Caipirinha", 9.50],
      ["Margarita", 10.00],
      ["Aperol Spritz", 8.50],
      ["Gin Tonic", 9.00],
      ["Negroni", 10.50],
    ]},
  ];

  const buildCatalog = () => {
    const cats = MENU.map(m => m.cat);
    const products = [];
    MENU.forEach(m => {
      m.items.forEach(([name, price]) => {
        const id = `${m.cat}::${name}`; // stable id
        products.push({ id, cat:m.cat, name, price:Number(price) });
      });
    });
    return { cats, products };
  };

  const CATALOG = buildCatalog();

  // ---------------------------
  // Ticket model
  // ---------------------------
  // ticket: { id, table, userId, openedAt, items:[{id, productId, name, cat, price, qty, paid:{cash,card,comp}}], closedAt? }
  const getOrCreateTicket = (db, tableId) => {
    const day = getDay(db);
    const userId = db.currentUserId;
    const key = `${tableId}::${userId}`;
    if (!day.tickets[key]) {
      day.tickets[key] = {
        id: uid(),
        table: tableId,
        userId,
        openedAt: nowISO(),
        items: [],
      };
    }
    return day.tickets[key];
  };

  const ticketTotals = (ticket) => {
    let unpaid = 0, cash=0, card=0, comp=0, all=0;
    for (const it of ticket.items) {
      const lineAll = it.qty * it.price;
      const paidQty = (it.paid?.cash||0) + (it.paid?.card||0) + (it.paid?.comp||0);
      const linePaid = paidQty * it.price;
      const lineUnpaid = (it.qty - paidQty) * it.price;
      all += lineAll;
      unpaid += lineUnpaid;
      cash += (it.paid?.cash||0) * it.price;
      card += (it.paid?.card||0) * it.price;
      comp += (it.paid?.comp||0) * it.price;
    }
    return { unpaid, cash, card, comp, all };
  };

  const addProductToTicket = (ticket, product) => {
    // αν υπάρχει ίδια γραμμή, αύξησε qty
    const found = ticket.items.find(it => it.productId === product.id);
    if (found) {
      found.qty += 1;
      return;
    }
    ticket.items.push({
      id: uid(),
      productId: product.id,
      name: product.name,
      cat: product.cat,
      price: product.price,
      qty: 1,
      paid: { cash:0, card:0, comp:0 }
    });
  };

  const clampPaid = (it) => {
    const totalPaid = it.paid.cash + it.paid.card + it.paid.comp;
    if (totalPaid > it.qty) {
      // reduce comp first then card then cash (rare)
      let extra = totalPaid - it.qty;
      const order = ["comp","card","cash"];
      for (const k of order) {
        const can = Math.min(extra, it.paid[k]);
        it.paid[k] -= can;
        extra -= can;
        if (!extra) break;
      }
    }
  };

  const payOneUnit = (db, ticket, itemId, method) => {
    const it = ticket.items.find(x => x.id === itemId);
    if (!it) return;
    const paidQty = it.paid.cash + it.paid.card + it.paid.comp;
    if (paidQty >= it.qty) return;

    // undo snapshot
    db.undo = { type:"payOne", ticketKey: currentTicketKey(), itemId, method, when: nowISO() };

    it.paid[method] += 1;
    clampPaid(it);

    // stats
    const day = getDay(db);
    if (method === "cash") day.stats.cash += it.price;
    if (method === "card") day.stats.card += it.price;
    if (method === "comp") day.stats.comp += it.price;

    // product qty stats (για Top 8 σήμερα) -> μετράμε όταν μπαίνει προϊόν, όχι στην πληρωμή
    saveDB(db);
  };

  const undoLast = (db) => {
    const u = db.undo;
    if (!u) return false;
    const day = getDay(db);

    if (u.type === "payOne") {
      const t = day.tickets[u.ticketKey];
      if (!t) { db.undo=null; saveDB(db); return false; }
      const it = t.items.find(x=>x.id===u.itemId);
      if (!it) { db.undo=null; saveDB(db); return false; }
      if (it.paid[u.method] > 0) {
        it.paid[u.method] -= 1;
        // stats reverse
        if (u.method === "cash") day.stats.cash -= it.price;
        if (u.method === "card") day.stats.card -= it.price;
        if (u.method === "comp") day.stats.comp -= it.price;
      }
      db.undo = null;
      saveDB(db);
      return true;
    }

    if (u.type === "addProduct") {
      const t = day.tickets[u.ticketKey];
      if (!t) { db.undo=null; saveDB(db); return false; }
      const it = t.items.find(x=>x.productId===u.productId);
      if (!it) { db.undo=null; saveDB(db); return false; }
      if (it.qty > 1) it.qty -= 1;
      else t.items = t.items.filter(x=>x !== it);
      db.undo = null;
      // reverse stats qty
      if (day.stats.productQty[u.productId]) {
        day.stats.productQty[u.productId] = Math.max(0, day.stats.productQty[u.productId] - 1);
      }
      saveDB(db);
      return true;
    }

    return false;
  };

  const deleteTicketConfirm = (db, ticketKey) => {
    const day = getDay(db);
    delete day.tickets[ticketKey];
    saveDB(db);
  };

  // ---------------------------
  // UI state
  // ---------------------------
  let db = loadDB();
  ensureDay(db);
  if (!db.currentUserId) db.currentUserId = db.users[0]?.id || null;
  saveDB(db);

  let view = "home";
  let activeTable = null;
  let activeCategory = CATALOG.cats[0];
  let searchText = "";

  const views = ["home","tables","order","open","summary","fav"];

  const setView = (v) => {
    view = v;
    views.forEach(x => {
      document.querySelector(`[data-view="${x}"]`)?.classList.toggle("on", x === v);
    });
    // tabs highlight
    $("tabHome").classList.toggle("on", v === "home");
    $("tabTables").classList.toggle("on", v === "tables" || v === "order" || v === "open");
    $("tabSummary").classList.toggle("on", v === "summary" || v === "fav");

    // Back button label
    $("btnBack").textContent = (v === "home") ? "⬅️ Πίσω" : "⬅️ Πίσω";
    render();
  };

  const currentUser = () => db.users.find(u => u.id === db.currentUserId) || db.users[0];

  const currentTicketKey = () => {
    if (!activeTable) return null;
    return `${activeTable}::${db.currentUserId}`;
  };

  // ---------------------------
  // Render
  // ---------------------------
  const renderTop = () => {
    $("storeName").textContent = db.storeName || "Το Μαγαζί Μου";
    const u = currentUser();
    $("storeSub").textContent = `Σήμερα: ${todayHuman()} · Χρήστης: ${u?.name || "—"}`;

    // user select
    $("userSelect").innerHTML = db.users.map(u2 =>
      `<option value="${u2.id}" ${u2.id===db.currentUserId?"selected":""}>${u2.name}</option>`
    ).join("");
  };

  const renderHome = () => {
    const day = getDay(db);
    const openKeys = Object.keys(day.tickets).filter(k => ticketTotals(day.tickets[k]).unpaid > 0);
    $("openCount").textContent = openKeys.length;
  };

  const renderTables = () => {
    const day = getDay(db);
    const grid = $("tablesGrid");
    grid.innerHTML = "";

    for (const tname of db.tables) {
      const t = getOrCreateTicket(db, tname); // ensures exists for current user
      const totals = ticketTotals(t);
      const isOpen = totals.unpaid > 0;

      const el = document.createElement("div");
      el.className = "tablebtn" + (activeTable===tname ? " active" : "");
      el.innerHTML = `
        <div class="tname">${tname}</div>
        <div class="tmeta">
          <span class="badge"><span class="dot ${isOpen?"open":"paid"}"></span>${isOpen?"Ανοιχτό":"—"}</span>
          · <strong>${fmt(totals.unpaid)}</strong>
        </div>
      `;
      el.addEventListener("click", () => {
        activeTable = tname;
        setView("order");
      });
      grid.appendChild(el);
    }
    saveDB(db);
  };

  const renderCategories = () => {
    const catList = $("catList");
    catList.innerHTML = "";

    CATALOG.cats.forEach(cat => {
      const row = document.createElement("div");
      row.className = "row";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div class="main">
          <div class="title">${cat}</div>
          <div class="sub">Πάτα για να δεις προϊόντα</div>
        </div>
        <div class="price">${cat===activeCategory?"✓":"→"}</div>
      `;
      row.addEventListener("click", () => {
        activeCategory = cat;
        renderProducts();
      });
      catList.appendChild(row);
    });
  };

  const renderOpenItems = () => {
    const list = $("openItemsList");
    list.innerHTML = "";
    if (!activeTable) return;

    const ticket = getOrCreateTicket(db, activeTable);
    const totals = ticketTotals(ticket);
    $("orderTitle").textContent = `Τραπέζι: ${activeTable} · Απλήρωτο: ${fmt(totals.unpaid)}`;
    $("ticketUnpaid").textContent = fmt(totals.unpaid);

    if (ticket.items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "row";
      empty.innerHTML = `<div class="main"><div class="title">Δεν έχει προϊόντα ακόμα</div><div class="sub">Διάλεξε κατηγορία και πάτα προϊόν.</div></div>`;
      list.appendChild(empty);
      return;
    }

    ticket.items.forEach(it => {
      const paidQty = it.paid.cash + it.paid.card + it.paid.comp;
      const unpaidQty = it.qty - paidQty;

      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <div class="main">
          <div class="title">${it.name}</div>
          <div class="sub">${it.cat} · ${fmt(it.price)} · Πληρωμένα: ${paidQty}/${it.qty}</div>
          <div class="paychips">
            <span class="chip ok" data-pay="cash" title="Πληρωμή 1 τεμ. με μετρητά">Μετ +1</span>
            <span class="chip accent" data-pay="card" title="Πληρωμή 1 τεμ. με κάρτα">Κάρ +1</span>
            <span class="chip warn" data-pay="comp" title="Κέρασμα 1 τεμ.">Κερ +1</span>
          </div>
        </div>

        <div class="qtybox">
          <div class="mini" data-minus="1">−</div>
          <div class="qnum">${it.qty}</div>
          <div class="mini" data-plus="1">+</div>
        </div>
      `;

      // qty +/- (με προστασία)
      row.querySelector('[data-plus]')?.addEventListener("click", () => {
        it.qty += 1;
        saveDB(db);
        renderOpenItems();
      });

      row.querySelector('[data-minus]')?.addEventListener("click", () => {
        // μην αφήσεις qty < paidQty
        const paid = it.paid.cash + it.paid.card + it.paid.comp;
        if (it.qty <= 1) {
          // αν έχει πληρωθεί κάτι, δεν το σβήνουμε
          if (paid > 0) return toast("Δεν γίνεται. Έχει ήδη πληρωμές.");
          // επιβεβαίωση
          confirmBox("Αφαίρεση προϊόντος", `Να αφαιρεθεί το “${it.name}”;`, () => {
            ticket.items = ticket.items.filter(x=>x.id!==it.id);
            saveDB(db);
            renderOpenItems();
          });
          return;
        }
        if (it.qty - 1 < paid) return toast("Δεν γίνεται. Έχει ήδη πληρωθεί μέρος.");
        it.qty -= 1;
        saveDB(db);
        renderOpenItems();
      });

      // pay +1 (με επιβεβαίωση)
      row.querySelectorAll("[data-pay]").forEach(ch => {
        ch.addEventListener("click", () => {
          if (unpaidQty <= 0) return toast("Ήδη πληρωμένο.");
          const method = ch.getAttribute("data-pay");
          const methodName = method==="cash"?"Μετρητά":method==="card"?"Κάρτα":"Κερασμένο";
          confirmBox("Επιβεβαίωση πληρωμής", `Να καταχωρηθεί 1 τεμ. “${it.name}” ως ${methodName};`, () => {
            payOneUnit(db, ticket, it.id, method);
            // αν το τραπέζι μηδενίσει απλήρωτο, γύρνα αυτόματα στα τραπέζια
            const totals2 = ticketTotals(ticket);
            renderOpenItems();
            if (totals2.unpaid <= 0.00001) {
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
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(q));
    }

    prods.forEach(p => {
      const row = document.createElement("div");
      row.className = "row";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div class="main">
          <div class="title">${p.name}</div>
          <div class="sub">${p.cat}</div>
        </div>
        <div class="price">${fmt(p.price)}</div>
      `;

      row.addEventListener("click", () => {
        if (!activeTable) {
          toast("Διάλεξε πρώτα τραπέζι.");
          setView("tables");
          return;
        }
        const ticket = getOrCreateTicket(db, activeTable);
        addProductToTicket(ticket, p);

        // stats qty για Top8
        const day = getDay(db);
        day.stats.productQty[p.id] = (day.stats.productQty[p.id] || 0) + 1;

        // undo
        db.undo = { type:"addProduct", ticketKey: currentTicketKey(), productId: p.id, when: nowISO() };

        saveDB(db);
        renderOpenItems();

        // Μένεις στην ίδια οθόνη για γρήγορο χτύπημα
      });

      list.appendChild(row);
    });
  };

  const renderOpen = () => {
    const day = getDay(db);
    const list = $("openTablesList");
    list.innerHTML = "";

    const entries = Object.entries(day.tickets)
      .map(([k,t]) => ({k,t, totals: ticketTotals(t)}))
      .filter(x => x.totals.unpaid > 0)
      .sort((a,b) => b.totals.unpaid - a.totals.unpaid);

    if (entries.length === 0) {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `<div class="main"><div class="title">Δεν υπάρχουν ανοιχτά</div><div class="sub">Όλα είναι κλειστά/μηδενικά για σήμερα.</div></div>`;
      list.appendChild(row);
      return;
    }

    entries.forEach(({k,t,totals}) => {
      const uname = db.users.find(u=>u.id===t.userId)?.name || "—";
      const row = document.createElement("div");
      row.className = "row";
      row.style.cursor = "pointer";
      row.innerHTML = `
        <div class="main">
          <div class="title">${t.table} · ${uname}</div>
          <div class="sub">Ανοιχτό απλήρωτο: ${fmt(totals.unpaid)}</div>
        </div>
        <div class="price">→</div>
      `;
      row.addEventListener("click", () => {
        // άνοιγμα συγκεκριμένου ticket
        activeTable = t.table;
        db.currentUserId = t.userId; // πάει στον αντίστοιχο χρήστη
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

    // σύνολο ανά χρήστη
    const byUser = {};
    for (const [k,t] of Object.entries(day.tickets)) {
      const totals = ticketTotals(t);
      if (!byUser[t.userId]) byUser[t.userId] = { cash:0, card:0, comp:0, unpaid:0, all:0 };
      byUser[t.userId].cash += totals.cash;
      byUser[t.userId].card += totals.card;
      byUser[t.userId].comp += totals.comp;
      byUser[t.userId].unpaid += totals.unpaid;
      byUser[t.userId].all += totals.all;
    }

    const users = db.users.map(u => ({
      u,
      ... (byUser[u.id] || { cash:0, card:0, comp:0, unpaid:0, all:0 })
    }));

    users.forEach(x => {
      const row = document.createElement("div");
      row.className = "row";
      row.style.cursor = "pointer