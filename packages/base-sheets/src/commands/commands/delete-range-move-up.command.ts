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

import { IDeleteRangeMutationParams, IInsertRangeMutationParams } from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../mutations/insert-range.mutation';

export interface DeleteRangeMoveUpCommandParams {
    ranges: IRange[];
}
/**
 * The command to delete range.
 */
export const DeleteRangeMoveUpCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.delete-range-move-up',

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
        const redos: ICommandInfo[] = [{ id: DeleteRangeMutation.id, params: deleteRangeMutationParams }];
        const undos: ICommandInfo[] = [{ id: InsertRangeMutation.id, params: insertRangeMutationParams }];
        redos.push(...sheetInterceptor.redos);
        undos.push(...sheetInterceptor.undos);
        const result = await sequenceExecute(redos, commandService).result;

        if (result) {
            undoRedoService.pushUndoRedo({
                // 如果有多个 mutation 构成一个封装项目，那么要封装在同一个 undo redo element 里面
                // 通过勾子可以 hook 外部 controller 的代码来增加新的 action
                unitID: workbookId,
                undo: async () => sequenceExecute(undos.reverse(), commandService).result,
                redo: async () => sequenceExecute(redos, commandService).result,
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
