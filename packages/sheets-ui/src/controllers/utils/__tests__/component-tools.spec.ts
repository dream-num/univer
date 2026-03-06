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

import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import { getCoordByCell, getCoordByOffset, getSheetObject, getTransformCoord } from '../component-tools';

function createSheetComponents() {
    const rowHeader = { id: 'row-header' };
    const columnHeader = { id: 'col-header' };
    const leftTop = { id: 'left-top' };
    const components = new Map<unknown, unknown>([
        [SHEET_VIEW_KEY.ROW, rowHeader],
        [SHEET_VIEW_KEY.COLUMN, columnHeader],
        [SHEET_VIEW_KEY.LEFT_TOP, leftTop],
    ]);

    return { components, rowHeader, columnHeader, leftTop };
}

describe('component tools', () => {
    it('getSheetObject returns null when no workbook or render is available', () => {
        const noWorkbookInstance = {
            getCurrentUnitForType: vi.fn(() => null),
        };
        const renderManager = {
            getRenderById: vi.fn(),
        };
        expect(getSheetObject(noWorkbookInstance as any, renderManager as any)).toBeNull();
        expect(renderManager.getRenderById).not.toHaveBeenCalled();

        const workbook = { getUnitId: () => 'unit-1' };
        const noRenderInstance = {
            getCurrentUnitForType: () => workbook,
        };
        expect(getSheetObject(noRenderInstance as any, renderManager as any)).toBeNull();
        expect(renderManager.getRenderById).toHaveBeenCalledWith('unit-1');
    });

    it('getSheetObject extracts spreadsheet components from render manager', () => {
        const workbook = { getUnitId: () => 'unit-1' };
        const { components, rowHeader, columnHeader, leftTop } = createSheetComponents();
        const render = {
            components,
            mainComponent: { id: 'spreadsheet' },
            scene: { id: 'scene' },
            engine: { id: 'engine' },
        };
        const instance = {
            getCurrentUnitForType: () => workbook,
        };
        const renderManager = {
            getRenderById: () => render,
        };

        const sheetObject = getSheetObject(instance as any, renderManager as any);
        expect(sheetObject).toEqual({
            spreadsheet: render.mainComponent,
            spreadsheetRowHeader: rowHeader,
            spreadsheetColumnHeader: columnHeader,
            spreadsheetLeftTopPlaceholder: leftTop,
            scene: render.scene,
            engine: render.engine,
        });
    });

    it('getSheetObject supports render context input', () => {
        const workbook = { getUnitId: () => 'unit-1' };
        const { components, rowHeader, columnHeader, leftTop } = createSheetComponents();
        const renderContext = {
            isMainScene: true,
            components,
            mainComponent: { id: 'spreadsheet' },
            scene: { id: 'scene' },
            engine: { id: 'engine' },
        };
        const instance = {
            getCurrentUnitForType: () => workbook,
        };

        const sheetObject = getSheetObject(instance as any, renderContext as any);
        expect(sheetObject?.spreadsheetRowHeader).toBe(rowHeader);
        expect(sheetObject?.spreadsheetColumnHeader).toBe(columnHeader);
        expect(sheetObject?.spreadsheetLeftTopPlaceholder).toBe(leftTop);
    });

    it('getCoordByCell returns cell coordinates from skeleton', () => {
        const getCellWithCoordByIndex = vi.fn(() => ({ startX: 1, startY: 2, endX: 3, endY: 4 }));
        const result = getCoordByCell(2, 3, {} as any, { getCellWithCoordByIndex } as any);

        expect(getCellWithCoordByIndex).toHaveBeenCalledWith(2, 3);
        expect(result).toEqual({ startX: 1, startY: 2, endX: 3, endY: 4 });
    });

    it('getCoordByOffset converts offsets to selected cell coordinates', () => {
        const scene = {
            getCoordRelativeToViewport: vi.fn(() => ({ x: 40, y: 60 })),
            getScrollXYInfoByViewport: vi.fn(() => ({ x: 6, y: 8 })),
            getAncestorScale: vi.fn(() => ({ scaleX: 2, scaleY: 4 })),
        };
        const skeleton = {
            getCellIndexByOffset: vi.fn(() => ({ row: 2, column: 3 })),
            getNoMergeCellWithCoordByIndex: vi.fn(() => ({ startX: 10, startY: 20, endX: 30, endY: 40 })),
        };

        const result = getCoordByOffset(100, 120, scene as any, skeleton as any, { id: 'vp' } as any, true);

        expect(skeleton.getCellIndexByOffset).toHaveBeenCalledWith(40, 60, 2, 4, { x: 6, y: 8 }, { closeFirst: true });
        expect(skeleton.getNoMergeCellWithCoordByIndex).toHaveBeenCalledWith(2, 3);
        expect(result).toEqual({
            row: 2,
            column: 3,
            startX: 10,
            startY: 20,
            endX: 30,
            endY: 40,
        });
    });

    it('getTransformCoord applies scroll and scale conversion', () => {
        const viewMain = { id: 'view-main' };
        const scene = {
            getCoordRelativeToViewport: vi.fn(() => ({ x: 11, y: 22 })),
            getViewport: vi.fn(() => viewMain),
            getScrollXYInfoByViewport: vi.fn(() => ({ x: 5, y: 7 })),
            getAncestorScale: vi.fn(() => ({ scaleX: 2, scaleY: 4 })),
        };

        const result = getTransformCoord(100, 40, scene as any, {} as any);

        expect(scene.getViewport).toHaveBeenCalledWith(SHEET_VIEWPORT_KEY.VIEW_MAIN);
        expect(scene.getScrollXYInfoByViewport).toHaveBeenCalledWith({ x: 11, y: 22 }, viewMain);
        expect(result).toEqual({ x: 55, y: 17 });
    });
});
