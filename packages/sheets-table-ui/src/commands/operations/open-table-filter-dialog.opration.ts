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
import { CommandType, ICommandService } from '@univerjs/core';
import { TableManager } from '@univerjs/sheets-table';
import { SheetsTableComponentController } from '../../controllers/sheet-table-component.controller';

export interface IOpenTableFilterPanelOperationParams {
    row: number;
    col: number;
    unitId: string;
    subUnitId: string;
    tableId: string;
}

export interface IRequestOpenTableFilterPanelOperationParams extends IOpenTableFilterPanelOperationParams {
    /** Set by a beforeCommandExecuted listener when an alternative panel handles this request. */
    handled?: boolean;
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
        const sheetsTableComponentController = accessor.get(SheetsTableComponentController);

        const table = tableManager.getTable(unitId, tableId);
        if (!table) {
            return false;
        }

        sheetsTableComponentController.openOrToggleFilterPanel({ unitId, subUnitId, row, tableId, column: col });

        return true;
    },
};

export const RequestOpenTableFilterPanelOperation: ICommand<IRequestOpenTableFilterPanelOperationParams> = {
    id: 'sheet.operation.request-open-table-filter-panel',
    type: CommandType.OPERATION,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }
        if (params.handled) {
            return true;
        }
        return accessor.get(ICommandService).executeCommand(OpenTableFilterPanelOperation.id, params);
    },
};
