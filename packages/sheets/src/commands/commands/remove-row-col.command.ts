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
import { getVisibleRanges } from '../../basics/utils';
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
    range: IRange;
}

export interface IRemoveRowColCommandInterceptParams extends IRemoveRowColCommandParams {
    ranges?: IRange[];
}

export interface IRemoveRowByRangeCommandParams {
    range: IRange;
    unitId: string;
    subUnitId: string;
}

export interface IRemoveColByRangeCommandParams {
    range: IRange;
    unitId: string;
    subUnitId: string;
}

export const RemoveRowCommandId = 'sheet.command.remove-row';

export const RemoveRowByRangeCommand: ICommand<IRemoveRowByRangeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row-by-range',
    handler: (accessor, params) => {
        if (!params) {
            return false;
        }
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { workbook, worksheet } = target;
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const { range, unitId, subUnitId } = params;

        const visibleRanges = getVisibleRanges([range], accessor, unitId, subUnitId).reverse();

        const undoMutations: IMutationInfo[] = [];
        const redoMutations: IMutationInfo[] = [];

        visibleRanges.forEach((visibleRange) => {
            const undos: IMutationInfo[] = [];
            const redos: IMutationInfo[] = [];
            const removeRowsParams: IRemoveRowsMutationParams = {
                unitId,
                subUnitId,
                range: visibleRange,
            };
            const undoRemoveRowsParams: IInsertRowMutationParams = RemoveRowsUndoMutationFactory(
                removeRowsParams,
                worksheet
            );

            const removedRows = worksheet.getCellMatrix().getSlice(visibleRange.startRow, visibleRange.endRow, 0, worksheet.getColumnCount() - 1);
            const undoSetRangeValuesParams: ISetRangeValuesMutationParams = {
                unitId,
                subUnitId,
                cellValue: removedRows.getMatrix(),
            };

            const intercepted = sheetInterceptorService.onCommandExecute({
                id: RemoveRowCommandId,
                params: { range: visibleRange } as IRemoveRowColCommandParams,
            });

            redos.push(...(intercepted.preRedos ?? []));
            redos.push({ id: RemoveRowMutation.id, params: removeRowsParams });
            redos.push(...(intercepted.redos ?? []));
            undos.push(...(intercepted.preUndos ?? []));
            undos.push({ id: InsertRowMutation.id, params: undoRemoveRowsParams });
            undos.push({ id: SetRangeValuesMutation.id, params: undoSetRangeValuesParams });
            undos.push(...(intercepted.undos ?? []));

            redoMutations.push(...redos);
            undoMutations.unshift(...undos);
        });

        redoMutations.push(followSelectionOperation(range, workbook, worksheet));

        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(redoMutations, commandService);
        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations,
                redoMutations,
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
        let range = params?.range;
        if (!range) range = selectionManagerService.getCurrentLastSelection()?.range;
        if (!range) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, subUnitId, unitId } = target;

        range = {
            ...range,
            startColumn: 0,
            endColumn: Math.max(worksheet.getMaxColumns() - 1, 0),
        };

        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: RemoveRowCommand.id,
            params: { range } as IRemoveRowColCommandParams,
        });

        if (!canPerform) {
            return false;
        }

        return commandService.syncExecuteCommand(RemoveRowByRangeCommand.id, {
            range,
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
        const { range, unitId, subUnitId } = parmas;
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
            id: RemoveColCommandId,
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
                    ...intercepted.undos,
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    { id: RemoveColMutation.id, params: removeColParams },
                    ...intercepted.redos,
                ],
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
        let range = params?.range;
        if (!range) range = selectionManagerService.getCurrentLastSelection()?.range;
        if (!range) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, subUnitId, unitId } = target;

        range = {
            ...range,
            startRow: 0,
            endRow: Math.max(worksheet.getMaxRows() - 1, 0),
        };

        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: RemoveColCommand.id,
            params: { range } as IRemoveRowColCommandParams,
        });

        if (!canPerform) {
            return false;
        }

        return commandService.syncExecuteCommand(RemoveColByRangeCommand.id, {
            range,
            unitId,
            subUnitId,
        });
    },
};
