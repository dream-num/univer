// This file provide operations to change selection of sheets.

import { CommandType, IOperation } from '@univerjs/core';

import { IEditorBridgeService, IEditorBridgeServiceVisibleParam } from '../../services/editor-bridge.service';

export const SetCellEditOperation: IOperation<IEditorBridgeServiceVisibleParam> = {
    id: 'sheet.operation.set-cell-edit',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const editorBridgeService = accessor.get(IEditorBridgeService);

        if (params?.visible === true) {
            editorBridgeService.show(params.eventType);
        } else {
            editorBridgeService.hide();
        }

        return true;
    },
};
