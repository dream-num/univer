import { CommandType, ICellData, ICommand, ICommandService, IRangeData, IUndoRedoService, ObjectMatrix, ObjectMatrixPrimitiveType, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../Mutations/set-range-values.mutation';

export interface ISetRangeValuesCommandParams {
    worksheetId: string;
    workbookId: string;
    range: IRangeData;
    value: ICellData | ICellData[][] | ObjectMatrixPrimitiveType<ICellData>;
}

/**
 * The command to set values for ranges.
 */
export const SetRangeValuesCommand: ICommand = {
    id: 'sheet.command.set-range-values',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: ISetRangeValuesCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { range, value, workbookId, worksheetId } = params;
        const { startRow, startColumn, endRow, endColumn } = range;
        let cellValue = new ObjectMatrix<ICellData>();

        if (Tools.isArray(value)) {
            for (let r = 0; r <= endRow - startRow; r++) {
                for (let c = 0; c <= endColumn - startColumn; c++) {
                    cellValue.setValue(r + startRow, c + startColumn, value[r][c]);
                }
            }
        } else if (Tools.isObject(value)) {
            cellValue = value as ObjectMatrix<ICellData>;
        } else {
            cellValue.setValue(startRow, startColumn, value);
        }

        const setRangeValuesMutationParams: ISetRangeValuesMutationParams = {
            rangeData: range,
            worksheetId,
            workbookId,
            cellValue: cellValue as any,
        };
        const undoSetRangeValuesMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, setRangeValuesMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, undoSetRangeValuesMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, setRangeValuesMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};
