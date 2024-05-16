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

import type { ICommand, IMutationInfo, IRange } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { InsertColMutation, InsertRowMutation } from '../mutations/insert-row-col.mutation';
import {
    RemoveColMutation,
    RemoveColMutationFactory,
    RemoveRowMutation,
    RemoveRowsUndoMutationFactory,
} from '../mutations/remove-row-col.mutation';
import { type ISetRangeValuesMutationParams, SetRangeValuesMutation } from '../mutations/set-range-values.mutation';
import { followSelectionOperation } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

export interface IRemoveRowColCommandParams {
    range: IRange;
}
export const RemoveRowCommandId = 'sheet.command.remove-row';
/**
 * This command would remove the selected rows. These selected rows can be non-continuous.
 */
export const RemoveRowCommand: ICommand<IRemoveRowColCommandParams> = {
    type: CommandType.COMMAND,

    id: RemoveRowCommandId,

    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        let totalRange = params?.range;
        if (!totalRange) totalRange = selectionManagerService.getLast()?.range;
        if (!totalRange) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet, subUnitId, unitId } = target;

        totalRange = {
            ...totalRange,
            startColumn: 0,
            endColumn: Math.max(worksheet.getMaxColumns() - 1, 0),
        };

        const filterOutRowsInRemove: number[] = [];
        for (let i = totalRange.startRow; i <= totalRange.endRow; i++) {
            if (worksheet.getRowFiltered(i)) {
                filterOutRowsInRemove.push(i);
            }
        }

        const ranges: IRange[] = [];
        if (filterOutRowsInRemove.length) {
            const starts = [totalRange.startRow, ...filterOutRowsInRemove.map((r) => r + 1)];
            const ends = [...filterOutRowsInRemove.map((r) => r - 1), totalRange.endRow];
            for (let i = starts.length - 1; i >= 0; i--) {
                if (starts[i] <= ends[i]) {
                    ranges.push({
                        startRow: starts[i],
                        endRow: ends[i],
                        startColumn: totalRange.startColumn,
                        endColumn: totalRange.endColumn,
                    });
                }
            }
        } else {
            ranges.push(totalRange);
        }

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        ranges.forEach((range) => {
            // row count
            const removeRowsParams: IRemoveRowsMutationParams = {
                unitId,
                subUnitId,
                range,
            };
            const removedRows = worksheet.getCellMatrix().getSlice(range.startRow, range.endRow, 0, worksheet.getColumnCount() - 1);
            const undoSetRangeValuesParams: ISetRangeValuesMutationParams = {
                unitId,
                subUnitId,
                cellValue: removedRows.getMatrix(),
            };
            const undoRemoveRowsParams: IInsertRowMutationParams = RemoveRowsUndoMutationFactory(
                removeRowsParams,
                worksheet
            );

            redos.push({ id: RemoveRowMutation.id, params: removeRowsParams });
            undos.unshift({ id: InsertRowMutation.id, params: undoRemoveRowsParams }, { id: SetRangeValuesMutation.id, params: undoSetRangeValuesParams });
        });

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveRowCommand.id,
            params: { range: totalRange } as IRemoveRowColCommandParams,
        });

        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                ...(intercepted.preRedos ?? []),
                ...redos,
                ...intercepted.redos,
                followSelectionOperation(totalRange, workbook, worksheet),
            ],
            commandService
        );

        if (result.result) {
            accessor.get(IUndoRedoService).pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    ...undos,
                    ...intercepted.undos,
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    ...redos,
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

    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        let range = params?.range;
        if (!range) range = selectionManagerService.getLast()?.range;
        if (!range) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet, subUnitId, unitId } = target;

        range = {
            ...range,
            startRow: 0,
            endRow: Math.max(worksheet.getMaxRows() - 1, 0),
        };

        // col count
        const removeColParams: IRemoveColMutationParams = {
            unitId,
            subUnitId,
            range,
        };
        const undoRemoveColParams: IInsertColMutationParams = RemoveColMutationFactory(accessor, removeColParams);

        const removedCols = worksheet.getCellMatrix().getSlice(0, worksheet.getRowCount() - 1, range.startColumn, range.endColumn);
        const undoSetRangeValuesParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: removedCols.getMatrix(),
        };
        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveColCommand.id,
            params: { range } as IRemoveRowColCommandParams,
        });
        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                ...(intercepted.preRedos ?? []),
                { id: RemoveColMutation.id, params: removeColParams },
                ...intercepted.redos,
                followSelectionOperation(range, workbook, worksheet),
            ],
            commandService
        );

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    { id: InsertColMutation.id, params: undoRemoveColParams },
                    { id: SetRangeValuesMutation.id, params: undoSetRangeValuesParams },
                    ...intercepted.undos],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    { id: RemoveColMutation.id, params: removeColParams },
                    ...intercepted.redos],
            });

            return true;
        }
        return false;
    },
};
