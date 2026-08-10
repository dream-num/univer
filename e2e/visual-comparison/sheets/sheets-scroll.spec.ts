import { chromium, expect, test } from '@playwright/test';
import { generateSnapshotName } from '../const';

const SHEET_MAIN_CANVAS_ID = '#univer-sheet-main-canvas_workbook-01';
const SHEET_SCROLLBAR_SIZE = 11;
const isCI = !!process.env.CI;

test('cells rendering after scrolling', async () => {
    const browser = await chromium.launch({
        headless: isCI, // Set to false to see the browser window in local
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadMergeCellSheet());
    await page.waitForTimeout(1000);

    const canvas = page.locator(SHEET_MAIN_CANVAS_ID);
    await canvas.evaluate(async (element: HTMLCanvasElement) => {
        const scroll = async (deltaY: number) => {
            for (let elapsed = 0; elapsed < 1000; elapsed += 30) {
                element.dispatchEvent(new WheelEvent('wheel', {
                    bubbles: true,
                    cancelable: true,
                    deltaY,
                    clientX: 580,
                    clientY: 580,
                }));
                await new Promise((resolve) => setTimeout(resolve, 30));
            }
        };
        await scroll(100);
        await scroll(-100);
    });
    await page.evaluate(() => new Promise<void>((resolve) => {
        let previous = '';
        let stableFrames = 0;
        const check = () => {
            const current = JSON.stringify(window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState());
            stableFrames = current === previous ? stableFrames + 1 : 0;
            previous = current;
            if (stableFrames >= 5) {
                resolve();
                return;
            }
            requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
    }));

    const filename = generateSnapshotName('mergedCellsRenderingScrolling');
    const screenshot = await canvas.screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
});

test('incremental merged-cell repaint matches a full refresh', async () => {
    const browser = await chromium.launch({ headless: isCI });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadMergeCellSheet());
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(page.getByText('Custom Loading...', { exact: true })).toHaveCount(0, { timeout: 15_000 });
    await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    });

    const canvas = page.locator(SHEET_MAIN_CANVAS_ID);
    await canvas.evaluate(async (element: HTMLCanvasElement) => {
        const scroll = async (deltaY: number) => {
            for (let elapsed = 0; elapsed < 1000; elapsed += 30) {
                element.dispatchEvent(new WheelEvent('wheel', {
                    bubbles: true,
                    cancelable: true,
                    deltaY,
                    clientX: 580,
                    clientY: 580,
                }));
                await new Promise((resolve) => setTimeout(resolve, 30));
            }
        };
        await scroll(100);
        await scroll(-100);
    });
    await page.evaluate(() => new Promise<void>((resolve) => {
        let previous = '';
        let stableFrames = 0;
        const check = () => {
            const current = JSON.stringify(window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState());
            stableFrames = current === previous ? stableFrames + 1 : 0;
            previous = current;
            if (stableFrames >= 5) {
                resolve();
                return;
            }
            requestAnimationFrame(check);
        };
        requestAnimationFrame(check);
    }));

    await canvas.evaluate((source: HTMLCanvasElement) => {
        const reference = document.createElement('canvas');
        reference.id = 'merge-scroll-incremental-reference';
        reference.style.display = 'none';
        reference.width = source.width;
        reference.height = source.height;
        const sourceContext = source.getContext('2d');
        const referenceContext = reference.getContext('2d');
        if (!sourceContext || !referenceContext) {
            throw new Error('Failed to read incremental canvas pixels');
        }
        referenceContext.putImageData(sourceContext.getImageData(0, 0, source.width, source.height), 0, 0);
        document.body.appendChild(reference);
    });

    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().refreshCanvas());
    await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));

    const differentPixels = await canvas.evaluate((source: HTMLCanvasElement, scrollBarSize) => {
        const reference = document.querySelector<HTMLCanvasElement>('#merge-scroll-incremental-reference');
        const sourceContext = source.getContext('2d');
        const referenceContext = reference?.getContext('2d');
        if (!reference || !sourceContext || !referenceContext) {
            throw new Error('Failed to read canvas pixels');
        }
        if (source.width !== reference.width || source.height !== reference.height) {
            return Number.POSITIVE_INFINITY;
        }
        const actual = sourceContext.getImageData(0, 0, source.width, source.height).data;
        const expected = referenceContext.getImageData(0, 0, reference.width, reference.height).data;
        const activeWorkbook = window.univerAPI.getActiveWorkbook();
        const activeSheet = activeWorkbook.getActiveSheet();
        const sheetSnapshot = activeWorkbook.save().sheets[activeSheet.getSheetId()];
        const pixelRatio = source.width / source.getBoundingClientRect().width;
        const left = Math.round((sheetSnapshot.rowHeader?.hidden ? 0 : sheetSnapshot.rowHeader?.width ?? 0) * pixelRatio);
        const top = Math.round((sheetSnapshot.columnHeader?.hidden ? 0 : sheetSnapshot.columnHeader?.height ?? 0) * pixelRatio);
        const right = Math.round(source.width - scrollBarSize * pixelRatio);
        const bottom = Math.round(source.height - scrollBarSize * pixelRatio);
        let count = 0;
        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                const index = (y * source.width + x) * 4;
                if (
                    actual[index] !== expected[index] ||
                    actual[index + 1] !== expected[index + 1] ||
                    actual[index + 2] !== expected[index + 2] ||
                    actual[index + 3] !== expected[index + 3]
                ) {
                    count++;
                }
            }
        }
        reference.remove();
        return count;
    }, SHEET_SCROLLBAR_SIZE);
    await browser.close();
    expect(differentPixels).toBeLessThanOrEqual(1);
});

test('rendering after scrolling by API', async () => {
    const browser = await chromium.launch({
        headless: isCI, // Set to false to see the browser window in local
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadMergeCellSheet());
    await page.evaluate(async () => {
        const activeSheet = window.univerAPI.getActiveWorkbook().getActiveSheet();
        activeSheet.scrollToCell(2, 4);
    });
    await page.waitForTimeout(1000);
    const filename = generateSnapshotName('renderingAfterScrollByAPI');
    const screenshot = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
});

test('status bar count with array formula selection', async () => {
    const browser = await chromium.launch({
        headless: isCI, // Set to false to see the browser window in local
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    // Load the snapshot with array formula
    await page.evaluate(() => {
        const snapshot = {
            id: 'workbook-status-bar-array-formula',
            sheetOrder: [
                'sheet-01',
            ],
            name: 'New Sheet',
            appVersion: '1',
            locale: 'enUS',
            styles: {},
            sheets: {
                'sheet-01': {
                    id: 'sheet-01',
                    name: 'Sheet1',
                    rowCount: 1000,
                    columnCount: 20,
                    freeze: {
                        xSplit: 0,
                        ySplit: 0,
                        startRow: -1,
                        startColumn: -1,
                    },
                    hidden: 0,
                    rowData: {},
                    tabColor: '',
                    mergeData: [],
                    rowHeader: {
                        width: 46,
                        hidden: 0,
                    },
                    scrollTop: 200,
                    zoomRatio: 1,
                    columnData: {},
                    scrollLeft: 100,
                    rightToLeft: 0,
                    columnHeader: {
                        height: 20,
                        hidden: 0,
                    },
                    showGridlines: 1,
                    defaultRowHeight: 24,
                    defaultColumnWidth: 88,
                    cellData: {
                        0: {
                            0: {
                                v: 1,
                                t: 2,
                            },
                            1: {
                                v: 1,
                                t: 2,
                            },
                            3: {
                                f: '=A1:B2',
                                t: 2,
                            },
                            5: {
                                v: 2,
                                t: 2,
                            },
                        },
                        1: {
                            0: {
                                v: 1,
                                t: 2,
                            },
                            1: {
                                v: 1,
                                t: 2,
                            },
                            5: {
                                v: 2,
                                t: 2,
                            },
                        },
                    },
                },
            },
        };
        window.univerAPI.dispose();
        setTimeout(() => {
            window.univerAPI.createWorkbook(snapshot);
        }, 500);
    });
    await page.waitForTimeout(1000);

    // Select the array formula range D1:E2
    await page.evaluate(() => {
        const activeRange = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange({ startRow: 0, startColumn: 3, endRow: 1, endColumn: 5 });
        activeRange.activate();

        // set new value to trigger status bar update
        const range = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange({ startRow: 1, startColumn: 5, endRow: 1, endColumn: 5 });
        range.setValue(3);
    });
    await page.waitForTimeout(1000);

    // Take screenshot including status bar
    const filename = generateSnapshotName('arrayFormulaStatusBarCount');
    const screenshot = await page.screenshot({ fullPage: false });
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
});
