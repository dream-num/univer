import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertColMutationParams, IRemoveColMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../Services/selection-manager.service';
import { InsertColMutation, InsertColMutationFactory } from '../Mutations/insert-row-col.mutation';
import { IRemoveColMutationFactory, RemoveColMutation } from '../Mutations/remove-row-col.mutation';

export interface IMoveColumnsToCommandParams {
    destinationIndex: number;
}

export const MoveColumnsToCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.move-columns-to',
    handler: async (accessor: IAccessor, params: IMoveColumnsToCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);
        const selectionManagerService = accessor.get(SelectionManagerService);

        const originRange = selectionManagerService.getRangeDataList()?.[0];
        if (!originRange) {
            return false;
        }

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService.getCurrentUniverSheetInstance().getWorkBook().getActiveSheet().getSheetId();
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const { startColumn, endColumn } = originRange;

        const removeColumnMutationParams: IRemoveColMutationParams = {
            workbookId,
            worksheetId,
            ranges: [
                {
                    startColumn,
                    endColumn,
                    startRow: 0,
                    endRow: 0,
                },
            ],
        };
        const undoRemoveColumnMutationParams: IInsertColMutationParams = IRemoveColMutationFactory(accessor, removeColumnMutationParams);

        const removeResult = commandService.executeCommand(RemoveColMutation.id, removeColumnMutationParams);

        const insertColMutationParams: IInsertColMutationParams = {
            ...undoRemoveColumnMutationParams,
            ranges: [
                {
                    startColumn: params.destinationIndex,
                    endColumn: params.destinationIndex + endColumn - startColumn,
                    startRow: 0,
                    endRow: 0,
                },
            ],
        };

        const undoMutationParams: IRemoveColMutationParams = InsertColMutationFactory(accessor, insertColMutationParams);

        const result = commandService.executeCommand(InsertColMutation.id, insertColMutationParams);

        if (removeResult && result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                URI: 'sheet', // TODO: this URI is fake
                undo() {
                    return (commandService.executeCommand(InsertColMutation.id, undoRemoveColumnMutationParams) as Promise<boolean>).then((res) => {
                        if (res) return commandService.executeCommand(RemoveColMutation.id, undoMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (commandService.executeCommand(RemoveColMutation.id, removeColumnMutationParams) as Promise<boolean>).then((res) => {
                        if (res) return commandService.executeCommand(InsertColMutation.id, insertColMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }

        return false;
    },
};
