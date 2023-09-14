import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../Services/selection-manager.service';
import { ISetRangeStyleMutationParams, SetRangeStyleMutation, SetRangeStyleUndoMutationFactory } from '../Mutations/set-range-styles.mutation';
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
        const selectionManagerService = accessor.get(SelectionManagerService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const worksheet = workbook.getActiveSheet();
        const selections = selectionManagerService.getRangeDataList();
        if (!selections?.length) {
            return false;
        }

        const cleanStyleMutationParams: ISetRangeStyleMutationParams = {
            range: selections,
            worksheetId: worksheet.getSheetId(),
            workbookId: workbook.getUnitId(),
        };
        const setStyleMutationParams: ISetRangeStyleMutationParams = SetRangeStyleUndoMutationFactory(accessor, cleanStyleMutationParams);

        const cleanResult = commandService.executeCommand(SetRangeStyleMutation.id, cleanStyleMutationParams);

        const clearMutationParams: ISetRangeValuesMutationParams = {
            rangeData: selections,
            worksheetId: worksheet.getSheetId(),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, clearMutationParams);

        const result = commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);

        if (result && cleanResult) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return (commandService.executeCommand(SetRangeValuesMutation.id, undoClearMutationParams) as Promise<boolean>).then((res) => {
                        if (res) return commandService.executeCommand(SetRangeStyleMutation.id, setStyleMutationParams);
                        return false;
                    });
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
