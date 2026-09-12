import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { initWebVitals } from './services/vitals.js';
import './index.css';

const sentryDsn = import.meta.env.VITE_SENTRY_DSN || "https://27e944bed5f1dd7b412afbc72fb939c7@o4512074817011712.ingest.us.sentry.io/4512074829594624";

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ],
    // Tracing
    tracesSampleRate: 1.0,
    tracePropagationTargets: ["localhost", /^\/api/],
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0
  });
  window.Sentry = Sentry;
}


initWebVitals();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

