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
import { IContextService, IPermissionService, IUniverInstanceService, UserManagerService } from '@univerjs/core';
import {
    IExclusiveRangeService,
    RangeProtectionRuleModel,
    SheetsSelectionsService,
    WorksheetEditPermission,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$ } from '../menu-util';

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

describe('getCurrentRangeDisable$', () => {
    it('drops a removed active worksheet instead of composing permissions for it', () => {
        const worksheet = { getSheetId: () => 'sheet-1', getConfig: () => ({}) };
        const workbook = {
            getUnitId: () => 'unit-1',
            activeSheet$: new BehaviorSubject(worksheet),
            sheetDisposed$: new Subject(),
            // The worksheet is no longer part of the workbook: its permission points were deleted on disposal.
            getSheetBySheetId: () => undefined,
        };
        const permissionService = {
            permissionPointUpdate$: new Subject(),
            composePermission$: vi.fn(() => {
                throw new Error('composePermission$ must not run for a removed worksheet');
            }),
        };
        const services = new Map<unknown, unknown>([
            [IUniverInstanceService, { getCurrentTypeOfUnit$: () => new BehaviorSubject(workbook) }],
            [UserManagerService, { currentUser$: new BehaviorSubject(null) }],
            [IContextService, { subscribeContextValue$: () => new BehaviorSubject(false) }],
            [RangeProtectionRuleModel, { getSubunitRuleList: () => [] }],
            [WorksheetProtectionRuleModel, { getRule: () => null }],
            [SheetsSelectionsService, {
                selectionChanged$: new BehaviorSubject([]),
                getWorkbookSelections: () => ({ getSelectionsOfWorksheet: () => [] }),
            }],
            [IPermissionService, permissionService],
        ]);
        const accessor = {
            get: (token: unknown) => services.get(token),
            has: (token: unknown) => services.has(token),
        } as never;

        const states: boolean[] = [];
        const subscription = getCurrentRangeDisable$(accessor, { worksheetTypes: [WorksheetEditPermission] })
            .subscribe((state) => states.push(state));

        expect(states[states.length - 1]).toBe(true);
        expect(permissionService.composePermission$).not.toHaveBeenCalled();
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
