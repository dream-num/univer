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

import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { FEATURE_TABLE_ID } from '../../const';
import { SheetTableRangeController } from '../sheet-table-range.controller';

describe('SheetTableRangeController', () => {
    it('should sync exclusive ranges on table add/range change/delete', () => {
        const tableRangeChanged$ = new Subject<any>();
        const tableAdd$ = new Subject<any>();
        const tableDelete$ = new Subject<any>();

        const tableManager = {
            tableRangeChanged$,
            tableAdd$,
            tableDelete$,
        };

        const exclusiveRangeService = {
            clearExclusiveRangesByGroupId: vi.fn(),
            addExclusiveRange: vi.fn(),
        };

        const controller = new SheetTableRangeController(tableManager as any, exclusiveRangeService as any);

        tableAdd$.next({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            range: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 2 },
        });

        expect(exclusiveRangeService.addExclusiveRange).toHaveBeenCalledWith('u1', 's1', FEATURE_TABLE_ID, [{
            range: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 2 },
            groupId: 't1',
        }]);

        tableRangeChanged$.next({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
            range: { startRow: 2, endRow: 4, startColumn: 1, endColumn: 3 },
        });

        expect(exclusiveRangeService.clearExclusiveRangesByGroupId).toHaveBeenCalledWith('u1', 's1', FEATURE_TABLE_ID, 't1');
        expect(exclusiveRangeService.addExclusiveRange).toHaveBeenLastCalledWith('u1', 's1', FEATURE_TABLE_ID, [{
            range: { startRow: 2, endRow: 4, startColumn: 1, endColumn: 3 },
            groupId: 't1',
        }]);

        tableDelete$.next({
            unitId: 'u1',
            subUnitId: 's1',
            tableId: 't1',
        });

        expect(exclusiveRangeService.clearExclusiveRangesByGroupId).toHaveBeenLastCalledWith('u1', 's1', FEATURE_TABLE_ID, 't1');

        controller.dispose();
    });
});
