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

/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ISelectionWithStyle } from '@univerjs/sheets';
import { IUniverInstanceService } from '@univerjs/core';
import { IExclusiveRangeService, SheetsSelectionsService } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { getCurrentExclusiveRangeInterest$ } from '../menu-util';

describe('getCurrentExclusiveRangeInterest$', () => {
    it('uses the current sheet selections when the active sheet changes', () => {
        const worksheets = {
            regular: { getSheetId: () => 'regular-sheet' },
            exclusive: { getSheetId: () => 'exclusive-sheet' },
        };
        const activeSheet$ = new BehaviorSubject(worksheets.exclusive);
        const workbook = { activeSheet$ };
        const workbook$ = new BehaviorSubject(workbook);
        const selectionsBySheet: Record<string, ISelectionWithStyle[]> = {
            'regular-sheet': [createSelection('regular-sheet')],
            'exclusive-sheet': [createSelection('exclusive-sheet')],
        };
        const selectionMoveEnd$ = new BehaviorSubject(selectionsBySheet['exclusive-sheet']);
        const services = new Map<unknown, unknown>([
            [IUniverInstanceService, {
                getCurrentTypeOfUnit$: () => workbook$,
            }],
            [SheetsSelectionsService, {
                selectionMoveEnd$,
                getCurrentSelections: () => selectionsBySheet[activeSheet$.value.getSheetId()],
            }],
            [IExclusiveRangeService, {
                getInterestGroupId: (selections: ISelectionWithStyle[]) => selections[0].range.sheetId === 'exclusive-sheet'
                    ? ['pivot-table']
                    : [],
            }],
        ]);
        const accessor = { get: (token: unknown) => services.get(token) } as never;
        const states: boolean[] = [];
        const subscription = getCurrentExclusiveRangeInterest$(accessor).subscribe((state) => states.push(state));

        expect(states[states.length - 1]).toBe(true);

        activeSheet$.next(worksheets.regular);

        expect(states[states.length - 1]).toBe(false);
        subscription.unsubscribe();
    });
});

function createSelection(sheetId: string): ISelectionWithStyle {
    return {
        range: {
            unitId: 'unit-1',
            sheetId,
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        },
        primary: null,
    };
}
