importScripts("/precache-manifest.3a2873e4473e9b35bf1c8dcf581a0c77.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
