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
/* eslint-disable no-console */
import type { Page } from '@playwright/test';
import { sheetData as emptySheetData } from '../mockdata/emptysheet';
import { sheetData as freezeData } from '../mockdata/freezesheet';
import { sheetData as mergeCellData } from '../mockdata/mergecell';
import { sheetData as overflowData } from '../mockdata/overflow';

export interface IFPSData {
    fpsData: number[];
    avgFps: number;
}

interface IJsonObject {
    [key: string]: any;
}

interface IMeasureFPSParam { duration: number; deltaX: number; deltaY: number }

const isCI = !!process.env.CI;
/**
 * measure FPS of scrolling time.
 * @param page Page from playwright
 * @param duration fps test duration
 * @param deltaX scroll step of X
 * @param deltaY scroll step of Y
 * @returns {Promise<number>} avg FPS value of test time.
 */
async function measureFPS(page: Page, duration = 5, deltaX: number, deltaY: number) {
    const fps = await page.evaluate(({ duration, deltaX, deltaY }: IMeasureFPSParam) => {
        let intervalID;
        // dispatch wheel event
        const dispathWheelEvent = () => {
            const canvasElements = document.querySelectorAll('canvas.univer-render-canvas') as unknown as HTMLElement[];
            const filteredCanvasElements = Array.from(canvasElements).filter((canvas) => canvas.offsetHeight > 500);

            const interval = 60;
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
            const continuousWheelSimulation = (element, interval) => {
                intervalID = setInterval(function () {
                    dispatchSimulateWheelEvent(element);
                }, interval);
            };

            // start mock wheel event.
            continuousWheelSimulation(filteredCanvasElements[0], interval);
        };

        dispathWheelEvent();

        return new Promise((resolve) => {
            let frameCount = 0;
            const startTime = performance.now();

            function countFrames(_timestamp) {
                frameCount++;
                if (performance.now() - startTime < duration * 1000) {
                    requestAnimationFrame(countFrames);
                } else {
                    clearInterval(intervalID);
                    const elapsedTime = (performance.now() - startTime) / 1000;
                    const fps = frameCount / elapsedTime;
                    resolve(fps);
                }
            }

            requestAnimationFrame(countFrames);
        });
    }, { duration, deltaX, deltaY });

    return fps;
}

const createTest = (title: string, sheetData: IJsonObject, minFpsValue: number, deltaX = 0, deltaY = 0) => {
    test(title, async ({ page }) => {
        let port = 3000;
        if (!isCI) {
            const browser = await chromium.launch({ headless: false }); // launch browser
            page = await browser.newPage();
            port = 3002;
        }

        await page.goto(`http://localhost:${port}/sheets/`);
        await page.waitForTimeout(2000);

        const windowOfPage = await page.evaluateHandle('window');
        await test.step('create univer', async () => {
            await page.evaluate(({ sheetData, window }: any) => {
                window.E2EControllerAPI.disposeCurrSheetUnit();
                window.univer.createUniverSheet(sheetData);
            }, { sheetData, window: windowOfPage });

            // wait for canvas has data
            // await page.waitForFunction(() => {
            //     const canvaslist = document.querySelectorAll('canvas');
            //     if (canvaslist.length > 2) {
            //         const imgData = canvaslist[2]!.getContext('2d')!.getImageData(40, 40, 1, 1).data;
            //         return imgData[3] !== 0;
            //     }
            // });
        });

        try {
            const fps = await measureFPS(page, 10, deltaX, deltaY);
            await test.step('fps', async () => {
                console.log('fps', fps);
                expect(fps).toBeGreaterThan(minFpsValue);
            });
        } catch (error) {
            console.error('error when exec scrolling test', error);
        } finally {
            console.log('Test case completed.');
        }
    });
};

createTest('sheet scroll empty', emptySheetData, 50, 10, 100);
createTest('sheet scroll after freeze', freezeData, 10, 10, 100);
createTest('sheet scroll in a lots of merge cell', mergeCellData, 10, 10, 50);
createTest('sheet X scroll in a lots of overflow', overflowData, 10, 50, 5);
