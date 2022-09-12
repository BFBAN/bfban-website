importScripts("/precache-manifest.20f4494d000835fc6495195e290dcaf2.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
