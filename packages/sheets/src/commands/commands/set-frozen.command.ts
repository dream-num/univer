import type { ICommand } from '@univerjs/core';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type { ISetFrozenMutationParams } from '../mutations/set-frozen.mutation';
import { SetFrozenMutation, SetFrozenMutationFactory } from '../mutations/set-frozen.mutation';

interface ISetFrozenCommandParams {
    startRow: number;
    startColumn: number;
    ySplit: number;
    xSplit: number;
}

export const SetFrozenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-frozen',
    handler: async (accessor: IAccessor, params: ISetFrozenCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const { startColumn, startRow, xSplit, ySplit } = params;

        if (
            startRow >= worksheet.getRowCount() ||
            startColumn >= worksheet.getColumnCount() ||
            xSplit >= worksheet.getColumnCount() ||
            ySplit >= worksheet.getRowCount()
        ) {
            return false;
        }
        const redoMutationParams: ISetFrozenMutationParams = {
            workbookId,
            worksheetId,
            ...params,
        };

        const undoMutationParams: ISetFrozenMutationParams = SetFrozenMutationFactory(accessor, redoMutationParams);
        const result = commandService.syncExecuteCommand(SetFrozenMutation.id, redoMutationParams);

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: SetFrozenMutation.id, params: undoMutationParams }],
                redoMutations: [{ id: SetFrozenMutation.id, params: redoMutationParams }],
            });
            return true;
        }
        return false;
    },
};
