const CACHE_NAME = "shadow-oath-v2";
const ASSETS = [
  "./",
  "./ninja_story_game.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./ninja-assets/characters/hero.png",
  "./ninja-assets/monsters/enemy1.png",
  "./ninja-assets/monsters/enemy2.png",
  "./ninja-assets/background/tileset.png",
  "./ninja-assets/music/theme.ogg",
  "./ninja-assets/sounds/hit.ogg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const isLocalAsset = url.origin === self.location.origin;
  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

  event.respondWith(
    (async () => {
      if (isHTML) {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          if (isLocalAsset) cache.put(req, fresh.clone());
          return fresh;
        } catch (_) {
          return (await caches.match(req)) || (await caches.match("./ninja_story_game.html")) || (await caches.match("./index.html"));
        }
      }
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        if (isLocalAsset) cache.put(req, fresh.clone());
        return fresh;
      } catch (_) {
        return (await caches.match("./index.html")) || (await caches.match("./ninja_story_game.html"));
      }
    })()
  );
});
