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

import type { Page } from '@playwright/test';

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
export async function getMetrics(page: Page): Promise<IMetrics> {
    const client = await page.context().newCDPSession(page);
    await client.send('Performance.enable');
    await client.send('HeapProfiler.collectGarbage');
    const perfMetricObject = await client.send('Performance.getMetrics');
    const extractedMetric = perfMetricObject?.metrics;
    const metricObject = extractedMetric.reduce((acc, { name, value }) => {
        acc[name] = value;
        return acc;
    }, {});

    return metricObject as unknown as IMetrics;
}
