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

import type { IMutation, IRange } from '@univerjs/core';
import { CommandType, IUniverInstanceService, Rectangle } from '@univerjs/core';
import type { IAccessor } from '@wendellhu/redi';

// TODO@wzhudev: maybe we should do some error handling in these mutators

export interface IMoveRowsMutationParams {
    workbookId: string;
    worksheetId: string;
    /**
     * The rows to be moved.
     */
    sourceRange: IRange;
    /**
     * The destination range to move the source rows to. Note that the range is before the movement has occurred.
     */
    targetRange: IRange;
}

/**
 * Get an undo mutation for the move rows mutation.
 * @param accessor
 * @param params
 */
export function MoveRowsMutationUndoFactory(
    _accessor: IAccessor,
    params: IMoveRowsMutationParams
): IMoveRowsMutationParams {
    const { workbookId, worksheetId, sourceRange, targetRange } = params;
    const movingBackward = sourceRange.startRow > targetRange.startRow;
    const count = sourceRange.endRow - sourceRange.startRow + 1;
    if (movingBackward) {
        // If is moving backward, target range should be `count` offset.
        return {
            workbookId,
            worksheetId,
            sourceRange: Rectangle.clone(targetRange),
            targetRange: { ...sourceRange, endRow: sourceRange.endRow + count, startRow: sourceRange.startRow + count },
        };
    }
    return {
        workbookId,
        worksheetId,
        targetRange: Rectangle.clone(sourceRange),
        sourceRange: Rectangle.clone(targetRange),
    };
}

export const MoveRowsMutation: IMutation<IMoveRowsMutationParams> = {
    id: 'sheet.mutation.move-rows',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { workbookId, worksheetId, sourceRange, targetRange } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const univerSheet = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!univerSheet) {
            throw new Error('[MoveRowMutation] univerSheet is null!');
        }

        const worksheet = univerSheet.getSheetBySheetId(worksheetId);
        if (!worksheet) {
            throw new Error('[MoveRowMutation] worksheet is null!');
        }

        const fromRow = sourceRange.startRow;
        const count = sourceRange.endRow - sourceRange.startRow + 1;
        const toRow = targetRange.startRow;

        // move row properties by directing mutating
        const rowWrapper = worksheet.getRowManager().getRowData();
        rowWrapper.move(fromRow, count, toRow);

        // move cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.moveRows(fromRow, count, toRow);

        return true;
    },
};

export interface IMoveColumnsMutationParams {
    workbookId: string;
    worksheetId: string;
    /**
     * The cols to be moved.
     */
    sourceRange: IRange;
    /**
     * The destination range to move the source cols to. Note that the range is before the movement has occurred.
     */
    targetRange: IRange;
}

export function MoveColsMutationUndoFactory(
    _accessor: IAccessor,
    params: IMoveColumnsMutationParams
): IMoveColumnsMutationParams {
    const { workbookId, worksheetId, sourceRange, targetRange } = params;
    const movingBackward = sourceRange.startColumn > targetRange.startColumn;
    const count = sourceRange.endColumn - sourceRange.startColumn + 1;
    if (movingBackward) {
        // If is moving backward, target range should be `count` offset.
        return {
            workbookId,
            worksheetId,
            sourceRange: Rectangle.clone(targetRange),
            targetRange: {
                ...sourceRange,
                endColumn: sourceRange.endColumn + count,
                startColumn: sourceRange.startColumn + count,
            },
        };
    }
    return {
        workbookId,
        worksheetId,
        targetRange: Rectangle.clone(sourceRange),
        sourceRange: Rectangle.clone(targetRange),
    };
}

export const MoveColsMutation: IMutation<IMoveColumnsMutationParams> = {
    id: 'sheet.mutation.move-columns',
    type: CommandType.MUTATION,
    handler: (accessor, params) => {
        const { workbookId, worksheetId, sourceRange, targetRange } = params;
        const univerInstanceService = accessor.get(IUniverInstanceService);

        const univerSheet = univerInstanceService.getUniverSheetInstance(workbookId);
        if (!univerSheet) {
            throw new Error('[MoveColumnMutation] univerSheet is null!');
        }

        const worksheet = univerSheet.getSheetBySheetId(worksheetId);
        if (!worksheet) {
            throw new Error('[MoveColumnMutation] worksheet is null!');
        }

        const fromCol = sourceRange.startColumn;
        const count = sourceRange.endColumn - sourceRange.startColumn + 1;
        const toCol = targetRange.startColumn;

        // move column properties by directing mutating
        const columnWrapper = worksheet.getColumnManager().getColumnData();
        columnWrapper.move(fromCol, count, toCol);

        // move cells contents by directly mutating worksheetCellMatrix
        const cellMatrix = worksheet.getCellMatrix();
        cellMatrix.moveColumns(fromCol, count, toCol);

        return true;
    },
};
