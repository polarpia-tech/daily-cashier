const CACHE_VERSION = "dc-cache-v12";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k !== CACHE_VERSION ? caches.delete(k) : null))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          try {
            const url = new URL(req.url);
            if (req.method === "GET" && url.origin === location.origin) {
              const clone = res.clone();
              caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
            }
          } catch {}
          return res;
        })
        .catch(() => cached || new Response("Offline", { status: 503 }));
    })
  );
});
