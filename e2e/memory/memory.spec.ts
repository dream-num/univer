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

import { expect, test } from '@playwright/test';
import { getMetrics } from './util';

const MAX_UNIT_MEMORY_OVERFLOW = 1_000_000; // 1MB

// There are some compiled code and global cache, so we make some room
// for this. But we need to make sure that a Univer object cannot fit
// in this size.
const MAX_UNIVER_MEMORY_OVERFLOW = 5_000_000;

test('memory', async ({ page }) => {
    test.setTimeout(60_000);

    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(5000);

    const memoryBeforeLoad = (await getMetrics(page)).JSHeapUsedSize;
    console.log('Memory before load (B):', memoryBeforeLoad);

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(1));
    await page.waitForTimeout(5000);
    const memoryAfterFirstLoad = (await getMetrics(page)).JSHeapUsedSize;
    console.log('Memory after first load (B):', memoryAfterFirstLoad);

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(2));
    await page.waitForTimeout(5000);
    const memoryAfterSecondLoad = (await getMetrics(page)).JSHeapUsedSize;
    console.log('Memory after second load (B):', memoryAfterSecondLoad);

    await page.evaluate(() => window.univer.dispose());
    await page.waitForTimeout(5000);
    const memoryAfterDisposingUniver = (await getMetrics(page)).JSHeapUsedSize;
    console.log('Memory after disposing univer (B):', memoryAfterDisposingUniver);

    const noUnitLeaking = memoryAfterSecondLoad - memoryAfterFirstLoad <= MAX_UNIT_MEMORY_OVERFLOW;
    expect(noUnitLeaking).toBeTruthy();

    const noUniverLeaking = memoryAfterDisposingUniver - memoryBeforeLoad <= MAX_UNIVER_MEMORY_OVERFLOW;
    expect(noUniverLeaking).toBeTruthy();
});

