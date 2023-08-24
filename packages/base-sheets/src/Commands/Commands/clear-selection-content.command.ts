import { CommandType, ICommand, ICommandService, ICurrentUniverService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { ISelectionManager } from '../../Services/tokens';
import { SelectionController } from '../../Controller/Selection/SelectionController';
import { SelectionModel } from '../../Model/SelectionModel';
import { ISetRangeValuesMutationParams, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../Mutations/set-range-values.mutation';

/**
 * The command to clear content in current selected ranges.
 */
export const ClearSelectionContentCommand: ICommand = {
    id: 'sheet.command.clear-selection',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        // TODO: may with options to only clear content, style etc
        const currentUniverService = accessor.get(ICurrentUniverService);
        const commandService = accessor.get(ICommandService);
        const selectionManager = accessor.get(ISelectionManager);
        // const undoRedoService = accessor.get(IUndoRedoService);

        // TODO: this is to verbose to get a serializable range
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

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(SetRangeValuesMutation.id, clearMutationParams);
        if (result) {
            const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(accessor, clearMutationParams);
            // TODO: add undo redo logic here
            // undoRedoService.pushUndoRedo(workbook.URI);
            // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
            // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
            return true;
        }

        return false;
    },
};
