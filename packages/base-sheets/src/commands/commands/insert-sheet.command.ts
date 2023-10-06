import {
    CommandType,
    DEFAULT_WORKSHEET,
    ICommand,
    ICommandService,
    ICurrentUniverService,
    IUndoRedoService,
    IWorksheetConfig,
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
        const currentUniverService = accessor.get(ICurrentUniverService);

        let workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();

        if (params) {
            workbookId = params.workbookId ?? workbookId;
        }

        const workbook = currentUniverService.getUniverSheetInstance(workbookId);
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
        const result = commandService.executeCommand(InsertSheetMutation.id, insertSheetMutationParams);

        const setSheetActiveMutationParams: ISetWorksheetActivateMutationParams = {
            workbookId,
            worksheetId: sheetConfig.id,
        };
        const undoMutationParams: ISetWorksheetActivateMutationParams = SetWorksheetUnActivateMutationFactory(
            accessor,
            setSheetActiveMutationParams
        );
        const activateResult = commandService.executeCommand(
            SetWorksheetActivateMutation.id,
            setSheetActiveMutationParams
        );

        if (result && activateResult) {
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
                            InsertSheetMutation.id,
                            insertSheetMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res)
                            return commandService.executeCommand(
                                SetWorksheetActivateMutation.id,
                                setSheetActiveMutationParams
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
