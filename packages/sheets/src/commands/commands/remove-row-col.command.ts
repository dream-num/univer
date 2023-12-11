/**
 * Copyright 2023 DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ICommand, IRange, Nullable } from '@univerjs/core';
import {
    CommandType,
    Dimension,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    Rectangle,
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IDeleteRangeMutationParams,
    IInsertColMutationParams,
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { DeleteRangeMutation, DeleteRangeUndoMutationFactory } from '../mutations/delete-range.mutation';
import { InsertRangeMutation } from '../mutations/insert-range.mutation';
import { InsertColMutation, InsertRowMutation } from '../mutations/insert-row-col.mutation';
import {
    RemoveColMutation,
    RemoveColMutationFactory,
    RemoveRowMutation,
    RemoveRowsUndoMutationFactory,
} from '../mutations/remove-row-col.mutation';

export interface IRemoveRowColCommandParams {
    ranges: IRange[];
}
export const RemoveRowCommandId = 'sheet.command.remove-row';
/**
 * This command would remove the selected rows. These selected rows can be non-continuous.
 */
export const RemoveRowCommand: ICommand = {
    type: CommandType.COMMAND,
    id: RemoveRowCommandId,
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
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
            params: { ranges } as IRemoveRowColCommandParams,
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
                unitID: workbookId,
                undoMutations: [
                    ...intercepted.undos,

                    { id: InsertRowMutation.id, params: undoRemoveRowsParams },
                    { id: InsertRangeMutation.id, params: undoDeleteRangeValueParams },
                ],
                redoMutations: [
                    { id: DeleteRangeMutation.id, params: deleteRangeValueParams },
                    { id: RemoveRowMutation.id, params: removeRowsParams },
                    ...intercepted.redos,
                ],
            });
            return true;
        }
        return false;
    },
};
export const RemoveColCommandId = 'sheet.command.remove-col';
/**
 * This command would remove the selected columns. These selected rows can be non-continuous.
 */
export const RemoveColCommand: ICommand = {
    type: CommandType.COMMAND,
    id: RemoveColCommandId,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
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
            params: { ranges } as IRemoveRowColCommandParams,
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
                unitID: workbookId,
                undoMutations: [
                    ...intercepted.undos,
                    { id: InsertColMutation.id, params: undoRemoveColParams },
                    { id: InsertRangeMutation.id, params: undoRemoveRangeValuesParams },
                ],
                redoMutations: [
                    { id: RemoveColMutation.id, params: removeColParams },
                    { id: DeleteRangeMutation.id, params: removeRangeValuesParams },
                    ...intercepted.redos,
                ],
            });

            return true;
        }
        return false;
    },
};
