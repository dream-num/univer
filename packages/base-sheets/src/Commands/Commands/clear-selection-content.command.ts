import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISelectionManager } from '../../Services/tokens';
import { SelectionController } from '../../Controller/Selection/SelectionController';
import { SelectionModel } from '../../Model/SelectionModel';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation } from '../Mutations/set-range-values.mutation';

/**
 * The command to clear content in current selected ranges.
 */
export const ClearSelectionContentCommand: ICommand = {
    id: 'sheet.command.clear-selection',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const commandService = accessor.get(ICommandService);
        const selectionManager = accessor.get(ISelectionManager);
        const undoRedoService = accessor.get(IUndoRedoService);

        // TODO: this is to verbose to get a serializable range
        // a range should have worksheet id as well
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();
        const controls = selectionManager.getCurrentControls();
        const selections = controls?.map((control: SelectionController) => {
            const model: SelectionModel = control.model;
            return {
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            };
        });

        if (!selections) {
            return false;
        }

        // prepare do mutations

        const range = selections[0];
        const clearMutationParams: ISetRangeValuesMutationParams = {
            rangeData: range,
            worksheetId: worksheet.getSheetId(),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFectory(accessor, clearMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, undoClearMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};