import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetRowHeightMutationParams, SetWorksheetRowHeightMutation, SetWorksheetRowHeightMutationFactory } from '../Mutations/set-worksheet-row-height.mutation';
import { ISelectionManager } from '../../Services/tokens';

export interface SetWorksheetRowHeightCommandParams {
    workbookId?: string;
    worksheetId?: string;
    rowIndex?: number;
    value: number | number[];
}

export const SetWorksheetRowHeightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-row-height',
    handler: async (accessor: IAccessor, params: SetWorksheetRowHeightCommandParams) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selections = selectionManager.getCurrentSelections();
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const range = selections[0];

        let { worksheetId, workbookId, rowIndex, value } = params;
        if (!workbookId) {
            workbookId = workbook.getUnitId();
        }

        if (!worksheetId) {
            worksheetId = workbook.getActiveSheet().getSheetId();
        }

        if (!rowIndex) {
            rowIndex = range.startRow;
        }

        if (!Array.isArray(value)) {
            if (typeof value === 'object') {
                value = 1;
            }
            value = new Array(range.endRow - range.startRow + 1).fill(value);
        }

        const redoMutationParams: ISetWorksheetRowHeightMutationParams = {
            worksheetId,
            workbookId,
            rowIndex,
            rowHeight: value,
        };
        const undoMutationParams: ISetWorksheetRowHeightMutationParams = SetWorksheetRowHeightMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetRowHeightMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
