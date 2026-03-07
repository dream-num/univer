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
    IContextService,
    IPermissionService,
    IUniverInstanceService,
    RANGE_TYPE,
    UserManagerService,
} from '@univerjs/core';
import {
    RangeProtectionCache,
    RangeProtectionRuleModel,
    SheetsSelectionsService,
    UnitAction,
    WorksheetProtectionRuleModel,
} from '@univerjs/sheets';
import { BehaviorSubject, firstValueFrom, of, skip, take } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import {
    getAddPermissionDisableBase$,
    getAddPermissionFromSheetBarDisable$,
    getAddPermissionHidden$,
    getEditPermissionHidden$,
    getPermissionDisableBase$,
    getRemovePermissionDisable$,
    getRemovePermissionFromSheetBarDisable$,
    getSetPermissionFromSheetBarDisable$,
    getViewPermissionDisable$,
} from '../permission-menu-util';

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

interface IMockOption {
    workbook: any;
    worksheet: any;
    selections?: any[] | undefined;
    subUnitRules?: any[];
    worksheetRule?: any;
    permissionAllTrue?: boolean;
    permissionPointValue?: boolean;
    formulaEditorFocus?: boolean;
    focusingDrawing?: boolean;
    editorVisible?: any;
    hasEditorBridge?: boolean;
    cellInfoByCoord?: Record<string, Record<string, boolean>>;
}

function createPermissionAccessor(option: Partial<IMockOption> = {}) {
    const worksheet = option.worksheet ?? { getSheetId: () => 'sheet-1' };
    const workbook = option.workbook ?? { getUnitId: () => 'unit-1', activeSheet$: of(worksheet) };
    const selections = option.selections;

    const selectionMoveEnd$ = new BehaviorSubject(null);
    const selectionService = {
        selectionMoveEnd$,
        getCurrentSelections: () => selections,
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

    const permissionAllTrue = option.permissionAllTrue ?? true;
    const permissionPointValue = option.permissionPointValue ?? true;
    const permissionService = {
        composePermission$: (ids: string[]) => of(ids.map(() => ({ value: permissionAllTrue }))),
        getPermissionPoint: () => ({ value: permissionPointValue }),
        getPermissionPoint$: () => of({ value: permissionPointValue }),
    };

    const formulaEditorFocus = option.formulaEditorFocus ?? false;
    const focusingDrawing = option.focusingDrawing ?? false;
    const contextService = {
        subscribeContextValue$: (key: unknown) => {
            if (key === FOCUSING_FX_BAR_EDITOR) {
                return of(formulaEditorFocus);
            }
            if (key === FOCUSING_COMMON_DRAWINGS) {
                return of(focusingDrawing);
            }
            return of(false);
        },
    };

    const cellInfoByCoord = option.cellInfoByCoord ?? {};
    const rangeProtectionCache = {
        getCellInfo: (_unitId: string, _subUnitId: string, row: number, col: number) => {
            return cellInfoByCoord[`${row},${col}`] ?? null;
        },
    };

    const pairs: Array<[unknown, unknown]> = [
        [IUniverInstanceService, { getCurrentTypeOfUnit$: () => of(workbook) }],
        [UserManagerService, { currentUser$: of({ userID: 'u1' }) }],
        [SheetsSelectionsService, selectionService],
        [RangeProtectionRuleModel, rangeProtectionRuleModel],
        [WorksheetProtectionRuleModel, worksheetProtectionRuleModel],
        [IPermissionService, permissionService],
        [IContextService, contextService],
        [RangeProtectionCache, rangeProtectionCache],
    ];

    if (option.hasEditorBridge) {
        pairs.push([IEditorBridgeService, { visible$: of(option.editorVisible ?? null) }]);
    }

    return createAccessor(pairs);
}

describe('permission-menu-util', () => {
    it('computes add-permission hidden by worksheet rule or range overlap', async () => {
        const overlapAccessor = createPermissionAccessor({
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            subUnitRules: [{ ranges: [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 }] }],
        });
        expect(await firstValue(getAddPermissionHidden$(overlapAccessor))).toBe(true);

        const worksheetRuleAccessor = createPermissionAccessor({
            selections: [{ range: { startRow: 3, endRow: 3, startColumn: 3, endColumn: 3 } }],
            worksheetRule: { permissionId: 'sheet-permission' },
            subUnitRules: [],
        });
        expect(await firstValue(getAddPermissionHidden$(worksheetRuleAccessor))).toBe(true);

        const emptySelectionAccessor = createPermissionAccessor({
            selections: undefined,
            subUnitRules: [{ ranges: [{ startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 }] }],
        });
        expect(await firstValue(getAddPermissionHidden$(emptySelectionAccessor))).toBe(false);
    });

    it('computes edit-permission hidden with selection/rule/cell-action checks', async () => {
        const multiSelectionAccessor = createPermissionAccessor({
            selections: [
                { range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } },
                { range: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 } },
            ],
        });
        expect(await firstValue(getEditPermissionHidden$(multiSelectionAccessor))).toBe(true);

        const worksheetRuleAccessor = createPermissionAccessor({
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            worksheetRule: { permissionId: 'sheet-rule' },
            permissionPointValue: false,
        });
        expect(await firstValue(getEditPermissionHidden$(worksheetRuleAccessor))).toBe(true);

        const blockedByCellAccessor = createPermissionAccessor({
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            subUnitRules: [{ ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }] }],
            cellInfoByCoord: { '1,1': { [UnitAction.ManageCollaborator]: false } },
        });
        expect(await firstValue(getEditPermissionHidden$(blockedByCellAccessor))).toBe(true);

        const allowedCellAccessor = createPermissionAccessor({
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            subUnitRules: [{ ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }] }],
            cellInfoByCoord: { '1,1': { [UnitAction.ManageCollaborator]: true } },
        });
        expect(await firstValue(getEditPermissionHidden$(allowedCellAccessor))).toBe(false);
    });

    it('computes base permission disable with permission result and selection count', async () => {
        const noPermissionAccessor = createPermissionAccessor({
            permissionAllTrue: false,
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
        });
        expect(await firstValue(getPermissionDisableBase$(noPermissionAccessor))).toBe(true);

        const oneSelectionAccessor = createPermissionAccessor({
            permissionAllTrue: true,
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
        });
        expect(await firstValue(getPermissionDisableBase$(oneSelectionAccessor))).toBe(false);

        const multiSelectionAccessor = createPermissionAccessor({
            permissionAllTrue: true,
            selections: [
                { range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } },
                { range: { startRow: 2, endRow: 2, startColumn: 2, endColumn: 2 } },
            ],
        });
        expect(await firstValue(getPermissionDisableBase$(multiSelectionAccessor))).toBe(true);
    });

    it('computes add-permission disable base with editor/drawing/overlap checks', async () => {
        const editorVisibleAccessor = createPermissionAccessor({
            hasEditorBridge: true,
            editorVisible: { visible: true, unitId: 'unit-1' },
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
        });
        expect(await firstValue(getAddPermissionDisableBase$(editorVisibleAccessor))).toBe(true);

        const focusingDrawingAccessor = createPermissionAccessor({
            focusingDrawing: true,
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            permissionAllTrue: true,
        });
        expect(await firstValueFrom(getAddPermissionDisableBase$(focusingDrawingAccessor).pipe(skip(1), take(1)))).toBe(true);

        const enabledAccessor = createPermissionAccessor({
            permissionAllTrue: true,
            selections: [{ range: { startRow: 5, endRow: 5, startColumn: 5, endColumn: 5 } }],
            subUnitRules: [{ ranges: [{ startRow: 0, endRow: 0, startColumn: 0, endColumn: 0 }] }],
        });
        expect(await firstValue(getAddPermissionDisableBase$(enabledAccessor))).toBe(false);
    });

    it('computes sheet-bar add/remove/set disable states', async () => {
        const addAllowedAccessor = createPermissionAccessor({
            permissionAllTrue: true,
            subUnitRules: [{ permissionId: undefined }],
        });
        expect(await firstValue(getAddPermissionFromSheetBarDisable$(addAllowedAccessor))).toBe(false);

        const addDisabledAccessor = createPermissionAccessor({
            permissionAllTrue: true,
            subUnitRules: [{ permissionId: 'r1' }],
        });
        expect(await firstValue(getAddPermissionFromSheetBarDisable$(addDisabledAccessor))).toBe(true);

        const removeNoRuleAccessor = createPermissionAccessor({
            worksheetRule: null,
        });
        expect(await firstValue(getRemovePermissionFromSheetBarDisable$(removeNoRuleAccessor))).toBe(true);

        const removeWithRuleAccessor = createPermissionAccessor({
            worksheetRule: { permissionId: 'sheet-rule' },
            permissionPointValue: true,
        });
        expect(await firstValue(getRemovePermissionFromSheetBarDisable$(removeWithRuleAccessor))).toBe(false);

        const setDisabledAccessor = createPermissionAccessor({
            permissionAllTrue: false,
            subUnitRules: [],
        });
        expect(await firstValue(getSetPermissionFromSheetBarDisable$(setDisabledAccessor))).toBe(true);

        const setEnabledAccessor = createPermissionAccessor({
            permissionAllTrue: true,
            worksheetRule: { permissionId: 'sheet-rule' },
        });
        expect(await firstValue(getSetPermissionFromSheetBarDisable$(setEnabledAccessor))).toBe(false);
    });

    it('computes remove-permission disable from selection and permission detail', async () => {
        const noSelectionAccessor = createPermissionAccessor({
            selections: undefined,
        });
        expect(await firstValue(getRemovePermissionDisable$(noSelectionAccessor))).toBe(true);

        const rowSelectionAccessor = createPermissionAccessor({
            selections: [{
                range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1, rangeType: RANGE_TYPE.ROW },
            }],
        });
        expect(await firstValue(getRemovePermissionDisable$(rowSelectionAccessor))).toBe(true);

        const worksheetRuleAccessor = createPermissionAccessor({
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            worksheetRule: { permissionId: 'sheet-rule' },
            permissionPointValue: false,
        });
        expect(await firstValue(getRemovePermissionDisable$(worksheetRuleAccessor))).toBe(true);

        const blockedCellAccessor = createPermissionAccessor({
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            subUnitRules: [{ ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }] }],
            cellInfoByCoord: { '1,1': { [UnitAction.Delete]: false } },
        });
        expect(await firstValue(getRemovePermissionDisable$(blockedCellAccessor))).toBe(true);

        const allowedAccessor = createPermissionAccessor({
            selections: [{ range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } }],
            subUnitRules: [{ ranges: [{ startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 }] }],
            cellInfoByCoord: { '1,1': { [UnitAction.Delete]: true } },
        });
        expect(await firstValue(getRemovePermissionDisable$(allowedAccessor))).toBe(false);
    });

    it('computes view-permission disable with workbook/editor/permission states', async () => {
        const noWorkbookAccessor = createAccessor([
            [IUniverInstanceService, { getCurrentTypeOfUnit$: () => of(null) }],
            [UserManagerService, { currentUser$: of({ userID: 'u1' }) }],
            [IPermissionService, { getPermissionPoint$: () => of({ value: true }) }],
            [IContextService, { subscribeContextValue$: () => of(false) }],
        ]);
        expect(await firstValue(getViewPermissionDisable$(noWorkbookAccessor))).toBe(true);

        const editorVisibleAccessor = createPermissionAccessor({
            hasEditorBridge: true,
            editorVisible: { visible: true, unitId: 'unit-1' },
            permissionPointValue: true,
        });
        expect(await firstValue(getViewPermissionDisable$(editorVisibleAccessor))).toBe(true);

        const allowedAccessor = createPermissionAccessor({
            permissionPointValue: true,
        });
        expect(await firstValue(getViewPermissionDisable$(allowedAccessor))).toBe(false);
    });
});
