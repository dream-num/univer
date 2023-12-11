/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICellData, ICommand, IMutationInfo, IRange, IRowData } from '@univerjs/core';
import {
    BooleanNumber,
    CommandType,
    Dimension,
    ICommandService,
    ILogService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectArray,
    ObjectMatrix,
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IDeleteRangeMutationParams,
    IInsertRangeMutationParams,
    IInsertRowMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { DeleteRangeMutation } from '../mutations/delete-range.mutation';
import { InsertRangeMutation, InsertRangeUndoMutationFactory } from '../mutations/insert-range.mutation';
import { InsertRowMutation, InsertRowMutationUndoFactory } from '../mutations/insert-row-col.mutation';
import { RemoveRowMutation } from '../mutations/remove-row-col.mutation';
import type { IInterval } from './utils/selection-util';
import { calculateTotalLength } from './utils/selection-util';

export interface InsertRangeMoveDownCommandParams {
    ranges: IRange[];
}

export const InsertRangeMoveDownCommandId = 'sheet.command.insert-range-move-down';
/**
 * The command to insert range.
 */
export const InsertRangeMoveDownCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.insert-range-move-down',

    handler: async (accessor: IAccessor, params?: InsertRangeMoveDownCommandParams) => {
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const logService = accessor.get(ILogService);
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        if (selectionManagerService.isOverlapping()) {
            // TODO@Dushusir: use Dialog after Dialog component completed
            logService.error('Cannot use that command on overlapping selections.');
            return false;
        }

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

        const redoMutations: IMutationInfo[] = [];
        const undoMutations: IMutationInfo[] = [];

        // 1. insert range
        const cellValue = new ObjectMatrix<ICellData>();
        for (let i = 0; i < ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = ranges[i];

            for (let r = startRow; r <= endRow; r++) {
                for (let c = startColumn; c <= endColumn; c++) {
                    cellValue.setValue(r, c, { v: '' });
                }
            }
        }

        const insertRangeMutationParams: IInsertRangeMutationParams = {
            ranges,
            worksheetId,
            workbookId,
            shiftDimension: Dimension.ROWS,
            cellValue: cellValue.getData(),
        };

        redoMutations.push({ id: InsertRangeMutation.id, params: insertRangeMutationParams });

        const deleteRangeMutationParams: IDeleteRangeMutationParams = InsertRangeUndoMutationFactory(
            accessor,
            insertRangeMutationParams
        );

        undoMutations.push({ id: DeleteRangeMutation.id, params: deleteRangeMutationParams });

        // 2. insert row
        // Only required when the last row has a value, and the row height is set to the row height of the last row
        let hasValueInLastRow = false;
        let lastRowHeight = 0;
        const lastRowIndex = worksheet.getMaxRows() - 1;
        const rowsObject: IInterval = {};
        for (let i = 0; i < ranges.length; i++) {
            const { startRow, endRow, startColumn, endColumn } = ranges[i];
            rowsObject[`${i}`] = [startRow, endRow];
            for (let column = startColumn; column <= endColumn; column++) {
                const lastCell = worksheet.getCell(lastRowIndex, column);
                const lastCellValue = lastCell?.v;
                if (lastCellValue && lastCellValue !== '') {
                    hasValueInLastRow = true;
                    lastRowHeight = worksheet.getRowHeight(lastRowIndex);
                    break;
                }
            }
        }

        // There may be overlap and deduplication is required
        const rowsCount = calculateTotalLength(rowsObject);
        if (hasValueInLastRow) {
            const lastRowRange = {
                startRow: lastRowIndex,
                endRow: lastRowIndex,
                startColumn: ranges[0].startColumn,
                endColumn: ranges[0].endColumn,
            };
            const insertRowParams: IInsertRowMutationParams = {
                workbookId,
                worksheetId,
                ranges: [lastRowRange],
                rowInfo: new ObjectArray<IRowData>(
                    new Array(rowsCount).fill(undefined).map(() => ({
                        h: lastRowHeight,
                        hd: BooleanNumber.FALSE,
                    }))
                ),
            };

            redoMutations.push({
                id: InsertRowMutation.id,
                params: insertRowParams,
            });

            const undoRowInsertionParams: IRemoveRowsMutationParams = InsertRowMutationUndoFactory(
                accessor,
                insertRowParams
            );

            undoMutations.push({ id: RemoveRowMutation.id, params: undoRowInsertionParams });
        }

        const sheetInterceptor = sheetInterceptorService.onCommandExecute({
            id: InsertRangeMoveDownCommand.id,
            params: { ranges } as InsertRangeMoveDownCommandParams,
        });
        redoMutations.push(...sheetInterceptor.redos);
        undoMutations.push(...sheetInterceptor.undos);

        // execute do mutations and add undo mutations to undo stack if completed
        const result = sequenceExecute(redoMutations, commandService);
        if (result) {
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undoMutations.reverse(),
                redoMutations,
            });

            return true;
        }

        return false;
    },
    // all subsequent mutations should succeed inorder to make the whole process succeed
    // Promise.all([]).then(() => true),
};
