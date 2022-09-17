importScripts("/precache-manifest.1d1ec7f24ded5db7367fc24d68880f0f.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
