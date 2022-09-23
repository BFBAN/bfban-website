importScripts("/precache-manifest.f000aab2945301677a716f5e2933ae22.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
