import { defineConfig, devices } from '@playwright/test';

// End-to-end tests run against the built store, served by the real Express server.
const port = Number(process.env.E2E_PORT || 3100);
// Optional: path to an already installed Chrome or Chromium (useful offline).
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    launchOptions: { executablePath },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && node server/index.js',
    url: `http://localhost:${port}/api/health`,
    env: { SITE_PORT: String(port) },
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
