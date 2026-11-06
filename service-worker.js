"use strict";

var CACHE_NAME = "aquavanguard-shell-v9";
var APP_SHELL = [
  "./",
  "./index.html",
  "./offline.html",
  "./offline-guides.html",
  "./offline-guide.html",
  "./blueprints.html",
  "./blueprint.html",
  "./diagnose.html",
  "./map.html",
  "./report.html",
  "./community.html",
  "./report.js",
  "./verify.js",
  "./water-data.js",
  "./style.css",
  "./app.js",
  "./icons/icon.svg",
  "./icons/logo-a.svg",
  "./act.js",
  "./video-library.js",
  "./offline-directory.js",
  "./offline-guide-data.js",
  "./offline-guide.js",
  "./diagnose.js",
  "./map.js",
  "./data.js",
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

function getCachedNavigation(request) {
  return caches.match(request).then(function (exactPage) {
    if (exactPage) return exactPage;
    return caches.match(request, { ignoreSearch: true }).then(function (cachedPage) {
      if (cachedPage) return cachedPage;
      return caches.match("./offline.html");
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
        if (cacheName.indexOf("aquavanguard-shell-") === 0 && cacheName !== CACHE_NAME) {
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

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).then(function (response) {
        if (response.ok) {
          var pageUrl = new URL(request.url);
          pageUrl.hash = "";
          return caches.open(CACHE_NAME).then(function (cache) {
            return cache.put(pageUrl.href, response.clone()).then(function () {
              return response;
            });
          });
        }
        return getCachedNavigation(request);
      }).catch(function () {
        return getCachedNavigation(request);
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).then(function (response) {
      if (!response.ok) return response;
      return caches.open(CACHE_NAME).then(function (cache) {
        return cache.put(request, response.clone()).then(function () {
          return response;
        });
      });
    }).catch(function () {
      return caches.match(request);
    })
  );
});