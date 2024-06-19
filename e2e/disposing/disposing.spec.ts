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
export interface IE2EControllerAPI {
    loadAndRelease(id: number): Promise<void>;
    loadDefaultSheet(): Promise<void>;
    disposeUniver(): Promise<void>;
}

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        E2EControllerAPI: IE2EControllerAPI;
    }
}

test('no error on constructing and disposing', async ({ page }) => {
    let errored = false;

    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadDefaultSheet());
    await page.waitForTimeout(6000); // wait for features loaded in STEADY stage (5s)

    await page.evaluate(() => window.E2EControllerAPI.disposeUniver());
    await page.waitForTimeout(2000);

    expect(errored).toBeFalsy();
});

test('no error when dispose a unit', async ({ page }) => {
    let errored = false;

    page.on('pageerror', (error) => {
        console.error('Page error:', error);
        errored = true;
    });

    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(1));
    await page.waitForTimeout(2000);

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(2));
    await page.waitForTimeout(2000);

    expect(errored).toBeFalsy();
});
