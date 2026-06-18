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

import { Injector, RANGE_TYPE, ThemeService } from '@univerjs/core';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { SetSelectionsOperation } from '@univerjs/sheets';
import { IShortcutService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import { beforeAll, describe, expect, it } from 'vitest';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import {
    createFakeScene,
    createFakeSkeleton,
    createFakeViewport,
    createRenderTestBed,
    createTestEvent,
} from '../../../controllers/render-controllers/__tests__/render-test-bed';
import { SheetScrollManagerService } from '../../scroll-manager.service';
import { MobileSheetsSelectionRenderService, shouldKeepCurrentSelectionOnMobileLongPress } from '../mobile-selection-render.service';
import { MobileSelectionControl } from '../mobile-selection-shape';

class TestThemeService {
    getColorFromTheme(key: string) {
        return key === 'white' ? '#ffffff' : '#3b82f6';
    }
}

class TestShortcutService {
    forceEscape() {
        return { dispose: () => { } };
    }
}

class TestSheetScrollManagerService {
    readonly validViewportScrollInfo$ = new BehaviorSubject<{ viewportScrollX: number; viewportScrollY: number } | null>(null);
}

function createMobileControl(rangeType: RANGE_TYPE) {
    const injector = new Injector();
    injector.add([ThemeService, { useClass: TestThemeService }]);
    const viewport = createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
    const scene = createFakeScene(new Map([[SHEET_VIEWPORT_KEY.VIEW_MAIN, viewport]]));
    const skeleton = createFakeSkeleton();
    const control = injector.createInstance(
        MobileSelectionControl,
        scene as never,
        1,
        injector.get(ThemeService),
        {
            rowHeaderWidth: skeleton.rowHeaderWidth,
            columnHeaderHeight: skeleton.columnHeaderHeight,
            rangeType,
        }
    );

    control.updateRangeBySelectionWithCoord({
        rangeWithCoord: {
            startRow: 1,
            endRow: 3,
            startColumn: 1,
            endColumn: 2,
            startX: 100,
            startY: 20,
            endX: 300,
            endY: 80,
            rangeType,
        },
        primaryWithCoord: {
            actualRow: 1,
            actualColumn: 1,
            isMerged: false,
            isMergedMainCell: false,
            startX: 100,
            startY: 20,
            endX: 200,
            endY: 40,
            mergeInfo: {
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
                startX: 100,
                startY: 20,
                endX: 200,
                endY: 40,
            },
        },
        style: null,
    }, skeleton as never);

    return control;
}

function installCellLookupForMobileSelection(skeleton: ReturnType<typeof createFakeSkeleton>) {
    const cellWithMeta = (row: number, column: number) => {
        const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
        return {
            ...cell,
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
            actualRow: row,
            actualColumn: column,
            isMerged: false,
            isMergedMainCell: false,
            mergeInfo: {
                ...cell,
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
            },
        };
    };
    (skeleton as never as {
        getCellByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
        getCellWithCoordByIndex: (row: number, column: number) => unknown;
        getCellWithCoordByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
        getColumnCount: () => number;
        getRowCount: () => number;
        expandRangeByMerge: <T>(range: T) => T;
    }).getCellByOffset = (x, y, scaleX, scaleY, scrollXY) => {
        const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
        return cellWithMeta(row, column);
    };
    (skeleton as never as { getCellWithCoordByIndex: (row: number, column: number) => unknown }).getCellWithCoordByIndex = cellWithMeta;
    (skeleton as never as {
        getCellWithCoordByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
    }).getCellWithCoordByOffset = (x, y, scaleX, scaleY, scrollXY) => {
        const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
        return cellWithMeta(row, column);
    };
    (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
    (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
    (skeleton as never as { expandRangeByMerge: <T>(range: T) => T }).expandRangeByMerge = (range) => range;
}

describe('shouldKeepCurrentSelectionOnMobileLongPress', () => {
    beforeAll(() => {
        globalThis.window = {
            cancelAnimationFrame: () => { },
            requestAnimationFrame: () => 1,
        } as unknown as Window & typeof globalThis;
    });

    it('keeps the existing selection when long press is inside it', () => {
        expect(shouldKeepCurrentSelectionOnMobileLongPress([
            {
                startRow: 1,
                endRow: 3,
                startColumn: 2,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
        ], {
            startRow: 2,
            endRow: 2,
            startColumn: 3,
            endColumn: 3,
            rangeType: RANGE_TYPE.NORMAL,
        })).toBe(true);
    });

    it('does not keep the existing selection when long press is outside it', () => {
        expect(shouldKeepCurrentSelectionOnMobileLongPress([
            {
                startRow: 1,
                endRow: 3,
                startColumn: 2,
                endColumn: 4,
                rangeType: RANGE_TYPE.NORMAL,
            },
        ], {
            startRow: 5,
            endRow: 5,
            startColumn: 5,
            endColumn: 5,
            rangeType: RANGE_TYPE.NORMAL,
        })).toBe(false);
    });

    it('checks all existing selections', () => {
        expect(shouldKeepCurrentSelectionOnMobileLongPress([
            {
                startRow: 1,
                endRow: 1,
                startColumn: 1,
                endColumn: 1,
                rangeType: RANGE_TYPE.NORMAL,
            },
            {
                startRow: 4,
                endRow: 6,
                startColumn: 4,
                endColumn: 6,
                rangeType: RANGE_TYPE.NORMAL,
            },
        ], {
            startRow: 5,
            endRow: 5,
            startColumn: 5,
            endColumn: 5,
            rangeType: RANGE_TYPE.NORMAL,
        })).toBe(true);
    });

    it('positions mobile expand handles on normal selections', () => {
        const control = createMobileControl(RANGE_TYPE.NORMAL);

        expect(control.fillControlTopLeft?.visible).toBe(true);
        expect(control.fillControlBottomRight?.visible).toBe(true);
        expect(control.fillControlTopLeft?.left).toBeLessThan(0);
        expect(control.fillControlBottomRight?.left).toBeGreaterThan(0);
        expect(control.getViewportMainScrollInfo()).toMatchObject({
            viewportScrollX: 0,
            viewportScrollY: 0,
            width: 800,
            height: 600,
        });
    });

    it('keeps row and column expand handles inside the visible sheet body', () => {
        const rowControl = createMobileControl(RANGE_TYPE.ROW);
        rowControl.transformControlPoint(900, 0, 500, 500);
        expect(rowControl.rangeType).toBe(RANGE_TYPE.ROW);
        expect(rowControl.fillControlTopLeft?.left).toBeLessThanOrEqual(500);
        expect(rowControl.fillControlBottomRight?.top).toBeGreaterThan(rowControl.fillControlTopLeft?.top ?? 0);

        const columnControl = createMobileControl(RANGE_TYPE.COLUMN);
        columnControl.transformControlPoint(0, 900, 500, 300);
        expect(columnControl.rangeType).toBe(RANGE_TYPE.COLUMN);
        expect(columnControl.fillControlTopLeft?.top).toBeLessThanOrEqual(300);
        expect(columnControl.fillControlBottomRight?.left).toBeGreaterThan(columnControl.fillControlTopLeft?.left ?? 0);
    });

    it('keeps replacement mobile handles wired through disposal', () => {
        const control = createMobileControl(RANGE_TYPE.NORMAL);
        const topLeft = control.fillControlTopLeft!;
        const bottomRight = control.fillControlBottomRight!;

        control.fillControlTopLeft = topLeft;
        control.fillControlBottomRight = bottomRight;
        control.rangeType = RANGE_TYPE.ALL;

        expect(control.fillControlTopLeft).toBe(topLeft);
        expect(control.fillControlBottomRight).toBe(bottomRight);
        expect(control.rangeType).toBe(RANGE_TYPE.ALL);

        control.dispose();
    });

    it('creates mobile selections from pointer positions after the sheet skeleton is ready', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
                [SheetScrollManagerService, { useClass: TestSheetScrollManagerService }],
            ],
        });
        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context } = testBed;
        (context.mainComponent as never as { onPointerUp$: unknown }).onPointerUp$ = createTestEvent();
        (skeleton as never as {
            getCellByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
            getColumnCount: () => number;
            getRowCount: () => number;
        }).getCellByOffset = (x, y, scaleX, scaleY, scrollXY) => {
            const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
            const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
            return {
                ...cell,
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
            };
        };
        (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
        (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
        commandService.registerCommand(SetSelectionsOperation);
        const service = injector.createInstance(MobileSheetsSelectionRenderService, context as never);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton: skeleton as never,
        });

        service.createNewSelection({ offsetX: 150, offsetY: 45 } as never, 0, RANGE_TYPE.NORMAL);
        expect(service.getSelectionControls()).toHaveLength(1);
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
        });

        service.createNewSelection({ offsetX: 150, offsetY: 45 } as never, 0, RANGE_TYPE.ROW);
        expect(service.getActiveRange()).toMatchObject({
            startRow: 2,
            endRow: 2,
            startColumn: 0,
            endColumn: 49,
        });

        const scrollManager = injector.get(SheetScrollManagerService) as never as TestSheetScrollManagerService;
        scrollManager.validViewportScrollInfo$.next({ viewportScrollX: 240, viewportScrollY: 180 });
        expect(service.getActiveSelectionControl<MobileSelectionControl>()?.fillControlTopLeft?.left).toBeGreaterThan(0);

        const leftTopPlaceholder = context.components.get(SHEET_VIEW_KEY.LEFT_TOP)!;
        let stopped = false;
        (leftTopPlaceholder.onPointerDown$ as unknown as { emit: (evt: unknown, state: { stopPropagation: () => void }) => void }).emit({ button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        expect(stopped).toBe(true);
        expect(service.getActiveRange()).toMatchObject({
            startRow: 0,
            startColumn: 0,
            endRow: 199,
            endColumn: 49,
        });

        service.dispose();
        testBed.univer.dispose();
    });

    it('expands a mobile selection by dragging the bottom-right handle', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
                [SheetScrollManagerService, { useClass: TestSheetScrollManagerService }],
            ],
        });
        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context, scene, contextService } = testBed;
        (context.mainComponent as never as { onPointerUp$: unknown }).onPointerUp$ = createTestEvent();
        installCellLookupForMobileSelection(skeleton);
        (scene as never as { getTransformer: () => { clearSelectedObjects: () => void } }).getTransformer = () => ({ clearSelectedObjects: () => { } });
        commandService.registerCommand(SetSelectionsOperation);
        const service = injector.createInstance(MobileSheetsSelectionRenderService, context as never);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton: skeleton as never,
        });

        service.createNewSelection({ offsetX: 150, offsetY: 45 } as never, 0, RANGE_TYPE.NORMAL);
        const movingSelections: unknown[] = [];
        service.selectionMoving$.subscribe((selection) => movingSelections.push(selection));
        const activeControl = service.getActiveSelectionControl<MobileSelectionControl>()!;

        activeControl.fillControlBottomRight!.onPointerDown$.emitEvent({ offsetX: 150, offsetY: 45 } as never);
        expect(contextService.getContextValue('MOBILE_EXPANDING_SELECTION')).toBe(true);

        (scene.onPointerMove$ as unknown as { emit: (evt: unknown, state?: unknown) => void }).emit({ offsetX: 360, offsetY: 90 });
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 4,
            startColumn: 1,
            endColumn: 3,
        });
        expect(movingSelections.length).toBeGreaterThan(0);

        (scene.onPointerUp$ as unknown as { emit: (evt: unknown, state?: unknown) => void }).emit({ offsetX: 360, offsetY: 90 });
        expect(contextService.getContextValue('MOBILE_EXPANDING_SELECTION')).toBe(false);

        service.dispose();
        testBed.univer.dispose();
    });

    it('creates mobile selections from tap and header gestures while respecting pinch zoom state', () => {
        const testBed = createRenderTestBed({
            dependencies: [
                [IShortcutService, { useClass: TestShortcutService }],
                [SheetScrollManagerService, { useClass: TestSheetScrollManagerService }],
            ],
        });
        const { injector, sheet, commandService, sheetSkeletonManagerService, skeleton, context, contextService } = testBed;
        (context.mainComponent as never as { onPointerUp$: unknown }).onPointerUp$ = createTestEvent();
        (skeleton as never as {
            getCellByOffset: (x: number, y: number, scaleX: number, scaleY: number, scrollXY: { x: number; y: number }) => unknown;
            getColumnCount: () => number;
            getRowCount: () => number;
            expandRangeByMerge: <T>(range: T) => T;
        }).getCellByOffset = (x, y, scaleX, scaleY, scrollXY) => {
            const { row, column } = skeleton.getCellIndexByOffset(x, y, scaleX, scaleY, scrollXY);
            const cell = skeleton.getNoMergeCellWithCoordByIndex(row, column);
            return {
                ...cell,
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
                actualRow: row,
                actualColumn: column,
                isMerged: false,
                isMergedMainCell: false,
                mergeInfo: {
                    ...cell,
                    startRow: row,
                    endRow: row,
                    startColumn: column,
                    endColumn: column,
                },
            };
        };
        (skeleton as never as { getColumnCount: () => number }).getColumnCount = () => skeleton.worksheet.getColumnCount();
        (skeleton as never as { getRowCount: () => number }).getRowCount = () => skeleton.worksheet.getRowCount();
        (skeleton as never as { expandRangeByMerge: <T>(range: T) => T }).expandRangeByMerge = (range) => range;
        commandService.registerCommand(SetSelectionsOperation);
        const service = injector.createInstance(MobileSheetsSelectionRenderService, context as never);

        sheetSkeletonManagerService.emitCurrentSkeleton({
            unitId: sheet.getUnitId(),
            sheetId: 'sheet1',
            skeleton: skeleton as never,
        });

        const spreadsheet = context.mainComponent as never as {
            onPointerDown$: { emit: (evt: unknown, state: unknown) => void };
            onPointerUp$: { emit: (evt: unknown, state: unknown) => void };
        };
        let stopped = false;
        spreadsheet.onPointerDown$.emit({ offsetX: 150, offsetY: 45, button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        spreadsheet.onPointerUp$.emit({ offsetX: 154, offsetY: 49, button: 0 }, {
            stopPropagation: () => {
                stopped = true;
            },
        });
        expect(stopped).toBe(true);
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
        });

        contextService.setContextValue('MOBILE_PINCH_ZOOMING', true);
        spreadsheet.onPointerDown$.emit({ offsetX: 250, offsetY: 65, button: 0 }, {
            stopPropagation: () => {
                throw new Error('pinch zoom should not start a tap selection');
            },
        });
        spreadsheet.onPointerUp$.emit({ offsetX: 250, offsetY: 65, button: 0 }, {
            stopPropagation: () => {
                throw new Error('pinch zoom should not finish a tap selection');
            },
        });
        expect(service.getActiveRange()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
        });
        contextService.setContextValue('MOBILE_PINCH_ZOOMING', false);

        const rowHeader = context.components.get(SHEET_VIEW_KEY.ROW)!;
        (rowHeader.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 10,
            offsetY: 65,
            button: 0,
        }, {});
        expect(service.getActiveRange()).toEqual({
            startRow: 3,
            endRow: 3,
            startColumn: 0,
            endColumn: 49,
        });

        const columnHeader = context.components.get(SHEET_VIEW_KEY.COLUMN)!;
        (columnHeader.onPointerDown$ as unknown as { emit: (evt: unknown, state: unknown) => void }).emit({
            offsetX: 350,
            offsetY: 5,
            button: 0,
        }, {});
        expect(service.getActiveRange()).toEqual({
            startRow: 0,
            endRow: 199,
            startColumn: 3,
            endColumn: 3,
        });

        service.dispose();
        testBed.univer.dispose();
    });
});
