import React, { createContext, useContext, useState, useEffect } from 'react';

const PWAContext = createContext({
  isInstallable: false,
  isInstalled: false,
  isOnline: true,
  installPWA: async () => {},
  dismissInstallPrompt: () => {}
});

export const PWAProvider = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable]   = useState(false);
  const [isInstalled, setIsInstalled]       = useState(false);
  const [isOnline, setIsOnline]             = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isDismissed, setIsDismissed]       = useState(false);

  useEffect(() => {
    // 1. Detect if already running in standalone PWA window
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://');

    setIsInstalled(Boolean(isStandalone));

    // 2. Listen for native PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // 3. Listen for successful app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('[Kisan Setu PWA] Application successfully installed.');
    };

    // 4. Online/Offline status listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const dismissInstallPrompt = () => {
    setIsDismissed(true);
    setIsInstallable(false);
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable: isInstallable && !isDismissed && !isInstalled,
        isInstalled,
        isOnline,
        installPWA,
        dismissInstallPrompt
      }}
    >
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => useContext(PWAContext);

export default PWAContext;
