importScripts("/precache-manifest.7ed5e085a228eace79dde665978603b1.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
