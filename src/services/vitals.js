import { onCLS, onFCP, onLCP, onTTFB, onINP } from 'web-vitals';

/**
 * ⚡ Core Web Vitals Telemetry Engine
 * Tracks FCP, LCP, CLS, TTFB, and INP metrics in real-time.
 */

export function reportMetric(metric) {
  const { name, value, rating } = metric;
  const ratingColors = {
    good: '#00E599',
    'needs-improvement': '#FDC800',
    poor: '#FF4D4D'
  };
  const color = ratingColors[rating] || '#000000';

  if (import.meta.env?.DEV) {
    console.log(
      `%c⚡ [Web Vitals] ${name}: ${Math.round(value * 100) / 100} (${rating})`,
      `background: ${color}; color: #000; font-weight: bold; padding: 2px 6px; border-radius: 4px;`
    );
  }

  // Dispatch custom event for in-app performance listeners or audits
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('web-vitals-metric', { detail: metric }));
  }
}

export function initWebVitals(customReporter = reportMetric) {
  if (typeof window === 'undefined') return;

  try {
    onCLS(customReporter);
    onFCP(customReporter);
    onLCP(customReporter);
    onTTFB(customReporter);
    if (typeof onINP === 'function') {
      onINP(customReporter);
    }
  } catch (err) {
    console.warn('Web Vitals initialization notice:', err);
  }
}
