import { Engine } from '@univerjs/base-render';
import { CANVAS_VIEW_KEY } from '@univerjs/base-sheets';
import { ISelectionCellWithCoord } from '@univerjs/core';

export interface ICellPosition {
    left: number;
    top: number;
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
}

export function getPositionOfCurrentCell(currentCell: ISelectionCellWithCoord, renderingEngine: Engine): ICellPosition {
    let startX: number;
    let endX: number;
    let startY: number;
    let endY: number;
    const mergeInfo = currentCell.mergeInfo;
    if (currentCell.isMerged) {
        startX = mergeInfo.startX;
        endX = mergeInfo.endX;
        startY = mergeInfo.startY;
        endY = mergeInfo.endY;
    } else {
        startX = currentCell.startX;
        endX = currentCell.endX;
        startY = currentCell.startY;
        endY = currentCell.endY;
    }

    if (currentCell.isMergedMainCell) {
        endX = mergeInfo.endX;
        endY = mergeInfo.endY;
    }

    const mainScene = renderingEngine.getScene(CANVAS_VIEW_KEY.MAIN_SCENE);
    const scrollX = mainScene?.getViewport(CANVAS_VIEW_KEY.VIEW_TOP)?.actualScrollX || 0;
    const scrollY = mainScene?.getViewport(CANVAS_VIEW_KEY.VIEW_LEFT)?.actualScrollY || 0;

    const canvasElement = renderingEngine.getCanvasElement();
    const sheetContentRect = canvasElement.getBoundingClientRect();

    return {
        left: startX - scrollX,
        top: startY - scrollY + 40, // FIXME: dirty hack here
        minWidth: endX - startX,
        minHeight: endY - startY,
        maxWidth: sheetContentRect.width - startX + scrollX,
        maxHeight: sheetContentRect.height - startY + scrollY,
    };
}
