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

import type { ISelectionCell } from '@univerjs/core';
import { IUniverInstanceService, makeCellRangeToRangeData } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

export class MergeCellService {
    constructor(@Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService) {}

    transformCellDataToSelectionData(unitID: string, subUnitId: string, row: number, column: number) {
        const newCellRange = this.getCellInfoInfo(unitID, subUnitId, row, column);

        const newSelectionData = makeCellRangeToRangeData(newCellRange);

        if (!newSelectionData) {
            return;
        }

        return {
            range: newSelectionData,
            primary: newCellRange,
            style: null,
        };
    }

    getMergeData(unitID: string, subUnitId: string) {
        const workbook = this._univerInstanceService.getUniverSheetInstance(unitID);
        const sheet = workbook?.getSheetBySheetId(subUnitId);
        if (!sheet) {
            throw new Error(`unitID:${unitID} subUnitId:${subUnitId}, is not found`);
        }
        const mergeData = sheet.getSnapshot().mergeData;
        if (!mergeData) {
            throw new Error(`mergeData:${subUnitId} is not found`);
        }
        return mergeData;
    }

    rowAcrossMergedCell(unitID: string, subUnitId: string, row: number): boolean {
        return this.getMergeData(unitID, subUnitId).some(
            (mergedCell) => mergedCell.startRow < row && row <= mergedCell.endRow
        );
    }

    columnAcrossMergedCell(unitID: string, subUnitId: string, col: number): boolean {
        return this.getMergeData(unitID, subUnitId).some(
            (mergedCell) => mergedCell.startColumn < col && col <= mergedCell.endColumn
        );
    }

    getCellInfoInfo(unitID: string, subUnitId: string, row: number, col: number): ISelectionCell {
        const mergeData = this.getMergeData(unitID, subUnitId);
        let isMerged = false; // The upper left cell only renders the content
        let isMergedMainCell = false;
        let newEndRow = row;
        let newEndColumn = col;
        let mergeRow = row;
        let mergeColumn = col;

        if (mergeData == null) {
            return {
                actualRow: row,
                actualColumn: col,
                isMergedMainCell,
                isMerged,
                endRow: newEndRow,
                endColumn: newEndColumn,
                startRow: mergeRow,
                startColumn: mergeColumn,
            };
        }

        for (let i = 0; i < mergeData.length; i++) {
            const {
                startRow: startRowMerge,
                endRow: endRowMerge,
                startColumn: startColumnMerge,
                endColumn: endColumnMerge,
            } = mergeData[i];
            if (row === startRowMerge && col === startColumnMerge) {
                newEndRow = endRowMerge;
                newEndColumn = endColumnMerge;
                mergeRow = startRowMerge;
                mergeColumn = startColumnMerge;

                isMergedMainCell = true;
                break;
            }
            if (row >= startRowMerge && row <= endRowMerge && col >= startColumnMerge && col <= endColumnMerge) {
                newEndRow = endRowMerge;
                newEndColumn = endColumnMerge;
                mergeRow = startRowMerge;
                mergeColumn = startColumnMerge;

                isMerged = true;
                break;
            }
        }

        return {
            actualRow: row,
            actualColumn: col,
            isMergedMainCell,
            isMerged,
            endRow: newEndRow,
            endColumn: newEndColumn,
            startRow: mergeRow,
            startColumn: mergeColumn,
        };
    }
}
