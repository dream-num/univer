import { CommandType, ICommand, ICommandService, IUndoRedoService, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { FormatType } from '../../base/types';
import { factorySetNumfmtUndoMutation, SetNumfmtMutation } from '../mutations/set.numfmt.mutation';

export type SetNumfmtCommandParams = {
    values: Array<{ pattern?: string; row: number; col: number; type?: FormatType }>;
};

export const SetNumfmtCommand: ICommand<SetNumfmtCommandParams> = {
    id: 'sheet.command.numfmt.set.numfmt',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params) => {
        if (!params) {
            return false;
        }
        const commandService = accessor.get(ICommandService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const undoRedoService = accessor.get(IUndoRedoService);

        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const workbookId = workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        const worksheetId = worksheet.getSheetId();
        const redoOption = { ...params, workbookId, worksheetId };
        const undoOption = factorySetNumfmtUndoMutation(accessor, redoOption);
        const result = commandService.syncExecuteCommand(SetNumfmtMutation.id, redoOption);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: [{ id: SetNumfmtMutation.id, params: undoOption }],
                redoMutations: [{ id: SetNumfmtMutation.id, params: redoOption }],
            });
        }
        return result;
    },
};
