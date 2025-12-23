// sw.js
const CACHE_VERSION = "dc-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./menu.config.js",
  "./sw.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(ASSETS);
    self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.map(k => (k.startsWith("dc-") && k !== STATIC_CACHE) ? caches.delete(k) : null)
    );
    await self.clients.claim();
  })());
});

// Cache-first για στατικά, network fallback
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith((async () => {
    const url = new URL(req.url);

    // Μόνο στο ίδιο origin
    if (url.origin !== self.location.origin) {
      return fetch(req);
    }

    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(req);
    if (cached) return cached;

    try {
      const fresh = await fetch(req);
      // cache νέες επιτυχείς απαντήσεις
      if (fresh && fresh.status === 200) {
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (e) {
      // offline fallback στην αρχική
      const fallback = await cache.match("./index.html");
      return fallback || new Response("Offline", { status: 503 });
    }
  })());
});