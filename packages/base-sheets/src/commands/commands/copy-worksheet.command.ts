import {
    CommandType,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { InsertSheetMutation, InsertSheetUndoMutationFactory } from '../mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../mutations/remove-sheet.mutation';
import {
    ISetWorksheetActivateMutationParams,
    SetWorksheetActivateMutation,
    SetWorksheetUnActivateMutationFactory,
} from '../mutations/set-worksheet-activate.mutation';

export interface ICopySheetCommandParams {
    workbookId?: string;
    worksheetId?: string;
}

export const CopySheetCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-sheet',
    handler: async (accessor: IAccessor, params?: ICopySheetCommandParams) => {
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

        const config = Tools.deepClone(worksheet.getConfig());
        config.name += '副本'; //Todo: 文字国际化
        config.id = Tools.generateRandomId();
        const sheetIndex = workbook.getSheetIndex(worksheet);

        const insertSheetMutationParams: IInsertSheetMutationParams = {
            index: sheetIndex + 1,
            sheet: config,
            workbookId,
        };

        const removeSheetMutationParams: IRemoveSheetMutationParams = InsertSheetUndoMutationFactory(
            accessor,
            insertSheetMutationParams
        );
        const insertResult = commandService.executeCommand(InsertSheetMutation.id, insertSheetMutationParams);

        const setSheetActiveMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId: config.id,
        };

        const undoMutationParams: ISetWorksheetActivateMutationParams = SetWorksheetUnActivateMutationFactory(
            accessor,
            setSheetActiveMutationParams
        );
        const result = commandService.executeCommand(SetWorksheetActivateMutation.id, setSheetActiveMutationParams);

        if (insertResult && result) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return (
                        commandService.executeCommand(
                            SetWorksheetActivateMutation.id,
                            undoMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res)
                            return commandService.executeCommand(RemoveSheetMutation.id, removeSheetMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (
                        commandService.executeCommand(
                            SetWorksheetActivateMutation.id,
                            setSheetActiveMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res)
                            return commandService.executeCommand(InsertSheetMutation.id, insertSheetMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }
        return false;
    },
};
