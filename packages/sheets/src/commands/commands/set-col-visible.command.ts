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

import type { IAccessor, ICommand, IRange, Nullable, Worksheet } from '@univerjs/core';
import type { ISetColHiddenMutationParams, ISetColVisibleMutationParams } from '../mutations/set-col-visible.mutation';

import type { ISetSelectionsOperationParams } from '../operations/selection.operation';
import {
    CommandType,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    sequenceExecute,
} from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import {
    SetColHiddenMutation,
    SetColHiddenUndoMutationFactory,
    SetColVisibleMutation,
    SetColVisibleUndoMutationFactory,
} from '../mutations/set-col-visible.mutation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { getPrimaryForRange } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetSpecificColsVisibleCommandParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const SetSpecificColsVisibleCommand: ICommand<ISetSpecificColsVisibleCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-visible-on-cols',
    handler: (accessor, params: ISetSpecificColsVisibleCommandParams) => {
        const { unitId, subUnitId, ranges } = params;

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const commandService = accessor.get(ICommandService);
        const instanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(instanceService, { unitId, subUnitId });
        if (!target) return false;

        const { worksheet } = target;
        const redoMutationParams: ISetColVisibleMutationParams = {
            unitId,
            subUnitId,
            ranges,
        };
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            reveal: true,
            selections: ranges.map((r) => ({ range: r, primary: getPrimaryForRange(r, worksheet), style: null })),
        };

        const undoMutationParams = SetColVisibleUndoMutationFactory(accessor, redoMutationParams);
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,

            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

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
    handler: (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);

        const ranges = selectionManagerService.getCurrentSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
        if (!ranges?.length) return false;

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService));
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        // `ranges` would not overlap each other, so `hiddenRanges` would not overlap each other either
        const hiddenRanges = ranges.map((r) => worksheet.getHiddenCols(r.startColumn, r.endColumn)).flat();

        return commandService.executeCommand<ISetSpecificColsVisibleCommandParams>(SetSpecificColsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: hiddenRanges,
        });
    },
};

export interface ISetColHiddenCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[];
}

export const SetColHiddenCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-col-hidden',
    handler: (accessor: IAccessor, params?: ISetColHiddenCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        let ranges = params?.ranges?.length ? params.ranges : selectionManagerService.getCurrentSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.COLUMN);
        if (!ranges?.length) return false;

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;

        ranges = divideRangesByHiddenCols(target.worksheet, ranges);

        const redoMutationParams: ISetColHiddenMutationParams = { unitId, subUnitId, ranges };
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const undoMutationParams = SetColHiddenUndoMutationFactory(accessor, redoMutationParams);
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            reveal: true,
            selections: ranges.map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

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

export function divideRangesByHiddenCols(worksheet: Worksheet, ranges: IRange[]): IRange[] {
    const endRow = worksheet.getRowCount() - 1;
    const hiddenCols = worksheet.getHiddenCols();
    const divided: IRange[] = [];

    ranges.forEach((range) => {
        const hiddenColsInSelection = hiddenCols.filter((c) => c.startColumn >= range.startColumn && c.endColumn <= range.endColumn);
        if (hiddenColsInSelection.length) {
            let startColumn = range.startColumn;
            hiddenColsInSelection.forEach((hiddenRange) => {
                if (hiddenRange.startColumn > startColumn) {
                    divided.push({ startColumn, endColumn: hiddenRange.startColumn - 1, startRow: 0, endRow });
                    startColumn = hiddenRange.endColumn + 1;
                }
            });

            if (startColumn <= range.endColumn) {
                divided.push({ startColumn, endColumn: range.endColumn, startRow: 0, endRow });
            }
        } else {
            divided.push(range);
        }
    });

    return divided;
}

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
