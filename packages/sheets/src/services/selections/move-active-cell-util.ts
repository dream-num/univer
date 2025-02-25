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

import type { IRange, ISelectionCell, Worksheet } from '@univerjs/core';
import type { ISelectionWithStyle } from '../../basics';
import { Direction, Range, RANGE_TYPE, Rectangle } from '@univerjs/core';

const getPrimaryCellUp = (scopeRange: IRange, worksheet: Worksheet, currentPrimary: ISelectionCell, step: number = 1, isFindNext: boolean = true, isGoBack: boolean = true): IRange | undefined => {
    const movedRange = Range.transformRange(scopeRange, worksheet);
    const { startRow, endRow } = movedRange;
    let next = currentPrimary.startRow - step;
    let nextCellMergedInfo = worksheet.getMergedCell(next, currentPrimary.startColumn);
    let isMainCell = !nextCellMergedInfo || (nextCellMergedInfo.startRow === next && nextCellMergedInfo.startColumn === currentPrimary.startColumn);
    while (!worksheet.getRowVisible(next) || !isMainCell) {
        next--;
        nextCellMergedInfo = worksheet.getMergedCell(next, currentPrimary.startColumn);
        isMainCell = !nextCellMergedInfo || (nextCellMergedInfo.startRow === next && nextCellMergedInfo.startColumn === currentPrimary.startColumn);
    }
    if (next >= startRow) {
        return { ...currentPrimary, startRow: next, endRow: next };
    } else if (isGoBack) {
        const newPrimary = { ...currentPrimary, startRow: endRow, endRow };
        // eslint-disable-next-line ts/no-use-before-define
        return getPrimaryCellLeft(scopeRange, worksheet, newPrimary, step, isFindNext, false);
    }
};

const getPrimaryCellDown = (scopeRange: IRange, worksheet: Worksheet, currentPrimary: ISelectionCell, step: number = 1, isFindNext: boolean = true, isGoBack: boolean = true): IRange | undefined => {
    const movedRange = Range.transformRange(scopeRange, worksheet);
    const { startRow, endRow } = movedRange;
    let next = currentPrimary.endRow + step;
    let nextCellMergedInfo = worksheet.getMergedCell(next, currentPrimary.startColumn);
    let isMainCell = !nextCellMergedInfo || (nextCellMergedInfo.startRow === next && nextCellMergedInfo.startColumn === currentPrimary.startColumn);
    while (!worksheet.getRowVisible(next) || !isMainCell) {
        next++;
        nextCellMergedInfo = worksheet.getMergedCell(next, currentPrimary.startColumn);
        isMainCell = !nextCellMergedInfo || (nextCellMergedInfo.startRow === next && nextCellMergedInfo.startColumn === currentPrimary.startColumn);
    }
    if (next <= endRow) {
        return { ...currentPrimary, startRow: next, endRow: next };
    } else if (isGoBack) {
        const newPrimary = { ...currentPrimary, startRow, endRow: startRow };
        // eslint-disable-next-line ts/no-use-before-define
        return getPrimaryCellRight(scopeRange, worksheet, newPrimary, step, isFindNext, false);
    }
};

const getPrimaryCellLeft = (scopeRange: IRange, worksheet: Worksheet, currentPrimary: ISelectionCell, step: number = 1, isFindNext: boolean = true, isGoBack: boolean = true): IRange | undefined => {
    const movedRange = Range.transformRange(scopeRange, worksheet);
    const { startColumn, endColumn } = movedRange;
    let next = currentPrimary.startColumn - step;
    let nextCellMergedInfo = worksheet.getMergedCell(currentPrimary.startRow, next);
    let isMainCell = !nextCellMergedInfo || (nextCellMergedInfo.startRow === currentPrimary.startRow && nextCellMergedInfo.startColumn === next);
    while (!worksheet.getColVisible(next) || !isMainCell) {
        next--;
        nextCellMergedInfo = worksheet.getMergedCell(currentPrimary.startRow, next);
        isMainCell = !nextCellMergedInfo || (nextCellMergedInfo.startRow === currentPrimary.startRow && nextCellMergedInfo.startColumn === next);
    }
    if (next >= startColumn) {
        return { ...currentPrimary, startColumn: next, endColumn: next };
    } else if (isGoBack) {
        const newPrimary = { ...currentPrimary, startColumn: endColumn, endColumn };
        return getPrimaryCellUp(scopeRange, worksheet, newPrimary, step, isFindNext, false);
    }
};

const getPrimaryCellRight = (scopeRange: IRange, worksheet: Worksheet, currentPrimary: ISelectionCell, step: number = 1, isFindNext: boolean = true, isGoBack: boolean = true): IRange | undefined => {
    const movedRange = Range.transformRange(scopeRange, worksheet);
    const { startColumn, endColumn } = movedRange;
    let next = currentPrimary.endColumn + step;
    let nextCellMergedInfo = worksheet.getMergedCell(currentPrimary.startRow, next);
    let isMainCell = !nextCellMergedInfo || (nextCellMergedInfo.startRow === currentPrimary.startRow && nextCellMergedInfo.startColumn === next);
    while (!worksheet.getColVisible(next) || !isMainCell) {
        next++;
        nextCellMergedInfo = worksheet.getMergedCell(currentPrimary.startRow, next);
        isMainCell = !nextCellMergedInfo || (nextCellMergedInfo.startRow === currentPrimary.startRow && nextCellMergedInfo.startColumn === next);
    }
    if (next <= endColumn) {
        return { ...currentPrimary, endColumn: next, startColumn: next };
    } else if (isGoBack) {
        const newPrimary = { ...currentPrimary, startColumn, endColumn: startColumn };
        return getPrimaryCellDown(scopeRange, worksheet, newPrimary, step, isFindNext, false);
    }
};

function getCellAtRowCol(row: number, col: number, worksheet: Worksheet): ISelectionCell {
    let destRange: ISelectionCell | null = null;

    const matrix = worksheet.getMatrixWithMergedCells(row, col, row, col);
    matrix.forValue((row, col, value) => {
        destRange = {
            actualRow: row,
            actualColumn: col,
            startRow: row,
            startColumn: col,
            isMerged: value.rowSpan !== undefined || value.colSpan !== undefined,
            isMergedMainCell: value.rowSpan !== undefined && value.colSpan !== undefined,
            endRow: row + (value.rowSpan !== undefined ? value.rowSpan - 1 : 0),
            endColumn: col + (value.colSpan !== undefined ? value.colSpan - 1 : 0),
            rangeType: RANGE_TYPE.NORMAL,
        };

        return false;
    });

    if (!destRange) {
        return {
            actualColumn: col,
            actualRow: row,
            startRow: row,
            startColumn: col,
            endRow: row,
            endColumn: col,
            isMerged: false,
            isMergedMainCell: false,
            rangeType: RANGE_TYPE.NORMAL,
        };
    }

    return destRange;
}

const getPrimaryCell = (scopeRange: IRange, worksheet: Worksheet, currentPrimary: ISelectionCell, direction: Direction, step: number = 1): IRange | undefined => {
    switch (direction) {
        case Direction.UP:
            return getPrimaryCellUp(scopeRange, worksheet, currentPrimary, step);
        case Direction.DOWN:
            return getPrimaryCellDown(scopeRange, worksheet, currentPrimary, step);
        case Direction.LEFT:
            return getPrimaryCellLeft(scopeRange, worksheet, currentPrimary, step);
        case Direction.RIGHT:
            return getPrimaryCellRight(scopeRange, worksheet, currentPrimary, step);
    }
};

/**
 * Get the next primary cell in the specified direction. If the primary cell not exists in selections, return null.
 * @param selections The current selections.
 * @param {Direction} direction The direction to move the primary cell.The enum value is maybe one of the following: UP(0),RIGHT(1), DOWN(2), LEFT(3).
 * @param {Worksheet} worksheet The worksheet instance.
 * @returns {IRange | null} The next primary cell.
 */
export const getNextPrimaryCell = (selections: ISelectionWithStyle[], direction: Direction, worksheet: Worksheet): IRange | null => {
    let activeSelection;
    let activeIndex = -1;
    let currentPrimary;
    for (let i = 0; i < selections.length; i++) {
        if (selections[i].primary) {
            activeSelection = selections[i];
            activeIndex = i;
            currentPrimary = activeSelection.primary;
            break;
        }
    }

    if (activeIndex === -1) {
        return null;
    }
    const isReverse = direction === Direction.LEFT || direction === Direction.UP;
     // for shift tab or shift enter, the direction should be reversed. so we need find the previous selection.
    const nextIndex = isReverse
        ? (activeIndex - 1 >= 0 ? activeIndex - 1 : selections.length - 1)
        : activeIndex + 1 < selections.length ? activeIndex + 1 : 0;
    const nextSelection = selections[nextIndex];

    if (!activeSelection || !currentPrimary) {
        return null;
    }
    const primary = { ...currentPrimary };
    const { startRow, startColumn, endRow, endColumn } = activeSelection.range;

    const isLastCell = isReverse ? primary.startRow === startRow && primary.startColumn === startColumn : primary.endRow === endRow && primary.endColumn === endColumn;
    const useLeftTopAsDest = isLastCell && isReverse;

    // if the current selection is a single cell, we should not move the primary cell.
    if (!Rectangle.equals(activeSelection.range, primary)) {
        const next = isLastCell ? nextSelection.range : getPrimaryCell(activeSelection.range, worksheet, primary, direction);
        if (!next) {
            return null;
        }
        const destRange = useLeftTopAsDest ? getCellAtRowCol(next.endRow, next.endColumn, worksheet) : getCellAtRowCol(next.startRow, next.startColumn, worksheet);

        return {
            startRow: destRange.startRow,
            startColumn: destRange.startColumn,
            endRow: destRange.endRow,
            endColumn: destRange.endColumn,
        };
    }

    const destRange = useLeftTopAsDest ? getCellAtRowCol(nextSelection.range.endRow, nextSelection.range.endColumn, worksheet) : getCellAtRowCol(nextSelection.range.startRow, nextSelection.range.startColumn, worksheet);
    return {
        startRow: destRange.startRow,
        startColumn: destRange.startColumn,
        endRow: destRange.endRow,
        endColumn: destRange.endColumn,
    };
};
