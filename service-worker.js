importScripts("/precache-manifest.2d5a0a135b8c528257ff5aaf9e302ff9.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
