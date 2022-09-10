importScripts("/precache-manifest.00eaf34add57aa782f3f654a8623bcee.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
