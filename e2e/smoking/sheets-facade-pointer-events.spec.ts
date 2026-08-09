import { expect, test } from '@playwright/test';

const SHEET_MAIN_CANVAS = '[id^="univer-sheet-main-canvas_"]';

test('bridges sheet pointer events when the workbook is created after the Facade', async ({ page }) => {
    const pageErrors: string[] = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/sheets/');
    await page.waitForFunction(() => !!window.univerAPI && !!window.E2EControllerAPI);
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());

    await page.evaluate(() => {
        document.documentElement.dataset.cellPointerDown = '0';
        document.documentElement.dataset.cellHovered = '0';
        window.univerAPI.addEvent(window.univerAPI.Event.CellPointerDown, () => {
            document.documentElement.dataset.cellPointerDown = '1';
        });
        window.univerAPI.addEvent(window.univerAPI.Event.CellHover, () => {
            document.documentElement.dataset.cellHovered = '1';
        });
    });

    const canvas = page.locator(SHEET_MAIN_CANVAS);
    await expect(canvas).toBeVisible();
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('Sheet canvas is not visible');

    await page.mouse.move(canvasBox.x + 160, canvasBox.y + 100);
    await page.mouse.move(canvasBox.x + 260, canvasBox.y + 140);
    await page.mouse.click(canvasBox.x + 260, canvasBox.y + 140, { delay: 50 });

    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.cellHovered)).toBe('1');
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.cellPointerDown)).toBe('1');
    expect(pageErrors).toEqual([]);
});
