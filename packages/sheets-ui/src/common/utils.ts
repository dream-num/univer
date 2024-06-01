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

import type { ICellData, IMutationInfo, IPosition, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { ObjectMatrix } from '@univerjs/core';
import { Vector2 } from '@univerjs/engine-render';
import type { ISetRangeValuesMutationParams, ISheetLocation } from '@univerjs/sheets';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';
import type { IAccessor } from '@wendellhu/redi';
import type { IBoundRectNoAngle, IRender, Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ICollaborator } from '@univerjs/protocol';
import type { ISheetSkeletonManagerParam } from '../services/sheet-skeleton-manager.service';
import { VIEWPORT_KEY } from './keys';

export function getUserListEqual(userList1: ICollaborator[], userList2: ICollaborator[]) {
    if (userList1.length !== userList2.length) return false;

    const sorted1 = userList1.sort((a, b) => a.id.localeCompare(b.id));
    const sorted2 = userList2.sort((a, b) => a.id.localeCompare(b.id));

    return sorted1.every((user, index) => {
        return user.subject?.userID === sorted2[index].subject?.userID && user.role === sorted2[index].role;
    });
}

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
        x: activeViewport.viewportScrollX,
        y: activeViewport.viewportScrollY,
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

export function getViewportByCell(row: number, column: number, scene: Scene, worksheet: Worksheet) {
    const freeze = worksheet.getFreeze();
    if (!freeze || (freeze.startRow <= 0 && freeze.startColumn <= 0)) {
        return scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
    }

    if (row > freeze.startRow && column > freeze.startColumn) {
        return scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
    }

    if (row <= freeze.startRow && column <= freeze.startColumn) {
        return scene.getViewport(VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP);
    }

    if (row <= freeze.startRow && column > freeze.startColumn) {
        return scene.getViewport(VIEWPORT_KEY.VIEW_MAIN_TOP);
    }

    if (row > freeze.startRow && column <= freeze.startColumn) {
        return scene.getViewport(VIEWPORT_KEY.VIEW_MAIN_LEFT);
    }
}

export function transformBound2OffsetBound(originBound: IBoundRectNoAngle, scene: Scene, skeleton: SpreadsheetSkeleton, worksheet: Worksheet): IBoundRectNoAngle {
    const topLeft = transformPosition2Offset(originBound.left, originBound.top, scene, skeleton, worksheet);
    const bottomRight = transformPosition2Offset(originBound.right, originBound.bottom, scene, skeleton, worksheet);

    return {
        left: topLeft.x,
        top: topLeft.y,
        right: bottomRight.x,
        bottom: bottomRight.y,
    };
}

export function transformPosition2Offset(x: number, y: number, scene: Scene, skeleton: SpreadsheetSkeleton, worksheet: Worksheet) {
    const { scaleX, scaleY } = scene.getAncestorScale();
    const viewMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
    if (!viewMain) {
        return {
            x,
            y,
        };
    }
    const freeze = worksheet.getFreeze();
    const { startColumn, startRow, xSplit, ySplit } = freeze;
     // freeze start
    const startSheetView = skeleton.getNoMergeCellPositionByIndexWithNoHeader(startRow - ySplit, startColumn - xSplit);
     // freeze end
    const endSheetView = skeleton.getNoMergeCellPositionByIndexWithNoHeader(startRow, startColumn);
    const { rowHeaderWidth, columnHeaderHeight } = skeleton;
    const freezeWidth = endSheetView.startX - startSheetView.startX;
    const freezeHeight = endSheetView.startY - startSheetView.startY;

    const { top, left, viewportScrollX, viewportScrollY } = viewMain;
    let offsetX: number;
    // viewMain or viewTop
    if (x > left) {
        offsetX = (x - viewportScrollX) * scaleX;
    } else {
        offsetX = ((freezeWidth + rowHeaderWidth) - (left - x)) * scaleX;
    }

    let offsetY: number;
    if (y > top) {
        offsetY = (y - viewportScrollY) * scaleY;
    } else {
        offsetY = ((freezeHeight + columnHeaderHeight) - (top - y)) * scaleX;
    }

    return {
        x: offsetX,
        y: offsetY,
    };
}

export function getHoverCellPosition(currentRender: IRender, workbook: Workbook, worksheet: Worksheet, skeletonParam: ISheetSkeletonManagerParam, offsetX: number, offsetY: number) {
    const { scene } = currentRender;

    const { skeleton, sheetId, unitId } = skeletonParam;

    const cellIndex = getCellIndexByOffsetWithMerge(offsetX, offsetY, scene, skeleton);

    if (!cellIndex) {
        return null;
    }

    const { row, col, mergeCell, actualCol, actualRow } = cellIndex;

    const location: ISheetLocation = {
        unitId,
        subUnitId: sheetId,
        workbook,
        worksheet,
        row: actualRow,
        col: actualCol,
    };

    let anchorCell: IRange;

    if (mergeCell) {
        anchorCell = mergeCell;
    } else {
        anchorCell = {
            startRow: row,
            endRow: row,
            startColumn: col,
            endColumn: col,
        };
    }

    const activeViewport = scene.getActiveViewportByCoord(
        Vector2.FromArray([offsetX, offsetY])
    );

    if (!activeViewport) {
        return;
    }

    const { scaleX, scaleY } = scene.getAncestorScale();

    const scrollXY = {
        x: activeViewport.viewportScrollX,
        y: activeViewport.viewportScrollY,
    };

    const position: IPosition = {
        startX: (skeleton.getOffsetByPositionX(anchorCell.startColumn - 1) - scrollXY.x) * scaleX,
        endX: (skeleton.getOffsetByPositionX(anchorCell.endColumn) - scrollXY.x) * scaleX,
        startY: (skeleton.getOffsetByPositionY(anchorCell.startRow - 1) - scrollXY.y) * scaleY,
        endY: (skeleton.getOffsetByPositionY(anchorCell.endRow) - scrollXY.y) * scaleY,
    };

    return {
        position,
        location,
    };
}
