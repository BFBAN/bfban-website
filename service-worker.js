importScripts("/precache-manifest.4201cc167bc1193af3d7232ecf8ef67d.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
