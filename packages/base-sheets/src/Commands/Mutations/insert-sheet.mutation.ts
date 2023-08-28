import { IMutation, CommandType, ICurrentUniverService, Worksheet, CommandManager, ObserverManager } from '@univerjs/core';
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
    sheetId: params.sheet.id,
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

        const iSheets = workbook.getWorksheets();
        const config = workbook.getConfig();
        const { sheets, sheetOrder } = config;
        if (sheets[sheet.id]) {
            throw new Error(`Insert Sheet fail ${sheet.id} is already exist`);
        }
        sheets[sheet.id] = sheet;
        sheetOrder.splice(index, 0, sheet.id);
        const commandManager = accessor.get(CommandManager);
        const observerManager = accessor.get(ObserverManager);
        iSheets.set(sheet.id, new Worksheet(sheet, commandManager, observerManager, currentUniverService));

        return true;
    },
};
