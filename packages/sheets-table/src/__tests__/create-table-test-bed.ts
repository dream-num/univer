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
import {
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import sheetsEnUS from '@univerjs/sheets/locale/en-US';
import type { ITableJson } from '../types/type';
import { PLUGIN_NAME } from '../const';
import { SheetTableRefRangeController } from '../controllers/sheet-table-ref-range.controller';
import enUS from '../locale/en-US';
import { TableManager } from '../models/table-manager';
import { UniverSheetsTablePlugin } from '../plugin';
import { TableColumnDataTypeEnum } from '../types/enum';

export function createTableTestBed(startRow = 0, startColumn = 0, columnCount = 20) {
    const univer = new Univer();
    const injector = univer.__getInjector();
    const locale = injector.get(LocaleService);
    locale.load({ [LocaleType.EN_US]: { ...sheetsEnUS, ...enUS } });
    locale.setLocale(LocaleType.EN_US);
    locale.setDirection('ltr');
    univer.registerPlugin(UniverFormulaEnginePlugin);
    univer.registerPlugin(UniverSheetsPlugin);
    univer.registerPlugin(UniverSheetsTablePlugin);
    const columns: ITableJson['columns'] = ['Id', 'Date', 'Region', 'Product', 'Qty', 'Price', 'Amount', 'Status'].map((displayName, index) => ({
        id: `original-${index}`,
        displayName,
        dataType: index >= 4 && index <= 6 ? TableColumnDataTypeEnum.Number : TableColumnDataTypeEnum.String,
        formula: index === 6 ? '=E2*F2' : '',
        formulaIsArray: index === 6 ? false : undefined,
        meta: { originalIndex: index },
        style: { bl: 1 },
        showFilterButton: index !== 6,
    }));
    const table: ITableJson = {
        id: 'sales',
        name: 'SalesData',
        range: { startRow, endRow: startRow + 8, startColumn, endColumn: startColumn + 7 },
        options: { showHeader: true, showFooter: false, showAutoFilter: true, tableStyleId: 'table-default-2' },
        meta: { owner: 'sales' },
        columns,
        filters: { tableColumnFilterList: [] },
    };
    const workbook = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, {
        id: 'unit',
        locale: LocaleType.EN_US,
        styles: {},
        sheetOrder: ['orders'],
        sheets: { orders: { id: 'orders', name: 'Orders', rowCount: 30, columnCount, cellData: {
            [startRow]: { 6: { v: 'Amount' }, 7: { v: 'Status' } },
            [startRow + 1]: { 4: { v: 3 }, 5: { v: 25 }, 6: { f: '=E2*F2', v: 75 }, 7: { v: 'Done' } },
            29: { 19: { v: 'outside' } },
        } } },
        resources: [{ name: PLUGIN_NAME, data: JSON.stringify({ orders: { tables: [table], tableFilteredOutRows: [] } }) }],
    });
    injector.get(IUniverInstanceService).focusUnit('unit');
    const controller = injector.get(SheetTableRefRangeController);
    const manager = injector.get(TableManager);
    const commands = injector.get(ICommandService);
    return { univer, injector, workbook, controller, manager, commands };
}
