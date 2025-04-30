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

test('diff default sheet toolbar', async () => {
    const browser = await chromium.launch({
        headless: isCI, // Set to false to see the browser window
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(1000);

    const filename = generateSnapshotName('default-sheet-fullpage');
    const screenshot = await page.screenshot({
        mask: [
            page.locator('[data-u-comp=headerbar]'),
            page.locator('[data-u-comp=defined-name]'),
        ],
        fullPage: true,
    });
    expect(screenshot).toMatchSnapshot(filename, { maxDiffPixels: 100 });
});

test('diff sheet dark mode', async () => {
    const browser = await chromium.launch({
        headless: isCI, // Set to false to see the browser window
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.E2EControllerAPI.setDarkMode(true));
    await page.waitForTimeout(1000);

    const filename = generateSnapshotName('dark-mode');
    const screenshot = await page.screenshot({
        mask: [
            page.locator('[data-u-comp=headerbar]'),
            page.locator('[data-u-comp=defined-name]'),
        ],
        fullPage: true,
    });
    expect(screenshot).toMatchSnapshot(filename, { maxDiffPixels: 100 });
});

test('diff default sheet content', async ({ page }) => {
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(1000);

    const filename = generateSnapshotName('default-sheet');
    const screenshot = await page.locator('#univer-sheet-main-canvas_test').screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
});

test('diff demo sheet content', async ({ page }) => {
    let errored = false;

    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet());
    await page.waitForTimeout(1000);

    const filename = generateSnapshotName('demo-sheet');
    const screenshot = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
    expect(errored).toBeFalsy();
});

/**
 * Aim for merged cells rendering.
 */
test('diff merged cells rendering', async () => {
    const browser = await chromium.launch({
        headless: !!isCI, // Set to false to see the browser window
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

    const filename = generateSnapshotName('mergedCellsRendering');
    const screenshot = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
});

/**
 * Aim for default sheet style.
 */
test('diff sheet default style rendering', async () => {
    const browser = await chromium.launch({
        headless: !!isCI, // Set to false to see the browser window
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultStyleSheet());
    await page.waitForTimeout(1000);

    const filename = generateSnapshotName('defaultstyle');
    const screenshot = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
});

test('diff facade sheet hooks', async () => {
    const browser = await chromium.launch({
        headless: !!isCI, // Set to false to see the browser window
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultStyleSheet());
    await page.waitForTimeout(1000);

    await page.evaluate(() => window.univerAPI.getSheetHooks().onCellRender([{
        drawWith: (ctx, info) => {
            const { row, col } = info;
            // Update to any cell location you want
            if (row === 1 && col === 2) {
                const { primaryWithCoord } = info;
                const { startX, startY } = primaryWithCoord;
                ctx.fillText('Univer', startX, startY + 10);
            }
        },
    }]));
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().refreshCanvas());

    const filename = generateSnapshotName('facade-sheet-hooks');
    const screenshot = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });
});

test('diff set force string cell', async () => {
    const browser = await chromium.launch({
        headless: !!isCI, // Set to false to see the browser window
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultStyleSheet());
    await page.waitForTimeout(2000);

    await page.evaluate(async () => {
        const activeWorkbook = window.univerAPI.getActiveWorkbook();
        const activeSheet = activeWorkbook.getActiveSheet();

        const sheetId = activeSheet.getSheetId();
        const unitId = activeWorkbook.getId();

        await window.univerAPI.executeCommand('sheet.operation.set-selections', {
            selections: [
                {
                    range: {
                        startRow: 0,
                        startColumn: 7,
                        endRow: 0,
                        endColumn: 7,
                        rangeType: 0,
                        unitId,
                        sheetId,
                    },
                    primary: {
                        actualRow: 0,
                        actualColumn: 7,
                        isMerged: false,
                        isMergedMainCell: false,
                        startRow: 0,
                        startColumn: 7,
                        endRow: 0,
                        endColumn: 7,
                    },
                    style: {
                        strokeWidth: 1,
                        stroke: '#274fee',
                        fill: 'rgba(39,79,238,0.07)',
                        widgets: {},
                        widgetSize: 6,
                        widgetStrokeWidth: 1,
                        widgetStroke: '#ffffff',
                        autofillSize: 6,
                        autofillStrokeWidth: 1,
                        autofillStroke: '#ffffff',
                        rowHeaderFill: 'rgba(39,79,238,0.07)',
                        rowHeaderStroke: '#274fee',
                        rowHeaderStrokeWidth: 1,
                        columnHeaderFill: 'rgba(39,79,238,0.07)',
                        columnHeaderStroke: '#274fee',
                        columnHeaderStrokeWidth: 1,
                        expandCornerSize: 40,
                    },
                },
            ],
            unitId,
            subUnitId: sheetId,
            type: 2,
        });

        activeWorkbook.startEditing();
        await window.univerAPI.getActiveDocument().appendText("'1");
        activeWorkbook.endEditing(true);

        activeSheet.getRange('I1').setValue({
            v: '001',
            t: 1,
            s: {
                ff: 'Arial CE',
                fs: 11,
                bl: 1,
                cl: {
                    rgb: '#000080',
                    th: 0,
                },
                n: {
                    pattern: 'General',
                },
                ht: 1,
                tb: 3,
            },
        });
    });

    const filename = generateSnapshotName('set-force-string-cell');
    const screenshot = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });

    await page.waitForTimeout(2000);
    await browser.close();
});

test('diff set text format number cell', async () => {
    const browser = await chromium.launch({
        headless: !!isCI, // Set to false to see the browser window
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultStyleSheet());
    await page.waitForTimeout(2000);

    await page.evaluate(async () => {
        await window.univerAPI.executeCommand('sheet.command.numfmt.set.numfmt', {
            values: [
                {
                    row: 0,
                    col: 7,
                    pattern: '@',
                    type: 'text',
                },
            ],
        });

        await window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('H1').setValue(2);

        await window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('I1').setValue(3);

        await window.univerAPI.executeCommand('sheet.command.numfmt.set.numfmt', {
            values: [
                {
                    row: 0,
                    col: 8,
                    pattern: '@',
                    type: 'text',
                },
            ],
        });
    });

    const filename = generateSnapshotName('set-text-format-number-cell');
    const screenshot = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot).toMatchSnapshot(filename, { maxDiffPixelRatio: 0.005 });

    await page.waitForTimeout(2000);
    await browser.close();
});
