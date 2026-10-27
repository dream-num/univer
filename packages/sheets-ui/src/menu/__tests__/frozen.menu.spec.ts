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
import { IUniverInstanceService, LocaleType, SheetTypes, Univer, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { expect, it, onTestFinished } from 'vitest';
import { SheetFrozenToolbarMenuItemFactory } from '../frozen.menu';

it('disables the freeze toolbar on Chart Sheets and restores it immediately on Grid without a selection event', () => {
    const univer = new Univer();
    onTestFinished(() => univer.dispose());
    univer.registerPlugin(UniverSheetsPlugin);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'freeze-menu',
        name: 'Freeze',
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
    const subscription = SheetFrozenToolbarMenuItemFactory(injector).disabled$!.subscribe((disabled) => states.push(disabled));
    onTestFinished(() => subscription.unsubscribe());
    expect(states[states.length - 1]).toBe(true);
    workbook.setActiveSheet(workbook.getSheetBySheetId('grid')!);
    expect(states[states.length - 1]).toBe(false);
    workbook.setActiveSheet(workbook.getSheetBySheetId('chart')!);
    expect(states[states.length - 1]).toBe(true);
});
