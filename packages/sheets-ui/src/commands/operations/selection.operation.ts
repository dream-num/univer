// This file provide operations to change selection of sheets.

import { ISelectionWithStyle, SelectionManagerService } from '@univerjs/sheets';
import { CommandType, IOperation } from '@univerjs/core';

import { ISelectionRenderService } from '../../services/selection/selection-render.service';

export interface ISetCopySelectionsOperationParams {
    workbookId: string;
    worksheetId: string;
    pluginName: string;
    selections: ISelectionWithStyle[];
    show: boolean;
}

export const FORMAT_PAINTER_SELECTION_PLUGIN_NAME = 'formatPainterSelectionPluginName';

export const SetCopySelectionsOperation: IOperation<ISetCopySelectionsOperationParams> = {
    id: 'sheet.operation.set-copy-selection',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
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
