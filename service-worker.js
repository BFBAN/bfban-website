importScripts("/precache-manifest.83c27fc79d03e7e066883e8d5507c663.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

import workbox from "register-service-worker";

self.addEventListener('fetch', function (event) {
  console.log(event);
});

