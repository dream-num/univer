import {
    CommandType,
    DEFAULT_WORKSHEET,
    ICommand,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    IWorksheetConfig,
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

export interface InsertSheetCommandParams {
    workbookId?: string;
    index?: number;
    sheet?: IWorksheetConfig;
}

/**
 * The command to insert new worksheet
 */
export const InsertSheetCommand: ICommand = {
    id: 'sheet.command.insert-sheet',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params?: InsertSheetCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        let workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
        }

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;

        let index = workbook.getSheets().length;
        let sheetConfig = Tools.deepClone(DEFAULT_WORKSHEET);
        if (params) {
            index = params.index ?? index;
            if (params.sheet) {
                sheetConfig = params.sheet;
            } else {
                sheetConfig.id = Tools.generateRandomId();
                sheetConfig.name = `工作表${++workbook.getSheets().length}`; // Todo: 表名
            }
        } else {
            sheetConfig.id = Tools.generateRandomId();
            sheetConfig.name = `工作表${++workbook.getSheets().length}`; // Todo: 表名
        }

        // prepare do mutations
        const insertSheetMutationParams: IInsertSheetMutationParams = {
            index,
            sheet: sheetConfig,
            workbookId,
        };
        const removeSheetMutationParams: IRemoveSheetMutationParams = InsertSheetUndoMutationFactory(
            accessor,
            insertSheetMutationParams
        );
        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.syncExecuteCommand(InsertSheetMutation.id, insertSheetMutationParams);

        const setSheetActiveMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId: sheetConfig.id,
        };
        const undoMutationParams: ISetWorksheetActivateMutationParams = SetWorksheetUnActivateMutationFactory(
            accessor,
            setSheetActiveMutationParams
        );
        const activateResult = commandService.syncExecuteCommand(
            SetWorksheetActivateMutation.id,
            setSheetActiveMutationParams
        );

        if (result && activateResult) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [
                    { id: SetWorksheetActivateMutation.id, params: undoMutationParams },
                    { id: RemoveSheetMutation.id, params: removeSheetMutationParams },
                ],
                redoMutations: [
                    { id: InsertSheetMutation.id, params: insertSheetMutationParams },
                    { id: SetWorksheetActivateMutation.id, params: setSheetActiveMutationParams },
                ],
            });

            return true;
        }

        return false;
    },
};
