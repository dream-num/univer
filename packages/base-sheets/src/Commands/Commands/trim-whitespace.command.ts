import { IAccessor } from '@wendellhu/redi';
import { CommandType, ICellV, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService, ObjectMatrix } from '@univerjs/core';

import { ISetRangeFormattedValueMutationParams, SetRangeFormattedValueMutation, SetRangeFormattedValueUndoMutationFactory } from '../Mutations/set-range-formatted-value.mutation';

export interface ITrimWhitespaceParams {
    workbookId: string;
    worksheetId: string;
    range: IRangeData[];
}

/**
 * The command to insert range.
 */
export const TrimWhitespaceCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.trim-whitespace',

    handler: async (accessor: IAccessor, params: ITrimWhitespaceParams) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const { workbookId, worksheetId, range } = params;
        const worksheet = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook().getSheetBySheetId(worksheetId);
        if (!worksheet) return false;
        const sheetMatrix = worksheet.getCellMatrix();
        const cellValue = new ObjectMatrix<ICellV>();

        for (let i = 0; i < range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = range[i];
            const regx = /\s+/g;
            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    const value = sheetMatrix.getValue(r, c)!.m?.replace(regx, '');
                    cellValue.setValue(r, c, value || '');
                }
            }
        }

        const setRangeFormattedValueMutationParams: ISetRangeFormattedValueMutationParams = {
            range,
            worksheetId,
            workbookId,
            value: cellValue.getData(),
        };

        const undoSetRangeFormattedValueMutationParams: ISetRangeFormattedValueMutationParams = SetRangeFormattedValueUndoMutationFactory(
            accessor,
            setRangeFormattedValueMutationParams
        );

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetRangeFormattedValueMutation.id, setRangeFormattedValueMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(SetRangeFormattedValueMutation.id, undoSetRangeFormattedValueMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeFormattedValueMutation.id, setRangeFormattedValueMutationParams);
                },
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
