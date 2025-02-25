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

import type { IOperation } from '@univerjs/core';
import { CommandType, ICommandService, IContextService, Quantity } from '@univerjs/core';
import { SheetsFilterService } from '@univerjs/sheets-filter';
import { ILayoutService } from '@univerjs/ui';
import { SetCellEditVisibleOperation } from '@univerjs/sheets-ui';
import type { FilterBy } from '../../services/sheets-filter-panel.service';
import { SheetsFilterPanelService } from '../../services/sheets-filter-panel.service';

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
    handler: (accessor, params: IOpenFilterPanelOperationParams) => {
        const contextService = accessor.get(IContextService);
        const sheetsFilterService = accessor.get(SheetsFilterService);
        const sheetsFilterPanelService = accessor.get(SheetsFilterPanelService);
        const commandService = accessor.get(ICommandService);

        // Close the cell edit if it is opened.
        commandService.syncExecuteCommand(SetCellEditVisibleOperation.id, { visible: false });

        const { unitId, subUnitId, col } = params;
        const filterModel = sheetsFilterService.getFilterModel(unitId, subUnitId);
        if (!filterModel) return false;

        sheetsFilterPanelService.setupCol(filterModel, col);
        if (!contextService.getContextValue(FILTER_PANEL_OPENED_KEY)) {
            contextService.setContextValue(FILTER_PANEL_OPENED_KEY, true);
        }

        // Set the filter condition to the filter ui service on the specific column.
        return true;
    },
};

export const CloseFilterPanelOperation: IOperation = {
    id: 'sheet.operation.close-filter-panel',
    type: CommandType.OPERATION,
    handler: (accessor) => {
        const contextService = accessor.get(IContextService);
        const sheetsFilterPanelService = accessor.get(SheetsFilterPanelService);
        const layoutService = accessor.get(ILayoutService, Quantity.OPTIONAL);

        if (contextService.getContextValue(FILTER_PANEL_OPENED_KEY)) {
            contextService.setContextValue(FILTER_PANEL_OPENED_KEY, false);
            layoutService?.focus();

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
