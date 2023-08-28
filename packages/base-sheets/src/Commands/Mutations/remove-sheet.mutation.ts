import { IMutation, CommandType, ICurrentUniverService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';

/**
 * Generate undo mutation of a `RemoveSheetMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IRemoveSheetMutationParams} params - do mutation params
 * @returns {IInsertSheetMutationParams} undo mutation params
 */
export const RemoveSheetUndoMutationFactory = (accessor: IAccessor, params: IRemoveSheetMutationParams): IInsertSheetMutationParams => {
    const currentUniverService = accessor.get(ICurrentUniverService);
    const workbook = currentUniverService.getCurrentUniverSheetInstance().getWorkBook();
    const { sheetId, workbookId } = params;
    const sheet = workbook.getSheetBySheetId(sheetId)!.getConfig();
    const config = workbook!.getConfig();
    const index = config.sheetOrder.findIndex((id) => id === sheetId);

    return {
        index,
        sheet,
        workbookId,
    };
};

export const RemoveSheetMutation: IMutation<IRemoveSheetMutationParams, boolean> = {
    id: 'sheet.mutation.remove-sheet',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const { sheetId, workbookId } = params;
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();

        if (!workbook) {
            return false;
        }

        workbook.removeSheetBySheetId(sheetId);

        return true;
    },
};
