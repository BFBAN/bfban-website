importScripts("/precache-manifest.78f7c51ad10d5ce1392f5d071d4bdf5a.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

import workbox from "register-service-worker";

self.addEventListener('fetch', function (event) {
  console.log(event);
});

