importScripts("/precache-manifest.12ea4e521b681985a1a4e923f2238e48.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
