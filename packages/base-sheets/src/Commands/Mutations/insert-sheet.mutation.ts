import { IMutation, CommandType, ICurrentUniverService } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';
import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';

/**
 * Generate undo mutation of a `InsertSheetMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IInsertSheetMutationParams} params - do mutation params
 * @returns {IRemoveSheetMutationParams} undo mutation params
 */
export const InsertSheetUndoMutationFactory = (accessor: IAccessor, params: IInsertSheetMutationParams): IRemoveSheetMutationParams => ({
    worksheetId: params.sheet.id,
    workbookId: params.workbookId,
});

export const InsertSheetMutation: IMutation<IInsertSheetMutationParams, boolean> = {
    id: 'sheet.mutation.insert-sheet',
    type: CommandType.MUTATION,
    handler: async (accessor, params) => {
        const currentUniverService = accessor.get(ICurrentUniverService);
        const { sheet, index, workbookId } = params;
        const workbook = currentUniverService.getUniverSheetInstance(workbookId)?.getWorkBook();

        if (!workbook) {
            return false;
        }

        workbook.insertSheetByIndexSheet(index, sheet);
        // TODO activate next sheet

        return true;
    },
};
