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

test('diff default sheet content', async ({ page }) => {
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(5000);

    await expect(page).toHaveScreenshot(generateSnapshotName('default-sheet'), { maxDiffPixels: 5 });
});
const isCI = !!process.env.CI;

test('diff demo sheet content', async ({ page }) => {
    let errored = false;

    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDemoSheet());
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot(generateSnapshotName('demo-sheet'), { maxDiffPixels: 5 });
    await page.waitForTimeout(2000);
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
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot(generateSnapshotName('mergedCellsRendering'), { maxDiffPixels: 5 });

    await page.waitForTimeout(2000);
    await browser.close();
});
test('diff merged cells rendering after scrolling', async () => {
    const browser = await chromium.launch({
        headless: !!isCI, // Set to false to see the browser window in local
    });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 1280 },
        deviceScaleFactor: 2, // Set your desired DPR
    });
    const page = await context.newPage();
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadMergeCellSheet());
    await page.waitForTimeout(2000);

    await page.evaluate(async () => {
        const dispatchWheelEvent = (deltaX: number, deltaY: number, element: HTMLElement, interval: number = 30, lastFor: number = 1000) => {
            // const canvasElements = document.querySelectorAll('canvas.univer-render-canvas') as unknown as HTMLElement[];
            // const filteredCanvasElements = Array.from(canvasElements).filter((canvas) => canvas.offsetHeight > 500);

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
        const canvasElements = document.querySelectorAll('canvas.univer-render-canvas') as unknown as HTMLElement[];
        const filteredCanvasElements = Array.from(canvasElements).filter((canvas) => canvas.offsetHeight > 500);
        const element = filteredCanvasElements[0];
        await dispatchWheelEvent(0, 100, element);
        await dispatchWheelEvent(0, -100, element);
    });
    await page.waitForTimeout(2000);

    await expect(page).toHaveScreenshot(generateSnapshotName('mergedCellsRenderingScrolling'), { maxDiffPixels: 5 });

    await page.waitForTimeout(2000);
    await browser.close();
});
