importScripts("/precache-manifest.c52d3f27375cc9a69b998065353a366e.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
