importScripts("/precache-manifest.8bcc98db2940bce6ef4d2d58dca3c5c7.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
