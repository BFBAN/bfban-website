importScripts("/precache-manifest.a71fb2ed4803ffd5c5824354d12ef3f9.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

import workbox from "register-service-worker";

self.addEventListener('fetch', function (event) {
  console.log(event);
});
