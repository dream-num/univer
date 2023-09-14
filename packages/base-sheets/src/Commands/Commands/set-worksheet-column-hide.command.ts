import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { SelectionManagerService } from '../../Services/selection-manager.service';
import { ISetWorksheetColumnHideMutationParams, SetWorksheetColumnHideMutation, SetWorksheetColumnHideMutationFactory } from '../Mutations/set-worksheet-column-hide.mutation';
import { SetWorksheetColumnShowMutation } from '../Mutations/set-worksheet-column-show.mutation';

export const SetWorksheetColumnHideCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-worksheet-column-hide',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const selections = selectionManagerService.getRangeDataList();
        if (!selections?.length) {
            return false;
        }

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const redoMutationParams: ISetWorksheetColumnHideMutationParams = {
            workbookId,
            worksheetId,
            ranges: selections,
        };

        const undoMutationParams = SetWorksheetColumnHideMutationFactory(accessor, redoMutationParams);
        const result = commandService.executeCommand(SetWorksheetColumnHideMutation.id, redoMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(SetWorksheetColumnShowMutation.id, undoMutationParams);
                },
                redo() {
                    return commandService.executeCommand(SetWorksheetColumnHideMutation.id, redoMutationParams);
                },
            });
            return true;
        }

        return false;
    },
};
