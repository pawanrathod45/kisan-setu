import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import './styles/Responsive.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Global resilience handler for browser extension errors & unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const isExtensionError =
      (reason && typeof reason === 'object' && reason.errNo === -2) ||
      (reason && typeof reason === 'object' && reason.errMsg?.includes('Service is currently unstable')) ||
      (reason?.message && reason.message.includes('message channel closed')) ||
      (reason?.message && reason.message.includes('startTime'));

    if (isExtensionError) {
      event.preventDefault();
      event.stopPropagation();
      return;
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
