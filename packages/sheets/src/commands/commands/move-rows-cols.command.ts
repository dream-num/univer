/**
 * Copyright 2023 DreamNum Inc.
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

import type { ICommand, IRange } from '@univerjs/core';
import {
    CommandType,
    ErrorService,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    RANGE_TYPE,
    Rectangle,
    sequenceExecute,
    Tools,
} from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

import type {
    IAddWorksheetMergeMutationParams,
    IRemoveWorksheetMergeMutationParams,
} from '../../basics/interfaces/mutation-interface';
import { NORMAL_SELECTION_PLUGIN_NAME, SelectionManagerService } from '../../services/selection-manager.service';
import { SheetInterceptorService } from '../../services/sheet-interceptor/sheet-interceptor.service';
import { AddMergeUndoMutationFactory, AddWorksheetMergeMutation } from '../mutations/add-worksheet-merge.mutation';
import type { IMoveColumnsMutationParams, IMoveRowsMutationParams } from '../mutations/move-rows-cols.mutation';
import {
    MoveColsMutation,
    MoveColsMutationUndoFactory,
    MoveRowsMutation,
    MoveRowsMutationUndoFactory,
} from '../mutations/move-rows-cols.mutation';
import {
    RemoveMergeUndoMutationFactory,
    RemoveWorksheetMergeMutation,
} from '../mutations/remove-worksheet-merge.mutation';
import type { ISetSelectionsOperationParams } from '../operations/selection.operation';
import { SetSelectionsOperation } from '../operations/selection.operation';
import { columnAcrossMergedCell, rowAcrossMergedCell } from './utils/merged-cell-util';
import { alignToMergedCellsBorders, getPrimaryForRange } from './utils/selection-util';

export interface IMoveRowsCommandParams {
    fromRow: number;
    toRow: number;
}

/**
 * Command to move the selected rows (must currently selected) to the specified row.
 */
export const MoveRowsCommand: ICommand<IMoveRowsCommandParams> = {
    id: 'sheet.command.move-rows',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IMoveRowsCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        const { fromRow, toRow } = params;
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
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        const errorService = accessor.get(ErrorService);
        // Forbid action when some parts of a merged cell are selected.
        const rangeToMove = filteredSelections[0].range;
        const beforePrimary = filteredSelections[0].primary;
        const alignedRange = alignToMergedCellsBorders(rangeToMove, worksheet, false);
        if (!Rectangle.equals(rangeToMove, alignedRange)) {
            errorService.emit('Only part of a merged cell is selected.');
            return false;
        }

        if (rowAcrossMergedCell(toRow, worksheet)) {
            errorService.emit('Across a merged cell.');
            return false;
        }

        const destinationRange: IRange = {
            ...rangeToMove,
            startRow: toRow,
            endRow: toRow + rangeToMove.endRow - rangeToMove.startRow,
        };
        const moveRowsParams: IMoveRowsMutationParams = {
            workbookId,
            worksheetId,
            sourceRange: rangeToMove,
            targetRange: destinationRange,
        };
        const undoMoveRowsParams = MoveRowsMutationUndoFactory(accessor, moveRowsParams);

        // we could just move the merged cells because other situations are not allowed
        // we should only deal with merged cell that is between the range of the rows to move
        const movedLength = toRow - fromRow;
        const moveBackward = movedLength < 0;
        const count = rangeToMove.endRow - rangeToMove.startRow + 1;
        const mergedCells: IRange[] = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergedCells.length; i++) {
            const mergedCell = mergedCells[i];
            const { startRow: mergeStartRow, endRow: mergedEndRow } = mergedCell;
            if (moveBackward) {
                // merged cells between `rangeToMove` to `destination` should be moved forward
                // merged cells in the `rangeToMove` should be moved backward
                if (Rectangle.contains(rangeToMove, mergedCell)) {
                    mergedCell.startRow += movedLength;
                    mergedCell.endRow += movedLength;
                } else if (mergedEndRow < rangeToMove.startRow && mergeStartRow >= destinationRange.startRow) {
                    mergedCell.startRow += count;
                    mergedCell.endRow += count;
                }
            } else {
                // move forward
                if (Rectangle.contains(rangeToMove, mergedCell)) {
                    mergedCell.startRow += movedLength;
                    mergedCell.endRow += movedLength;
                } else if (rangeToMove.endRow < mergeStartRow && mergedEndRow < destinationRange.startRow) {
                    mergedCell.startRow -= count;
                    mergedCell.endRow -= count;
                }
            }
        }
        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: mergedCells,
        };
        const undoAddMergeParams = AddMergeUndoMutationFactory(accessor, addMergeParams);

        // deal with selections
        const destSelection: IRange = moveBackward
            ? destinationRange
            : {
                  ...destinationRange,
                  startRow: destinationRange.startRow - count,
                  endRow: destinationRange.endRow - count,
              };
        const setSelectionsParam: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range: destSelection, primary: getPrimaryForRange(destSelection, worksheet), style: null }],
        };
        const undoSetSelectionsParam: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range: rangeToMove, primary: beforePrimary, style: null }],
        };

        const commandService = accessor.get(ICommandService);

        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: MoveRowsCommand.id, params });

        const redos = [
            { id: MoveRowsMutation.id, params: moveRowsParams },
            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
            { id: AddWorksheetMergeMutation.id, params: addMergeParams },
            { id: SetSelectionsOperation.id, params: setSelectionsParam },
            ...interceptorCommands.redos,
        ];

        const undos = [
            { id: MoveRowsMutation.id, params: undoMoveRowsParams },
            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
            { id: SetSelectionsOperation.id, params: undoSetSelectionsParam },
            ...interceptorCommands.undos,
        ];

        const result = sequenceExecute(redos, commandService);

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }

        return false;
    },
};

export interface IMoveColsCommandParams {
    fromCol: number;
    toCol: number;
}

export const MoveColsCommand: ICommand<IMoveColsCommandParams> = {
    id: 'sheet.command.move-cols',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor, params: IMoveColsCommandParams) => {
        const selectionManagerService = accessor.get(SelectionManagerService);
        const selections = selectionManagerService.getSelections();
        const { fromCol, toCol } = params;
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
        const workbook = univerInstanceService.getCurrentUniverSheetInstance();
        if (!workbook) {
            return false;
        }
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return false;
        }

        const workbookId = workbook.getUnitId();
        const worksheetId = worksheet.getSheetId();

        const errorService = accessor.get(ErrorService);
        // Forbid action when some parts of a merged cell are selected.
        const rangeToMove = filteredSelections[0].range;
        const beforePrimary = filteredSelections[0].primary;
        const alignedRange = alignToMergedCellsBorders(rangeToMove, worksheet, false);
        if (!Rectangle.equals(rangeToMove, alignedRange)) {
            errorService.emit('Only part of a merged cell is selected.');
            return false;
        }

        if (columnAcrossMergedCell(toCol, worksheet)) {
            errorService.emit('Across a merged cell.');
            return false;
        }

        const destinationRange: IRange = {
            ...rangeToMove,
            startColumn: toCol,
            endColumn: toCol + rangeToMove.endColumn - rangeToMove.startColumn,
        };
        const moveColsParams: IMoveColumnsMutationParams = {
            workbookId,
            worksheetId,
            sourceRange: rangeToMove,
            targetRange: destinationRange,
        };
        const undoMoveColsParams = MoveColsMutationUndoFactory(accessor, moveColsParams);

        // we could just move the merged cells because other situations are not allowed
        // we should only deal with merged cell that is between the range of the cols to move
        const count = rangeToMove.endColumn - rangeToMove.startColumn + 1;
        const movedLength = toCol - fromCol;
        const moveBackward = movedLength < 0;

        const mergedCells: IRange[] = Tools.deepClone(worksheet.getMergeData());
        for (let i = 0; i < mergedCells.length; i++) {
            const mergedCell = mergedCells[i];
            const { startColumn: mergeStartCol, endColumn: mergedEndCol } = mergedCell;
            if (moveBackward) {
                // merged cells between `rangeToMove` to `destination` should be moved forward
                // merged cells in the `rangeToMove` should be moved backward
                if (Rectangle.contains(rangeToMove, mergedCell)) {
                    mergedCell.startColumn += movedLength;
                    mergedCell.endColumn += movedLength;
                } else if (mergedEndCol < rangeToMove.startColumn && mergeStartCol >= destinationRange.startColumn) {
                    mergedCell.startColumn += count;
                    mergedCell.endColumn += count;
                }
            } else {
                // move forward
                if (Rectangle.contains(rangeToMove, mergedCell)) {
                    mergedCell.startColumn += movedLength;
                    mergedCell.endColumn += movedLength;
                } else if (rangeToMove.endColumn < mergeStartCol && mergedEndCol < destinationRange.startColumn) {
                    mergedCell.startColumn -= count;
                    mergedCell.endColumn -= count;
                }
            }
        }

        const removeMergeMutationParams: IRemoveWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: Tools.deepClone(worksheet.getMergeData()),
        };
        const undoRemoveMergeMutationParams = RemoveMergeUndoMutationFactory(accessor, removeMergeMutationParams);
        const addMergeParams: IAddWorksheetMergeMutationParams = {
            workbookId,
            worksheetId,
            ranges: mergedCells,
        };
        const undoAddMergeParams = AddMergeUndoMutationFactory(accessor, addMergeParams);

        // deal with selections
        const destSelection: IRange = moveBackward
            ? destinationRange
            : {
                  ...destinationRange,
                  startColumn: destinationRange.startColumn - count,
                  endColumn: destinationRange.endColumn - count,
              };
        const setSelectionsParam: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range: destSelection, primary: getPrimaryForRange(destSelection, worksheet), style: null }],
        };
        const undoSetSelectionsParam: ISetSelectionsOperationParams = {
            workbookId,
            worksheetId,
            pluginName: NORMAL_SELECTION_PLUGIN_NAME,
            selections: [{ range: rangeToMove, primary: beforePrimary, style: null }],
        };

        const commandService = accessor.get(ICommandService);

        const interceptorCommands = sheetInterceptorService.onCommandExecute({ id: MoveColsCommand.id, params });

        const redos = [
            { id: MoveColsMutation.id, params: moveColsParams },
            { id: RemoveWorksheetMergeMutation.id, params: removeMergeMutationParams },
            { id: AddWorksheetMergeMutation.id, params: addMergeParams },
            { id: SetSelectionsOperation.id, params: setSelectionsParam },
            ...interceptorCommands.redos,
        ];

        const undos = [
            { id: MoveColsMutation.id, params: undoMoveColsParams },
            { id: RemoveWorksheetMergeMutation.id, params: undoAddMergeParams },
            { id: AddWorksheetMergeMutation.id, params: undoRemoveMergeMutationParams },
            { id: SetSelectionsOperation.id, params: undoSetSelectionsParam },
            ...interceptorCommands.undos,
        ];

        const result = sequenceExecute(redos, commandService);

        if (result.result) {
            const undoRedoService = accessor.get(IUndoRedoService);
            undoRedoService.pushUndoRedo({
                unitID: workbookId,
                undoMutations: undos,
                redoMutations: redos,
            });
            return true;
        }

        return true;
    },
};
