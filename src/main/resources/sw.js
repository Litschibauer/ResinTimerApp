const CACHE_NAME = "resin-timer-cache-v1";
const urlsToCache = [
    "/",
    "/index.html",
    "/main.css",
    "/main.js",
    "/resources/icons/app-icon.png"
];

// Installiere den Service Worker und cache die Dateien
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Nutze den Cache für Anfragen
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Aktualisiere den Cache, wenn sich Dateien ändern
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
