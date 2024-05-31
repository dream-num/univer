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

import type { ICommand, IRange, Nullable, Workbook } from '@univerjs/core';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    sequenceExecute,
    UniverInstanceType,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import type { ISetColHiddenMutationParams, ISetColVisibleMutationParams } from '../mutations/set-col-visible.mutation';
import {
    SetColHiddenMutation,
    SetColHiddenUndoMutationFactory,
    SetColVisibleMutation,
    SetColVisibleUndoMutationFactory,
} from '../mutations/set-col-visible.mutation';
import type { ISetSelectionsOperationParams } from '../operations/selection.operation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { getPrimaryForRange } from './utils/selection-utils';

export interface ISetSpecificColsVisibleCommandParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const SetSpecificColsVisibleCommand: ICommand<ISetSpecificColsVisibleCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-visible-on-cols',
    handler: async (accessor, params: ISetSpecificColsVisibleCommandParams) => {
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const { unitId, subUnitId, ranges } = params;

        const worksheet = accessor
            .get(IUniverInstanceService)
            .getUniverSheetInstance(unitId)!
            .getSheetBySheetId(subUnitId)!;

        const redoMutationParams: ISetColVisibleMutationParams = {
            unitId,
            subUnitId,
            ranges,
        };
        const undoMutationParams = SetColVisibleUndoMutationFactory(accessor, redoMutationParams);
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: ranges.map((r) => ({ range: r, primary: getPrimaryForRange(r, worksheet), style: null })),
        };
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const commandService = accessor.get(ICommandService);

        const result = sequenceExecute([
            { id: SetColVisibleMutation.id, params: redoMutationParams },
            { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
        ], commandService);

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: SetSpecificColsVisibleCommand.id,
            params,
        });

        const interceptedResult = sequenceExecute([...intercepted.redos], commandService);

        if (result.result && interceptedResult.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetColHiddenMutation.id, params: undoMutationParams },
                    { id: SetSelectionsOperation.id, params: undoSetSelectionsOperationParams },
                    ...(intercepted.undos ?? []),
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    { id: SetColVisibleMutation.id, params: redoMutationParams },
                    { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
                    ...intercepted.redos,
                ],
            });

            return true;
        }
        return true;
    },
};

export const SetSelectedColsVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selected-cols-visible',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const ranges = selectionManagerService
            .getSelections()
            ?.map((s) => s.range)
            .filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
        if (!ranges?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        // `ranges` would not overlap each other, so `hiddenRanges` would not overlap each other either
        const hiddenRanges = ranges.map((r) => worksheet.getHiddenCols(r.startColumn, r.endColumn)).flat();

        return accessor
            .get(ICommandService)
            .executeCommand<ISetSpecificColsVisibleCommandParams>(SetSpecificColsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: hiddenRanges,
        });
    },
};

export const SetColHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-hidden',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const ranges = selectionManagerService.getSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
        if (!ranges?.length) {
            return false;
        }

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) return false;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) return false;

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const redoMutationParams: ISetColHiddenMutationParams = {
            unitId, subUnitId, ranges,
        };
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId, subUnitId, pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            unitId, subUnitId, pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: ranges.map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const commandService = accessor.get(ICommandService);

        const result = sequenceExecute([
            { id: SetColHiddenMutation.id, params: redoMutationParams },
            { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
        ], commandService);

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: SetColHiddenCommand.id,
            params: redoMutationParams,
        });

        const interceptedResult = sequenceExecute([...intercepted.redos], commandService);

        if (result.result && interceptedResult.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            const undoMutationParams = SetColHiddenUndoMutationFactory(accessor, redoMutationParams);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    { id: SetColVisibleMutation.id, params: undoMutationParams },
                    { id: SetSelectionsOperation.id, params: undoSetSelectionsOperationParams },
                    ...(intercepted.undos ?? []),
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    { id: SetColHiddenMutation.id, params: redoMutationParams },
                    { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
                    ...intercepted.redos,
                ],
            });
            return true;
        }

        return false;
    },
};

/**
 * Get the selections after hiding cols.
 * @param worksheet the worksheet the command invoked on
 * @param ranges cols to be hidden
 */
function getSelectionsAfterHiding(ranges: IRange[]): IRange[] {
    const merged = mergeSelections(ranges);
    // TODO@wzhudev: actually we should dedupe selections here
    return merged.map((range) => {
        // prefer the left selection
        // we don't have to check if range.endColumn === lastColumn because this would be
        // forbidden in handler of SetColHiddenCommand
        const column = range.startColumn === 0 ? range.endColumn + 1 : range.startColumn - 1;
        return {
            ...range,
            startColumn: column,
            endColumn: column,
        };
    });
}

function mergeSelections(ranges: IRange[]): IRange[] {
    const merged: IRange[] = [];
    let current: Nullable<IRange>;
    ranges
        .sort((a, b) => a.startColumn - b.startColumn)
        .forEach((range) => {
            if (!current) {
                current = range;
                return;
            }

            if (current.endColumn === range.startColumn - 1) {
                current.endColumn = range.endColumn;
            } else {
                merged.push(current);
                current = range;
            }
        });
    merged.push(current!);
    return merged;
}
