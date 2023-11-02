import { CommandType, ICommand } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

export interface IInsertFunctionCommandParams {
    /**
     * function name
     */
    value: string;
}

export const InsertFunctionOperation: ICommand = {
    id: 'formula.operation.insert-function',
    type: CommandType.OPERATION,
    handler: async (accessor: IAccessor, params: IInsertFunctionCommandParams) => true,
};
