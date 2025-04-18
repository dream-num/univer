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

/* eslint-disable no-console */
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { sheetData as emptySheetData } from '../__testing__/emptysheet';
import { sheetData as freezeData } from '../__testing__/freezesheet';
import { sheetData as mergeCellData } from '../__testing__/mergecell';
import { sheetData as overflowData } from '../__testing__/overflow';
import { reportToPosthog } from '../utils/report-performance';

export interface IFPSData {
    fpsData: number[];
    avgFps: number;
}

interface IJsonObject {
    [key: string]: any;
}

interface IMeasureFPSParam { testDuration: number; deltaX: number; deltaY: number }

interface IFPSResult {
    fps: number;
    medianFrameTime: number;
    maxFrameTimes: number[];
}

// const isCI = !!process.env.CI;
/**
 * measure FPS of scrolling time.
 * @param page Page from playwright
 * @param testDuration fps test duration
 * @param deltaX scroll step of X
 * @param deltaY scroll step of Y
 * @returns {Promise<IFPSResult>} avg FPS value of test time.
 */
async function measureFPS(page: Page, testDuration = 5, deltaX: number, deltaY: number) {
    const fpsCounterPromise = await page.evaluate(({ testDuration, deltaX, deltaY }: IMeasureFPSParam) => {
        let intervalID;
        // dispatch wheel event
        const dispatchWheelEvent = () => {
            const canvasElements = document.querySelectorAll('canvas[data-u-comp=render-canvas]') as unknown as HTMLElement[];
            const filteredCanvasElements = Array.from(canvasElements).filter((canvas) => canvas.offsetHeight > 500);

            const interval = 30;
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
            if (filteredCanvasElements.length > 0) {
                continuousWheelSimulation(filteredCanvasElements[0], interval);
            } else {
                throw new Error('main canvas element not found');
            }
        };

        const getMaxFrameTimes = (arr, n) => {
            return arr.slice().sort((a, b) => b - a).slice(0, n);
        };

        const calculateMedian = (arr) => {
            if (arr.length === 0) return 0;
            const sorted = arr.slice().sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        };

        dispatchWheelEvent();

        let frameCount = 0;
        const frameTimes = [];
        const startTime = performance.now();
        let lastFrameTime = performance.now();

        return new Promise((resolve) => {
            function countFrames(_timestamp) {
                frameCount++;
                const currentFrameTime = performance.now();
                const deltaTime = currentFrameTime - lastFrameTime;
                lastFrameTime = currentFrameTime;
                if (deltaTime >= 1) {
                    frameTimes.push(Math.round(deltaTime * 100) / 100);
                }

                if (performance.now() - startTime < testDuration * 1000) {
                    requestAnimationFrame(countFrames);
                } else {
                    clearInterval(intervalID);

                    const elapsedTime = (performance.now() - startTime) / 1000;
                    const fps = Math.round(frameCount / elapsedTime * 100) / 100;
                    const maxFrameTimes = getMaxFrameTimes(frameTimes, 10);
                    const medianFrameTime = calculateMedian(frameTimes);
                    resolve({ fps, maxFrameTimes, medianFrameTime });
                }
            }

            requestAnimationFrame(countFrames);
        });
    }, { testDuration, deltaX, deltaY });

    return fpsCounterPromise as Promise<IFPSResult>;
}

const createTest = (title: string, telemetryName: string, sheetData: IJsonObject, minFpsValue: number, deltaX = 0, deltaY = 0) => {
    // Default Size Of browser: 1280x720 pixels. And default DPR is 1.
    test(title, async ({ page }) => {
        await page.goto('http://localhost:3000/sheets/');
        await page.waitForTimeout(2000);

        const windowOfPage = await page.evaluateHandle('window');
        await test.step('create univer', async () => {
            await page.evaluate(({ sheetData, window }: any) => {
                window.E2EControllerAPI.disposeCurrSheetUnit();
                window.univer.createUniverSheet(sheetData);
            }, { sheetData, window: windowOfPage });
            // wait for canvas has data
            await page.waitForTimeout(2000);
        });

        try {
            const resultOfFPS = await measureFPS(page, 5, deltaX, deltaY);
            await test.step('fps', async () => {
                console.log('FPS', resultOfFPS.fps);
                console.log('medianFrameTime', resultOfFPS.medianFrameTime);
                console.log('max10FrameTimes', resultOfFPS.maxFrameTimes);

                await reportToPosthog(telemetryName, resultOfFPS);
                expect(resultOfFPS.fps).toBeGreaterThan(minFpsValue);
            });
        } catch (error) {
            console.error('error when exec scrolling test', error);
        } finally {
            // if you want to debug, use `await page.pause();` to pause browser
            console.log('Test case completed.');
        }
    });
};

createTest('sheet scroll empty', 'perf.sheet.scroll.empty', emptySheetData, 50, 10, 100);
createTest('sheet scroll after freeze', 'perf.sheet.scroll.freeze', freezeData, 10, 10, 100);
createTest('sheet scroll in a lots of merge cell', 'perf.sheet.scroll.mergeCell', mergeCellData, 10, 10, 50);
createTest('sheet X scroll in a lots of overflow', 'perf.sheet.scroll.overflow', overflowData, 10, 50, 5);
