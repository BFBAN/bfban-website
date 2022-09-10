importScripts("/precache-manifest.06faa60d2bb2827e1375800f393db1d8.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
