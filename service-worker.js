importScripts("/precache-manifest.7b930b3239d94c8a7ac63f567ace42ab.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
