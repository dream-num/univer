import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISetWorksheetColWidthMutationParams, SetWorksheetColWidthMutation, SetWorksheetColWidthMutationFactory } from '../Mutations/set-worksheet-col-width.mutation';
import { ISelectionManager } from '../../Services/tokens';

/**
 * TODO@Dushusir 支持多个选区
 */
export interface SetWorksheetColWidthCommandParams {
    workbookId?: string;
    worksheetId?: string;
    colIndex?: number;
    value: number | number[];
}

export const SetWorksheetColWidthCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-col-width',
    handler: async (accessor: IAccessor, params: SetWorksheetColWidthCommandParams) => {
        const selectionManager = accessor.get(ISelectionManager);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selections = selectionManager.getCurrentSelections();
        const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
        const range = selections[0];

        let { worksheetId, workbookId, colIndex, value } = params || {};
        if (!workbookId) {
            workbookId = workbook.getUnitId();
        }

        if (!worksheetId) {
            worksheetId = workbook.getActiveSheet().getSheetId();
        }

        if (!colIndex) {
            colIndex = range.startColumn;
        }

        if (!Array.isArray(value)) {
            if (typeof value === 'object') {
                value = 1;
            }
            value = new Array(range.endColumn - range.startColumn + 1).fill(value);
        }

        const redoMutationParams: ISetWorksheetColWidthMutationParams = {
            worksheetId,
            workbookId,
            colIndex,
            colWidth: value,
        };
        const undoMutationParams: ISetWorksheetColWidthMutationParams = SetWorksheetColWidthMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetColWidthMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetColWidthMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetColWidthMutation.id, redoMutationParams);
                },
            });

            return true;
        }
        return true;
    },
};
