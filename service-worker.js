importScripts("/precache-manifest.7cb26b4c014024a7825e025fec5ed176.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
