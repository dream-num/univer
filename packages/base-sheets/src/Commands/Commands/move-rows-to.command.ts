import { CommandType, ICommand, ICommandService, ICurrentUniverService, IRangeData, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { ISelectionManager } from '../../Services/tokens';
import { IInsertRowMutationParams, IRemoveRowMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { IRemoveRowMutationFactory, RemoveRowMutation } from '../Mutations/remove-row-col.mutation';
import { InsertRowMutation, InsertRowMutationFactory } from '../Mutations/insert-row-col.mutation';

export interface IMoveRowsToCommandParams {
    workbookId?: string;
    worksheetId?: string;
    originRange?: IRangeData;
    destinationIndex?: number;
}

export const MoveRowsToCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-rows-to',
    handler: async (accessor: IAccessor, params: IMoveRowsToCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManager = accessor.get(ISelectionManager);

        const destinationIndex = params.destinationIndex ?? 0;
        const originRange = params.originRange || selectionManager.getCurrentSelections()[0];
        if (!originRange) {
            return false;
        }

        const workbookId = params.workbookId || currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = params.worksheetId || currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const { startRow, endRow } = originRange;

        const removeRowMutationParams: IRemoveRowMutationParams = {
            workbookId,
            worksheetId,
            rowIndex: startRow,
            rowCount: endRow - startRow + 1,
        };
        const undoRemoveRowMutationParams: IInsertRowMutationParams = IRemoveRowMutationFactory(accessor, removeRowMutationParams);

        const removeResult = commandService.executeCommand(RemoveRowMutation.id, removeRowMutationParams);

        const insertRowMutationParams: IInsertRowMutationParams = {
            ...undoRemoveRowMutationParams,
            rowIndex: destinationIndex,
            rowCount: endRow - startRow + 1,
        };

        const undoMutationParams: IRemoveRowMutationParams = InsertRowMutationFactory(accessor, insertRowMutationParams);

        const result = commandService.executeCommand(InsertRowMutation.id, insertRowMutationParams);

        if (removeResult && result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return (commandService.executeCommand(InsertRowMutation.id, undoRemoveRowMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(RemoveRowMutation.id, undoMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (commandService.executeCommand(RemoveRowMutation.id, removeRowMutationParams) as Promise<boolean>).then((res) => {
                        if (res) commandService.executeCommand(InsertRowMutation.id, insertRowMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }

        return false;
    },
};
