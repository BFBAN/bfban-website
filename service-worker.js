importScripts("/precache-manifest.08e3ad46f1a1c0a0041593513422913a.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
