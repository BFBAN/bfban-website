importScripts("/precache-manifest.32ac49fc8c83fca43441eb9f8d7e96ba.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
