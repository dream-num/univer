import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const SHEET_MAIN_CANVAS = '[id^="univer-sheet-main-canvas_"]';
const FORMULA_SUGGESTIONS = '[data-u-comp="sheets-formula-editor"]';
const SHEET_EDITOR_INPUT = '#univer-doc-selection-container-__INTERNAL_EDITOR__DOCS_NORMAL';

interface IPoint {
    x: number;
    y: number;
}

async function prepareFormulaSheet(page: Page): Promise<void> {
    await page.goto('/sheets/');
    await page.waitForFunction(() => !!window.univerAPI && !!window.E2EControllerAPI);
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet(1000));
    await page.locator(SHEET_EDITOR_INPUT).waitFor({ state: 'attached' });
    await page.evaluate(async () => {
        const workbook = window.univerAPI.getActiveWorkbook();
        const worksheet = workbook.create('formula-e2e', 30, 12);
        await worksheet.getRange('A1:F6').setValues([
            [1, 2, 3, 4, 5, 6],
            [7, 8, 9, 10, 11, 12],
            [13, 14, 15, 16, 17, 18],
            [19, 20, 21, 22, 23, 24],
            [25, 26, 27, 28, 29, 30],
            [31, 32, 33, 34, 35, 36],
        ]);
        const dataWorksheet = workbook.create('数据 表', 30, 12);
        await dataWorksheet.getRange('A1:C2').setValues([
            [10, 20, 30],
            [40, 50, 60],
        ]);
        workbook.setActiveSheet(worksheet);
    });

    await expect(page.locator(SHEET_MAIN_CANVAS)).toBeVisible();
}

async function getCellCenter(page: Page, address: string): Promise<IPoint> {
    const canvasBox = await page.locator(SHEET_MAIN_CANVAS).boundingBox();
    if (!canvasBox) throw new Error('Sheet canvas is not visible');

    const cellRect = await page.evaluate((cellAddress) => {
        const worksheet = window.univerAPI.getActiveWorkbook().getActiveSheet();
        return worksheet.getRange(cellAddress).getCellRect();
    }, address);

    return {
        x: canvasBox.x + cellRect.left + cellRect.width / 2,
        y: canvasBox.y + cellRect.top + cellRect.height / 2,
    };
}

async function doubleClickCell(page: Page, address: string): Promise<void> {
    const point = await getCellCenter(page, address);
    await page.mouse.dblclick(point.x, point.y, { delay: 80 });
}

async function clickCell(page: Page, address: string): Promise<void> {
    const point = await getCellCenter(page, address);
    await page.mouse.click(point.x, point.y);
}

async function dragRange(page: Page, startAddress: string, endAddress: string): Promise<void> {
    const start = await getCellCenter(page, startAddress);
    const end = await getCellCenter(page, endAddress);
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 8 });
    await page.mouse.up();
}

async function getFormula(page: Page, address: string): Promise<string> {
    return page.evaluate((cellAddress) => {
        const worksheet = window.univerAPI.getActiveWorkbook().getActiveSheet();
        return worksheet.getRange(cellAddress).getFormula();
    }, address);
}

async function getFormulaFromSheet(page: Page, sheetName: string, address: string): Promise<string> {
    return page.evaluate(({ cellAddress, name }) => {
        const worksheet = window.univerAPI.getActiveWorkbook().getSheetByName(name);
        if (!worksheet) throw new Error(`Worksheet ${name} is not available`);
        return worksheet.getRange(cellAddress).getFormula();
    }, { cellAddress: address, name: sheetName });
}

async function getValue(page: Page, address: string): Promise<unknown> {
    return page.evaluate((cellAddress) => {
        const worksheet = window.univerAPI.getActiveWorkbook().getActiveSheet();
        return worksheet.getRange(cellAddress).getValue();
    }, address);
}

async function insertSumFunction(page: Page): Promise<void> {
    await page.keyboard.type('=su');
    const suggestions = page.locator(FORMULA_SUGGESTIONS);
    await expect(suggestions).toBeVisible();
    await suggestions.locator('li').filter({ hasText: /^SUM/ }).first().click();
    await expect(suggestions).toBeHidden();
    await page.waitForTimeout(300);
}

async function activateSheetByName(page: Page, sheetName: string): Promise<void> {
    const tab = page.getByRole('tab', { name: sheetName, exact: true });
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
}

async function getShortcutModifier(page: Page): Promise<'Control' | 'Meta'> {
    return page.evaluate(() => /Mac/.test(navigator.appVersion) ? 'Meta' : 'Control');
}

async function getRedoShortcut(page: Page): Promise<string> {
    return page.evaluate(() => /Mac/.test(navigator.appVersion) ? 'Meta+Shift+z' : 'Control+y');
}

async function pasteFromSystemClipboard(page: Page): Promise<void> {
    await page.evaluate(async () => {
        const [clipboardItem] = await navigator.clipboard.read();
        if (!clipboardItem) throw new Error('The system clipboard is empty');

        const clipboardData = new DataTransfer();
        for (const type of clipboardItem.types) {
            if (type === 'text/plain' || type === 'text/html') {
                clipboardData.setData(type, await (await clipboardItem.getType(type)).text());
            }
        }
        const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData,
        });
        (document.activeElement ?? document.body).dispatchEvent(pasteEvent);
    });
}

test.describe('sheet formula reference selection', () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeEach(async ({ page }) => {
        await prepareFormulaSheet(page);
    });

    test('builds multiple formula references with the mouse and commits them', async ({ page }) => {
        await doubleClickCell(page, 'H2');
        await insertSumFunction(page);

        await dragRange(page, 'B2', 'D4');
        await page.keyboard.down('Control');
        await dragRange(page, 'F2', 'E3');
        await page.keyboard.up('Control');
        await page.keyboard.press('Enter');

        await expect.poll(() => getFormula(page, 'H2')).toBe('=SUM(B2:D4,E2:F3)');
        await expect.poll(() => getValue(page, 'H2')).toBe(193);
    });

    test('creates and expands formula references with the keyboard', async ({ page }) => {
        await doubleClickCell(page, 'H3');
        await insertSumFunction(page);

        const firstReference = await getCellCenter(page, 'B2');
        await page.mouse.click(firstReference.x, firstReference.y);
        await page.waitForTimeout(100);
        await page.keyboard.press('Shift+ArrowRight');
        await page.waitForTimeout(100);
        await page.keyboard.press('Shift+ArrowRight');
        await page.waitForTimeout(100);
        await page.keyboard.press('Shift+ArrowDown');
        await page.waitForTimeout(100);
        await page.keyboard.type(',');
        await page.waitForTimeout(100);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
        await page.keyboard.press('Shift+ArrowDown');
        await page.waitForTimeout(100);
        await page.keyboard.press('Enter');

        await expect.poll(() => getFormula(page, 'H3')).toBe('=SUM(B2:D3,E2:E3)');
        await expect.poll(() => getValue(page, 'H3')).toBe(100);
    });

    test('cycles a reference through every absolute state with F4', async ({ page }) => {
        const cases = [
            { address: 'H5', presses: 1, expected: '=$B$2' },
            { address: 'H6', presses: 2, expected: '=B$2' },
            { address: 'H7', presses: 3, expected: '=$B2' },
            { address: 'H8', presses: 4, expected: '=B2' },
        ];

        for (const testCase of cases) {
            await doubleClickCell(page, testCase.address);
            await page.keyboard.type('=B2');
            await page.waitForTimeout(100);
            for (let index = 0; index < testCase.presses; index++) {
                await page.keyboard.press('F4');
                await page.waitForTimeout(100);
            }
            await page.keyboard.press('Enter');
            await expect.poll(() => getFormula(page, testCase.address)).toBe(testCase.expected);
        }
    });

    test('cancels formula editing with Escape without leaving reference-selection state behind', async ({ page }) => {
        await doubleClickCell(page, 'H9');
        await insertSumFunction(page);
        await dragRange(page, 'A1', 'C3');
        await page.keyboard.press('Escape');

        await expect.poll(() => getFormula(page, 'H9')).toBe('');
        await expect(page.locator(FORMULA_SUGGESTIONS)).toBeHidden();

        await clickCell(page, 'H10');
        await page.keyboard.type('42');
        await page.keyboard.press('Enter');
        await expect.poll(() => getValue(page, 'H10')).toBe(42);
    });

    test('builds and commits a cross-sheet reference through sheet tabs', async ({ page }) => {
        await doubleClickCell(page, 'H11');
        await insertSumFunction(page);

        await activateSheetByName(page, '数据 表');
        await page.waitForTimeout(300);
        await dragRange(page, 'A1', 'C2');
        await page.keyboard.press('Enter');

        await expect.poll(() => getFormulaFromSheet(page, 'formula-e2e', 'H11'))
            .toBe("=SUM('数据 表'!A1:C2)");
        await activateSheetByName(page, 'formula-e2e');
        await expect.poll(() => getValue(page, 'H11')).toBe(210);
    });

    test('edits an existing formula reference at the caret and preserves the other reference', async ({ page }) => {
        await page.evaluate(async () => {
            const worksheet = window.univerAPI.getActiveWorkbook().getActiveSheet();
            await worksheet.getRange('H12').setFormula('=SUM(B2:D3,E2:E3)');
        });

        await doubleClickCell(page, 'H12');
        await page.keyboard.press('End');
        await page.keyboard.press('ArrowLeft');
        await page.keyboard.press('F4');
        await page.keyboard.press('Enter');

        await expect.poll(() => getFormula(page, 'H12')).toBe('=SUM(B2:D3,E2:$E$3)');
        await expect.poll(() => getValue(page, 'H12')).toBe(100);
    });

    test('keeps relative formula copy, undo, and redo in one user workflow', async ({ page }) => {
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
        const shortcutModifier = await getShortcutModifier(page);

        await doubleClickCell(page, 'H13');
        await page.keyboard.type('=B2+C2');
        await page.keyboard.press('Enter');
        await expect.poll(() => getFormula(page, 'H13')).toBe('=B2+C2');

        await clickCell(page, 'H13');
        await page.keyboard.press(`${shortcutModifier}+c`);
        await clickCell(page, 'I13');
        await pasteFromSystemClipboard(page);
        await expect.poll(() => getFormula(page, 'I13')).toBe('=C2+D2');
        await expect.poll(() => getValue(page, 'I13')).toBe(19);

        await page.keyboard.press(`${shortcutModifier}+z`);
        await expect.poll(() => getFormula(page, 'I13')).toBe('');
        await page.keyboard.press(await getRedoShortcut(page));
        await expect.poll(() => getFormula(page, 'I13')).toBe('=C2+D2');
        await expect.poll(() => getValue(page, 'I13')).toBe(19);
    });
});
