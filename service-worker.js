importScripts("/precache-manifest.385ff9abaacdd48e4b707d678fce1862.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
