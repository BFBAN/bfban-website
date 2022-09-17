importScripts("/precache-manifest.5962b57f2b854dce015b23668b2a0395.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
