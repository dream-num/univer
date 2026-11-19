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
import { firstValueFrom, skip } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GlobalRangeSelectorService } from '../../services/range-selector.service';
import { createFormulaTestBed } from './create-formula-test-bed';
import '../../facade';

describe('Test FUniver with sheets-formula-ui facade', () => {
    let disposeUniver: () => void;

    beforeEach(() => {
        disposeUniver = () => {};
    });

    afterEach(() => {
        disposeUniver();
    });

    it('showRangeSelectorDialog preserves the caller callback when the same options are reused', async () => {
        const testBed = createFormulaTestBed(undefined, [[GlobalRangeSelectorService]]);
        const selectorService = testBed.get(GlobalRangeSelectorService);
        const callback = vi.fn();
        const selectedRanges: IUnitRangeName[] = [{
            unitId: 'test',
            sheetName: 'sheet1',
            range: {
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
            },
        }];

        disposeUniver = () => testBed.univer.dispose();

        const options = {
            unitId: 'test',
            subUnitId: 'sheet1',
            initialValue: selectedRanges,
            maxRangeCount: 2,
            supportAcrossSheet: true,
            callback,
        };
        const firstSelectorPromise = firstValueFrom(selectorService.currentSelector$.pipe(skip(1)));
        const firstResultPromise = testBed.univerAPI.showRangeSelectorDialog(options);

        const firstSelector = await firstSelectorPromise;

        expect(firstSelector).toMatchObject({
            unitId: 'test',
            subUnitId: 'sheet1',
            initialValue: selectedRanges,
            maxRangeCount: 2,
            supportAcrossSheet: true,
        });

        firstSelector!.callback(selectedRanges);
        await expect(firstResultPromise).resolves.toEqual(selectedRanges);

        const secondSelectorPromise = firstValueFrom(selectorService.currentSelector$.pipe(skip(1)));
        const secondResultPromise = testBed.univerAPI.showRangeSelectorDialog(options);
        const secondSelector = await secondSelectorPromise;

        secondSelector!.callback(selectedRanges);
        await expect(secondResultPromise).resolves.toEqual(selectedRanges);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(options.callback).toBe(callback);
    });
});
