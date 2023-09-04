import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISelectionManager } from '../../Services/tokens';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../Mutations/set-range-values.mutation';

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

        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();
        const selections = selectionManager.getCurrentSelections();
        if (!selections.length) {
            return false;
        }

        const range = selections[0];
        const clearMutationParams: ISetRangeValuesMutationParams = {
            rangeData: range,
            worksheetId: worksheet.getSheetId(),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, clearMutationParams);

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
