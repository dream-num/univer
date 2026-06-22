import { expect, test } from '@playwright/test';
import { generateSnapshotName } from '../const';

test('diff default doc content', async ({ page }) => {
    let errored = false;

    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/docs/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultDoc());
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot(generateSnapshotName('default-doc'), { maxDiffPixels: 100 });
    expect(errored).toBeFalsy();
});
