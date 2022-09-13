importScripts("/precache-manifest.f93e8471ddaad1bb86fdb73e958aa331.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

self.addEventListener('fetch', function (event) {
  console.log(event);
});
