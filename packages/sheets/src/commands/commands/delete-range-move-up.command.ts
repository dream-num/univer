import type { ICommand, IMutationInfo, IRange, Nullable } from '@univerjs/core';
import {
    CommandType,
    Dimension,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
    SheetInterceptorService,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IDeleteRangeMutationParams,
    IInsertRangeMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../mutations/insert-range.mutation';

export interface DeleteRangeMoveUpCommandParams {
    ranges: IRange[];
}
export const DeleteRangeMoveUpCommandId = 'sheet.command.delete-range-move-up';
/**
 * The command to delete range.
 */
export const DeleteRangeMoveUpCommand: ICommand = {
    type: CommandType.COMMAND,
    id: DeleteRangeMoveUpCommandId,

    handler: async (accessor: IAccessor, params: DeleteRangeMoveUpCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const workbookId = univerInstanceService.getCurrentUniverSheetInstance().getUnitId();
        const worksheetId = univerInstanceService
            .getCurrentUniverSheetInstance()

            .getActiveSheet()
            .getSheetId();
        let ranges = params?.ranges as IRange[];
        if (!ranges) {
            ranges = selectionManagerService.getSelectionRanges() || [];
        }
        if (!ranges?.length) return false;

        const workbook = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!workbook) return false;
        const worksheet = workbook.getSheetBySheetId(worksheetId);
        if (!worksheet) return false;

        const deleteRangeMutationParams: IDeleteRangeMutationParams = {
            ranges,
            worksheetId,
            workbookId,
            shiftDimension: Dimension.ROWS,
        };

        const insertRangeMutationParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(
            accessor,
            deleteRangeMutationParams
        );
        if (!insertRangeMutationParams) return false;

        const sheetInterceptor = sheetInterceptorService.onCommandExecute({
            id: DeleteRangeMoveUpCommand.id,
            params: { ranges } as DeleteRangeMoveUpCommandParams,
        });
        const redos: IMutationInfo[] = [{ id: DeleteRangeMutation.id, params: deleteRangeMutationParams }];
        const undos: IMutationInfo[] = [{ id: InsertRangeMutation.id, params: insertRangeMutationParams }];
        redos.push(...sheetInterceptor.redos);
        undos.push(...sheetInterceptor.undos);
        const result = await sequenceExecute(redos, commandService).result;

        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undos.reverse(),
                redoMutations: redos,
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
