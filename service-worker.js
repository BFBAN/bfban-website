importScripts("/precache-manifest.f0323c94fe4629984c818c09505556bc.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
