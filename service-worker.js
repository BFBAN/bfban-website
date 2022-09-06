importScripts("/precache-manifest.464685f580dff2de8ef2b4c6efdf449c.js", "https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

import workbox from "register-service-worker";

self.addEventListener('fetch', function (event) {
  console.log(event);
});
