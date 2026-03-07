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

import {
    FOCUSING_COMMON_DRAWINGS,
    FOCUSING_FX_BAR_EDITOR,
    FOCUSING_SHAPE_TEXT_EDITOR,
    IContextService,
    IPermissionService,
    IUniverInstanceService,
    UserManagerService,
} from '@univerjs/core';
import {
    IExclusiveRangeService,
    RangeProtectionRuleModel,
    SheetsSelectionsService,
    WorkbookEditablePermission,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { BehaviorSubject, firstValueFrom, of, skip, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import {
    deriveStateFromActiveSheet$,
    getBaseRangeMenuHidden$,
    getCellMenuHidden$,
    getCurrentExclusiveRangeInterest$,
    getCurrentRangeDisable$,
    getDeleteMenuHidden$,
    getInsertAfterMenuHidden$,
    getInsertBeforeMenuHidden$,
    getObservableWithExclusiveRange$,
    getWorkbookPermissionDisable$,
} from '../menu-util';

function createAccessor(pairs: Array<[unknown, unknown]>) {
    const map = new Map<unknown, unknown>(pairs);
    return {
        get(token: unknown) {
            if (!map.has(token)) {
                throw new Error(`Unknown token: ${String(token)}`);
            }
            return map.get(token);
        },
        has(token: unknown) {
            return map.has(token);
        },
    } as any;
}

function firstValue<T>(obs: { pipe: (...args: any[]) => any }) {
    return firstValueFrom(obs.pipe(take(1)));
}

interface IMenuAccessorOption {
    workbook?: any;
    worksheet?: any;
    selections?: any[] | undefined;
    subUnitRules?: any[];
    worksheetRule?: any;
    composePermissionAllTrue?: boolean;
    editorVisible?: any;
    hasEditorBridge?: boolean;
    formulaFocus?: boolean;
    drawingFocus?: boolean;
    shapeEditorFocus?: boolean;
    interestGroupIds?: string[];
}

function createMenuAccessor(option: Partial<IMenuAccessorOption> = {}) {
    const worksheet = option.worksheet ?? {
        getSheetId: () => 'sheet-1',
        getRowCount: () => 20,
        getColumnCount: () => 10,
    };

    const workbook = option.workbook ?? {
        getUnitId: () => 'unit-1',
        getActiveSheet: () => worksheet,
        activeSheet$: of(worksheet),
    };

    const selections = option.selections ?? [{ range: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 } }];
    const selectionMoveEnd$ = new BehaviorSubject(selections);
    const selectionService = {
        selectionMoveEnd$,
        getCurrentSelections: () => selections,
        getCurrentLastSelection: () => selections[0] ?? null,
    };

    const subUnitRules = option.subUnitRules ?? [];
    const rangeProtectionRuleModel = {
        ruleChange$: new BehaviorSubject(null),
        getSubunitRuleList: () => subUnitRules,
    };

    const worksheetRule = option.worksheetRule ?? null;
    const worksheetProtectionRuleModel = {
        ruleChange$: new BehaviorSubject(null),
        getRule: () => worksheetRule,
    };

    const composePermissionAllTrue = option.composePermissionAllTrue ?? true;
    const permissionService = {
        composePermission$: (ids: string[]) => of(ids.map(() => ({ value: composePermissionAllTrue }))),
        composePermission: (ids: string[]) => ids.map((_id, index) => ({ value: index === 0 ? true : composePermissionAllTrue })),
        permissionPointUpdate$: new BehaviorSubject(null),
    };

    const formulaFocus = option.formulaFocus ?? false;
    const drawingFocus = option.drawingFocus ?? false;
    const shapeEditorFocus = option.shapeEditorFocus ?? false;
    const contextService = {
        subscribeContextValue$: (key: unknown) => {
            if (key === FOCUSING_FX_BAR_EDITOR) {
                return of(formulaFocus);
            }
            if (key === FOCUSING_COMMON_DRAWINGS) {
                return of(drawingFocus);
            }
            if (key === FOCUSING_SHAPE_TEXT_EDITOR) {
                return of(shapeEditorFocus);
            }
            return of(false);
        },
    };

    const interestGroupIds = option.interestGroupIds ?? [];
    const exclusiveRangeService = {
        getInterestGroupId: () => interestGroupIds,
    };

    const pairs: Array<[unknown, unknown]> = [
        [IUniverInstanceService, { getCurrentTypeOfUnit$: () => of(workbook), getCurrentUnitForType: () => workbook }],
        [SheetsSelectionsService, selectionService],
        [RangeProtectionRuleModel, rangeProtectionRuleModel],
        [WorksheetProtectionRuleModel, worksheetProtectionRuleModel],
        [IPermissionService, permissionService],
        [UserManagerService, { currentUser$: of({ userID: 'u1' }) }],
        [IContextService, contextService],
        [IExclusiveRangeService, exclusiveRangeService],
    ];

    if (option.hasEditorBridge) {
        pairs.push([IEditorBridgeService, { visible$: of(option.editorVisible ?? null) }]);
    }

    return createAccessor(pairs);
}

describe('menu-util', () => {
    it('deriveStateFromActiveSheet$ returns default without active sheet and callback value with active sheet', async () => {
        const noActive = { getCurrentTypeOfUnit$: () => of(null) };
        expect(await firstValue(deriveStateFromActiveSheet$(noActive as any, 'DEFAULT', () => of('ACTIVE')))).toBe('DEFAULT');

        const worksheet = { getSheetId: () => 'sheet-1' };
        const workbook = { activeSheet$: of(worksheet) };
        const withActive = { getCurrentTypeOfUnit$: () => of(workbook) };
        expect(await firstValue(deriveStateFromActiveSheet$(withActive as any, 'DEFAULT', () => of('ACTIVE')))).toBe('ACTIVE');
    });

    it('handles exclusive-range interest and derived observable state', async () => {
        const accessor = createMenuAccessor({
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            interestGroupIds: ['group-a', 'group-b'],
        });

        expect(await firstValue(getCurrentExclusiveRangeInterest$(accessor))).toBe(true);
        expect(await firstValue(getCurrentExclusiveRangeInterest$(accessor, new Set(['group-z'])))).toBe(false);
        expect(await firstValue(getCurrentExclusiveRangeInterest$(accessor, new Set(['group-b'])))).toBe(true);
        expect(await firstValue(getObservableWithExclusiveRange$(accessor, of(false), new Set(['group-b'])))).toBe(true);
    });

    it('computes current-range disable with workbook/editor/drawing/permission states', async () => {
        const noWorkbookAccessor = createAccessor([
            [IUniverInstanceService, { getCurrentTypeOfUnit$: () => of(null) }],
            [UserManagerService, { currentUser$: of({ userID: 'u1' }) }],
            [IContextService, { subscribeContextValue$: () => of(false) }],
        ]);
        expect(await firstValue(getCurrentRangeDisable$(noWorkbookAccessor))).toBe(true);

        const editorVisibleAccessor = createMenuAccessor({
            hasEditorBridge: true,
            editorVisible: { visible: true, unitId: 'unit-1' },
        });
        expect(await firstValue(getCurrentRangeDisable$(editorVisibleAccessor))).toBe(true);

        const drawingFocusedAccessor = createMenuAccessor({
            drawingFocus: true,
            shapeEditorFocus: false,
            composePermissionAllTrue: true,
        });
        expect(await firstValueFrom(getCurrentRangeDisable$(drawingFocusedAccessor).pipe(skip(1), take(1)))).toBe(true);

        const enabledAccessor = createMenuAccessor({
            composePermissionAllTrue: true,
            drawingFocus: false,
            worksheetRule: null,
            subUnitRules: [],
        });
        expect(await firstValue(getCurrentRangeDisable$(enabledAccessor))).toBe(false);
    });

    it('computes base/insert/delete/cell menu hidden observables', async () => {
        const accessor = createMenuAccessor({
            composePermissionAllTrue: false,
            subUnitRules: [{ permissionId: 'r1', ranges: [{ startRow: 0, endRow: 5, startColumn: 0, endColumn: 5 }] }],
            selections: [{ range: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 } }],
        });

        expect(await firstValue(getBaseRangeMenuHidden$(accessor))).toBe(true);
        expect(await firstValue(getInsertAfterMenuHidden$(accessor, 'row'))).toBe(true);
        expect(await firstValue(getInsertBeforeMenuHidden$(accessor, 'col'))).toBe(true);
        expect(await firstValue(getDeleteMenuHidden$(accessor, 'row'))).toBe(true);
        expect(await firstValue(getCellMenuHidden$(accessor, 'col'))).toBe(true);
    });

    it('computes workbook-permission disable with protection rules', async () => {
        const noWorkbookAccessor = createAccessor([
            [IUniverInstanceService, { getCurrentTypeOfUnit$: () => of(null) }],
            [WorksheetProtectionRuleModel, { getRule: () => null }],
            [RangeProtectionRuleModel, { getSubunitRuleList: () => [] }],
            [IPermissionService, { composePermission$: () => of([{ value: true }]) }],
            [UserManagerService, { currentUser$: of({ userID: 'u1' }) }],
        ]);
        expect(await firstValue(getWorkbookPermissionDisable$(noWorkbookAccessor, [WorkbookEditablePermission]))).toBe(true);

        const hasWorksheetRuleAccessor = createMenuAccessor({
            composePermissionAllTrue: true,
            worksheetRule: { permissionId: 'sheet-rule' },
        });
        expect(await firstValue(getWorkbookPermissionDisable$(hasWorksheetRuleAccessor, [WorkbookEditablePermission]))).toBe(true);

        const enabledAccessor = createMenuAccessor({
            composePermissionAllTrue: true,
            worksheetRule: null,
            subUnitRules: [],
        });
        expect(await firstValue(getWorkbookPermissionDisable$(enabledAccessor, [WorkbookEditablePermission]))).toBe(false);
    });
});
