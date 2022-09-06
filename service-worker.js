importScripts("/precache-manifest.0a13ccede5f1a7a9976d30c314e40497.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
