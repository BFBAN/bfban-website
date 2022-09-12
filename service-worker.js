importScripts("/precache-manifest.17e7304490ebad50c3cfc6c378415993.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
