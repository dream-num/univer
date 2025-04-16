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
import type { ISetRangeValuesMutationParams, ISetSelectionsOperationParams } from '@univerjs/sheets';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, sequenceExecute } from '@univerjs/core';
import { generateNullCellValue, getSheetCommandTarget, SetRangeValuesMutation, SetRangeValuesUndoMutationFactory, SetSelectionsOperation, SheetInterceptorService } from '@univerjs/sheets';

import { IAutoFillService } from '../../services/auto-fill/auto-fill.service';

export interface IAutoFillCommandParams {
    sourceRange: IRange;
    targetRange: IRange;
}

export const AutoFillCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.auto-fill',

    handler: async (accessor: IAccessor, params: IAutoFillCommandParams) => {
        const autoFillService = accessor.get(IAutoFillService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const { sourceRange, targetRange } = params;

        const commandTarget = getSheetCommandTarget(univerInstanceService);
        if (!commandTarget) return false;

        const { subUnitId, unitId } = commandTarget;
        return autoFillService.triggerAutoFill(unitId, subUnitId, sourceRange, targetRange);
    },
};

export interface IAutoClearContentCommand {
    clearRange: IRange;
    selectionRange: IRange;
}

export const AutoClearContentCommand: ICommand = {
    id: 'sheet.command.auto-clear-content',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IAutoClearContentCommand) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { unitId, subUnitId } = target;
        const { clearRange, selectionRange } = params;

        const clearMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCellValue([clearRange]),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );
        const { startColumn, startRow } = selectionRange;
        const param: ISetSelectionsOperationParams = {
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
        };
        commandService.executeCommand(SetSelectionsOperation.id, param);

        const result = commandService.syncExecuteCommand(SetRangeValuesMutation.id, clearMutationParams);
        if (result) {
            const afterInterceptors = sheetInterceptorService.afterCommandExecute({
                id: SetRangeValuesMutation.id,
                params: clearMutationParams,
            });

            sequenceExecute(afterInterceptors.redos, commandService);
            undoRedoService.pushUndoRedo({
                // If there are multiple mutations that form an encapsulated project, they must be encapsulated in the same undo redo element.
                // Hooks can be used to hook the code of external controllers to add new actions.
                unitID: unitId,
                undoMutations: [{ id: SetRangeValuesMutation.id, params: undoClearMutationParams }, ...afterInterceptors.undos],
                redoMutations: [{ id: SetRangeValuesMutation.id, params: clearMutationParams }, ...afterInterceptors.redos],
            });

            return true;
        }

        return false;
    },
};
