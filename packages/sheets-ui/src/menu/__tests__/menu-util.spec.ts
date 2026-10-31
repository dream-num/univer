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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import { EDITOR_ACTIVATED, FOCUSING_COMMON_DRAWINGS, FOCUSING_SHAPE_TEXT_EDITOR, IContextService, IPermissionService, IUniverInstanceService, LocaleType, SheetTypes, Univer, UniverInstanceType } from '@univerjs/core';
import { IExclusiveRangeService, SheetsSelectionsService, UniverSheetsPlugin, WorkbookEditablePermission } from '@univerjs/sheets';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getBaseRangeMenuHidden$, getCellMenuHidden$, getCurrentExclusiveRangeInterest$, getCurrentRangeDisable$, getDeleteMenuHidden$, getInsertAfterMenuHidden$, getInsertBeforeMenuHidden$ } from '../menu-util';

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

describe('Chart Sheet range menu observables', () => {
    let univer: Univer;
    let workbook: Workbook;
    const subscriptions: Array<{ unsubscribe(): void }> = [];

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverSheetsPlugin);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'menu-workbook',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            name: 'Menus',
            styles: {},
            sheetOrder: ['grid', 'chart'],
            sheets: {
                grid: { id: 'grid', name: 'Grid', cellData: {} },
                chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, cellData: {} },
            },
        });
        univer.__getInjector().get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    });

    afterEach(() => {
        subscriptions.forEach((subscription) => subscription.unsubscribe());
        subscriptions.length = 0;
        univer.dispose();
    });

    it('disables grid controls on Chart background and selection, retaining permission transitions on Grid', async () => {
        const injector = univer.__getInjector();
        const states: boolean[] = [];
        subscriptions.push(getCurrentRangeDisable$(injector).subscribe((value) => states.push(value)));
        expect(states[states.length - 1]).toBe(false);
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        expect(states[states.length - 1]).toBe(true);
        injector.get(SheetsSelectionsService).setSelections(workbook.getUnitId(), 'chart', [createSelection('chart')]);
        expect(states[states.length - 1]).toBe(true);
        injector.get(IContextService).setContextValue(FOCUSING_COMMON_DRAWINGS, true);
        expect(states[states.length - 1]).toBe(true);
        injector.get(IContextService).setContextValue(FOCUSING_COMMON_DRAWINGS, false);
        expect(states[states.length - 1]).toBe(true);
        workbook.setActiveSheet(workbook.getSheetBySheetId('grid')!);
        expect(states[states.length - 1]).toBe(false);
        const permissions = injector.get(IPermissionService);
        const permission = new WorkbookEditablePermission(workbook.getUnitId());
        permissions.updatePermissionPoint(permission.id, false);
        await new Promise((done) => setTimeout(done, 120));
        expect(states[states.length - 1]).toBe(true);
        permissions.updatePermissionPoint(permission.id, true);
        await new Promise((done) => setTimeout(done, 120));
        expect(states[states.length - 1]).toBe(false);
    });

    it('requires explicit text support and both editor contexts for the Chart font observable exception', () => {
        const injector = univer.__getInjector();
        const context = injector.get(IContextService);
        const gridStates: boolean[] = [];
        const textStates: boolean[] = [];
        subscriptions.push(getCurrentRangeDisable$(injector, {}, true).subscribe((value) => gridStates.push(value)));
        subscriptions.push(getCurrentRangeDisable$(injector, {}, true, true).subscribe((value) => textStates.push(value)));
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        expect(textStates[textStates.length - 1]).toBe(true);
        context.setContextValue(FOCUSING_SHAPE_TEXT_EDITOR, true);
        expect(textStates[textStates.length - 1]).toBe(true);
        context.setContextValue(EDITOR_ACTIVATED, true);
        expect(textStates[textStates.length - 1]).toBe(false);
        expect(gridStates[gridStates.length - 1]).toBe(true);
        context.setContextValue(EDITOR_ACTIVATED, false);
        expect(textStates[textStates.length - 1]).toBe(true);
    });

    it('hides range-specific controls immediately on sheet switches without selection events', () => {
        const injector = univer.__getInjector();
        injector.get(SheetsSelectionsService).setSelections(workbook.getUnitId(), 'grid', [createSelection('grid')]);
        const observables = [
            getBaseRangeMenuHidden$(injector),
            getInsertAfterMenuHidden$(injector, 'row'),
            getInsertBeforeMenuHidden$(injector, 'col'),
            getDeleteMenuHidden$(injector, 'row'),
            getCellMenuHidden$(injector, 'col'),
        ];
        const current = observables.map(() => false);
        observables.forEach((observable, index) => subscriptions.push(observable.subscribe((value) => {
            current[index] = value;
        })));
        expect(current).toEqual([false, false, false, false, false]);
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        expect(current).toEqual([true, true, true, true, true]);
        workbook.setActiveSheet(workbook.getSheetBySheetId('grid')!);
        expect(current).toEqual([false, false, false, false, false]);
    });
});
