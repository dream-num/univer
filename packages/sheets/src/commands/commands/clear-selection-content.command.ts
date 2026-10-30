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
import { generateNullCellValue, getVisibleRanges } from '../../basics/utils';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SheetSkeletonService } from '../../skeleton/skeleton.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';
import { getSuitableRangesInView } from './util';
import { getSheetCommandTarget } from './utils/target-util';

export interface IClearSelectionContentCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[];
}

/**
 * The command to clear content in current selected ranges.
 */
export const ClearSelectionContentCommand: ICommand<IClearSelectionContentCommandParams> = {
    id: 'sheet.command.clear-selection-content',

    type: CommandType.COMMAND,

    handler: (accessor, params) => {
        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), { unitId: params?.unitId, subUnitId: params?.subUnitId });
        if (!target) return false;

        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const { unitId, subUnitId } = target;
        const ranges = params?.ranges || selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!ranges?.length) return false;

        const sheetSkeletonService = accessor.get(SheetSkeletonService);
        const skeleton = sheetSkeletonService.getSkeleton(unitId, subUnitId);
        if (!skeleton) return false;

        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const redoMutations: IMutationInfo[] = [];
        const undoMutations: IMutationInfo[] = [];

        // clear content
        const visibleRanges = getVisibleRanges(ranges, accessor, unitId, subUnitId);
        const clearMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCellValue(visibleRanges),
        };
        const undoClearMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            clearMutationParams
        );

        redoMutations.push({
            id: SetRangeValuesMutation.id,
            params: clearMutationParams,
        });
        undoMutations.push({
            id: SetRangeValuesMutation.id,
            params: undoClearMutationParams,
        });

        // intercept
        const intercepted = sheetInterceptorService.onCommandExecute({ id: ClearSelectionContentCommand.id, params });

        redoMutations.push(...intercepted.redos);
        undoMutations.unshift(...intercepted.undos);

        const result = sequenceExecute(redoMutations, commandService);

        // auto height
        const { suitableRanges, remainingRanges } = getSuitableRangesInView(ranges, skeleton);
        const { undos: autoHeightUndos, redos: autoHeightRedos } = sheetInterceptorService.generateMutationsOfAutoHeight({
            unitId,
            subUnitId,
            ranges: suitableRanges,
            autoHeightRanges: suitableRanges,
            lazyAutoHeightRanges: remainingRanges,
        });
        const autoHeightExecuteResult = sequenceExecute(autoHeightRedos, commandService);

        if (result.result && autoHeightExecuteResult.result) {
            redoMutations.push(...autoHeightRedos);
            undoMutations.push(...autoHeightUndos);

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
