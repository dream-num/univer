import {
    CommandType,
    Dimension,
    ICommand,
    ICommandInfo,
    ICommandService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    Nullable,
    sequenceExecute,
    SheetInterceptorService,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../mutations/insert-range.mutation';

export interface DeleteRangeMoveLeftCommandParams {
    ranges: IRange[];
}
/**
 * The command to delete range.
 */
export const DeleteRangeMoveLeftCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-range-move-left',

    handler: async (accessor: IAccessor, params?: DeleteRangeMoveLeftCommandParams) => {
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
            shiftDimension: Dimension.COLUMNS,
        };

        const insertRangeMutationParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(
            accessor,
            deleteRangeMutationParams
        );
        if (!insertRangeMutationParams) return false;

        const sheetInterceptor = sheetInterceptorService.onCommandExecute({
            id: DeleteRangeMoveLeftCommand.id,
            params: { ranges } as DeleteRangeMoveLeftCommandParams,
        });
        const redos: ICommandInfo[] = [{ id: DeleteRangeMutation.id, params: deleteRangeMutationParams }];
        const undos: ICommandInfo[] = [{ id: InsertRangeMutation.id, params: insertRangeMutationParams }];
        redos.push(...sheetInterceptor.redos);
        undos.push(...sheetInterceptor.undos);
        // execute do mutations and add undo mutations to undo stack if completed
        const result = sequenceExecute(redos, commandService).result;

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
