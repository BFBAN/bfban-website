importScripts("/precache-manifest.ca45ac93125fffdca98251bf8f8e4fb7.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
