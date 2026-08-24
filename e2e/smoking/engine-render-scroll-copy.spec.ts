import { expect, test } from '@playwright/test';

test('preserves pixels across independent viewport copies on a short canvas', async ({ page }) => {
    await page.goto('/sheets/');
    await page.waitForFunction(() => window.E2EControllerAPI != null);

    const pixelAlphaByRatio = await page.evaluate(() => [1, 2].map((pixelRatio) => {
        const canvas = document.createElement('canvas');
        canvas.width = 8 * pixelRatio;
        canvas.height = 4 * pixelRatio;
        const nativeContext = canvas.getContext('2d');
        if (nativeContext == null) {
            throw new Error('Failed to create the regression canvas.');
        }

        nativeContext.fillStyle = '#2563eb';
        nativeContext.fillRect(0, 0, canvas.width, canvas.height);
        window.E2EControllerAPI.scrollAndClearCanvas(canvas, pixelRatio, [
            {
                bounds: { left: 2, top: 0, right: 8, bottom: 4 },
                offsetX: 0,
                offsetY: -1,
            },
            {
                bounds: { left: 0, top: 0, right: 2, bottom: 4 },
                offsetX: 0,
                offsetY: -1,
            },
        ], [{ left: 0, top: 3, right: 8, bottom: 4 }]);

        const getAlpha = (x: number, y: number) =>
            nativeContext.getImageData(x * pixelRatio, y * pixelRatio, 1, 1).data[3];
        return {
            main: getAlpha(4, 1),
            header: getAlpha(1, 1),
            dirty: getAlpha(4, 3),
        };
    }));

    expect(pixelAlphaByRatio).toEqual([
        { main: 255, header: 255, dirty: 0 },
        { main: 255, header: 255, dirty: 0 },
    ]);
});
