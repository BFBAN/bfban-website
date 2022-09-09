importScripts("/precache-manifest.3cd448db91fad5d2778e6a26b1094869.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
