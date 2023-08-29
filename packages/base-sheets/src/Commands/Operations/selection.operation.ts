// This file provide operations to change selecction of sheets.

import { ISelectionManager } from '@Services/tokens';
import { CommandType, ICellInfo, IOperation, ISelection, Nullable } from '@univerjs/core';

export interface ISelectionModelValue {
    selection: ISelection;
    cell: Nullable<ICellInfo>;
}

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
