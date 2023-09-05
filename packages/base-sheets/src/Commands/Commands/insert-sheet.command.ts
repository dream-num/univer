import { CommandType, DEFAULT_WORKSHEET, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService, IWorksheetConfig, Tools } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { InsertSheetMutation, InsertSheetUndoMutationFactory } from '../Mutations/insert-sheet.mutation';
import { RemoveSheetMutation } from '../Mutations/remove-sheet.mutation';
import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';

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

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;

        let index = workbook.getSheets().length;
        let config = Tools.deepClone(DEFAULT_WORKSHEET);
        if (params) {
            index = params.index ?? index;
            if (params.sheet) {
                config = params.sheet;
            } else {
                config.id = Tools.generateRandomId();
                config.name = `工作表${++workbook.getSheets().length}`; // Todo: 表名
            }
        } else {
            config.id = Tools.generateRandomId();
            config.name = `工作表${++workbook.getSheets().length}`; // Todo: 表名
        }

        // prepare do mutations
        const insertSheetMutationParams: IInsertSheetMutationParams = {
            index,
            sheet: config,
            workbookId,
        };
        const removeSheetMutationParams: IRemoveSheetMutationParams = InsertSheetUndoMutationFactory(accessor, insertSheetMutationParams);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = commandService.executeCommand(InsertSheetMutation.id, insertSheetMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                URI: 'sheet',
                undo() {
                    return commandService.executeCommand(RemoveSheetMutation.id, removeSheetMutationParams);
                },
                redo() {
                    return commandService.executeCommand(InsertSheetMutation.id, insertSheetMutationParams);
                },
            });

            return true;
        }

        return false;
    },
};
