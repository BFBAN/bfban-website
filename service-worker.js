importScripts("/precache-manifest.25b62f1db7c69131e1513dba708db7b5.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
