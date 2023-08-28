import { IAccessor } from '@wendellhu/redi';
import {
    CommandType,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IRangeData,
    IStyleData,
    IUndoRedoService,
    ObjectMatrix,
    ObjectMatrixPrimitiveType,
    Tools,
} from '@univerjs/core';

import { ISetRangeStyleMutationParams, SetRangeStyleMutation, SetRangeStyleUndoMutationFactory } from '../Mutations/set-range-styles.mutation';

export interface ISetStyleParams<T> {
    range: IRangeData;
    style: T | T[][];
}

/**
 * The command to insert a row into a worksheet.
 */
export const SetBackgroundCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-background',

    handler: async (accessor: IAccessor, params: ISetStyleParams<string>) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        // TODO: this is to verbose to get a serializable range
        // a range should have worksheet id as well
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();

        // prepare do mutations
        const { startRow, endRow, startColumn, endColumn } = params.range;
        let value: ObjectMatrixPrimitiveType<IStyleData>;
        if (params.style instanceof Array) {
            const matrix = new ObjectMatrix<IStyleData>();
            for (let r = 0; r < endRow - startRow + 1; r++) {
                for (let c = 0; c < endColumn - startColumn + 1; c++) {
                    matrix.setValue(r, c, {
                        bg: {
                            rgb: params.style[r][c],
                        },
                    });
                }
            }
            value = matrix.getData();
        } else {
            const colorObj: IStyleData = {
                bg: {
                    rgb: params.style,
                },
            };
            value = Tools.fillObjectMatrix(endRow - startRow + 1, endColumn - startColumn + 1, colorObj);
        }

        const setRangeStyleMutationParams: ISetRangeStyleMutationParams = {
            rangeData: params.range,
            worksheetId: worksheet.getSheetId(),
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

/**
 * Set new font family for currently selected cells
 */
// export const SetFontFamilyCommand: ICommand = {
//     id: 'sheet.command.set-font-family',
//     type: CommandType.COMMAND,
//     handler: async (accessor: IAccessor, params: ISetStyleParams<string>) => {
//         const currentUniverService = accessor.get(ICurrentUniverService);
//         const commandService = accessor.get(ICommandService);
//         const selectionManager = accessor.get(ISelectionManager);
//         const undoRedoService = accessor.get(IUndoRedoService);

//         const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
//         const worksheet = workbook.getActiveSheet();
//         const controls = selectionManager.getCurrentControls();
//         const selections = controls?.map((control: SelectionController) => {
//             const model: SelectionModel = control.model;
//             return {
//                 startRow: model.startRow,
//                 startColumn: model.startColumn,
//                 endRow: model.endRow,
//                 endColumn: model.endColumn,
//             };
//         });

//         if (!selections) {
//             return false;
//         }

//         // prepare do mutations

//         const range = selections[0];
//         const { startRow, endRow, startColumn, endColumn } = range;
//         let value: ObjectMatrixPrimitiveType<IStyleData>;
//         if (params.style instanceof Array) {
//             const matrix = new ObjectMatrix<IStyleData>();
//             for (let r = 0; r < endRow - startRow + 1; r++) {
//                 for (let c = 0; c < endColumn - startColumn + 1; c++) {
//                     matrix.setValue(r, c, {
//                         bg: {
//                             rgb: params.style[r][c],
//                         },
//                     });
//                 }
//             }
//             value = matrix.getData();
//         } else {
//             const colorObj: IStyleData = {
//                 bg: {
//                     rgb: params.style,
//                 },
//             };
//             value = Tools.fillObjectMatrix(endRow - startRow + 1, endColumn - startColumn + 1, colorObj);
//         }

//         const setRangeStyleMutationParams: ISetRangeStyleMutationParams = {
//             rangeData: range,
//             worksheetId: worksheet.getSheetId(),
//             value,
//         };

//         const undoSetRangeStyleMutationParams: ISetRangeStyleMutationParams = SetRangeStyleUndoMutationFactory(accessor, setRangeStyleMutationParams);

//         // execute do mutations and add undo mutations to undo stack if completed
//         const result = commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
//         if (result) {
//             undoRedoService.pushUndoRedo({
//                 // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
//                 // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
//                 URI: 'sheet', // TODO: this URI is fake
//                 undo() {
//                     return commandService.executeCommand(SetRangeStyleMutation.id, undoSetRangeStyleMutationParams);
//                 },
//                 redo() {
//                     return commandService.executeCommand(SetRangeStyleMutation.id, setRangeStyleMutationParams);
//                 },
//             });

//             return true;
//         }

//         return false;
//     },
// };
