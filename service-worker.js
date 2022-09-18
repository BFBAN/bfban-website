importScripts("/precache-manifest.992eb06078c3e72879d999ed20152bd3.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
