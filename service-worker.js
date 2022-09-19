importScripts("/precache-manifest.2991f12f96a4459439121c42f886392f.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
