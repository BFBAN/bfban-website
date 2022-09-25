importScripts("/precache-manifest.ae627c46fef607967d809cf7366d4b1a.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
