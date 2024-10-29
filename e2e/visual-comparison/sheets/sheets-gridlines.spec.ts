/**
 * Copyright 2023-present DreamNum Inc.
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

const isCI = !!process.env.CI;

test('sheets no gridlines', async () => {
    const browser = await chromium.launch({
        headless: !!isCI, // Set to false to see the browser window
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().setHiddenGridlines(true));
    await page.waitForTimeout(1000);

    const filename = generateSnapshotName('sheets-no-gridlines');
    const screenshot = await page.screenshot({
        mask: [
            page.locator('.univer-headerbar'),
            page.locator('.univer-workbench-container-header'),
            page.locator('.univer-formula-box'),
        ],
        fullPage: true,
    });
    expect(screenshot).toMatchSnapshot(filename, { maxDiffPixels: 5 });
});
