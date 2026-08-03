import { expect, test } from '@playwright/test';
import { generateSnapshotName } from '../const';

test('embedded document keeps slide text layout', async ({ page }) => {
    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));

    await page.goto('/slides/');
    await page.evaluate(() => window.E2EControllerAPI.loadSlideLayoutFixture());

    await expect(page).toHaveScreenshot(generateSnapshotName('slide-embedded-doc-layout'), { maxDiffPixels: 150 });
    expect(errors.map((error) => error.stack ?? error.message)).toEqual([]);
});
