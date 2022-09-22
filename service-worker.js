importScripts("/precache-manifest.36ff761e37a9353c16f97004b87487fd.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
