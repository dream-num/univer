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
import type { IOpenTableFilterPanelOperationParams } from '../open-table-filter-dialog.opration';
import { CommandType } from '@univerjs/core';
import { TableManager } from '@univerjs/sheets-table';
import { SheetsTableMobileComponentController } from '../../../controllers/mobile/sheet-table-component.controller';
import { OpenTableFilterPanelOperation } from '../open-table-filter-dialog.opration';

export const OpenTableFilterPanelMobileOperation: ICommand<IOpenTableFilterPanelOperationParams> = {
    type: CommandType.OPERATION,
    id: OpenTableFilterPanelOperation.id,
    async handler(accessor, params) {
        if (!params) {
            return false;
        }

        const { row, col, unitId, subUnitId, tableId } = params;
        const tableManager = accessor.get(TableManager);
        const componentController = accessor.get(SheetsTableMobileComponentController);
        if (!tableManager.getTable(unitId, tableId)) {
            return false;
        }

        componentController.openOrToggleFilterPanel({ unitId, subUnitId, row, tableId, column: col });
        return true;
    },
};
