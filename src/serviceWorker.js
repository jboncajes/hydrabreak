// Lightweight PWA registration — uses CRA's default service-worker contract.
// In CRA 5+, service workers aren't included by default, so we register a
// minimal inline worker via Blob URL to provide basic offline shell caching.

const SW_CODE = `
const CACHE = 'hydrabreak-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  // Network-first for navigations, cache-first for assets
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => cached))
  );
});
`;

export function register() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  if (process.env.NODE_ENV !== "production") return;

  window.addEventListener("load", () => {
    try {
      const blob = new Blob([SW_CODE], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      navigator.serviceWorker
        .register(url)
        .then(() => console.log("[HydraBreak] Service worker registered."))
        .catch((err) =>
          console.warn("[HydraBreak] SW registration failed:", err)
        );
    } catch (e) {
      console.warn("[HydraBreak] SW setup error:", e);
    }
  });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((reg) => reg.unregister())
      .catch(() => {});
  }
}
