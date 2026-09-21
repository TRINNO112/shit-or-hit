import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { initWebVitals } from './services/vitals.js';
import './index.css';

// ⚡ Instant Critical Path Render: Paint UI immediately without waiting for heavy monitoring SDKs
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

initWebVitals();

// ⚡ Lazy Telemetry: Load Sentry asynchronously during idle time post-first-paint (Production Only)
const initDeferredSentry = () => {
  // 🔇 Localhost & Dev Isolation: Never initialize or send telemetry events from local dev ports
  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.local')
  );
  if (isLocalHost || !import.meta.env.PROD) {
    return;
  }

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN || "https://27e944bed5f1dd7b412afbc72fb939c7@o4512074817011712.ingest.us.sentry.io/4512074829594624";
  if (!sentryDsn) return;

  import('@sentry/react').then((Sentry) => {
    const isMobileDevice = typeof window !== 'undefined' && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
    );

    const integrations = [Sentry.browserTracingIntegration()];
    // ⚡ Performance Guard: Only attach heavy DOM mutation replay observer on desktop
    if (!isMobileDevice) {
      integrations.push(Sentry.replayIntegration());
    }

    Sentry.init({
      dsn: sentryDsn,
      environment: 'production',
      integrations,
      tracesSampleRate: isMobileDevice ? 0.2 : 0.6,
      tracePropagationTargets: [/^\/api/],
      replaysSessionSampleRate: 0.0,
      replaysOnErrorSampleRate: isMobileDevice ? 0 : 0.5,
      ignoreErrors: [
        'Failed to fetch dynamically imported module',
        'ChunkLoadError',
        'Loading chunk',
        'NetworkError when attempting to fetch resource',
        'ResizeObserver loop completed with undelivered notifications',
        'ResizeObserver loop limit exceeded'
      ]
    });
    window.Sentry = Sentry;
  }).catch((err) => {
    console.warn('Sentry background initialization skipped:', err);
  });
};

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(initDeferredSentry, { timeout: 2500 });
  } else {
    setTimeout(initDeferredSentry, 1200);
  }
}

