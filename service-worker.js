importScripts("/precache-manifest.73136458ac92cb37a4ed06c43cb915aa.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
