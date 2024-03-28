/**
 * Copyright 2023-present DreamNum Inc.
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

import { CommandType, ICommandService, IContextService, type IOperation, IUniverInstanceService } from '@univerjs/core';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import { SelectionManagerService } from '@univerjs/sheets';
import type { FilterBy } from '../services/sheets-filter-panel.service';
import { SheetsFilterPanelService } from '../services/sheets-filter-panel.service';

export const FILTER_PANEL_OPENED_KEY = 'FILTER_PANEL_OPENED';

export interface IOpenFilterPanelOperationParams {
    unitId: string;
    subUnitId: string;

    col: number;
}

/**
 * The operation to open the filter panel and prepare for changing the filter conditions on a given column.
 */
export const OpenFilterPanelOperation: IOperation<IOpenFilterPanelOperationParams> = {
    id: 'sheet.operation.open-filter-panel',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const contextService = accessor.get(IContextService);
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const sheetsFilterPanelService = accessor.get(SheetsFilterPanelService);

        const { unitId, subUnitId, col } = params;
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) {
            return false;
        }

        const result = sheetsFilterPanelService.setupCol(filterModel, col);
        if (!contextService.getContextValue(FILTER_PANEL_OPENED_KEY)) {
            contextService.setContextValue(FILTER_PANEL_OPENED_KEY, true);
        }

        // Set the filter condition to the filter ui service on the specific column.
        return result;
    },
};

/**
 * This openeration would try to open the filter panel on the currently selected column
 * if the column is inside the range of the filter.
 */
export const OpenFilterPanelOnCurrentSelectionOperation: IOperation = {
    id: 'sheet.operation.open-filter-panel-on-current-selection',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const sheetsFilterService = accessor.get(SheetsFilterService);

        const selection = selectionManagerService.getLast();
        if (!selection) {
            return false;
        }

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();
        const filterModel = sheetsFilterService.getFilterModel(worksheet.getUnitId(), worksheet.getSheetId());
        if (!filterModel) {
            return false;
        }

        const filterRange = filterModel.getRange();
        if (filterRange.startColumn <= selection.primary.startColumn && selection.primary.startColumn <= filterRange.endColumn) {
            return commandService.syncExecuteCommand(OpenFilterPanelOperation.id, {
                unitId: worksheet.getUnitId(),
                subUnitId: worksheet.getSheetId(),
                col: selection.primary.startColumn - filterRange.startColumn,
            } as IOpenFilterPanelOperationParams);
        }

        return false;
    },
};

export const CloseFilterPanelOperation: IOperation = {
    id: 'sheet.operation.close-filter-panel',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const contextService = accessor.get(IContextService);
        const sheetsFilterPanelService = accessor.get(SheetsFilterPanelService);

        if (contextService.getContextValue(FILTER_PANEL_OPENED_KEY)) {
            contextService.setContextValue(FILTER_PANEL_OPENED_KEY, false);

            return sheetsFilterPanelService.terminate();
        }

        return false;
    },
};

export interface IChangeFilterByOperationParams {
    filterBy: FilterBy;
}
export const ChangeFilterByOperation: IOperation<IChangeFilterByOperationParams> = {
    id: 'sheet.operation.apply-filter',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const { filterBy } = params!;
        const sheetsFilterPanelService = accessor.get(SheetsFilterPanelService);
        return sheetsFilterPanelService.changeFilterBy(filterBy);
    },
};
