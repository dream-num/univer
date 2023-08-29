import { IAccessor } from '@wendellhu/redi';
import { CommandType, ICommand, ICommandService, IRangeData, IStyleData, IUndoRedoService, ObjectMatrixPrimitiveType } from '@univerjs/core';

import { ISetRangeStyleMutationParams, SetRangeStyleMutation, SetRangeStyleUndoMutationFactory } from '../Mutations/set-range-styles.mutation';

export interface ISetStyleParams {
    range: IRangeData[];
    value: ObjectMatrixPrimitiveType<IStyleData>;
    workbookId: string;
    worksheetId: string;
}

/**
 * The command to insert a row into a worksheet.
 */
export const SetStyleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-style',

    handler: async (accessor: IAccessor, params: ISetStyleParams) => {
        // const currentUniverService = accessor.get(ICurrentUniverService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const setRangeStyleMutationParams: ISetRangeStyleMutationParams = {
            range: params.range,
            worksheetId: params.worksheetId,
            workbookId: params.workbookId,
            value: params.value,
        };

        const undoSetRangeStyleMutationParams: ISetRangeStyleMutationParams = SetRangeStyleUndoMutationFactory(accessor, setRangeStyleMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(SetRangeStyleMutation.id, undoSetRangeStyleMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
                },
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
