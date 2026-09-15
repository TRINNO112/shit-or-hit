import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration for SHIT OR HIT
 * Runs automated browser integration tests against isolated local environments.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1, // Sequential execution for stable mock localStorage isolation
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:5178',
    trace: 'on-first-retry',
    headless: true,
    viewport: { width: 1600, height: 900 },
    extraHTTPHeaders: {
      'x-test-sandbox': 'true'
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: [
    {
      command: 'node server/index.js',
      port: 5001,
      timeout: 30000,
      reuseExistingServer: true,
      env: {
        NODE_ENV: 'test',
        IS_PLAYWRIGHT: 'true'
      }
    },
    {
      command: 'npx vite --port 5178 --strictPort',
      port: 5178,
      timeout: 30000,
      reuseExistingServer: false
    }
  ]
});
