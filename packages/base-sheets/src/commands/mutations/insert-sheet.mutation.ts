import { CommandType, ICurrentUniverService, IMutation, ObserverManager, Worksheet } from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IInsertSheetMutationParams, IRemoveSheetMutationParams } from '../../Basics/Interfaces/MutationInterface';

/**
 * Generate undo mutation of a `InsertSheetMutation`
 *
 * @param {IAccessor} accessor - injector accessor
 * @param {IInsertSheetMutationParams} params - do mutation params
 * @returns {IRemoveSheetMutationParams} undo mutation params
 */
export const InsertSheetUndoMutationFactory = (
    accessor: IAccessor,
    params: IInsertSheetMutationParams
): IRemoveSheetMutationParams => ({
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

        const { sheets, sheetOrder } = workbook.getConfig();

        if (sheets[index]) {
            throw new Error(`Insert sheet fail ${index} already exists.`);
        }
        sheets[sheet.id] = sheet;
        sheetOrder.splice(index, 0, sheet.id);

        const worksheets = workbook.getWorksheets();
        worksheets.set(sheet.id, new Worksheet(sheet, accessor.get(ObserverManager), workbook.getStyles()));

        return true;
    },
};
