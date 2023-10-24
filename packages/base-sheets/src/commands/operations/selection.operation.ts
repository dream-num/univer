// This file provide operations to change selection of sheets.

import { CommandType, IOperation } from '@univerjs/core';

import { ISelectionWithStyle } from '../../Basics/selection';
import { SelectionManagerService } from '../../services/selection/selection-manager.service';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';

export interface ISetSelectionsOperationParams {
    workbookId: string;
    worksheetId: string;
    pluginName: string;
    selections: ISelectionWithStyle[];
}

export interface ISetCopySelectionsOperationParams {
    workbookId: string;
    worksheetId: string;
    pluginName: string;
    selections: ISelectionWithStyle[];
    show: boolean;
}

export const FORMAT_PAINTER_SELECTION_PLUGIN_NAME = 'formatPainterSelectionPluginName';

export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = params?.selections;
        if (!selections) {
            return false;
        }
        if (params.pluginName === FORMAT_PAINTER_SELECTION_PLUGIN_NAME) {
            selections.length > 1 && selections.splice(1, selections.length - 2);
        }

        selectionManagerService.replace(selections);
        return true;
    },
};

export const SetCopySelectionsOperation: IOperation<ISetCopySelectionsOperationParams> = {
    id: 'sheet.operation.set-copy-selection',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selectionRenderService = accessor.get(ISelectionRenderService);
        if (!params) {
            return false;
        }
        if (!params.show) {
            selectionRenderService.disableShowPrevious();
            selectionManagerService.makeDirty(true);
            selectionManagerService.reset();
            selectionManagerService.add(params.selections);
            return true;
        }
        selectionRenderService.enableShowPrevious();
        selectionManagerService.makeDirty(false);
        selectionManagerService.setCurrentSelectionNotRefresh({
            pluginName: params.pluginName,
            unitId: params.workbookId,
            sheetId: params.worksheetId,
        });
        const selection = params.selections[0];
        const { range, primary } = selection;
        const newSelection = {
            range,
            primary,
            style: selectionManagerService.createCopyPasteSelection(),
        };
        selectionManagerService.add([newSelection]);
        return true;
    },
};
