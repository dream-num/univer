import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../Services/selection-manager.service';
import { SetWorksheetColumnHideMutation } from '../Mutations/set-worksheet-column-hide.mutation';
import { ISetWorksheetColumnShowMutationParams, SetWorksheetColumnShowMutation, SetWorksheetColumnShowMutationFactory } from '../Mutations/set-worksheet-column-show.mutation';

export const SetWorksheetColumnShowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-column-show',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManagerService.getRangeDatas();
        if (!selections?.length) {
            return false;
        }

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetWorksheetColumnShowMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams = SetWorksheetColumnShowMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetColumnShowMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetColumnHideMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetColumnShowMutation.id, redoMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
