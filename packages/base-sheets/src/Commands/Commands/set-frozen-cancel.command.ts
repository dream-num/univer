import { CommandType, ICommand, ICommandService, ICurrentUniverService, IUndoRedoService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    ISetFrozenColumnsMutationParams,
    SetFrozenColumnsMutation,
    SetFrozenColumnsMutationFactory,
} from '../Mutations/set-frozen-columns.mutation';
import {
    ISetFrozenRowsMutationParams,
    SetFrozenRowsMutation,
    SetFrozenRowsMutationFactory,
} from '../Mutations/set-frozen-rows.mutation';

export const SetFrozenCancelCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen-cancel',
    handler: async (accessor: IAccessor) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const currentUniverService = accessor.get(ICurrentUniverService);

        const workbookId = currentUniverService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = currentUniverService
            .getCurrentUniverSheetInstance()
            .getWorkBook()
            .getActiveSheet()
            .getSheetId();

        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const cancelColumnMutationParams: ISetFrozenColumnsMutationParams = {
            workbookId,
            worksheetId,
            numColumns: -1,
        };

        const frozenColumnMutationParams: ISetFrozenColumnsMutationParams = SetFrozenColumnsMutationFactory(
            accessor,
            cancelColumnMutationParams
        );
        const frozenResult = commandService.executeCommand(SetFrozenColumnsMutation.id, cancelColumnMutationParams);

        const redoMutationParams: ISetFrozenRowsMutationParams = {
            workbookId,
            worksheetId,
            numRows: -1,
        };

        const undoMutationParams: ISetFrozenRowsMutationParams = SetFrozenRowsMutationFactory(
            accessor,
            redoMutationParams
        );
        const result = commandService.executeCommand(SetFrozenRowsMutation.id, redoMutationParams);

        if (result && frozenResult) {
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo() {
                    return (
                        commandService.executeCommand(
                            SetFrozenColumnsMutation.id,
                            frozenColumnMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res) return commandService.executeCommand(SetFrozenRowsMutation.id, undoMutationParams);
                        return false;
                    });
                },
                redo() {
                    return (
                        commandService.executeCommand(
                            SetFrozenColumnsMutation.id,
                            cancelColumnMutationParams
                        ) as Promise<boolean>
                    ).then((res) => {
                        if (res) return commandService.executeCommand(SetFrozenRowsMutation.id, redoMutationParams);
                        return false;
                    });
                },
            });
            return true;
        }
        return false;
    },
};
