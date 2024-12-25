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

import type { IAccessor, ICommand, IMutationInfo, IRange } from '@univerjs/core';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';

import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
} from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
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
    ranges: IRange[];
}

export interface IRemoveRowColCommandInterceptParams extends IRemoveRowColCommandParams {}

export const RemoveRowCommandId = 'sheet.command.remove-row';
/**
 * This command would remove the selected rows. These selected rows can be non-continuous.
 */
export const RemoveRowCommand: ICommand<IRemoveRowColCommandParams> = {
    type: CommandType.COMMAND,

    id: RemoveRowCommandId,

    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const ranges = params?.ranges || selectionManagerService.getCurrentSelections()?.map((sel) => sel.range) || [];
        if (ranges.length === 0) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet, subUnitId, unitId } = target;

        const filteredRanges: IRange[] = [];

        ranges.forEach((range) => {
            const filterOutRowsInRemove: number[] = [];
            for (let i = range.startRow; i <= range.endRow; i++) {
                if (worksheet.getRowFiltered(i)) {
                    filterOutRowsInRemove.push(i);
                }
            }

            if (filterOutRowsInRemove.length) {
                const starts = [range.startRow, ...filterOutRowsInRemove.map((r) => r + 1)];
                const ends = [...filterOutRowsInRemove.map((r) => r - 1), range.endRow];
                for (let i = starts.length - 1; i >= 0; i--) {
                    if (starts[i] <= ends[i]) {
                        filteredRanges.push({
                            startRow: starts[i],
                            endRow: ends[i],
                            startColumn: range.startColumn,
                            endColumn: range.endColumn,
                        });
                    }
                }
            } else {
                filteredRanges.push(range);
            }
        });

        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: RemoveRowCommand.id,
            params: { ranges: filteredRanges } as IRemoveRowColCommandInterceptParams,
        });

        if (!canPerform) {
            return false;
        }

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        filteredRanges.forEach((range) => {
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
            params: { ranges: filteredRanges } as IRemoveRowColCommandInterceptParams,
        });

        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                ...(intercepted.preRedos ?? []),
                ...redos,
                ...intercepted.redos,
                followSelectionOperation(filteredRanges[0], workbook, worksheet),
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
export const RemoveColCommand: ICommand<IRemoveRowColCommandParams> = {
    type: CommandType.COMMAND,
    id: RemoveColCommandId,

    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const ranges = params?.ranges || selectionManagerService.getCurrentSelections()?.map((sel) => sel.range) || [];
        if (ranges.length === 0) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { workbook, worksheet, subUnitId, unitId } = target;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        ranges.forEach((range) => {
            range = {
                ...range,
                startRow: 0,
                endRow: Math.max(worksheet.getMaxRows() - 1, 0),
            };

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

            redos.push({ id: RemoveColMutation.id, params: removeColParams });
            undos.unshift(
                { id: InsertColMutation.id, params: undoRemoveColParams },
                { id: SetRangeValuesMutation.id, params: undoSetRangeValuesParams }
            );
        });

        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: RemoveColCommand.id,
            params: { ranges } as IRemoveRowColCommandParams,
        });

        if (!canPerform) {
            return false;
        }

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveColCommand.id,
            params: { ranges } as IRemoveRowColCommandParams,
        });
        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                ...(intercepted.preRedos ?? []),
                ...redos,
                ...intercepted.redos,
                followSelectionOperation(ranges[0], workbook, worksheet),
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
