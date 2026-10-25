const NOM_CACHE = "muscu-v5";
const FICHIERS = [
  "./", "./index.html", "./manifest.json", "./programme.json",
  "./seance-a.json", "./seance-b.json", "./seance-c.json",
  "./icon-192.png", "./icon-512.png"
];

self.addEventListener("install", (e) => {
  // Each file is cached on its own: one missing file no longer blocks the install
  e.waitUntil(
    caches.open(NOM_CACHE).then((c) => Promise.all(FICHIERS.map((f) => c.add(f).catch(() => {}))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((noms) =>
      Promise.all(noms.filter((n) => n !== NOM_CACHE).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// Network first (always the latest version), cache when offline
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((rep) => {
        const copie = rep.clone();
        caches.open(NOM_CACHE).then((c) => c.put(e.request, copie));
        return rep;
      })
      .catch(() => caches.match(e.request))
  );
});