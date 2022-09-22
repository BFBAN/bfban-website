importScripts("/precache-manifest.af8b87af2b95017353c09c86ebd3ad0b.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
