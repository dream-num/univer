import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { InsertSheetMutation } from '../mutations/insert-sheet.mutation';
import { RemoveSheetMutation, RemoveSheetUndoMutationFactory } from '../mutations/remove-sheet.mutation';
import {
    ISetWorksheetActivateMutationParams,
    SetWorksheetActivateMutation,
    SetWorksheetUnActivateMutationFactory,
} from '../mutations/set-worksheet-activate.mutation';

export interface RemoveSheetCommandParams {
    workbookId?: string;
    worksheetId?: string;
}

/**
 * The command to insert new worksheet
 */
export const RemoveSheetCommand: ICommand = {
    id: 'sheet.command.remove-sheet',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params?: RemoveSheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        let workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        let worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
            worksheetId = params.worksheetId ?? worksheetId;
        }

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;
        if (workbook.getSheets().length <= 1) return false;

        const index = workbook.getSheetIndex(worksheet);
        const activateSheetId = workbook.getConfig().sheetOrder[index + 1];

        const activeSheetMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId: activateSheetId,
        };

        const activeMutationParams: ISetWorksheetActivateMutationParams = SetWorksheetUnActivateMutationFactory(
            accessor,
            activeSheetMutationParams
        );
        const activeResult = commandService.syncExecuteCommand(
            SetWorksheetActivateMutation.id,
            activeSheetMutationParams
        );

        // prepare do mutations
        const RemoveSheetMutationParams: IRemoveSheetMutationParams = {
            worksheetId,
            workbookId,
        };
        const InsertSheetMutationParams: IInsertSheetMutationParams = RemoveSheetUndoMutationFactory(
            accessor,
            RemoveSheetMutationParams
        );
        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(RemoveSheetMutation.id, RemoveSheetMutationParams);

        if (result && activeResult) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [
                    { id: InsertSheetMutation.id, params: InsertSheetMutationParams },
                    { id: SetWorksheetActivateMutation.id, params: activeMutationParams },
                ],
                redoMutations: [
                    { id: RemoveSheetMutation.id, params: RemoveSheetMutationParams },
                    { id: SetWorksheetActivateMutation.id, params: activeSheetMutationParams },
                ],
            });

            return true;
        }

        return false;
    },
};
