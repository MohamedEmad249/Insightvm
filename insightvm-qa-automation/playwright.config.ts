import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for InsightVM.com QA Automation
 *
 * This configuration sets up:
 * - Multiple browser projects (Chromium, Firefox, WebKit)
 * - Desktop and mobile viewports
 * - Screenshot/video capture on failure
 * - HTML reporter for test results
 * - Retry logic for flaky tests
 */
export default defineConfig({
  // Test directory
  testDir: './tests',

  // Test file pattern
  testMatch: '**/*.spec.ts',

  // Maximum time for each test
  timeout: 30000,

  // Assertion timeout
  expect: {
    timeout: 10000,
  },

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry failed tests
  retries: process.env.CI ? 2 : 1,

  // Number of parallel workers
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: 'playwright-report',
      },
    ],
    ['json', { outputFile: 'test-results/results.json' }],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'https://www.insightvm.com',

    // Collect trace on first retry
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'on-first-retry',

    // Action timeout
    actionTimeout: 10000,

    // Navigation timeout
    navigationTimeout: 30000,

    // Ignore HTTPS errors (useful for staging environments)
    ignoreHTTPSErrors: true,

    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  // Output directory for test artifacts (screenshots, videos, traces)
  outputDir: 'test-results/artifacts',

  // Browser projects
  projects: [
    // ──────────────────────────────
    // Desktop Browsers
    // ──────────────────────────────
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'firefox-desktop',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
      },
    },
    {
      name: 'webkit-desktop',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // ──────────────────────────────
    // Mobile Devices
    // ──────────────────────────────
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 13'],
      },
    },

    // ──────────────────────────────
    // Tablet
    // ──────────────────────────────
    {
      name: 'tablet-safari',
      use: {
        ...devices['iPad (gen 7)'],
      },
    },
  ],
});
