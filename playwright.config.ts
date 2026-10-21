import { defineConfig, devices } from '@playwright/test';

const port = 3100;

// On NixOS the bundled browsers are missing. Point CHROME_PATH at any Chrome or Chromium binary.
const executablePath = process.env.CHROME_PATH || undefined;

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'retain-on-failure',
    locale: 'sv-SE',
    timezoneId: 'Europe/Stockholm',
    launchOptions: { executablePath },
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'], launchOptions: { executablePath } },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 }, launchOptions: { executablePath } },
    },
  ],
  webServer: {
    command: `npm run build && npx next start -p ${port}`,
    url: `http://localhost:${port}/edit`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
