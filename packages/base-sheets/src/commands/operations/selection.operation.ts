// This file provide operations to change selection of sheets.

import { CommandType, IOperation } from '@univerjs/core';

import { ISelectionWithStyle } from '../../Basics/selection';
import { SelectionManagerService } from '../../services/selection/selection-manager.service';

export interface ISetSelectionsOperationParams {
    workbookId: string;
    worksheetId: string;
    pluginName: string;
    selections: ISelectionWithStyle[];
}

export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        selectionManagerService.replace(params!.selections);
        return true;
    },
};

export const SetCopySelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-copy-selection',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        if (!params) {
            return false;
        }
        selectionManagerService.replaceCopySelection(params!);
        return true;
    },
};
