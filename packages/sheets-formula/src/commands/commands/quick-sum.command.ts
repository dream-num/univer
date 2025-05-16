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

import type { IAccessor, ICellData, ICommand } from '@univerjs/core';
import type { ISetRangeValuesCommandParams, ISetSelectionsOperationParams } from '@univerjs/sheets';
import { CommandType, ICommandService, IUniverInstanceService, ObjectMatrix, Rectangle, sequenceExecuteAsync } from '@univerjs/core';
import { serializeRange } from '@univerjs/engine-formula';
import { alignToMergedCellsBorders, expandToContinuousRange, findFirstNonEmptyCell, getSheetCommandTarget, SetRangeValuesCommand, SetSelectionsOperation, SheetsSelectionsService } from '@univerjs/sheets';

/**
 * Tries to insert =SUM formulas in selection regions.
 */
export const QuickSumCommand: ICommand = {
    id: 'sheets-formula.command.quick-sum',
    type: CommandType.COMMAND,
    handler: async (accessor: IAccessor) => {
        const selectionsService = accessor.get(SheetsSelectionsService);
        const currentSelection = selectionsService.getCurrentLastSelection();
        if (!currentSelection) return false;

        const univerInstanceService = accessor.get(IUniverInstanceService);
        const target = getSheetCommandTarget(univerInstanceService);
        if (!target) return false;

        const range = currentSelection.range;
        const { worksheet } = target;
        let firstCell = findFirstNonEmptyCell(range, worksheet);
        if (!firstCell) return false;

        firstCell = alignToMergedCellsBorders(firstCell, worksheet);
        const targetRange = expandToContinuousRange({
            startRow: firstCell.startRow,
            startColumn: firstCell.startColumn,
            endRow: range.endRow,
            endColumn: range.endColumn,
        }, { left: true, right: true, up: true, down: true }, worksheet);

        const setValueMatrix = new ObjectMatrix<ICellData>();

        const lastRow = alignToMergedCellsBorders({
            startRow: targetRange.endRow,
            endRow: targetRange.endRow,
            startColumn: targetRange.startColumn,
            endColumn: targetRange.endColumn,
        }, worksheet);
        if (!Rectangle.equals(lastRow, targetRange)) {
            for (const cell of worksheet.iterateByColumn(lastRow)) {
                if (!cell.value || !worksheet.cellHasValue(cell.value)) {
                    setValueMatrix.setValue(cell.row, cell.col, {
                        f: `=SUM(${serializeRange({
                            startColumn: cell.col,
                            endColumn: cell.col,
                            startRow: targetRange.startRow,
                            endRow: cell.row - 1,
                        })})`,
                    });
                }
            }
        }

        const lastColumn = alignToMergedCellsBorders({
            startRow: targetRange.startRow,
            startColumn: targetRange.endColumn,
            endRow: targetRange.endRow,
            endColumn: targetRange.endColumn,
        }, worksheet);
        if (!Rectangle.equals(lastColumn, targetRange)) {
            for (const cell of worksheet.iterateByRow(lastColumn)) {
                if (!cell.value || !worksheet.cellHasValue(cell.value)) {
                    setValueMatrix.setValue(cell.row, cell.col, {
                        f: `=SUM(${serializeRange({
                            startColumn: targetRange.startColumn,
                            endColumn: cell.col - 1,
                            startRow: cell.row,
                            endRow: cell.row,
                        })})`,
                    });
                }
            }
        }

        const commandService = accessor.get(ICommandService);

        return (await sequenceExecuteAsync([
            {
                id: SetRangeValuesCommand.id,
                params: {
                    range: targetRange,
                    value: setValueMatrix.getMatrix(),
                } as ISetRangeValuesCommandParams,
            },
            {
                id: SetSelectionsOperation.id,
                params: {
                    unitId: target.unitId,
                    subUnitId: target.subUnitId,
                    selections: [{
                        range: targetRange,
                        primary: Rectangle.contains(targetRange, currentSelection.primary) ? currentSelection.primary : { ...firstCell, actualRow: firstCell.startRow, actualColumn: firstCell.startColumn },
                        style: null,
                    }],
                } as ISetSelectionsOperationParams,
            },
        ], commandService)).result;
    },
};
