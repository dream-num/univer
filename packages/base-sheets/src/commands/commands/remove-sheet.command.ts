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
        const activeResult = commandService.executeCommand(SetWorksheetActivateMutation.id, activeSheetMutationParams);

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
        const result = commandService.executeCommand(RemoveSheetMutation.id, RemoveSheetMutationParams);

        if (result && activeResult) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return (
                        commandService.executeCommand(
                            InsertSheetMutation.id,
                            InsertSheetMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res)
                            return commandService.executeCommand(SetWorksheetActivateMutation.id, activeMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (
                        commandService.executeCommand(
                            RemoveSheetMutation.id,
                            RemoveSheetMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res)
                            return commandService.executeCommand(
                                SetWorksheetActivateMutation.id,
                                activeSheetMutationParams
                            );
                        return false;
                    });
                },
            });

            return true;
        }

        return false;
    },
};
