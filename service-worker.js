importScripts("/precache-manifest.76cec0ce92e8ac2b79972747373a6eba.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
