importScripts("/precache-manifest.7e26a89b41e316cc680132b3cf851efd.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
