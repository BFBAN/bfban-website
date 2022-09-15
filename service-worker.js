importScripts("/precache-manifest.fdfec3e660a4ae1833e71e09f5ea077d.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
