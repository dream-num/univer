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

import type { IAccessor, ICommand, IMutationInfo, IRange, Workbook, Worksheet } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    Injector,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
    throttle,
} from '@univerjs/core';
import type {
    IInsertColMutationParams,
    IInsertRowMutationParams,
    IRemoveColMutationParams,
    IRemoveRowsMutationParams,
} from '../../basics/interfaces/mutation-interface';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import type { ISheetCommandSharedParams } from '../utils/interface';
import { getVisibleRanges } from '../../basics/utils';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SheetSkeletonService } from '../../skeleton/skeleton.service';
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

export interface IRemoveRowColCommandParams extends Partial<ISheetCommandSharedParams> {
    range: IRange;
}

export interface IRemoveRowColCommandInterceptParams extends IRemoveRowColCommandParams {
    unitId: string;
    subUnitId: string;
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

/**
 * Set selection after remove row/col through throttle to avoid frequent set selection operation
 */
const setSelection = throttle((range: IRange, workbook: Workbook, worksheet: Worksheet, commandService: ICommandService) => {
    if (!commandService.disposed) {
        const command = followSelectionOperation(range, workbook, worksheet);
        commandService.executeCommand(command.id, command.params);
    };
}, 300);

export const RemoveRowCommandId = 'sheet.command.remove-row';

export const RemoveRowByRangeCommand: ICommand<IRemoveRowByRangeCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.remove-row-by-range',
    // eslint-disable-next-line max-lines-per-function
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

        const skeletons = accessor.get(Injector).has(SheetSkeletonService) ? accessor.get(SheetSkeletonService) : undefined;
        if (skeletons?.isDisplayProjectionPending(unitId, subUnitId)) {
            return false;
        }
        const display = skeletons?.getDisplaySkeleton(unitId, subUnitId);
        const visibleRanges = getVisibleRanges(
            [range],
            accessor,
            unitId,
            subUnitId,
            display ? (row) => display.getRowFiltered(row) : undefined
        ).reverse();
        if (!visibleRanges.length) {
            return false;
        }

        const undoMutations: IMutationInfo[] = [];
        const redoMutations: IMutationInfo[] = [];
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);

        // Each span must update dependent models before the next span is prepared. Their
        // interceptors describe contiguous deletions, so an envelope would include kept rows.
        for (const visibleRange of visibleRanges) {
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

            redos.push({ id: RemoveRowMutation.id, params: removeRowsParams });
            undos.push({ id: InsertRowMutation.id, params: undoRemoveRowsParams });
            undos.push({ id: SetRangeValuesMutation.id, params: undoSetRangeValuesParams });

            const interceptorParams: IRemoveRowColCommandInterceptParams = {
                ...params,
                range: visibleRange,
                ranges: [visibleRange],
            };
            const groups = sheetInterceptorService.getCommandMutationGroups({
                id: RemoveRowCommandId,
                params: interceptorParams,
            });
            const preRedos = groups.flatMap((group) => group.preRedos ?? []);
            const spanRedos = [
                ...preRedos,
                ...redos,
                ...groups.flatMap((group) => group.redos),
            ];
            const result = sequenceExecute(spanRedos, commandService);
            if (!result.result) {
                // Recover the completed prefix of this span as well as earlier spans.
                const preUndos: IMutationInfo[] = [];
                const postUndos: IMutationInfo[] = [];
                const rollbackPre: IMutationInfo[] = [];
                const rollbackPost: IMutationInfo[] = [];
                let preIndex = 0;
                let postIndex = preRedos.length + redos.length;
                for (const group of groups) {
                    const preCount = group.preRedos?.length ?? 0;
                    const completedPre = Math.max(0, Math.min(preCount, result.index - preIndex));
                    const completedPost = Math.max(0, Math.min(group.redos.length, result.index - postIndex));
                    if (group.rollbackMutations) {
                        rollbackPre.unshift(...group.rollbackMutations.slice(0, completedPre).reverse().flat());
                        rollbackPost.unshift(...group.rollbackMutations.slice(preCount, preCount + completedPost).reverse().flat());
                    } else if (completedPre || completedPost) {
                        // Legacy hooks restore state around the row insertion. Their preUndos
                        // are not inverses of preRedos (merges, for example, use both phases).
                        preUndos.push(...group.preUndos ?? []);
                        postUndos.push(...group.undos);
                    }
                    preIndex += preCount;
                    postIndex += group.redos.length;
                }
                undoMutations.unshift(
                    ...rollbackPost,
                    ...preUndos,
                    ...(result.index > preRedos.length ? undos : []),
                    ...postUndos,
                    ...rollbackPre
                );
                redoMutations.push(...spanRedos.slice(0, result.index));
                if (redoMutations.length) {
                    undoRedoService.pushUndoRedo({ unitID: unitId, undoMutations, redoMutations });
                }
                return false;
            }

            const afterInterceptors = sheetInterceptorService.afterCommandExecute({
                id: RemoveRowCommandId,
                params: interceptorParams,
            });
            sequenceExecute(afterInterceptors.redos, commandService);

            undoMutations.unshift(
                ...groups.flatMap((group) => group.preUndos ?? []),
                ...undos,
                ...groups.flatMap((group) => group.undos),
                ...afterInterceptors.undos
            );
            redoMutations.push(...spanRedos, ...afterInterceptors.redos);
        }
        setSelection(range, workbook, worksheet, commandService);
        undoRedoService.pushUndoRedo({ unitID: unitId, undoMutations, redoMutations });
        return true;
    },
};

/**
 * This command would remove the selected rows. These selected rows can be non-continuous.
 */
export const RemoveRowCommand: ICommand<IRemoveRowColCommandParams> = {
    type: CommandType.COMMAND,

    id: RemoveRowCommandId,

    handler: async (accessor: IAccessor, params?: IRemoveRowColCommandParams) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const selectionManagerService = accessor.get(SheetsSelectionsService);

        let range = params?.range || selectionManagerService.getCurrentLastSelection()?.range;
        if (!range) return false;

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const commandService = accessor.get(ICommandService);

        const { worksheet, unitId, subUnitId } = target;
        const skeletons = accessor.get(Injector).has(SheetSkeletonService) ? accessor.get(SheetSkeletonService) : undefined;
        const display = skeletons?.getDisplaySkeleton(unitId, subUnitId);
        const projection = display?.getDisplayProjection();

        range = {
            ...range,
            startColumn: 0,
            endColumn: Math.max(worksheet.getMaxColumns() - 1, 0),
        };

        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: RemoveRowCommand.id,
            params: { range, unitId, subUnitId },
        });

        if (!canPerform || skeletons?.isDisplayProjectionPending(unitId, subUnitId) ||
            skeletons?.getDisplaySkeleton(unitId, subUnitId) !== display || display?.getDisplayProjection() !== projection) {
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

        const interceptorParams: IRemoveRowColCommandInterceptParams = params;
        const intercepted = sheetInterceptorService.onCommandExecute({
            id: RemoveColCommandId,
            params: interceptorParams,
        });
        const commandService = accessor.get(ICommandService);
        const result = sequenceExecute(
            [
                ...(intercepted.preRedos ?? []),
                { id: RemoveColMutation.id, params: removeColParams },
                ...intercepted.redos,
            ],
            commandService
        );

        if (result.result) {
            setSelection(range, workbook, worksheet, commandService);

            const afterInterceptors = sheetInterceptorService.afterCommandExecute({
                id: RemoveColCommandId,
                params: interceptorParams,
            });
            sequenceExecute(afterInterceptors.redos, commandService);

            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    { id: InsertColMutation.id, params: undoRemoveColParams },
                    { id: SetRangeValuesMutation.id, params: undoSetRangeValuesParams },
                    ...intercepted.undos,
                    ...afterInterceptors.undos,
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    { id: RemoveColMutation.id, params: removeColParams },
                    ...intercepted.redos,
                    ...afterInterceptors.redos,
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
        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet, subUnitId, unitId } = target;

        range = {
            ...range,
            startRow: 0,
            endRow: Math.max(worksheet.getMaxRows() - 1, 0),
        };

        const canPerform = await sheetInterceptorService.beforeCommandExecute({
            id: RemoveColCommand.id,
            params: { range, unitId, subUnitId },
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
