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

/* eslint-disable no-console */

import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const MAX_MEMORY_OVERFLOW = 1_000_000; // 5MB

test('memory', async ({ page }) => {
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    const memoryBeforeLoad = (await getMetrics(page)).JSHeapUsedSize;
    console.log('Memory before load:', memoryBeforeLoad);

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(1));
    await page.waitForTimeout(5000); // wait for long enough to let the GC do its job
    const memoryAfterFirstLoad = (await getMetrics(page)).JSHeapUsedSize;
    console.log('Memory after first load:', memoryAfterFirstLoad);

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(2));
    await page.waitForTimeout(5000); // wait for long enough to let the GC do its job
    const memoryAfterSecondLoad = (await getMetrics(page)).JSHeapUsedSize;
    console.log('Memory after second load:', memoryAfterSecondLoad);

    await page.evaluate(() => window.univer.dispose());
    await page.waitForTimeout(5000); // wait for long enough to let the GC do its job
    const memoryAfterDisposingUniver = (await getMetrics(page)).JSHeapUsedSize;

    const notLeaking = (memoryAfterDisposingUniver <= memoryAfterFirstLoad) && (memoryAfterSecondLoad - memoryAfterFirstLoad <= MAX_MEMORY_OVERFLOW);
    expect(notLeaking).toBeTruthy();
});

interface IMetrics {
    JSHeapUsedSize: number;
}

/**
 * Return a performance metric from the chrome cdp session.
 * Chrome only.
 * @param {Page} page page to attach cdpClient
 * @return {IMetrics}
 * @see {@link https://github.com/microsoft/playwright/issues/18071}
 */
async function getMetrics(page: Page): Promise<IMetrics> {
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    const perfMetricObject = await client.send('Performance.getMetrics');
    const extractedMetric = perfMetricObject?.metrics;
    const metricObject = extractedMetric.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
    }, {});

    return metricObject as unknown as IMetrics;
}

