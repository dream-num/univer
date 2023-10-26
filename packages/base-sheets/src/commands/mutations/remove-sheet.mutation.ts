import { CommandType, IMutation, IUniverInstanceService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';

/**
 * Generate undo mutation of a `RemoveSheetMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IRemoveSheetMutationParams} params - do mutation params
 * @returns {IInsertSheetMutationParams} undo mutation params
 */
export const RemoveSheetUndoMutationFactory = (
    accessor: IAccessor,
    params: IRemoveSheetMutationParams
): IInsertSheetMutationParams => {
    const univerInstanceService = accessor.get(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const { worksheetId, workbookId } = params;
    const sheet = workbook.getSheetBySheetId(worksheetId)!.getConfig();
    const config = workbook!.getConfig();
    const index = config.sheetOrder.findIndex((id) => id === worksheetId);

    return {
        index,
        sheet,
        workbookId,
    };
};

export const RemoveSheetMutation: IMutation<IRemoveSheetMutationParams, boolean> = {
    id: 'sheet.mutation.remove-sheet',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const { worksheetId, workbookId } = params;
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);

        if (!workbook) {
            return false;
        }

        const worksheets = workbook.getWorksheets();
        const config = workbook.getConfig();

        const { sheets } = config;
        if (sheets[worksheetId] == null) {
            throw new Error(`Remove sheet fail ${worksheetId} does not exist`);
        }
        const findIndex = config.sheetOrder.findIndex((id) => id === worksheetId);
        delete sheets[worksheetId];

        config.sheetOrder.splice(findIndex, 1);
        worksheets.delete(worksheetId);

        return true;
    },
};
