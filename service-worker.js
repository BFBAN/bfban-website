importScripts("/precache-manifest.a7b13178cea90aeb55d58f772dd32c4a.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
