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

import { Injector } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { ExclusiveRangeService, IExclusiveRangeService } from '../exclusive-range.service';

describe('ExclusiveRangeService', () => {
    let service: IExclusiveRangeService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IExclusiveRangeService, { useClass: ExclusiveRangeService }]);
        service = injector.get(IExclusiveRangeService);
    });

    it('tracks ranges reserved by sheet features and reports intersecting groups', () => {
        const changes: Array<{ unitId: string; subUnitId: string; ranges: unknown[] }> = [];
        service.exclusiveRangesChange$.subscribe((change) => changes.push(change as never));
        const protectedRange = { startRow: 1, endRow: 3, startColumn: 1, endColumn: 3 };

        service.addExclusiveRange('book-1', 'sheet-1', 'data-validation', [{ groupId: 'rule-1', range: protectedRange }]);

        expect(service.getInterestGroupId([
            { range: { unitId: 'book-1', sheetId: 'sheet-1', startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 } },
        ] as never)).toEqual(['data-validation']);
        expect(changes).toEqual([{ unitId: 'book-1', subUnitId: 'sheet-1', ranges: [protectedRange] }]);
    });

    it('clears only the requested exclusive range group', () => {
        service.addExclusiveRange('book-1', 'sheet-1', 'feature', [
            { groupId: 'group-a', range: { startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 } },
            { groupId: 'group-b', range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } },
        ]);

        service.clearExclusiveRangesByGroupId('book-1', 'sheet-1', 'feature', 'group-a');

        expect(service.getExclusiveRanges('book-1', 'sheet-1', 'feature')).toEqual([
            { groupId: 'group-b', range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } },
        ]);
    });
});
