import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type { ISelectionWithStyle } from '../../basics/selection';
import { SelectionManagerService } from '../../services/selection-manager.service';

export interface ISetSelectionsOperationParams {
    workbookId: string;
    worksheetId: string;
    pluginName: string;
    selections: ISelectionWithStyle[];
}
export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = params?.selections;
        if (!selections) {
            return false;
        }

        // TODO@yuhongz: incorrect coupling
        // if (params.pluginName === FORMAT_PAINTER_SELECTION_PLUGIN_NAME) {
        //     selections.length > 1 && selections.splice(1, selections.length - 2);
        // }

        selectionManagerService.replace(selections);

        return true;
    },
};
