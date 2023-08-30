import { IAccessor } from '@wendellhu/redi';
import { CommandType, ICommand, ICommandService, IRangeData, IStyleData, IUndoRedoService, ObjectMatrix, Tools } from '@univerjs/core';

import { ISetRangeStyleMutationParams, SetRangeStyleMutation, SetRangeStyleUndoMutationFactory } from '../Mutations/set-range-styles.mutation';

export interface IStyleTypeValue<T> {
    type: keyof IStyleData;
    value: T | T[][];
}

export interface ISetStyleParams<T> {
    range: IRangeData[];
    style: IStyleTypeValue<T>;
    workbookId: string;
    worksheetId: string;
}

/**
 * The command to set cell style.
 */
export const SetStyleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-style',

    handler: async <T>(accessor: IAccessor, params: ISetStyleParams<T>) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const { range, workbookId, worksheetId, style } = params;

        // let value: ObjectMatrixPrimitiveType<IStyleData> = new ObjectMatrix<IStyleData>();
        let value: any = new ObjectMatrix<IStyleData>();
        for (let i = 0; i < range.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = range[i];
            if (Tools.isArray(style.value)) {
                const matrix = new ObjectMatrix<IStyleData>();
                for (let r = 0; r < endRow - startRow + 1; r++) {
                    for (let c = 0; c < endColumn - startColumn + 1; c++) {
                        matrix.setValue(r, c, {
                            [style.type]: style.value[r][c],
                        });
                    }
                }
                value = matrix.getData();
            } else {
                const colorObj: IStyleData = {
                    [style.type]: style.value,
                };
                value = Tools.fillObjectMatrix(endRow - startRow + 1, endColumn - startColumn + 1, colorObj);
            }
        }

        const setRangeStyleMutationParams: ISetRangeStyleMutationParams = {
            range,
            worksheetId,
            workbookId,
            value,
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
