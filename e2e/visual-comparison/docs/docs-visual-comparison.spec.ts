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
            await expect.poll(async () => {
                const screenshot = await page.screenshot();
                return page.evaluate(async (base64) => {
                    const blob = await (await fetch(`data:image/png;base64,${base64}`)).blob();
                    const bitmap = await createImageBitmap(blob);
                    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    if (!context) return 0;
                    context.drawImage(bitmap, 0, 0);
                    const pixels = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
                    let ink = 0;
                    for (let index = 0; index < pixels.length; index += 16) {
                        const luminance = pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722;
                        if (pixels[index + 3] > 180 && luminance < 180) ink++;
                    }
                    return ink;
                }, screenshot.toString('base64'));
            }, { timeout: 10_000 }).toBeGreaterThan(1_000);
            expect(errors.map((error) => error.stack ?? error.message)).toEqual([]);
        });
    }
});
