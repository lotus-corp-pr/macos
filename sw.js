/********** SERVICE WORKER **********/
/*
 * Offline-first cache: precache the app shell and serve from cache,
 * falling back to network for everything else. Keeps the desktop usable
 * without a connection after the first visit.
 */
const CACHE_NAME = "macos-web-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./Css/style.css",
  "./javascript/app.js",
  "./javascript/script.js",
  "./javascript/blockblast.js",
  "./javascript/padel3d.js",
  "./manifest.json",
  "./background/iridescence.jpg",
  "./icon/manifest/192x192.png",
  "./icon/manifest/512x512.png",
  "./icon/apple-white.png",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(function (cache) {
        // Use addAll with individual error tolerance so one missing asset
        // doesn't fail the whole install.
        return Promise.all(
          APP_SHELL.map(function (url) {
            return cache.add(url).catch(function () {
              /* skip assets that may be missing */
            });
          })
        );
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key !== CACHE_NAME;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;

  // Only handle GET; ignore non-http(s) requests (e.g. chrome-extension://).
  if (request.method !== "GET" || !request.url.startsWith("http")) {
    return;
  }

  // Network-first for cross-origin (CDN) so we always get fresh fonts/libs,
  // cache fallback if offline. Cache-first for same-origin app shell.
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, copy).catch(function () {});
          });
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cached) {
            return cached || Response.error();
          });
        })
    );
    return;
  }

  // Same-origin: cache-first with network update (stale-while-revalidate).
  event.respondWith(
    caches.match(request).then(function (cached) {
      const fetchPromise = fetch(request)
        .then(function (response) {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(request, copy).catch(function () {});
            });
          }
          return response;
        })
        .catch(function () {
          return cached || Response.error();
        });
      return cached || fetchPromise;
    })
  );
});
