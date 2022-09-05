importScripts("/precache-manifest.4fab99c8d22d3b8ef890b9318e84add6.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

import workbox from "register-service-worker";

self.addEventListener('fetch', function (event) {
  console.log(event);
});

