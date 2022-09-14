importScripts("/precache-manifest.9ee8e15b5280116e39e899ad1d06a53c.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
