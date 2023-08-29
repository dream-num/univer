// This file provide operations to change selecction of sheets.

import { ISelectionManager } from '@Services/tokens';
import { CommandType, IOperation } from '@univerjs/core';
import { ISelectionModelValue } from '../../Model';

export interface ISetSelectionsOperationParams {
    sheetId: string;
    selections: ISelectionModelValue[];
}

export const SetSelectionsOperation: IOperation<ISetSelectionsOperationParams> = {
    id: 'sheet.operation.set-selections',
    type: CommandType.OPERATION,
    handler: async (accessor, params) => {
        const selectionManager = accessor.get(ISelectionManager);
        selectionManager.setModels(params.selections);
        return true;
    },
};