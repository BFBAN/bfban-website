importScripts("/precache-manifest.dec73b41791a99a3ed0cd725fb087d71.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
