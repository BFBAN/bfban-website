importScripts("/precache-manifest.e681bc9dbd9d2af10e93e87c7ed0b399.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
