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

// ⚡ Lazy Telemetry: Load Sentry asynchronously during idle time post-first-paint
const initDeferredSentry = () => {
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
      integrations,
      tracesSampleRate: isMobileDevice ? 0.2 : 1.0,
      tracePropagationTargets: ["localhost", /^\/api/],
      replaysSessionSampleRate: 0.05,
      replaysOnErrorSampleRate: isMobileDevice ? 0 : 1.0
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

