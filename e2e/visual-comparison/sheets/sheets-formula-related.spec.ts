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

const SHEET_MAIN_CANVAS_ID = '[id^="univer-sheet-main-canvas_"]';
const isCI = !!process.env.CI;

test('diff formula related', async () => {
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
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(5000);

    await page.evaluate(async () => {
        const worksheet = window.univerAPI.getActiveWorkbook().create('formula', 50, 20);
        worksheet.getRange('A1:C6').setValues({
            0: {
                0: {
                    v: 1,
                    t: 2,
                    s: 'cYigQ9',
                },
                1: {
                    v: 1,
                    t: 2,
                    s: 'cYigQ9',
                },
            },
            1: {
                0: {
                    v: 2,
                    t: 2,
                    s: 'cYigQ9',
                },
                1: {
                    v: 2,
                    t: 2,
                    s: 'cYigQ9',
                },
            },
            2: {
                0: {
                    v: 3,
                    t: 2,
                    s: 'cYigQ9',
                },
                1: {
                    v: 3,
                    t: 2,
                    s: 'cYigQ9',
                },
            },
            3: {
                0: {
                    v: 4,
                    t: 2,
                    s: 'cYigQ9',
                },
                1: {
                    v: 4,
                    t: 2,
                    s: 'cYigQ9',
                },
            },
            4: {
                0: {
                    v: 5,
                    t: 2,
                    s: 'cYigQ9',
                },
                1: {
                    v: 5,
                    t: 2,
                    s: 'cYigQ9',
                },
            },
            5: {
                0: {
                    f: '=SUBTOTAL(109,A1:A5)',
                    v: 15,
                    t: 2,
                },
                1: {
                    f: '=SUBTOTAL(109,B1:B5)',
                    v: 15,
                    t: 2,
                },
                2: {
                    f: '=SUM(B1:B5)',
                    v: 15,
                    t: 2,
                },
            },
        });

        const worksheet2 = window.univerAPI.getActiveWorkbook().create('formula2', 50, 20);
        worksheet2.getRange('A1').setValue({ f: '=SUBTOTAL(109,formula!B1:B5)' });
    });

    // The impact of hide row on the formula of the current worksheet
    await page.evaluate(async () => {
        const worksheet = window.univerAPI.getActiveWorkbook().getSheetByName('formula');
        window.univerAPI.getActiveWorkbook().setActiveSheet(worksheet);
        await worksheet.hideRows(3, 2);
    });

    await page.waitForTimeout(100);

    const filename1 = generateSnapshotName('formula-hide-row-current-worksheet');
    const screenshot1 = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot1).toMatchSnapshot(filename1, { maxDiffPixels: 150 });

    // restore the hidden row
    await page.evaluate(async () => {
        const worksheet = window.univerAPI.getActiveWorkbook().getActiveSheet();
        await worksheet.showRows(3, 2);
    });

    // The impact of filtering on the formula of the current worksheet
    await page.evaluate(async () => {
        const worksheet = window.univerAPI.getActiveWorkbook().getActiveSheet();
        const filter = await worksheet.getRange('A1:A5').createFilter();
        await filter.setColumnFilterCriteria(0, {
            colId: 0,
            filters: {
                filters: [
                    '5',
                    '4',
                    '2',
                ],
            },
        });
    });

    await page.waitForTimeout(100);

    const filename2 = generateSnapshotName('formula-filter-row-current-worksheet');
    const screenshot2 = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot2).toMatchSnapshot(filename2, { maxDiffPixels: 150 });

    await page.evaluate(async () => {
        const worksheet2 = window.univerAPI.getActiveWorkbook().getSheetByName('formula2');
        window.univerAPI.getActiveWorkbook().setActiveSheet(worksheet2);
    });

    await page.waitForTimeout(100);

    const filename3 = generateSnapshotName('formula-filter-row-other-worksheet');
    const screenshot3 = await page.locator(SHEET_MAIN_CANVAS_ID).screenshot();
    await expect(screenshot3).toMatchSnapshot(filename3, { maxDiffPixels: 150 });

    await page.waitForTimeout(1000);
    await browser.close();
});
