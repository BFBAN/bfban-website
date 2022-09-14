importScripts("/precache-manifest.d35af57bc3fc30e52cedf72a108e151b.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
