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

import { expect, test } from '@playwright/test';

// The type definition is copied from:
// examples/src/plugins/debugger/controllers/e2e/e2e-memory.controller.ts
export interface IE2EMemoryControllerAPI {
    loadAndRelease(id: number): Promise<void>;
    getHeapMemoryUsage(): number;
}
declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        E2EMemoryAPI: IE2EMemoryControllerAPI;
    }
}

test('memory', async ({ page }) => {
    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EMemoryAPI.loadAndRelease(1));
    const memoryAfterFirstLoad = await page.evaluate(() => window.E2EMemoryAPI.getHeapMemoryUsage());
    await page.evaluate(() => window.E2EMemoryAPI.loadAndRelease(2));
    const memoryAfterSecondLoad = await page.evaluate(() => window.E2EMemoryAPI.getHeapMemoryUsage());

    expect(Math.abs(memoryAfterSecondLoad - memoryAfterFirstLoad)).toBeGreaterThan(5_000_000); // should be less than 5M
});
