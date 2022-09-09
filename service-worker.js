importScripts("/precache-manifest.686e3a20f21abeb4e6164144f01d7d01.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
