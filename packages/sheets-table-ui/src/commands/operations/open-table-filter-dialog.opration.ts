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

import type { ICommand } from '@univerjs/core';
import { CommandType, IContextService } from '@univerjs/core';
import { TableManager } from '@univerjs/sheets-table';
import { SHEETS_TABLE_FILTER_PANEL_OPENED_KEY } from '../../const';
import { SheetsTableComponentController } from '../../controllers/sheet-table-component.controller';

export interface IOpenTableFilterPanelOperationParams {
    row: number;
    col: number;
    unitId: string;
    subUnitId: string;
    tableId: string;
}
export const OpenTableFilterPanelOperation: ICommand<IOpenTableFilterPanelOperationParams> = {
    type: CommandType.OPERATION,
    id: 'sheet.operation.open-table-filter-panel',
    async handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { row, col, unitId, subUnitId, tableId } = params;
        const tableManager = accessor.get(TableManager);
        const contextService = accessor.get(IContextService);
        const sheetsTableComponentController = accessor.get(SheetsTableComponentController);

        const table = tableManager.getTable(unitId, tableId);
        if (!table) {
            return false;
        }
        if (!contextService.getContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY)) {
            sheetsTableComponentController.setCurrentTableFilterInfo({ unitId, subUnitId, row, tableId, column: col });
            contextService.setContextValue(SHEETS_TABLE_FILTER_PANEL_OPENED_KEY, true);
        }

        return true;

        // const tableRange = table.getRange();
        // const tableFilter = table.getTableFilterColumn(col - tableRange.startColumn);

        // const dialogServiceProps = {
        //     id: UNIVER_SHEET_TABLE_FILTER_PANEL_ID,
        //     draggable: true,
        //     width: 312,
        //     dialogStyles: {
        //         header: { padding: '16px 16px 0', height: 0 },
        //         body: { padding: '0 16px 16px' },
        //     },
        //     closable: false,
        //     children: {
        //         label: SHEETS_TABLE_FILTER_PANEL_OPENED_KEY,
        //         unitId,
        //         subUnitId,
        //         key: `${row}-${col}-${tableId || ''}`,
        //         tableFilter,
        //         tableId,
        //         columnIndex: col - tableRange.startColumn,
        //     },

        //     onClose: (): void => {
        //         dialogService.close(UNIVER_SHEET_TABLE_FILTER_PANEL_ID);
        //     },
        //     destroyOnClose: true,
        // };
        // dialogService.open(dialogServiceProps);

        // return true;
    },
};
