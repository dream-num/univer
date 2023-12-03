import {
    CommandType,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    Tools,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../basics/interfaces/mutation-interface';
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
        const insertResult = commandService.syncExecuteCommand(InsertSheetMutation.id, insertSheetMutationParams);

        const setSheetActiveMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId: config.id,
        };

        const undoMutationParams: ISetWorksheetActivateMutationParams = SetWorksheetUnActivateMutationFactory(
            accessor,
            setSheetActiveMutationParams
        );
        const result = commandService.syncExecuteCommand(SetWorksheetActivateMutation.id, setSheetActiveMutationParams);

        if (insertResult && result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [
                    { id: SetWorksheetActivateMutation.id, params: undoMutationParams },
                    { id: RemoveSheetMutation.id, params: removeSheetMutationParams },
                ],
                redoMutations: [
                    { id: SetWorksheetActivateMutation.id, params: setSheetActiveMutationParams },
                    { id: InsertSheetMutation.id, params: insertSheetMutationParams },
                ],
            });
            return true;
        }
        return false;
    },
};
