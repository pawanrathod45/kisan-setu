// ============================================================
// KISAN SETU — PWA SERVICE WORKER REGISTRATION
// ============================================================

export const registerServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Check for service worker updates periodically
          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.addEventListener('statechange', () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[Kisan Setu PWA] New version available. Ready to update.');
                  } else {
                    console.log('[Kisan Setu PWA] Content cached for offline use.');
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.warn('[Kisan Setu PWA] Service Worker registration failed:', error);
        });
    });
  }
};

export const unregisterServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
};
