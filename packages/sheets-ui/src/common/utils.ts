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

import type { ICellData, IMutationInfo, IRange, Nullable, Worksheet } from '@univerjs/core';
import { ObjectMatrix } from '@univerjs/core';
import type { Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { Vector2 } from '@univerjs/engine-render';
import type { ISetRangeValuesMutationParams } from '@univerjs/sheets';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';

export function checkCellContentInRanges(worksheet: Worksheet, ranges: IRange[]): boolean {
    return ranges.some((range) => checkCellContentInRange(worksheet, range));
}

export function checkCellContentInRange(worksheet: Worksheet, range: IRange): boolean {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);

    let someCellGoingToBeRemoved = false;
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && (row !== startRow || col !== startColumn) && worksheet.cellHasValue(cellData)) {
            someCellGoingToBeRemoved = true;
            return false;
        }
    });
    return someCellGoingToBeRemoved;
}

export function getClearContentMutationParamsForRanges(
    accessor: IAccessor,
    unitId: string,
    worksheet: Worksheet,
    ranges: IRange[]
): { undos: IMutationInfo[]; redos: IMutationInfo[] } {
    const undos: IMutationInfo[] = [];
    const redos: IMutationInfo[] = [];

    const subUnitId = worksheet.getSheetId();

    // Use the following file as a reference.
    // packages/sheets/src/commands/commands/clear-selection-all.command.ts
    // packages/sheets/src/commands/mutations/set-range-values.mutation.ts
    ranges.forEach((range) => {
        const redoMatrix = getClearContentMutationParamForRange(worksheet, range);
        const redoMutationParams: ISetRangeValuesMutationParams = {
            unitId,
            subUnitId,
            cellValue: redoMatrix.getData(),
        };
        const undoMutationParams: ISetRangeValuesMutationParams = SetRangeValuesUndoMutationFactory(
            accessor,
            redoMutationParams
        );

        undos.push({ id: SetRangeValuesMutation.id, params: undoMutationParams });
        redos.push({ id: SetRangeValuesMutation.id, params: redoMutationParams });
    });

    return {
        undos,
        redos,
    };
}

export function getClearContentMutationParamForRange(
    worksheet: Worksheet,
    range: IRange
): ObjectMatrix<Nullable<ICellData>> {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn);
    const redoMatrix = new ObjectMatrix<Nullable<ICellData>>();
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && (row !== startRow || col !== startColumn)) {
            redoMatrix.setValue(row, col, null);
        }
    });

    return redoMatrix;
}

export function getCellIndexByOffsetWithMerge(offsetX: number, offsetY: number, scene: Scene, skeleton: SpreadsheetSkeleton) {
    const activeViewport = scene.getActiveViewportByCoord(
        Vector2.FromArray([offsetX, offsetY])
    );

    if (!activeViewport) {
        return;
    }

    const { scaleX, scaleY } = scene.getAncestorScale();

    const scrollXY = {
        x: activeViewport.actualScrollX,
        y: activeViewport.actualScrollY,
    };

    const cellPos = skeleton.getCellPositionByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);

    const mergeCell = skeleton.mergeData.find((range) => {
        const { startColumn, startRow, endColumn, endRow } = range;
        return cellPos.row >= startRow && cellPos.column >= startColumn && cellPos.row <= endRow && cellPos.column <= endColumn;
    });

    const params = {
        actualRow: mergeCell ? mergeCell.startRow : cellPos.row,
        actualCol: mergeCell ? mergeCell.startColumn : cellPos.column,
        mergeCell,
        row: cellPos.row,
        col: cellPos.column,
    };

    return params;
}
