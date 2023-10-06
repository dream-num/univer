import {
    Engine,
    IRenderManagerService,
    Rect,
    Scene,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetHeader,
    SpreadsheetSkeleton,
    Vector2,
} from '@univerjs/base-render';
import { ICurrentUniverService, Nullable } from '@univerjs/core';

import { SHEET_VIEW_KEY, VIEWPORT_KEY } from './Const/DEFAULT_SPREADSHEET_VIEW';

export interface ISheetObjectParam {
    spreadsheet: Spreadsheet;
    spreadsheetRowHeader: SpreadsheetHeader;
    spreadsheetColumnHeader: SpreadsheetColumnHeader;
    spreadsheetLeftTopPlaceholder: Rect;
    scene: Scene;
    engine: Engine;
}

export function getSheetObject(
    currentUniverService: ICurrentUniverService,
    renderManagerService: IRenderManagerService
): Nullable<ISheetObjectParam> {
    const workbook = currentUniverService.getCurrentUniverSheetInstance();

    const unitId = workbook.getUnitId();

    const currentRender = renderManagerService.getRenderById(unitId);

    if (currentRender == null) {
        return;
    }

    const { components, mainComponent, scene, engine } = currentRender;

    const spreadsheet = mainComponent as Spreadsheet;
    const spreadsheetRowHeader = components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;
    const spreadsheetColumnHeader = components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
    const spreadsheetLeftTopPlaceholder = components.get(SHEET_VIEW_KEY.LEFT_TOP) as Rect;

    return {
        spreadsheet,
        spreadsheetRowHeader,
        spreadsheetColumnHeader,
        spreadsheetLeftTopPlaceholder,
        scene,
        engine,
    };
}

export function getCoordByOffset(evtOffsetX: number, evtOffsetY: number, scene: Scene, skeleton: SpreadsheetSkeleton) {
    const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

    const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

    const scrollXY = scene.getScrollXYByRelativeCoords(relativeCoords);

    const { scaleX, scaleY } = scene.getAncestorScale();

    const moveActualSelection = skeleton.getCellPositionByOffset(
        newEvtOffsetX,
        newEvtOffsetY,
        scaleX,
        scaleY,
        scrollXY
    );

    const { row, column } = moveActualSelection;

    const startCell = skeleton.getNoMergeCellPositionByIndex(row, column, scaleX, scaleY);

    const { startX, startY, endX, endY } = startCell;

    return {
        startX,
        startY,
        endX,
        endY,
        row,
        column,
    };
}

export function getTransformCoord(evtOffsetX: number, evtOffsetY: number, scene: Scene, skeleton: SpreadsheetSkeleton) {
    const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

    const viewMain = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);

    const scrollXY = scene.getScrollXYByRelativeCoords(relativeCoords, viewMain);
    const { scaleX, scaleY } = scene.getAncestorScale();

    const { x: scrollX, y: scrollY } = scrollXY;

    const offsetX = evtOffsetX / scaleX + scrollX;

    const offsetY = evtOffsetY / scaleY + scrollY;

    return { x: offsetX, y: offsetY };
}
