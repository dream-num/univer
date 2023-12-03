// This file provide operations to change selection of sheets.

import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

import type { IEditorBridgeServiceParam } from '../../services/editor-bridge.service';
import { IEditorBridgeService } from '../../services/editor-bridge.service';

export const SetActivateCellEditOperation: IOperation<IEditorBridgeServiceParam> = {
    id: 'sheet.operation.set-activate-cell-edit',
    type: CommandType.OPERATION,
    handler: (accessor, params) => {
        const editorBridgeService = accessor.get(IEditorBridgeService);

        editorBridgeService.setState(params!);

        return true;
    },
};
