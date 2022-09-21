importScripts("/precache-manifest.0f9dad3c207d44661d226c50f62eee35.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
