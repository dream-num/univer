import {
    CommandType,
    Dimension,
    ICommand,
    ICommandService,
    IRange,
    IUndoRedoService,
    IUniverInstanceService,
    Nullable,
    Rectangle,
    sequenceExecute,
    SheetInterceptorService,
} from '@univerjs/core';
import { IAccessor } from '@wendellhu/redi';

import {
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../Basics/Interfaces/MutationInterface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../mutations/insert-range.mutation';
import { InsertColMutation, InsertRowMutation } from '../mutations/insert-row-col.mutation';
import {
    RemoveColMutation,
    RemoveColMutationFactory,
    RemoveRowMutation,
    RemoveRowsUndoMutationFactory,
} from '../mutations/remove-row-col.mutation';

export interface RemoveRowColCommandParams {
    ranges: IRange[];
}
/**
 * This command would remove the selected rows. These selected rows can be non-continuous.
 */
export const RemoveRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row',
    handler: async (accessor: IAccessor, params?: RemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        let ranges = params?.ranges;
        if (!ranges) {
            const selections = selectionManagerService.getSelections();
            if (!selections?.length) {
                return false;
            }
            ranges = selections.map((s) => Rectangle.clone(s.range));
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const lastColumnIndex = worksheet.getMaxColumns() - 1;
        ranges.forEach((item) => {
            item.startColumn = 0;
            item.endColumn = lastColumnIndex;
        });

        // row count
        const removeRowsParams: IRemoveRowsMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoRemoveRowsParams: IInsertRowMutationParams = RemoveRowsUndoMutationFactory(
            removeRowsParams,
            worksheet
        );

        // cells' contents
        const deleteRangeValueParams: IDeleteRangeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
            shiftDimension: Dimension.ROWS,
        };
        const undoDeleteRangeValueParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(
            accessor,
            deleteRangeValueParams
        );

        if (!undoDeleteRangeValueParams) return false;

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveRowCommand.id,
            params: { ranges } as RemoveRowColCommandParams,
        });

        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                { id: DeleteRangeMutation.id, params: deleteRangeValueParams },
                { id: RemoveRowMutation.id, params: removeRowsParams },
                ...intercepted.redos,
            ],
            commandService
        );

        if (result.result) {
            accessor.get(IUndoRedoService).pushUndoRedo({
                URI: workbookId,
                undo: async () => {
                    const undoResult = sequenceExecute(
                        [
                            ...intercepted.undos,

                            { id: InsertRowMutation.id, params: undoRemoveRowsParams },
                            { id: InsertRangeMutation.id, params: undoDeleteRangeValueParams },
                        ],
                        commandService
                    );
                    return undoResult.result;
                },
                redo: async () => {
                    const result = sequenceExecute(
                        [
                            { id: DeleteRangeMutation.id, params: deleteRangeValueParams },
                            { id: RemoveRowMutation.id, params: removeRowsParams },
                            ...intercepted.redos,
                        ],
                        commandService
                    );

                    return result.result;
                },
            });
            return true;
        }
        return false;
    },
};

/**
 * This command would remove the selected columns. These selected rows can be non-continuous.
 */
export const RemoveColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-col',
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: RemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        let ranges = params?.ranges;
        if (!ranges) {
            const selections = selectionManagerService.getSelections();
            if (!selections?.length) {
                return false;
            }
            ranges = selections.map((s) => Rectangle.clone(s.range));
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        const worksheet = workbook.getActiveSheet();

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();
        const lastRowIndex = worksheet.getMaxRows() - 1;
        ranges.forEach((item) => {
            item.startRow = 0;
            item.endRow = lastRowIndex;
        });

        // col count
        const removeColParams: IRemoveColMutationParams = {
            workbookId,
            worksheetId,
            ranges,
        };
        const undoRemoveColParams: IInsertColMutationParams = RemoveColMutationFactory(accessor, removeColParams);

        // cells' contents
        const removeRangeValuesParams: IDeleteRangeMutationParams = {
            workbookId,
            worksheetId,
            ranges,
            shiftDimension: Dimension.COLUMNS,
        };
        const undoRemoveRangeValuesParams: Nullable<IInsertRangeMutationParams> = DeleteRangeUndoMutationFactory(
            accessor,
            removeRangeValuesParams
        );
        if (!undoRemoveRangeValuesParams) {
            throw new Error();
        }

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveColCommand.id,
            params: { ranges } as RemoveRowColCommandParams,
        });
        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                { id: RemoveColMutation.id, params: removeColParams },
                { id: DeleteRangeMutation.id, params: removeRangeValuesParams },
                ...intercepted.redos,
            ],
            commandService
        );

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                URI: workbookId,
                undo: async () => {
                    const undoResult = sequenceExecute(
                        [
                            ...intercepted.undos,
                            { id: InsertColMutation.id, params: undoRemoveColParams },
                            { id: InsertRangeMutation.id, params: undoRemoveRangeValuesParams },
                        ],
                        commandService
                    );
                    return undoResult.result;
                },
                redo: async () => {
                    const result = sequenceExecute(
                        [
                            { id: RemoveColMutation.id, params: removeColParams },
                            { id: DeleteRangeMutation.id, params: removeRangeValuesParams },
                            ...intercepted.redos,
                        ],
                        commandService
                    );
                    return result.result;
                },
            });

            return true;
        }
        return false;
    },
};
