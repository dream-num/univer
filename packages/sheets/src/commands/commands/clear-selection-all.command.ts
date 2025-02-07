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

import type { IAccessor, ICommand, IMutationInfo, IRange, Workbook } from '@univerjs/core';
import type { ISetRangeValuesMutationParams } from '../mutations/set-range-values.mutation';

import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    sequenceExecute,
    UniverInstanceType,
} from '@univerjs/core';
import { generateNullCell, getVisibleRanges } from '../../basics/utils';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '../mutations/set-range-values.mutation';

interface IClearSelectionAllCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[];
}

/**
 * The command to clear all in current selected ranges.
 */
export const ClearSelectionAllCommand: ICommand = {
    id: 'sheet.command.clear-selection-all',
    type: CommandType.COMMAND,
    handler: (accessor: IAccessor, params: IClearSelectionAllCommandParams) => {
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
        const selections = params?.ranges || selectionManagerService.getCurrentSelections()?.map((s) => s.range);
        if (!selections?.length) {
            return false;
        }
        const visibleRanges = getVisibleRanges(selections, accessor, unitId, subUnitId);

        const sequenceExecuteList: IMutationInfo[] = [];
        const sequenceExecuteUndoList: IMutationInfo[] = [];

        // clear style and content
        const clearMutationParams: ISetRangeValuesMutationParams = {
            subUnitId,
            unitId,
            cellValue: generateNullCell(visibleRanges),
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

        const intercepted = sheetInterceptorService.onCommandExecute({ id: ClearSelectionAllCommand.id });

        sequenceExecuteList.push(...intercepted.redos);
        sequenceExecuteUndoList.unshift(...intercepted.undos);
        const result = sequenceExecute(sequenceExecuteList, commandService);

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
