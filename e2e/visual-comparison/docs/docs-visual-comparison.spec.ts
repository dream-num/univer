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

test.describe('Doc layout flavors', () => {
    for (const fixture of [
        { flavor: 1 as const, name: 'traditional' },
        { flavor: 2 as const, name: 'modern' },
    ]) {
        test(`${fixture.name} renders the representative layout fixture`, async ({ page }) => {
            const errors: Error[] = [];
            page.on('pageerror', (error) => errors.push(error));

            await page.goto('http://localhost:3000/docs/');
            await page.waitForTimeout(2_000);
            await page.evaluate((flavor) => window.E2EControllerAPI.loadDocLayoutFixture(flavor), fixture.flavor);

            await expect.poll(
                () => page.evaluate(() => window.univerAPI?.getActiveDocument()?.getDocumentFlavor()),
                { timeout: 10_000 }
            ).toBe(fixture.flavor);
            await expect(page).toHaveScreenshot(generateSnapshotName(`doc-layout-${fixture.name}`), { maxDiffPixels: 150 });
            expect(errors.map((error) => error.stack ?? error.message)).toEqual([]);
        });
    }
});
