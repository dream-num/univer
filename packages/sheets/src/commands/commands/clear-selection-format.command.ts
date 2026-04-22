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

import type { ICommand, IMutationInfo, IRange } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import { CommandType, ICommandService, IUndoRedoService, IUniverInstanceService, sequenceExecute } from '@univerjs/core';
import { generateNullCellStyle, getVisibleRanges } from '../../basics/utils';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { getSheetCommandTarget } from './utils/target-util';

export interface IClearSelectionFormatCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[];
}

/**
 * The command to clear content in current selected ranges.
 */
export const ClearSelectionFormatCommand: ICommand<IClearSelectionFormatCommandParams> = {
    id: 'sheet.command.clear-selection-format',

    type: CommandType.COMMAND,

    handler: (accessor, params) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), { unitId: params?.unitId, subUnitId: params?.subUnitId });
        if (!target) return false;

        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const { unitId, subUnitId } = target;
        const ranges = params?.ranges || selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!ranges?.length) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const visibleRanges = getVisibleRanges(ranges, accessor, unitId, subUnitId);

        const sequenceExecuteList: IMutationInfo[] = [];
        const sequenceExecuteUndoList: IMutationInfo[] = [];

        // clear style
        const clearMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCellStyle(visibleRanges),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );

        sequenceExecuteList.push({
            id: SetRangeValuesMutation.id,
            params: clearMutationParams,
        });
        sequenceExecuteUndoList.push({
            id: SetRangeValuesMutation.id,
            params: undoClearMutationParams,
        });

        const intercepted = sheetInterceptorService.onCommandExecute({ id: ClearSelectionFormatCommand.id, params });

        sequenceExecuteList.push(...intercepted.redos);
        sequenceExecuteUndoList.unshift(...intercepted.undos);

        const result = sequenceExecute(sequenceExecuteList, commandService);

        // const result = commandService.syncExecuteCommand(SetRangeValuesMutation.id, clearMutationParams);
        if (result) {
            undoRedoService.pushUndoRedo({
                // If there are multiple mutations that form an encapsulated project, they must be encapsulated in the same undo redo element.
                // Hooks can be used to hook the code of external controllers to add new actions.
                unitID: unitId,
                undoMutations: sequenceExecuteUndoList,
                redoMutations: sequenceExecuteList,
            });

            return true;
        }

        return false;
    },
};
