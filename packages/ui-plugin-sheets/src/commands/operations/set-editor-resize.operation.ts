// This file provide operations to change selection of sheets.

import { CommandType, IOperation } from '@univerjs/core';

export const SetEditorResizeOperation: IOperation = {
    id: 'sheet.operation.set-editor-resize',
    type: CommandType.OPERATION,
    handler: (accessor, params) => true,
};
