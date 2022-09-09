importScripts("/precache-manifest.ea0727e711d5bb09d5a275f73fc099da.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
