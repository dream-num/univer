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

import type { IAccessor, ICellData, IMutationInfo, IPosition, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { IBoundRectNoAngle, IRender, Scene, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ICollaborator } from '@univerjs/protocol';
import type { ISetRangeValuesMutationParams, ISheetLocation } from '@univerjs/sheets';
import type { ISheetSkeletonManagerParam } from '../services/sheet-skeleton-manager.service';
import { CellModeEnum, ObjectMatrix } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { SetRangeValuesMutation, SetRangeValuesUndoMutationFactory } from '@univerjs/sheets';

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

export function getClearContentMutationParamForRange(worksheet: Worksheet, range: IRange): ObjectMatrix<Nullable<ICellData>> {
    const { startRow, startColumn, endColumn, endRow } = range;
    const cellMatrix = worksheet.getMatrixWithMergedCells(startRow, startColumn, endRow, endColumn, CellModeEnum.Raw);
    const redoMatrix = new ObjectMatrix<Nullable<ICellData>>();
    let leftTopCellValue: Nullable<ICellData> = null;
    cellMatrix.forValue((row, col, cellData) => {
        if (cellData && row >= startRow && col >= startColumn) {
            if (!leftTopCellValue && worksheet.cellHasValue(cellData) && (cellData.v !== '' || (cellData.p?.body?.dataStream?.length ?? 0) > 2)) {
                leftTopCellValue = cellData;
            }
            redoMatrix.setValue(row, col, null);
        }
    });
    redoMatrix.setValue(startRow, startColumn, leftTopCellValue);

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

    const cellIndex = skeleton.getCellIndexByOffset(offsetX, offsetY, scaleX, scaleY, scrollXY);

    // const mergeCell = skeleton.mergeData.find((range) => {
    //     const { startColumn, startRow, endColumn, endRow } = range;
    //     return cellPos.row >= startRow && cellPos.column >= startColumn && cellPos.row <= endRow && cellPos.column <= endColumn;
    // });
    const mergeCell = skeleton.worksheet.getMergedCell(cellIndex.row, cellIndex.column);

    const params = {
        actualRow: mergeCell ? mergeCell.startRow : cellIndex.row,
        actualCol: mergeCell ? mergeCell.startColumn : cellIndex.column,
        mergeCell,
        row: cellIndex.row,
        col: cellIndex.column,
    };

    return params;
}

export function getViewportByCell(row: number, column: number, scene: Scene, worksheet: Worksheet) {
    const freeze = worksheet.getFreeze();
    if (!freeze || (freeze.startRow <= 0 && freeze.startColumn <= 0)) {
        return scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
    }

    if (row >= freeze.startRow && column >= freeze.startColumn) {
        return scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
    }

    if (row < freeze.startRow && column < freeze.startColumn) {
        return scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP);
    }

    if (row < freeze.startRow && column >= freeze.startColumn) {
        return scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP);
    }

    if (row >= freeze.startRow && column < freeze.startColumn) {
        return scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT);
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
    const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
    if (!viewMain) {
        return {
            x,
            y,
        };
    }
    const freeze = worksheet.getFreeze();
    const { startColumn, startRow, xSplit, ySplit } = freeze;
    // freeze start
    const startSheetView = skeleton.getNoMergeCellWithCoordByIndex(startRow - ySplit, startColumn - xSplit, false);
    // freeze end
    const endSheetView = skeleton.getNoMergeCellWithCoordByIndex(startRow, startColumn, false);
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

export function getCellRealRange(workbook: Workbook, worksheet: Worksheet, skeleton: SpreadsheetSkeleton, row: number, col: number) {
    let actualRow = row;
    let actualCol = col;

    skeleton.overflowCache.forValue((r, c, range) => {
        if (range.startRow <= actualRow && range.endRow >= actualRow && range.startColumn <= actualCol && range.endColumn >= actualCol) {
            actualCol = c;
            actualRow = r;
        }
    });

    const actualCell = skeleton.getCellWithCoordByIndex(actualRow, actualCol);

    const location: ISheetLocation = {
        unitId: workbook.getUnitId(),
        subUnitId: worksheet.getSheetId(),
        workbook,
        worksheet,
        row: actualCell.actualRow,
        col: actualCell.actualColumn,
    };

    return location;
}

export function getHoverCellPosition(currentRender: IRender, workbook: Workbook, worksheet: Worksheet, skeletonParam: ISheetSkeletonManagerParam, offsetX: number, offsetY: number) {
    const { scene } = currentRender;

    const unitId = workbook.getUnitId();
    const { skeleton, sheetId } = skeletonParam;

    const cellIndex = getCellIndexByOffsetWithMerge(offsetX, offsetY, scene, skeleton);

    if (!cellIndex) {
        return null;
    }

    let { actualCol, actualRow } = cellIndex;
    const originLocation = {
        unitId,
        subUnitId: sheetId,
        workbook,
        worksheet,
        row: actualRow,
        col: actualCol,
    };

    skeleton.overflowCache.forValue((r, c, range) => {
        if (range.startRow <= actualRow && range.endRow >= actualRow && range.startColumn <= actualCol && range.endColumn >= actualCol) {
            actualCol = c;
            actualRow = r;
        }
    });

    const actualCell = skeleton.getCellWithCoordByIndex(actualRow, actualCol);
    const location: ISheetLocation = getCellRealRange(workbook, worksheet, skeleton, actualRow, actualCol);
    let anchorCell: IRange;
    if (actualCell.mergeInfo) {
        anchorCell = actualCell.mergeInfo;
    } else {
        anchorCell = {
            startRow: location.row,
            endRow: location.row,
            startColumn: location.col,
            endColumn: location.col,
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
        startX: (skeleton.getOffsetByColumn(anchorCell.startColumn - 1) - scrollXY.x) * scaleX,
        endX: (skeleton.getOffsetByColumn(anchorCell.endColumn) - scrollXY.x) * scaleX,
        startY: (skeleton.getOffsetByRow(anchorCell.startRow - 1) - scrollXY.y) * scaleY,
        endY: (skeleton.getOffsetByRow(anchorCell.endRow) - scrollXY.y) * scaleY,
    };

    return {
        position,
        location: originLocation,
        overflowLocation: location,
    };
}
