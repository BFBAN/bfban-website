importScripts("/precache-manifest.91ed6583d207c69187930a941f3920c6.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
