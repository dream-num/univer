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

import type { IAccessor, ICommand, IRange } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, sequenceExecute } from '@univerjs/core';
import { generateNullCellValue } from '../../basics/utils';
import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';
import { AUTO_FILL_APPLY_TYPE } from '../../services/auto-fill/type';
import { SheetsSelectionsService } from '../../services/selections';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { getSheetCommandTarget } from './utils/target-util';

export interface IAutoFillCommandParams {
    sourceRange: IRange;
    targetRange: IRange;
    unitId?: string; // if not provided, use current unitId
    subUnitId?: string; // if not provided, use current subUnitId
    applyType?: AUTO_FILL_APPLY_TYPE; // manual apply type
}

export const AutoFillCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.auto-fill',
    handler: async (accessor: IAccessor, params: IAutoFillCommandParams) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), params);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const { sourceRange, targetRange, applyType } = params;
        const autoFillService = accessor.get(IAutoFillService);
        return autoFillService.triggerAutoFill(unitId, subUnitId, sourceRange, targetRange, applyType);
    },
};

function getSheetCopyFillRange(accessor: IAccessor, direction: 'down' | 'right'): IAutoFillCommandParams | null {
    const selection = accessor.get(SheetsSelectionsService).getCurrentLastSelection();
    if (!selection) {
        return null;
    }

    const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
    if (!target) {
        return null;
    }

    const { unitId, subUnitId } = target;
    const { startRow, endRow, startColumn, endColumn } = selection.range;

    if (direction === 'down') {
        if (startRow === endRow) {
            if (startRow === 0) {
                return null;
            }

            return {
                sourceRange: { startRow: startRow - 1, endRow: startRow - 1, startColumn, endColumn },
                targetRange: { startRow: startRow - 1, endRow, startColumn, endColumn },
                unitId,
                subUnitId,
                applyType: AUTO_FILL_APPLY_TYPE.COPY,
            };
        }

        return {
            sourceRange: { startRow, endRow: startRow, startColumn, endColumn },
            targetRange: { startRow, endRow, startColumn, endColumn },
            unitId,
            subUnitId,
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        };
    }

    if (startColumn === endColumn) {
        if (startColumn === 0) {
            return null;
        }

        return {
            sourceRange: { startRow, endRow, startColumn: startColumn - 1, endColumn: startColumn - 1 },
            targetRange: { startRow, endRow, startColumn: startColumn - 1, endColumn },
            unitId,
            subUnitId,
            applyType: AUTO_FILL_APPLY_TYPE.COPY,
        };
    }

    return {
        sourceRange: { startRow, endRow, startColumn, endColumn: startColumn },
        targetRange: { startRow, endRow, startColumn, endColumn },
        unitId,
        subUnitId,
        applyType: AUTO_FILL_APPLY_TYPE.COPY,
    };
}

async function executeSheetCopyFill(accessor: IAccessor, direction: 'down' | 'right') {
    const params = getSheetCopyFillRange(accessor, direction);
    if (!params) {
        return false;
    }

    const result = await accessor.get(ICommandService).executeCommand(AutoFillCommand.id, params);
    if (result) {
        accessor.get(IAutoFillService).setShowMenu(false);
    }

    return result;
}

export const SheetCopyDownCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-down',
    handler: async (accessor: IAccessor) => executeSheetCopyFill(accessor, 'down'),
};

export const SheetCopyRightCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.copy-right',
    handler: async (accessor: IAccessor) => executeSheetCopyFill(accessor, 'right'),
};

export interface IAutoClearContentCommand {
    clearRange: IRange;
    selectionRange: IRange;
}

export const AutoClearContentCommand: ICommand = {
    id: 'sheet.command.auto-clear-content',
    type: CommandType.COMMAND,
    // eslint-disable-next-line max-lines-per-function
    handler: async (accessor: IAccessor, params: IAutoClearContentCommand) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const selectionsService = accessor.get(SheetsSelectionsService);

        const { unitId, subUnitId } = target;
        const { clearRange, selectionRange } = params;
        const { startColumn, startRow } = selectionRange;

        const clearMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCellValue([clearRange]),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );

        const redos = [
            {
                id: SetRangeValuesMutation.id,
                params: clearMutationParams,
            },
            {
                id: SetSelectionsOperation.id,
                params: {
                    selections: [
                        {
                            primary: {
                                startColumn,
                                startRow,
                                endColumn: startColumn,
                                endRow: startRow,
                                actualRow: startRow,
                                actualColumn: startColumn,
                                isMerged: false,
                                isMergedMainCell: false,
                            },
                            range: {
                                ...selectionRange,
                            },
                        },
                    ],
                    unitId,
                    subUnitId,
                },
            },
        ];
        const undos = [
            {
                id: SetRangeValuesMutation.id,
                params: undoClearMutationParams,
            },
            {
                id: SetSelectionsOperation.id,
                params: {
                    selections: [selectionsService.getCurrentLastSelection()],
                    unitId,
                    subUnitId,
                },
            },
        ];

        const result = sequenceExecute(redos, commandService);
        if (result.result) {
            const afterInterceptors = sheetInterceptorService.afterCommandExecute({
                id: SetRangeValuesMutation.id,
                params: clearMutationParams,
            });

            sequenceExecute(afterInterceptors.redos, commandService);

            undoRedoService.pushUndoRedo({
                // If there are multiple mutations that form an encapsulated project, they must be encapsulated in the same undo redo element.
                // Hooks can be used to hook the code of external controllers to add new actions.
                unitID: unitId,
                undoMutations: [...undos, ...afterInterceptors.undos],
                redoMutations: [...redos, ...afterInterceptors.redos],
            });

            return true;
        }

        return false;
    },
};
