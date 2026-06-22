import { chromium, expect, test } from '@playwright/test';
import { generateSnapshotName } from '../const';

const isCI = !!process.env.CI;

test('ensure switching render unit successful with no errors', async () => {
    const browser = await chromium.launch({
        headless: isCI, // Set to false to see the browser window
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();

    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet());
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(1000);

    const filename = generateSnapshotName('switching-render-unit');
    const firstScreenshot = await page.screenshot({
        mask: [
            page.locator('[data-u-comp=headerbar]'),
            page.locator('[data-u-comp=formula-bar]'),
        ],
        fullPage: true,
    });
    expect(firstScreenshot).toMatchSnapshot(filename, { maxDiffPixels: 120 });
});
