import { expect, test } from '@playwright/test';

const SHEET_MAIN_CANVAS = '[id^="univer-sheet-main-canvas_"]';
const SHEET_EDITOR_INPUT_CONTAINER = '#univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';

test('keeps the IME anchor on the active cell across edits', async ({ page }) => {
    await page.goto('/sheets/');
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(3000);
    await page.locator('#app').evaluate((element) => {
        element.style.width = 'calc(100% - 240px)';
        element.style.transform = 'translateX(240px)';
    });
    await page.evaluate(() => window.dispatchEvent(new Event('resize')));

    const canvas = page.locator(SHEET_MAIN_CANVAS);
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox).not.toBeNull();

    const inputContainer = page.locator(SHEET_EDITOR_INPUT_CONTAINER);
    const initialAnchorBox = await inputContainer.boundingBox();
    expect(initialAnchorBox).not.toBeNull();
    expect(initialAnchorBox!.x).toBeLessThan(canvasBox!.x);

    await page.mouse.click(canvasBox!.x + 200, canvasBox!.y + 120);
    await expect.poll(async () => (await inputContainer.boundingBox())?.x).toBeGreaterThanOrEqual(canvasBox!.x);

    const client = await page.context().newCDPSession(page);
    const anchorPositions: Array<{ x: number; y: number }> = [];
    for (const [composition, text] of [['a', '啊'], ['ai', '爱']]) {
        await client.send('Input.imeSetComposition', {
            text: composition,
            selectionStart: composition.length,
            selectionEnd: composition.length,
            replacementStart: 0,
            replacementEnd: 0,
        });

        const anchorBox = await inputContainer.boundingBox();
        expect(anchorBox).not.toBeNull();
        expect(anchorBox!.x).toBeGreaterThanOrEqual(canvasBox!.x);
        expect(anchorBox!.x).toBeLessThan(canvasBox!.x + canvasBox!.width);
        expect(anchorBox!.y).toBeGreaterThanOrEqual(canvasBox!.y);
        expect(anchorBox!.y).toBeLessThan(canvasBox!.y + canvasBox!.height);
        anchorPositions.push({ x: anchorBox!.x, y: anchorBox!.y });

        await client.send('Input.insertText', { text });
        await page.keyboard.press('Enter');
    }

    expect(anchorPositions[1].y).toBeGreaterThan(anchorPositions[0].y);
});

test('preserves cell styles after deleting all text and entering new IME text', async ({ page }) => {
    await page.goto('/sheets/');
    await page.waitForFunction(() => !!window.univerAPI && !!window.E2EControllerAPI);
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());

    const canvas = page.locator(SHEET_MAIN_CANVAS);
    await expect(canvas).toBeVisible();
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) {
        throw new Error('Expected the sheet canvas to have a bounding box');
    }

    await page.mouse.click(canvasBox.x + 200, canvasBox.y + 120);
    const cell = await page.evaluate(() => {
        const range = window.univerAPI.getActiveWorkbook().getActiveRange();
        if (!range) {
            throw new Error('Expected an active sheet range');
        }

        range
            .setValue('A')
            .setHorizontalAlignment('center')
            .setVerticalAlignment('middle')
            .setFontSize(20)
            .setFontColor('#f05252');

        return range.getA1Notation();
    });

    await page.keyboard.press('F2');
    const inputContainer = page.locator(SHEET_EDITOR_INPUT_CONTAINER);
    await expect.poll(async () => (await inputContainer.boundingBox())?.x).toBeGreaterThanOrEqual(canvasBox.x);

    await page.keyboard.press('Backspace');

    const client = await page.context().newCDPSession(page);
    await client.send('Input.imeSetComposition', {
        text: 'xin',
        selectionStart: 3,
        selectionEnd: 3,
        replacementStart: 0,
        replacementEnd: 0,
    });
    await client.send('Input.insertText', { text: '新' });
    await page.keyboard.press('Enter');

    await expect.poll(() => page.evaluate((a1Notation) => {
        const range = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a1Notation);
        const style = range.getCellStyleData('cell');
        return {
            value: range.getValue(),
            horizontalAlignment: range.getHorizontalAlignment(),
            verticalAlignment: range.getVerticalAlignment(),
            fontSize: style?.fs,
            fontColor: style?.cl?.rgb,
        };
    }, cell)).toEqual({
        value: '新',
        horizontalAlignment: 'center',
        verticalAlignment: 'middle',
        fontSize: 20,
        fontColor: '#f05252',
    });
});
