// daily-cashier service worker (GitHub Pages)
// Αν αλλάξεις κάτι στο app, ανέβαζε πάντα το VERSION (π.χ. v1, v2, v3...).

const VERSION = "v3"; // <-- ΑΛΛΑΖΕ ΤΟ κάθε φορά που κάνεις update
const CACHE_NAME = `daily-cashier-${VERSION}`;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js"
];

// Install: cache basic assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML, cache-first for others
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Μόνο για ίδιο origin
  if (url.origin !== self.location.origin) return;

  // Για HTML: πάρε πρώτα από internet (για να βλέπεις updates),
  // αλλιώς από cache αν είσαι offline.
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html"))
    );
    return;
  }

  // Για τα υπόλοιπα: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
