import { chromium, expect, test } from '@playwright/test';
import { generateSnapshotName } from '../const';

const SHEET_MAIN_CANVAS_ID = '#univer-sheet-main-canvas_workbook-01';
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
