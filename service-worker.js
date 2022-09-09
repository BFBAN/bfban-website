importScripts("/precache-manifest.e4af3f44316b43946da3b54161a28aba.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
