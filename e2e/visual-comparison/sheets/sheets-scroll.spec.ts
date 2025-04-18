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
