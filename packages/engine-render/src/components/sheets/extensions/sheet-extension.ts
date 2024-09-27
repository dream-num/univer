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

import { Rectangle } from '@univerjs/core';
import type { IRange } from '@univerjs/core';

import { getCellByIndex } from '../../../basics/tools';
import { ComponentExtension } from '../../extension';
import type { SpreadsheetSkeleton } from '../sheet-skeleton';

export enum SHEET_EXTENSION_TYPE {
    GRID,
}

/**
 * for distinguish doc & slides extensions, now only used when metric performance.
 */
export const SHEET_EXTENSION_PREFIX = 'sheet-ext-';

export class SheetExtension extends ComponentExtension<SpreadsheetSkeleton, SHEET_EXTENSION_TYPE, IRange[]> {
    override type = SHEET_EXTENSION_TYPE.GRID;

    // cellCache: ObjectMatrix<ISelectionCellWithMergeInfo> = new ObjectMatrix();
    /**
     * @deprecated The function maybe cause performance issue, use spreadsheetSkeleton.getCellByIndexWithNoHeader instead.
     * Get ISelectionCellWithMergeInfo by cell rowIndex and cell columnIndex.
     * The startXY in return value does not include rowHeader and columnHeader.
     * @param rowIndex
     * @param columnIndex
     * @param rowHeightAccumulation
     * @param columnWidthAccumulation
     * @param dataMergeCache
     * @returns {ISelectionCellWithMergeInfo} cell Position & mergeInfo
     */
    getCellByIndex(
        rowIndex: number,
        columnIndex: number,
        rowHeightAccumulation: number[],
        columnWidthAccumulation: number[],
        dataMergeCache: IRange[]
    ) {
        // TODO @lumixraku: there are two coords in sheet!! This one does not include rowHeader and columnHeader. Should keep coord to be only one.
        const cell = getCellByIndex(rowIndex, columnIndex, rowHeightAccumulation, columnWidthAccumulation, dataMergeCache);
        return cell;
    }

    isRenderDiffRangesByCell(rangeP: IRange, diffRanges?: IRange[]) {
        if (diffRanges == null || diffRanges.length === 0) {
            return true;
        }

        for (const range of diffRanges) {
            const { startRow, startColumn, endRow, endColumn } = range;
            const isIntersect = Rectangle.intersects(rangeP, {
                startRow,
                endRow,
                startColumn,
                endColumn,
            });

            if (isIntersect) {
                return true;
            }
        }

        return false;
    }

    // isRenderDiffRangesByColumn(column: number, diffRanges?: IRange[]) {
    //     if (diffRanges == null || diffRanges.length === 0) {
    //         return true;
    //     }

    //     for (const range of diffRanges) {
    //         const { startColumn, endColumn } = range;
    //         if (column >= startColumn && column <= endColumn) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    isRenderDiffRangesByColumn(curStartColumn: number, curEndColumn: number, diffRanges?: IRange[]) {
        if (diffRanges == null || diffRanges.length === 0) {
            return true;
        }

        for (const range of diffRanges) {
            const { startColumn, endColumn } = range;
            // if (row >= startRow && row <= endRow) {
            //     return true;
            // }
            const isIntersect = Rectangle.intersects(
                {
                    startRow: 0,
                    endRow: 0,
                    startColumn: curStartColumn,
                    endColumn: curEndColumn,
                },
                {
                    startRow: 0,
                    endRow: 0,
                    startColumn,
                    endColumn,
                }
            );

            if (isIntersect) {
                return true;
            }
        }

        return false;
    }

    isRenderDiffRangesByRow(curStartRow: number, curEndRow: number, diffRanges?: IRange[]) {
        if (diffRanges == null || diffRanges.length === 0) {
            return true;
        }

        for (const range of diffRanges) {
            const { startRow, endRow } = range;
            // if (row >= startRow && row <= endRow) {
            //     return true;
            // }
            const isIntersect = Rectangle.intersects(
                {
                    startRow: curStartRow,
                    endRow: curEndRow,
                    startColumn: 0,
                    endColumn: 0,
                },
                {
                    startRow,
                    endRow,
                    startColumn: 0,
                    endColumn: 0,
                }
            );

            if (isIntersect) {
                return true;
            }
        }

        return false;
    }

    /**
     * 传入的 row 范围和 diffRanges 有相交, 返回 true
     * @param curStartRow
     * @param curEndRow
     * @param viewranges
     */
    isRowInRanges(curStartRow: number, curEndRow: number, viewranges?: IRange[]) {
        if (viewranges == null || viewranges.length === 0) {
            return true;
        }

        for (const range of viewranges) {
            const { startRow, endRow } = range;
            if (curStartRow >= startRow && curStartRow <= endRow) {
                return true;
            }
            if (curEndRow >= startRow && curEndRow <= endRow) {
                return true;
            }

            const isIntersect = Rectangle.intersects(
                {
                    startRow: curStartRow,
                    endRow: curEndRow,
                    startColumn: 0,
                    endColumn: 0,
                },
                {
                    startRow,
                    endRow,
                    startColumn: 0,
                    endColumn: 0,
                }
            );

            if (isIntersect) {
                return true;
            }
        }

        return false;
    }
}
