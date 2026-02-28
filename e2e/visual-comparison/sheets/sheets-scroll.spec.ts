/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

    await page.evaluate(async () => {
        const dispatchWheelEvent = (deltaX: number, deltaY: number, element: HTMLElement, interval: number = 30, lastFor: number = 1000) => {
            const dispatchSimulateWheelEvent = (element) => {
                const event = new WheelEvent('wheel', {
                    bubbles: true,
                    cancelable: true,
                    deltaY,
                    deltaX,
                    clientX: 580,
                    clientY: 580,
                });
                element.dispatchEvent(event);
            };

            // mock wheel event.
            let intervalID;
            const continuousWheelSimulation = (element, interval) => {
                intervalID = setInterval(function () {
                    dispatchSimulateWheelEvent(element);
                }, interval);
            };

            // start mock wheel event.
            continuousWheelSimulation(element, interval);
            return new Promise((resolve) => {
                setTimeout(() => {
                    clearInterval(intervalID);
                    resolve(1);
                }, lastFor);
            });
        };
        const canvasElements = document.querySelectorAll('canvas[data-u-comp=render-canvas]') as unknown as HTMLElement[];
        const filteredCanvasElements = Array.from(canvasElements).filter((canvas) => canvas.offsetHeight > 500);
        const element = filteredCanvasElements[0];
        await dispatchWheelEvent(0, 100, element);
        await dispatchWheelEvent(0, -100, element);
    });
    await page.waitForTimeout(1000);

    const filename = generateSnapshotName('mergedCellsRenderingScrolling');
    const screenshot = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
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
            window.univerAPI.createUniverSheet(snapshot);
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
