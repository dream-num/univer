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
import { IPermissionService, IUniverInstanceService, LocaleType, SheetTypes, Univer, UniverInstanceType } from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin, WorkbookEditablePermission } from '@univerjs/sheets';
import { expect, it, onTestFinished } from 'vitest';
import { InsertCommonFunctionMenuItemFactory, InsertFinancialFunctionMenuItemFactory } from '../menu';

it.each([
    ['common', InsertCommonFunctionMenuItemFactory],
    ['category', InsertFinancialFunctionMenuItemFactory],
] as const)(
    'disables function insertion on Chart Sheets and restores permitted Grid insertion through %s',
    async (_name, factory) => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        univer.registerPlugin(UniverFormulaEnginePlugin);
        univer.registerPlugin(UniverSheetsPlugin);
        const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
            id: 'formula-menu',
            name: 'Formula menus',
            locale: LocaleType.EN_US,
            appVersion: 'test',
            styles: {},
            sheetOrder: ['chart', 'grid'],
            sheets: {
                chart: { id: 'chart', name: 'Chart', type: SheetTypes.CHART, rowCount: 0, columnCount: 0 },
                grid: { id: 'grid', name: 'Grid', cellData: {} },
            },
        });
        const injector = univer.__getInjector();
        injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
        const states: boolean[] = [];
        const subscription = factory(injector).disabled$!.subscribe((disabled) => states.push(disabled));
        onTestFinished(() => subscription.unsubscribe());
        expect(states[states.length - 1]).toBe(true);
        workbook.setActiveSheet(workbook.getSheetBySheetId('grid')!);
        expect(states[states.length - 1]).toBe(false);
        const permissions = injector.get(IPermissionService);
        permissions.updatePermissionPoint(new WorkbookEditablePermission(workbook.getUnitId()).id, false);
        await new Promise((done) => setTimeout(done, 120));
        expect(states[states.length - 1]).toBe(true);
    }
);
