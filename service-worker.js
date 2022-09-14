importScripts("/precache-manifest.ccf84036e9aaf89aa9ac41f4316d183f.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
