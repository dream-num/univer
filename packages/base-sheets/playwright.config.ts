// playwright.config.ts
import { PlaywrightTestConfig, devices } from '@playwright/test';

const config: PlaywrightTestConfig = {
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    webServer: {
        command: 'npm run dev',
        port: 3103,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
    },
    use: {
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
};
export default config;

// import { PlaywrightTestConfig } from "@playwright/test";
// const config: PlaywrightTestConfig = {
//   use: {
//     channel: "chrome",
//   },
// };
// export default config;
