importScripts("/precache-manifest.e14822e9cad5cf2e50c9f5e2c2c77e66.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
