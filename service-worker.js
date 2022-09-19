importScripts("/precache-manifest.1e6509af7f46516ab90dcb34e6f5a119.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
