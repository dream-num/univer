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

import type { IUnitRangeName } from '@univerjs/core';
import { Injector } from '@univerjs/core';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { GlobalRangeSelectorService } from '../range-selector.service';

function createService(): GlobalRangeSelectorService {
    const injector = new Injector();
    onTestFinished(() => injector.dispose());
    injector.add([GlobalRangeSelectorService]);
    return injector.get(GlobalRangeSelectorService);
}

describe('GlobalRangeSelectorService', () => {
    it('preserves the caller callback when the same options are reused', async () => {
        const service = createService();
        const requests: Array<{ callback: (ranges: IUnitRangeName[]) => void } | null> = [];
        const subscription = service.currentSelector$.subscribe((request) => requests.push(request));
        const callback = vi.fn();
        const options = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            callback,
        };

        const firstPromise = service.showRangeSelectorDialog(options);
        requests[requests.length - 1]!.callback([]);
        await expect(firstPromise).resolves.toEqual([]);

        const secondPromise = service.showRangeSelectorDialog(options);
        requests[requests.length - 1]!.callback([]);
        await expect(secondPromise).resolves.toEqual([]);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(options.callback).toBe(callback);
        subscription.unsubscribe();
    });

    it('opens a range selector request and resolves with the ranges picked by the user', async () => {
        const service = createService();
        const shown: unknown[] = [];
        const selectedRanges: IUnitRangeName[] = [{
            unitId: 'unit-1',
            sheetName: 'Sheet1',
            range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 },
        }];
        const callbackRanges: IUnitRangeName[][] = [];
        const sub = service.currentSelector$.subscribe((value) => shown.push(value));

        const promise = service.showRangeSelectorDialog({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            callback: (ranges) => callbackRanges.push(ranges),
        });
        const selector = shown.at(-1) as { callback: (ranges: IUnitRangeName[]) => void };
        selector.callback(selectedRanges);

        await expect(promise).resolves.toEqual(selectedRanges);
        expect(callbackRanges).toEqual([selectedRanges]);
        expect(shown[0]).toBeNull();

        sub.unsubscribe();
    });
});
