importScripts("/precache-manifest.ac64d24c77c690d81c9d94ea869957e2.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
