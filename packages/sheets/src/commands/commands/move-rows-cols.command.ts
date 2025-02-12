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

import type { IAccessor, ICommand, IRange, Worksheet } from '@univerjs/core';
import type { ISelectionWithStyle } from '../../basics';

import type { IMoveColumnsMutationParams, IMoveRowsMutationParams } from '../mutations/move-rows-cols.mutation';
import type { ISetSelectionsOperationParams } from '../operations/selection.operation';
import {
    CommandType,
    ErrorService,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    LocaleService,
    RANGE_TYPE,
    Rectangle,
    sequenceExecute,
} from '@univerjs/core';
import { SheetsSelectionsService } from '../../services/selections/selection.service';
import { SelectionMoveType } from '../../services/selections/type';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import {
    MoveColsMutation,
    MoveColsMutationUndoFactory,
    MoveRowsMutation,
    MoveRowsMutationUndoFactory,
} from '../mutations/move-rows-cols.mutation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { alignToMergedCellsBorders, getPrimaryForRange } from './utils/selection-utils';
import { getSheetCommandTarget } from './utils/target-util';

export interface IMoveRowsCommandParams {
    unitId?: string;
    subUnitId?: string;
    range?: IRange; // for facade to use, accepting user parameters
    fromRange: IRange;
    toRange: IRange;
}

function rowAcrossMergedCell(row: number, worksheet: Worksheet): boolean {
    return worksheet.getMergeData().some((mergedCell) => mergedCell.startRow < row && row <= mergedCell.endRow);
}

function columnAcrossMergedCell(col: number, worksheet: Worksheet): boolean {
    return worksheet.getMergeData().some((mergedCell) => mergedCell.startColumn < col && col <= mergedCell.endColumn);
}

export const MoveRowsCommandId = 'sheet.command.move-rows' as const;
/**
 * Command to move the selected rows (must currently selected) to the specified row.
 */
export const MoveRowsCommand: ICommand<IMoveRowsCommandParams> = {
    id: MoveRowsCommandId,
    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params: IMoveRowsCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const {
            fromRange: { startRow: fromRow },
            toRange: { startRow: toRow },
            range,
        } = params;

        // user can specify the range to move, or use the current selection
        const selections = range ? [covertRangeToSelection(range)] : selectionManagerService.getCurrentSelections();

        const filteredSelections = selections?.filter(
            (selection) =>
                selection.range.rangeType === RANGE_TYPE.ROW &&
                selection.range.startRow <= fromRow &&
                fromRow <= selection.range.endRow
        );
        if (filteredSelections?.length !== 1) {
            return false;
        }

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { workbook, worksheet } = target;

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        const errorService = accessor.get(ErrorService);
        const localeService = accessor.get(LocaleService);
        // Forbid action when some parts of a merged cell are selected.
        const rangeToMove = filteredSelections[0].range;
        const beforePrimary = filteredSelections[0].primary;
        const alignedRange = alignToMergedCellsBorders(rangeToMove, worksheet, false);
        if (!Rectangle.equals(rangeToMove, alignedRange)) {
            errorService.emit(localeService.t('sheets.info.partOfCell'));
            return false;
        }

        if (rowAcrossMergedCell(toRow, worksheet)) {
            errorService.emit(localeService.t('sheets.info.acrossMergedCell'));
            return false;
        }

        const destinationRange: IRange = {
            ...rangeToMove,
            startRow: toRow,
            endRow: toRow + rangeToMove.endRow - rangeToMove.startRow,
        };
        const moveRowsParams: IMoveRowsMutationParams = {
            unitId,
            subUnitId,
            sourceRange: rangeToMove,
            targetRange: destinationRange,
        };
        const undoMoveRowsParams = MoveRowsMutationUndoFactory(accessor, moveRowsParams);

        const commandService = accessor.get(ICommandService);

        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: MoveRowsCommand.id, params });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            { id: MoveRowsMutation.id, params: moveRowsParams },
        ];

        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: MoveRowsMutation.id, params: undoMoveRowsParams },
        ];

        // Handle selection in user interaction, not when using the Facade API
        if (beforePrimary) {
             // we could just move the merged cells because other situations are not allowed
            // we should only deal with merged cell that is between the range of the rows to move
            const movedLength = toRow - fromRow;
            const moveBackward = movedLength < 0;
            const count = rangeToMove.endRow - rangeToMove.startRow + 1;

            // deal with selections
            const destSelection: IRange = moveBackward
                ? destinationRange
                : {
                    ...destinationRange,
                    startRow: destinationRange.startRow - count,
                    endRow: destinationRange.endRow - count,
                };

            const setSelectionsParam: ISetSelectionsOperationParams = {
                unitId,
                subUnitId,
                type: SelectionMoveType.MOVE_END,
                selections: [{
                    range: destSelection,
                    primary: getPrimaryForRange(destSelection, worksheet),
                    style: null,
                }],
            };
            const undoSetSelectionsParam: ISetSelectionsOperationParams = {
                unitId,
                subUnitId,
                type: SelectionMoveType.MOVE_END,
                selections: [{ range: rangeToMove, primary: beforePrimary, style: null }],
            };

            redos.push({ id: SetSelectionsOperation.id, params: setSelectionsParam });
            undos.push({ id: SetSelectionsOperation.id, params: undoSetSelectionsParam });
        }

        redos.push(...interceptorCommands.redos);
        undos.push(...interceptorCommands.undos);

        const result = sequenceExecute(redos, commandService);

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }

        return false;
    },
};

export interface IMoveColsCommandParams {
    unitId?: string;
    subUnitId?: string;
    range?: IRange; // for facade to use, accepting user parameters
    fromRange: IRange;
    toRange: IRange;
}
export const MoveColsCommandId = 'sheet.command.move-cols' as const;

export const MoveColsCommand: ICommand<IMoveColsCommandParams> = {
    id: MoveColsCommandId,
    type: CommandType.COMMAND,

    // eslint-disable-next-line max-lines-per-function
    handler: (accessor: IAccessor, params: IMoveColsCommandParams) => {
        const selectionManagerService = accessor.get(SheetsSelectionsService);
        const {
            fromRange: { startColumn: fromCol },
            toRange: { startColumn: toCol },
            range,
        } = params;

        // user can specify the range to move, or use the current selection
        const selections = range ? [covertRangeToSelection(range)] : selectionManagerService.getCurrentSelections();

        const filteredSelections = selections?.filter(
            (selection) =>
                selection.range.rangeType === RANGE_TYPE.COLUMN &&
                selection.range.startColumn <= fromCol &&
                fromCol <= selection.range.endColumn
        );
        if (filteredSelections?.length !== 1) {
            return false;
        }

        const sheetInterceptorService = accessor.get(SheetInterceptorService);
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const target = getSheetCommandTarget(univerInstanceService, params);
        if (!target) return false;

        const { workbook, worksheet } = target;

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();

        const errorService = accessor.get(ErrorService);
        const localeService = accessor.get(LocaleService);
        // Forbid action when some parts of a merged cell are selected.
        const rangeToMove = filteredSelections[0].range;
        const beforePrimary = filteredSelections[0].primary;
        const alignedRange = alignToMergedCellsBorders(rangeToMove, worksheet, false);
        if (!Rectangle.equals(rangeToMove, alignedRange)) {
            errorService.emit(localeService.t('sheets.info.partOfCell'));
            return false;
        }

        if (columnAcrossMergedCell(toCol, worksheet)) {
            errorService.emit(localeService.t('sheets.info.acrossMergedCell'));
            return false;
        }

        const destinationRange: IRange = {
            ...rangeToMove,
            startColumn: toCol,
            endColumn: toCol + rangeToMove.endColumn - rangeToMove.startColumn,
        };
        const moveColsParams: IMoveColumnsMutationParams = {
            unitId,
            subUnitId,
            sourceRange: rangeToMove,
            targetRange: destinationRange,
        };
        const undoMoveColsParams = MoveColsMutationUndoFactory(accessor, moveColsParams);

        const commandService = accessor.get(ICommandService);

        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: MoveColsCommand.id, params });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            { id: MoveColsMutation.id, params: moveColsParams },
        ];

        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: MoveColsMutation.id, params: undoMoveColsParams },
        ];

        // Handle selection in user interaction, not when using the Facade API
        if (beforePrimary) {
            // we could just move the merged cells because other situations are not allowed
            // we should only deal with merged cell that is between the range of the cols to move
            const count = rangeToMove.endColumn - rangeToMove.startColumn + 1;
            const movedLength = toCol - fromCol;
            const moveBackward = movedLength < 0;

            // deal with selections
            const destSelection: IRange = moveBackward
                ? destinationRange
                : {
                    ...destinationRange,
                    startColumn: destinationRange.startColumn - count,
                    endColumn: destinationRange.endColumn - count,
                };
            const setSelectionsParam: ISetSelectionsOperationParams = {
                unitId,
                subUnitId,
                type: SelectionMoveType.MOVE_END,
                selections: [{ range: destSelection, primary: getPrimaryForRange(destSelection, worksheet), style: null }],
            };
            const undoSetSelectionsParam: ISetSelectionsOperationParams = {
                unitId,
                subUnitId,
                type: SelectionMoveType.MOVE_END,
                selections: [{ range: rangeToMove, primary: beforePrimary, style: null }],
            };

            redos.push({ id: SetSelectionsOperation.id, params: setSelectionsParam });
            undos.push({ id: SetSelectionsOperation.id, params: undoSetSelectionsParam });
        }

        redos.push(...interceptorCommands.redos);
        undos.push(...interceptorCommands.undos);

        const result = sequenceExecute(redos, commandService);

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: unitId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }

        return true;
    },
};

function covertRangeToSelection(range: IRange): ISelectionWithStyle {
    return {
        range,
        primary: null,
        style: null,
    };
}
