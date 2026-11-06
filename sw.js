"use strict";

var CACHE_NAME = "aquavanguard-pwa-v1";
var APP_SHELL = [
  "./",
  "./index.html",
  "./map.html",
  "./report.html",
  "./diagnose.html",
  "./blueprints.html",
  "./community.html",
  "./offline-guides.html",
  "./offline-guide.html",
  "./offline.html",
  "./blueprint.html",
  "./style.css",
  "./app.js",
  "./act.js",
  "./data.js",
  "./diagnose.js",
  "./map.js",
  "./offline-directory.js",
  "./offline-guide-data.js",
  "./offline-guide.js",
  "./report.js",
  "./service-worker.js",
  "./verify.js",
  "./video-library.js",
  "./water-data.js",
  "./sw.js",
  "./manifest.json",
  "./icons/icon.svg",
  "./icons/icon-maskable.svg",
  "./icons/logo-a.svg",
  "./assets/offline-guides/water-jerrycans.jpg",
  "./assets/offline-guides/flooded-street.jpg",
  "./assets/offline-guides/muddy-water.jpg",
  "./assets/offline-guides/chemical-spill.jpg",
  "./assets/offline-guides/water-scarcity.jpg"
];

function sendMessageResponse(event, response) {
  if (event.ports && event.ports[0]) {
    event.ports[0].postMessage(response);
  }
}

function appShellIsCached(cache) {
  return Promise.all(APP_SHELL.map(function (path) {
    return cache.match(new URL(path, self.registration.scope).href);
  })).then(function (responses) {
    return responses.every(Boolean);
  });
}

function getOfflineResponse(request, cache) {
  return cache.match(request).then(function (exactResponse) {
    if (exactResponse) return exactResponse;
    return cache.match(request, { ignoreSearch: true }).then(function (cachedResponse) {
      if (cachedResponse) return cachedResponse;
      return cache.match(new URL("./index.html", self.registration.scope).href);
    });
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_SHELL);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("message", function (event) {
  if (!event.data || !event.data.type) return;

  if (event.data.type === "CACHE_APP_SHELL") {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(function (cache) {
          return appShellIsCached(cache).then(function (isCached) {
            return isCached ? true : cache.addAll(APP_SHELL);
          });
        })
        .then(function () {
          sendMessageResponse(event, { saved: true });
        })
        .catch(function (error) {
          console.error("AquaVanguard offline files could not be saved:", error);
          sendMessageResponse(event, {
            saved: false,
            message: "Some app files could not be saved. Reconnect and try again."
          });
        })
    );
    return;
  }

  if (event.data.type === "CHECK_APP_SHELL") {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then(appShellIsCached)
        .then(function (saved) {
          sendMessageResponse(event, { saved: saved });
        })
        .catch(function (error) {
          console.error("AquaVanguard offline cache could not be checked:", error);
          sendMessageResponse(event, { saved: false });
        })
    );
  }
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(cacheNames.map(function (cacheName) {
        if (cacheName.indexOf("aquavanguard-pwa-") === 0 && cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      }));
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      if (request.mode === "navigate") {
        return fetch(request).then(function (response) {
          if (!response.ok) return getOfflineResponse(request, cache);

          var pageUrl = new URL(request.url);
          pageUrl.hash = "";
          return cache.put(pageUrl.href, response.clone()).then(function () {
            return response;
          });
        }).catch(function () {
          return getOfflineResponse(request, cache);
        });
      }

      return cache.match(request).then(function (cachedResponse) {
        if (cachedResponse) return cachedResponse;

        return fetch(request).then(function (response) {
          if (!response.ok) return response;
          return cache.put(request, response.clone()).then(function () {
            return response;
          });
        });
      });
    })
  );
});
