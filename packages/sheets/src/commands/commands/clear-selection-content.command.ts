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

import type { IAccessor, ICommand, IRange, Workbook } from '@univerjs/core';

import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
    UniverInstanceType,
} from '@univerjs/core';
import { generateNullCellValue, getVisibleRanges } from '../../basics/utils';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';

interface IClearSelectionContentCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[];
}

/**
 * The command to clear content in current selected ranges.
 */
export const ClearSelectionContentCommand: ICommand = {
    id: 'sheet.command.clear-selection-content',

    type: CommandType.COMMAND,

    handler: (accessor: IAccessor, params: IClearSelectionContentCommandParams) => {
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;

        const unitId = params?.unitId || workbook.getUnitId();
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;

        const subUnitId = params?.subUnitId || worksheet.getSheetId();
        const ranges = params?.ranges || selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!ranges?.length) {
            return false;
        }
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

        const intercepted = sheetInterceptorService.onCommandExecute({ id: ClearSelectionContentCommand.id });
        const redos = [{ id: SetRangeValuesMutation.id, params: clearMutationParams }, ...intercepted.redos];
        const undos = [...intercepted.undos, { id: SetRangeValuesMutation.id, params: undoClearMutationParams }];

        const result = sequenceExecute(redos, commandService).result;
        if (result) {
            undoRedoService.pushUndoRedo({
                // If there are multiple mutations that form an encapsulated project, they must be encapsulated in the same undo redo element.
                // Hooks can be used to hook the code of external controllers to add new actions.
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });

            return true;
        }

        return false;
    },
};
