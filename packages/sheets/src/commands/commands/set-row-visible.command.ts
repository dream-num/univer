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
import type { ISetRowHiddenMutationParams, ISetRowVisibleMutationParams } from '../mutations/set-row-visible.mutation';

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
    SetRowHiddenMutation,
    SetRowHiddenUndoMutationFactory,
    SetRowVisibleMutation,
    SetRowVisibleUndoMutationFactory,
} from '../mutations/set-row-visible.mutation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { getPrimaryForRange } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

export interface ISetSpecificRowsVisibleCommandParams {
    unitId: string;
    subUnitId: string;
    ranges: IRange[];
}

export const SetSpecificRowsVisibleCommand: ICommand<ISetSpecificRowsVisibleCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-specific-rows-visible',
    handler: (accessor: IAccessor, params: ISetSpecificRowsVisibleCommandParams) => {
        const { unitId, subUnitId, ranges } = params;
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        const target = getSheetCommandTarget(accessor.get(IUniverInstanceService), { unitId, subUnitId });
        if (!target) return false;

        const { worksheet } = target;
        const redoMutationParams: ISetRowVisibleMutationParams = { unitId, subUnitId, ranges };
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            reveal: true,
            selections: ranges.map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const undoMutationParams = SetRowVisibleUndoMutationFactory(accessor, redoMutationParams);
        const undoSetSelectionsOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const result = sequenceExecute(
            [
                { id: SetRowVisibleMutation.id, params: redoMutationParams },
                { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
            ],
            commandService
        );

        const intercepted = sheetInterceptorService.onCommandExecute({
            id: SetSpecificRowsVisibleCommand.id,
            params,
        });

        const interceptedResult = sequenceExecute([...intercepted.redos], commandService);

        if (result.result && interceptedResult.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    { id: SetRowHiddenMutation.id, params: undoMutationParams },
                    { id: SetSelectionsOperation.id, params: undoSetSelectionsOperationParams },
                    ...(intercepted.undos ?? []),
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    { id: SetRowVisibleMutation.id, params: redoMutationParams },
                    { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
                    ...intercepted.redos,
                ],
            });

            return true;
        }
        return true;
    },
};

export const SetSelectedRowsVisibleCommand: ICommand = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-selected-rows-visible',
    handler: async (accessor: IAccessor) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const commandService = accessor.get(ICommandService);

        const ranges = selectionManagerService.getCurrentSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.ROW);
        if (!ranges?.length) return false;

        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const { worksheet, unitId, subUnitId } = target;
        const hiddenRanges = ranges.map((r) => worksheet.getHiddenRows(r.startRow, r.endRow)).flat();
        return commandService.executeCommand<ISetSpecificRowsVisibleCommandParams>(SetSpecificRowsVisibleCommand.id, {
            unitId,
            subUnitId,
            ranges: hiddenRanges,
        });
    },
};

export interface ISetRowHiddenCommandParams {
    unitId?: string;
    subUnitId?: string;
    ranges?: IRange[];
}

export const SetRowHiddenCommand: ICommand<ISetRowHiddenCommandParams> = {
    type: CommandType.COMMAND,
    id: 'sheet.command.set-rows-hidden',
    handler: (accessor: IAccessor, params?: ISetRowHiddenCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const commandService = accessor.get(ICommandService);
        const undoRedoService = accessor.get(IUndoRedoService);
        const univerInstanceService = accessor.get(IUniverInstanceService);
        const sheetInterceptorService = accessor.get(SheetInterceptorService);

        // Ranges should be divided by already hidden rows.
        let ranges = params?.ranges?.length ? params.ranges : selectionManagerService.getCurrentSelections()?.map((s) => s.range).filter((r) => r.rangeType === RANGE_TYPE.ROW);
        if (!ranges?.length) return false;

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        ranges = divideRangesByHiddenRows(target.worksheet, ranges);

        const { unitId, subUnitId, worksheet } = target;
        const redoMutationParams: ISetRowHiddenMutationParams = { unitId, subUnitId, ranges };
        const setSelectionOperationParams: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            selections: getSelectionsAfterHiding(ranges).map((range) => ({
                range,
                primary: getPrimaryForRange(range, worksheet),
                style: null,
            })),
        };

        const undoMutationParams = SetRowHiddenUndoMutationFactory(accessor, redoMutationParams);
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

        const intercepted = sheetInterceptorService.onCommandExecute({ id: SetRowHiddenCommand.id, params: redoMutationParams });
        const execution = sequenceExecute([
            ...(intercepted.preRedos ?? []),
            { id: SetRowHiddenMutation.id, params: redoMutationParams },
            { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
            ...intercepted.redos,
        ], commandService);

        if (execution.result) {
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: [
                    ...(intercepted.preUndos ?? []),
                    { id: SetRowVisibleMutation.id, params: undoMutationParams },
                    { id: SetSelectionsOperation.id, params: undoSetSelectionsOperationParams },
                    ...(intercepted.undos ?? []),
                ],
                redoMutations: [
                    ...(intercepted.preRedos ?? []),
                    { id: SetRowHiddenMutation.id, params: redoMutationParams },
                    { id: SetSelectionsOperation.id, params: setSelectionOperationParams },
                    ...intercepted.redos,
                ],
            });
            return true;
        }
        return true;
    },
};

// TODO@wzhudev: this should be unit tested
export function divideRangesByHiddenRows(worksheet: Worksheet, ranges: IRange[]): IRange[] {
    const endCol = worksheet.getMaxColumns() - 1;
    const hiddenRows = worksheet.getHiddenRows();
    const divided: IRange[] = [];

    ranges.forEach((range) => {
        const hiddenRowsInThisRange = hiddenRows.filter((r) => r.startRow >= range.startRow && r.endRow <= range.endRow);
        if (hiddenRowsInThisRange.length) {
            let startRow = range.startRow;
            hiddenRowsInThisRange.forEach((hiddenRange) => {
                if (hiddenRange.startRow > startRow) {
                    divided.push({ startRow, endRow: hiddenRange.startRow - 1, startColumn: 0, endColumn: endCol });
                    startRow = hiddenRange.endRow + 1;
                }
            });

            if (startRow <= range.endRow) {
                divided.push({ startRow, endRow: range.endRow, startColumn: 0, endColumn: endCol });
            }
        } else {
            divided.push(range);
        }
    });

    return divided;
}

function getSelectionsAfterHiding(ranges: IRange[]): IRange[] {
    const merged = mergeSelections(ranges);
    return merged.map((range) => {
        const row = range.startRow === 0 ? range.endRow + 1 : range.startRow - 1;
        return {
            ...range,
            startRow: row,
            endRow: row,
        };
    });
}

function mergeSelections(ranges: IRange[]): IRange[] {
    const merged: IRange[] = [];

    let current: Nullable<IRange>;
    ranges
        .sort((a, b) => a.startRow - b.startRow)
        .forEach((range) => {
            if (!current) {
                current = range;
                return;
            }

            if (range.startRow === current.endRow + 1) {
                current.endRow = range.endRow;
            } else {
                merged.push(current);
                current = range;
            }
        });

    merged.push(current!);
    return merged;
}
