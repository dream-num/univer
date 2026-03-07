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

    it('showRangeSelectorDialog forwards options to the selector service and resolves with selected ranges', async () => {
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

        const selectorPromise = firstValueFrom(selectorService.currentSelector$.pipe(skip(1)));
        const resultPromise = testBed.univerAPI.showRangeSelectorDialog({
            unitId: 'test',
            subUnitId: 'sheet1',
            initialValue: selectedRanges,
            maxRangeCount: 2,
            supportAcrossSheet: true,
            callback,
        });

        const currentSelector = await selectorPromise;

        expect(currentSelector).toMatchObject({
            unitId: 'test',
            subUnitId: 'sheet1',
            initialValue: selectedRanges,
            maxRangeCount: 2,
            supportAcrossSheet: true,
        });

        currentSelector!.callback(selectedRanges);

        await expect(resultPromise).resolves.toEqual(selectedRanges);
        expect(callback).toHaveBeenCalledWith(selectedRanges);
    });
});
