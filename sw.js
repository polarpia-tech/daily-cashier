// sw.js
const CACHE = "dc-static"; // Σταθερό όνομα - δεν χρειάζεται να το αλλάζεις
const PRECACHE = [
  "./manifest.webmanifest"
  // ❌ ΜΗΝ βάζεις "./" ή "./index.html" εδώ
  // ❌ ΜΗΝ βάζεις "./sw.js" εδώ
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(PRECACHE);
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k !== CACHE ? caches.delete(k) : null)));
    await self.clients.claim();
  })());
});

// ✅ Network-first για HTML (να βλέπεις πάντα την τελευταία έκδοση)
async function networkFirst(req) {
  try {
    const fresh = await fetch(req, { cache: "no-store" });
    return fresh;
  } catch (e) {
    const cached = await caches.match(req);
    return cached || new Response("Offline", { status: 503 });
  }
}

// ✅ Stale-while-revalidate για assets (offline αλλά με auto update)
async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);

  const fetchPromise = fetch(req).then((fresh) => {
    // cache only OK responses
    if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
    return fresh;
  }).catch(() => null);

  return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // μόνο same-origin
  if (url.origin !== location.origin) return;

  // HTML navigations -> network-first
  const accept = req.headers.get("accept") || "";
  if (req.mode === "navigate" || accept.includes("text/html")) {
    event.respondWith(networkFirst(req));
    return;
  }

  // assets -> stale-while-revalidate
  if (/\.(js|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // default
  event.respondWith(staleWhileRevalidate(req));
});