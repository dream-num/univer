/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
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
import { SetRangeValuesMutation } from '../mutations/set-range-values.mutation';
import { followSelectionOperation } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

export interface IRemoveRowColCommandParams {
    ranges: IRange[];
}

export interface IRemoveRowByRangeCommandParams extends IRemoveRowColCommandParams {
    unitId: string;
    subUnitId: string;
}

export interface IRemoveColByRangeCommandParams extends IRemoveRowColCommandParams {
    unitId: string;
    subUnitId: string;
}

export const RemoveRowCommandId = 'sheet.command.remove-row';

export const RemoveRowByRangeCommand: ICommand<IRemoveRowByRangeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row-by-range',
    handler: (accessor, parmas) => {
        if (!parmas) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, parmas);
        if (!target) return false;

        const { workbook, worksheet } = target;
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const { ranges, unitId, subUnitId } = parmas;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];

        ranges.forEach((range) => {
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
            id: RemoveRowCommandId,
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
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    ...undos,
                    ...intercepted.undos],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    ...redos,
                    ...intercepted.redos],
            });

            return true;
        }
        return false;
    },
};

/**
 * This command would remove the selected rows. These selected rows can be non-continuous.
 */
export const RemoveRowCommand: ICommand<IRemoveRowColCommandParams> = {
    type: CommandType.COMMAND,

    id: RemoveRowCommandId,

    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const commandService = accessor.get(ICommandService);

        const ranges = params?.ranges || selectionManagerService.getCurrentSelections()?.map((sel) => sel.range) || [];
        if (ranges.length === 0) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, subUnitId, unitId } = target;

        const filteredRanges: IRange[] = [];
        const startColumn = 0;
        const endColumn = Math.max(worksheet.getMaxColumns() - 1, 0);

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
                            startColumn,
                            endColumn,
                        });
                    }
                }
            } else {
                filteredRanges.push({ ...range, startColumn, endColumn });
            }
        });

        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: RemoveRowCommand.id,
            params: { ranges: filteredRanges } as IRemoveRowColCommandParams,
        });

        if (!canPerform) {
            return false;
        }

        return commandService.syncExecuteCommand(RemoveRowByRangeCommand.id, {
            ranges: filteredRanges,
            unitId,
            subUnitId,
        });
    },
};

export const RemoveColCommandId = 'sheet.command.remove-col';

export const RemoveColByRangeCommand: ICommand<IRemoveColByRangeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-col-by-range',
    handler: (accessor, parmas) => {
        if (!parmas) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, parmas);
        if (!target) return false;

        const { workbook, worksheet } = target;
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const { ranges, unitId, subUnitId } = parmas;

        const redos: IMutationInfo[] = [];
        const undos: IMutationInfo[] = [];


        ranges.forEach((range) => {
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

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveColCommandId,
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
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    ...undos,
                    ...intercepted.undos],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    ...redos,
                    ...intercepted.redos],
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
    id: RemoveColCommandId,

    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const commandService = accessor.get(ICommandService);

        const ranges = params?.ranges || selectionManagerService.getCurrentSelections()?.map((sel) => sel.range) || [];
        if (ranges.length === 0) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, subUnitId, unitId } = target;

        const rowRanges: IRange[] = [];
        const startRow = 0;
        const endRow = Math.max(worksheet.getMaxRows() - 1, 0);

        ranges.forEach((range) => {
            const rowRange = {
                ...range,
                startRow,
                endRow,
            };

            rowRanges.push(rowRange);
        });

        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: RemoveColCommand.id,
            params: { ranges: rowRanges } as IRemoveRowColCommandParams,
        });

        if (!canPerform) {
            return false;
        }

        return commandService.syncExecuteCommand(RemoveColByRangeCommand.id, {
            ranges,
            unitId,
            subUnitId,
        });
    },
};
