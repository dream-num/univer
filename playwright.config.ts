/* eslint-disable node/prefer-global/process */
import { defineConfig, devices } from '@playwright/test';

/**
 * If you are running tests in CI, you can use the `CI` environment variable to adjust the configuration.
 */
const IS_CI = !!process.env.CI;
const HEADLESS = !!process.env.HEADLESS;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './e2e',
    outputDir: 'test-results/', // Make sure this is set
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: IS_CI,
    timeout: 30_000,
    /* No retry */
    retries: 0,
    /* Opt out of parallel tests on CI. */
    workers: IS_CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['json', { outputFile: 'playwright-report.json' }],
        ['html', { attachments: true }],
    ],
    // outputDir: './playwright-report',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://127.0.0.1:3000',

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'retain-on-failure',
    },
    /* Configure projects for major browsers */
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], headless: IS_CI || HEADLESS },
        },

        // {
        //   name: 'firefox',
        //   use: { ...devices['Desktop Firefox'] },
        // },

        // {
        //   name: 'webkit',
        //   use: { ...devices['Desktop Safari'] },
        // },

        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: { ...devices['Pixel 5'] },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: { ...devices['iPhone 12'] },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        // },
    ],

    webServer: {
        command: 'pnpm serve:e2e',
        url: 'http://localhost:3000',
        reuseExistingServer: !IS_CI,
        timeout: 10_000,
        stdout: 'ignore',
        stderr: 'pipe',
    },
});
