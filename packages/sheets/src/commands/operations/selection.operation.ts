import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type { ISelectionWithStyle } from '../../basics/selection';
import type { SelectionMoveType } from '../../services/selection-manager.service';
import { SelectionManagerService } from '../../services/selection-manager.service';

export interface ISetSelectionsOperationParams {
    workbookId: string;
    worksheetId: string;
    pluginName: string;
    selections: ISelectionWithStyle[];
    type?: SelectionMoveType;
}
export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);

        if (!params) {
            return false;
        }

        const { selections, type } = params;

        // TODO@yuhongz: incorrect coupling
        // if (params.pluginName === FORMAT_PAINTER_SELECTION_PLUGIN_NAME) {
        //     selections.length > 1 && selections.splice(1, selections.length - 2);
        // }

        selectionManagerService.replace(selections, type);

        return true;
    },
};
