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

import type { ICommand, IRange, Workbook } from '@univerjs/core';
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
    UniverInstanceType,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import type { IMoveColumnsMutationParams, IMoveRowsMutationParams } from '../mutations/move-rows-cols.mutation';
import {
    MoveColsMutation,
    MoveColsMutationUndoFactory,
    MoveRowsMutation,
    MoveRowsMutationUndoFactory,
} from '../mutations/move-rows-cols.mutation';
import type { ISetSelectionsOperationParams } from '../operations/selection.operation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { columnAcrossMergedCell, rowAcrossMergedCell } from './utils/merged-cell-util';
import { alignToMergedCellsBorders, getPrimaryForRange } from './utils/selection-utils';

export interface IMoveRowsCommandParams {
    fromRange: IRange;
    toRange: IRange;
}

export const MoveRowsCommandId = 'sheet.command.move-rows' as const;
/**
 * Command to move the selected rows (must currently selected) to the specified row.
 */
export const MoveRowsCommand: ICommand<IMoveRowsCommandParams> = {
    id: MoveRowsCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IMoveRowsCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        const {
            fromRange: { startRow: fromRow },
            toRange: { startRow: toRow },
        } = params;
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
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

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
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range: destSelection, primary: getPrimaryForRange(destSelection, worksheet), style: null }],
        };
        const undoSetSelectionsParam: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range: rangeToMove, primary: beforePrimary, style: null }],
        };

        const commandService = accessor.get(ICommandService);

        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: MoveRowsCommand.id, params });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            { id: MoveRowsMutation.id, params: moveRowsParams },
            { id: SetSelectionsOperation.id, params: setSelectionsParam },
            ...interceptorCommands.redos,
        ];

        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: MoveRowsMutation.id, params: undoMoveRowsParams },
            { id: SetSelectionsOperation.id, params: undoSetSelectionsParam },
            ...interceptorCommands.undos,
        ];

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
    fromRange: IRange;
    toRange: IRange;
}
export const MoveColsCommandId = 'sheet.command.move-cols' as const;

export const MoveColsCommand: ICommand<IMoveColsCommandParams> = {
    id: MoveColsCommandId,
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IMoveColsCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        const {
            fromRange: { startColumn: fromCol },
            toRange: { startColumn: toCol },
        } = params;
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
        const workbook = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (!workbook) {
            return false;
        }
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

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
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range: destSelection, primary: getPrimaryForRange(destSelection, worksheet), style: null }],
        };
        const undoSetSelectionsParam: ISetSelectionsOperationParams = {
            unitId,
            subUnitId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range: rangeToMove, primary: beforePrimary, style: null }],
        };

        const commandService = accessor.get(ICommandService);

        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: MoveColsCommand.id, params });

        const redos = [
            ...(interceptorCommands.preRedos ?? []),
            { id: MoveColsMutation.id, params: moveColsParams },
            { id: SetSelectionsOperation.id, params: setSelectionsParam },
            ...interceptorCommands.redos,
        ];

        const undos = [
            ...(interceptorCommands.preUndos ?? []),
            { id: MoveColsMutation.id, params: undoMoveColsParams },
            { id: SetSelectionsOperation.id, params: undoSetSelectionsParam },
            ...interceptorCommands.undos,
        ];

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
