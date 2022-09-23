importScripts("/precache-manifest.9e0a9e6d7e1ce8026e068dc2860ef351.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
