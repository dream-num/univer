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

import type { IWorkbookData, Workbook } from '@univerjs/core';
import { ICommandService, IPermissionService, IUniverInstanceService, LocaleType, SheetTypes, Univer, UniverInstanceType } from '@univerjs/core';
import { WorkbookEditablePermission } from '@univerjs/sheets';
import { SetSheetsFilterCriteriaMutation, SetSheetsFilterRangeMutation, UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ClearFilterCriteriaMenuItemFactory, ReCalcFilterMenuItemFactory } from '../sheets-filter.menu';

describe('filter criteria menus on Chart Sheets', () => {
    let univer: Univer;
    let workbook: Workbook;
    const subscriptions: Array<{ unsubscribe(): void }> = [];

    beforeEach(() => {
        univer = new Univer();
        univer.registerPlugin(UniverSheetsFilterPlugin);
        workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'filter-menu-workbook',
            appVersion: '1.0.0',
            locale: LocaleType.EN_US,
            name: 'Filter menus',
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

    it('allows editable Grid criteria and disables Clear and Recalculate on a Chart Sheet with historical criteria', async () => {
        const injector = univer.__getInjector();
        const commands = injector.get(ICommandService);
        const states = { clear: true, recalc: true };
        subscriptions.push(ClearFilterCriteriaMenuItemFactory(injector).disabled$!.subscribe((value) => {
            states.clear = value;
        }));
        subscriptions.push(ReCalcFilterMenuItemFactory(injector).disabled$!.subscribe((value) => {
            states.recalc = value;
        }));

        for (const subUnitId of ['grid', 'chart']) {
            expect(commands.syncExecuteCommand(SetSheetsFilterRangeMutation.id, {
                unitId: workbook.getUnitId(),
                subUnitId,
                range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 0 },
            })).toBe(true);
            expect(commands.syncExecuteCommand(SetSheetsFilterCriteriaMutation.id, {
                unitId: workbook.getUnitId(),
                subUnitId,
                col: 0,
                criteria: { colId: 0, filters: { filters: ['Apple'] } },
            })).toBe(true);
        }

        expect(states).toEqual({ clear: false, recalc: false });
        workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
        expect(states).toEqual({ clear: true, recalc: true });
        workbook.setActiveSheet(workbook.getSheetBySheetId('grid')!);
        expect(states).toEqual({ clear: false, recalc: false });

        const permission = new WorkbookEditablePermission(workbook.getUnitId());
        injector.get(IPermissionService).updatePermissionPoint(permission.id, false);
        await vi.waitFor(() => expect(states).toEqual({ clear: true, recalc: true }));
        injector.get(IPermissionService).updatePermissionPoint(permission.id, true);
        await vi.waitFor(() => expect(states).toEqual({ clear: false, recalc: false }));
    });
});
