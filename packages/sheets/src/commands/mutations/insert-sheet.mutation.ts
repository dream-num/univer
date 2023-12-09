import type { IMutation } from '@univerjs/core';
import { CommandType, IUniverInstanceService } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IInsertSheetMutationParams,
    IRemoveSheetMutationParams,
} from '../../basics/interfaces/mutation-interface';

/**
 * Generate undo mutation of a `InsertSheetMutation`
 *
 * @param {IAccessor} _accessor - injector accessor
 * @param {IInsertSheetMutationParams} params - do mutation params
 * @returns {IRemoveSheetMutationParams} undo mutation params
 */
export const InsertSheetUndoMutationFactory = (
    _accessor: IAccessor,
    params: IInsertSheetMutationParams
): IRemoveSheetMutationParams => ({
    worksheetId: params.sheet.id,
    workbookId: params.workbookId,
    previousIndex: params.index,
});

export const InsertSheetMutation: IMutation<IInsertSheetMutationParams, boolean> = {
    id: 'sheet.mutation.insert-sheet',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const { sheet, index, workbookId } = params;
        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) {
            return false;
        }

        return workbook.addWorksheet(sheet.id, index, sheet);
    },
};
