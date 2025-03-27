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

import type { IUniverInstanceService, Nullable } from '@univerjs/core';
import type {
    Engine,
    IRenderContext,
    IRenderManagerService,
    Rect,
    Scene,
    Spreadsheet,
    SpreadsheetColumnHeader,
    SpreadsheetHeader,
    SpreadsheetSkeleton,
    Viewport,
} from '@univerjs/engine-render';
import { UniverInstanceType, Workbook } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';

import { SHEET_VIEW_KEY } from '../../common/keys';

export interface ISheetObjectParam {
    spreadsheet: Spreadsheet;
    spreadsheetRowHeader: SpreadsheetHeader;
    spreadsheetColumnHeader: SpreadsheetColumnHeader;
    /**
     * sheet corner: a rect which placed on the intersection of rowHeader & columnHeader
     */
    spreadsheetLeftTopPlaceholder: Rect;
    scene: Scene;
    engine: Engine;
}

function isRenderManagerService(renderManagerService: IRenderManagerService | IRenderContext): renderManagerService is IRenderManagerService {
    return typeof (renderManagerService as IRenderContext).isMainScene === 'undefined';
}

/**
 * Get render objects of a spreadsheet.
 */
export function getSheetObject(
    univerInstanceService: IUniverInstanceService | Workbook,
    renderManagerService: IRenderManagerService | IRenderContext
): Nullable<ISheetObjectParam> {
    const workbook = univerInstanceService instanceof Workbook
        ? univerInstanceService
        : univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
    if (!workbook) return null;

    const unitId = workbook.getUnitId();

    let components, mainComponent, scene, engine;
    if (isRenderManagerService(renderManagerService)) {
        const currentRender = renderManagerService.getRenderById(unitId);
        if (currentRender == null) return null;
        components = currentRender.components;
        components = currentRender.components;
        mainComponent = currentRender.mainComponent;
        scene = currentRender.scene;
        engine = currentRender.engine;
    } else {
        components = renderManagerService.components;
        mainComponent = renderManagerService.mainComponent;
        scene = renderManagerService.scene;
        engine = renderManagerService.engine;
    }

    if (!components || !mainComponent) return null;

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

export function getCoordByCell(row: number, col: number, scene: Scene, skeleton: SpreadsheetSkeleton) {
    const { startX, startY, endX, endY } = skeleton.getCellWithCoordByIndex(row, col);
    return { startX, startY, endX, endY };
}

export function getCoordByOffset(
    evtOffsetX: number,
    evtOffsetY: number,
    scene: Scene,
    skeleton: SpreadsheetSkeleton,
    viewport?: Viewport,
    closeFirst?: boolean
) {
    const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([evtOffsetX, evtOffsetY]));

    const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

    const scrollXY = scene.getScrollXYInfoByViewport(relativeCoords, viewport);

    const { scaleX, scaleY } = scene.getAncestorScale();

    const moveActualSelection = skeleton.getCellIndexByOffset(
        newEvtOffsetX,
        newEvtOffsetY,
        scaleX,
        scaleY,
        scrollXY,
        { closeFirst }
    );

    const { row, column } = moveActualSelection;

    const startCell = skeleton.getNoMergeCellWithCoordByIndex(row, column);

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
    const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([evtOffsetX, evtOffsetY]));

    const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

    const scrollXY = scene.getScrollXYInfoByViewport(relativeCoords, viewMain);
    const { scaleX, scaleY } = scene.getAncestorScale();

    const { x: scrollX, y: scrollY } = scrollXY;

    const offsetX = evtOffsetX / scaleX + scrollX;

    const offsetY = evtOffsetY / scaleY + scrollY;

    return { x: offsetX, y: offsetY };
}
