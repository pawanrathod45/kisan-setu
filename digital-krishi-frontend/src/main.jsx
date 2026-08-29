import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/Responsive.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { registerServiceWorker } from './registerServiceWorker';

// Register PWA Service Worker for offline capability & mobile installation
registerServiceWorker();

// Global resilience handler for browser extension errors & unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    if (!reason || typeof reason === 'object') {
      const isExtensionError =
        !reason ||
        reason.errNo === -2 ||
        reason.errMsg?.includes('Service is currently unstable') ||
        reason.message?.includes('message channel closed') ||
        reason.message?.includes('startTime') ||
        Object.keys(reason).length === 0;

      if (isExtensionError) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event?.message?.includes("reading 'startTime'") ||
      event?.message?.includes('reportAllChanges') ||
      event?.message?.includes('message channel closed')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
