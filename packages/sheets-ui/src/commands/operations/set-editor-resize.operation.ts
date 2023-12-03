// This file provide operations to change selection of sheets.

import type { IOperation } from '@univerjs/core';
import { CommandType } from '@univerjs/core';

export const SetEditorResizeOperation: IOperation = {
    id: 'sheet.operation.set-editor-resize',
    type: CommandType.OPERATION,
    handler: (accessor, params) => true,
};
