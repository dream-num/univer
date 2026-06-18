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

import type { IRangeWithCoord, ThemeService } from '@univerjs/core';
import type { Vector2 } from '@univerjs/engine-render';
import { Injector, IUniverInstanceService } from '@univerjs/core';
import { CURSOR_TYPE, IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { beforeAll, describe, expect, it } from 'vitest';
import { ISheetSelectionRenderService } from '../base-selection-render.service';
import { SelectionControl } from '../selection-control';

function createTestEvent<T>() {
    const listeners: Array<(event: T) => void> = [];
    return {
        subscribeEvent(listener: (event: T) => void) {
            listeners.push(listener);
            return {
                unsubscribe: () => {
                    const index = listeners.indexOf(listener);
                    if (index >= 0) {
                        listeners.splice(index, 1);
                    }
                },
                dispose: () => {
                    const index = listeners.indexOf(listener);
                    if (index >= 0) {
                        listeners.splice(index, 1);
                    }
                },
            };
        },
        emit(event: T) {
            for (let i = 0, len = listeners.length; i < len; i++) {
                listeners[i](event);
            }
        },
    };
}

function createFakeScene() {
    const pointerMove$ = createTestEvent<{ offsetX: number; offsetY: number }>();
    const pointerUp$ = createTestEvent<{ offsetX?: number; offsetY?: number }>();
    const viewports = new Map<string, unknown>();
    const mainViewport = {
        viewportKey: SHEET_VIEWPORT_KEY.VIEW_MAIN,
        left: 0,
        top: 0,
        width: 1000,
        height: 800,
        scrollToBarPos: () => { },
        scrollByViewportDeltaVal: () => false,
        transScroll2ViewportScrollValue: () => ({ x: 0, y: 0 }),
    };
    viewports.set(SHEET_VIEWPORT_KEY.VIEW_MAIN, mainViewport);

    return {
        pointerMove$,
        pointerUp$,
        addedObjects: [] as unknown[],
        disabledObjectsEventCount: 0,
        enabledObjectsEventCount: 0,
        cursor: '',
        addObject: (obj: { parent?: unknown }) => {
            obj.parent = null;
            (obj as { scene?: unknown }).scene = null;
        },
        addObjects: (objs: Array<{ parent?: unknown }>) => {
            objs.forEach((obj) => {
                obj.parent = null;
                (obj as { scene?: unknown }).scene = null;
            });
        },
        getCoordRelativeToViewport: (coord: Vector2) => coord,
        getScrollXYInfoByViewport: () => ({ x: 0, y: 0 }),
        getViewportScrollXY: () => ({ x: 0, y: 0 }),
        getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
        getViewport: (key: string) => viewports.get(key),
        getActiveViewportByCoord: () => mainViewport,
        disableObjectsEvent() {
            this.disabledObjectsEventCount += 1;
        },
        enableObjectsEvent() {
            this.enabledObjectsEventCount += 1;
        },
        setCursor(cursor: string) {
            this.cursor = cursor;
        },
        resetCursor() {
            this.cursor = '';
        },
        onPointerMove$: pointerMove$,
        onPointerUp$: pointerUp$,
        onTransformChange$: { subscribeEvent: () => ({ dispose: () => { } }) },
    } as any;
}

function createFakeThemeService() {
    return {
        getColorFromTheme: (key: string) => (key === 'white' ? '#ffffff' : '#3b82f6'),
    } as unknown as ThemeService;
}

function createWidgetStyle(widgets: Record<string, boolean>) {
    return {
        strokeWidth: 1,
        stroke: '#3b82f6',
        fill: 'rgba(59, 130, 246, 0.12)',
        widgetSize: 6,
        widgets,
    };
}

function createControl(options?: {
    highlightHeader?: boolean;
    enableAutoFill?: boolean;
    rowHeaderWidth: number;
    columnHeaderHeight: number;
    rowHeaderOffsetX?: number;
    columnHeaderOffsetY?: number;
}, scene = createFakeScene()) {
    const injector = new Injector();
    return injector.createInstance(
        SelectionControl,
        scene,
        1,
        createFakeThemeService(),
        options ?? {
            rowHeaderWidth: 46,
            columnHeaderHeight: 20,
        }
    );
}

function createFakeSkeleton(options?: { merged?: boolean }) {
    const cellWidth = 100;
    const cellHeight = 20;
    const toRange = (startRow: number, startColumn: number, endRow = startRow, endColumn = startColumn) => ({
        startRow,
        endRow,
        startColumn,
        endColumn,
        startX: startColumn * cellWidth,
        endX: (endColumn + 1) * cellWidth,
        startY: startRow * cellHeight,
        endY: (endRow + 1) * cellHeight,
    });

    return {
        rowHeaderWidth: 46,
        columnHeaderHeight: 20,
        rowHeaderWidthAndMarginLeft: 46,
        columnHeaderHeightAndMarginTop: 20,
        worksheet: {
            getCellInfoInMergeData: (row: number, column: number) => ({
                actualRow: row,
                actualColumn: column,
                isMerged: false,
                isMergedMainCell: false,
                ...toRange(row, column),
                mergeInfo: toRange(row, column),
            }),
            getMergedCellRange: () => options?.merged ? [toRange(1, 1, 2, 1)] : [],
        },
        getWorksheetConfig: () => ({
            freeze: {
                startRow: 2,
                startColumn: 2,
                xSplit: 0,
                ySplit: 0,
            },
        }),
        getRowCount: () => 20,
        getColumnCount: () => 20,
        getCellIndexByOffset: (offsetX: number, offsetY: number) => ({
            row: Math.max(0, Math.floor(offsetY / cellHeight)),
            column: Math.max(0, Math.floor(offsetX / cellWidth)),
        }),
        getNoMergeCellWithCoordByIndex: (row: number, column: number) => toRange(row, column),
        getCellWithMergeInfoByIndex: (row: number, column: number) => ({
            actualRow: row,
            actualColumn: column,
            isMerged: false,
            isMergedMainCell: false,
            ...toRange(row, column),
            mergeInfo: toRange(row, column),
        }),
    };
}

class TestUniverInstanceService {}

class TestRenderManagerService {}

class TestSheetSelectionRenderService {
    interceptor = {
        fetchThroughInterceptors: () => () => true,
    };
}

function attachExtension(control: SelectionControl, scene: ReturnType<typeof createFakeScene>, skeleton = createFakeSkeleton()) {
    const injector = new Injector();
    injector.add([IUniverInstanceService, { useClass: TestUniverInstanceService as never }]);
    injector.add([IRenderManagerService, { useClass: TestRenderManagerService as never }]);
    injector.add([ISheetSelectionRenderService, { useClass: TestSheetSelectionRenderService as never }]);

    const hooks = { selectionMoveEnd: () => {
        hooks.moveEndCount += 1;
    }, moveEndCount: 0 };
    control.setControlExtension({
        skeleton: skeleton as never,
        scene,
        themeService: createFakeThemeService(),
        injector,
        selectionHooks: hooks as never,
    });

    return hooks;
}

describe('SelectionControl', () => {
    beforeAll(() => {
        globalThis.window = {
            cancelAnimationFrame: () => { },
            requestAnimationFrame: () => 1,
        } as unknown as Window & typeof globalThis;
    });

    it('updates range and shows/hides autofill based on primary', () => {
        const control = createControl();

        // No primary: should hide autofill.
        control.updateRange(
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 20,
            },
            null
        );
        expect(control.fillControl.visible).toBe(false);

        // With primary: should show autofill.
        control.updateRange(
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 20,
            },
            {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 20,
            } as any
        );
        expect(control.fillControl.visible).toBe(true);

        // Avoid disposing here: engine-render shapes expect a real Scene tree.
    });

    it('keeps header highlights aligned with outline header padding', () => {
        const control = createControl();

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 3,
                endRow: 5,
                startColumn: 1,
                endColumn: 2,
                startX: 126,
                startY: 108,
                endX: 246,
                endY: 168,
            },
            primaryWithCoord: null,
            style: null,
        }, {
            rowHeaderWidth: 46,
            rowHeaderWidthAndMarginLeft: 86,
            columnHeaderHeight: 20,
            columnHeaderHeightAndMarginTop: 60,
        } as any);

        expect((control as any)._rowHeaderGroup.left).toBe(40);
        expect((control as any)._rowHeaderGroup.top).toBe(108);
        expect((control as any)._columnHeaderGroup.left).toBe(126);
        expect((control as any)._columnHeaderGroup.top).toBe(40);
    });

    it('uses widgets instead of autofill when a selection style exposes resize handles', () => {
        const control = createControl();

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 0,
                endRow: 1,
                startColumn: 0,
                endColumn: 1,
                startX: 0,
                startY: 0,
                endX: 120,
                endY: 40,
            },
            primaryWithCoord: {
                actualRow: 0,
                actualColumn: 0,
                isMerged: false,
                isMergedMainCell: false,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 20,
                mergeInfo: {
                    startRow: 0,
                    endRow: 0,
                    startColumn: 0,
                    endColumn: 0,
                    startX: 0,
                    startY: 0,
                    endX: 100,
                    endY: 20,
                },
            },
            style: {
                strokeWidth: 1,
                stroke: '#3b82f6',
                fill: 'rgba(59, 130, 246, 0.12)',
                widgetSize: 6,
                widgets: { tl: true, br: true },
            },
        });

        expect(control.fillControl.visible).toBe(false);
        expect(control.topLeftWidget.visible).toBe(true);
        expect(control.bottomRightWidget.visible).toBe(true);
        expect(control.topCenterWidget.visible).toBe(false);

        control.updateStyle({
            widgets: {},
        });
        expect(control.topLeftWidget.visible).toBe(false);
    });

    it('returns the highlighted cell range and clears it without changing the selected range', () => {
        const control = createControl();

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 1,
                endRow: 3,
                startColumn: 2,
                endColumn: 4,
                startX: 200,
                startY: 20,
                endX: 500,
                endY: 80,
            },
            primaryWithCoord: {
                actualRow: 2,
                actualColumn: 3,
                isMerged: false,
                isMergedMainCell: false,
                startX: 300,
                startY: 40,
                endX: 400,
                endY: 60,
                mergeInfo: {
                    startRow: 2,
                    endRow: 2,
                    startColumn: 3,
                    endColumn: 3,
                    startX: 300,
                    startY: 40,
                    endX: 400,
                    endY: 60,
                },
            },
            style: null,
        });

        expect(control.getCurrentCellInfo()).toEqual({
            startRow: 2,
            endRow: 2,
            startColumn: 3,
            endColumn: 3,
            startX: 300,
            startY: 40,
            endX: 400,
            endY: 60,
        });
        expect(control.getValue().rangeWithCoord).toMatchObject({
            startRow: 1,
            endRow: 3,
            startColumn: 2,
            endColumn: 4,
        });

        control.clearHighlight();
        expect(control.getCurrentCellInfo()).toBeUndefined();

        control.disableHelperSelection();
        expect(control.isHelperSelection).toBe(false);
        control.enableHelperSelection();
        expect(control.isHelperSelection).toBe(true);
    });

    it('updates public interaction state without changing the selected range', () => {
        const control = createControl();
        const selectedRange = {
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
            startX: 0,
            startY: 0,
            endX: 100,
            endY: 20,
        };
        control.updateRange(selectedRange, null);

        control.setEvent(false);
        expect(control.leftControl.evented).toBe(false);
        expect(control.rightControl.evented).toBe(false);
        control.setEvent(true);
        expect(control.topControl.evented).toBe(true);
        expect(control.bottomControl.evented).toBe(true);

        let filledRange: typeof selectedRange | undefined;
        control.selectionFilled$.subscribe((range) => {
            filledRange = range as typeof selectedRange;
        });
        control.refreshSelectionFilled(selectedRange);
        expect(filledRange).toEqual(selectedRange);

        control.updateCurrCell({
            actualRow: 0,
            actualColumn: 0,
            isMerged: false,
            isMergedMainCell: false,
            startX: 0,
            startY: 0,
            endX: 100,
            endY: 20,
            mergeInfo: {
                startRow: 0,
                endRow: 0,
                startColumn: 0,
                endColumn: 0,
                startX: 0,
                startY: 0,
                endX: 100,
                endY: 20,
            },
        });
        expect(control.getCurrentCellInfo()).toMatchObject({
            startRow: 0,
            startColumn: 0,
        });

        control.rowHeaderWidth = 72;
        control.columnHeaderHeight = 28;
        expect(control.rowHeaderWidth).toBe(72);
        expect(control.columnHeaderHeight).toBe(28);
        expect(control.getScene()).toBeDefined();

        const model = control.selectionModel;
        control.selectionModel = model;
        expect(control.model).toBe(model);

        control.setControlExtensionDisable(true);
        expect(control.getRange()).toMatchObject({
            startRow: 0,
            endRow: 0,
            startColumn: 0,
            endColumn: 0,
        });
    });

    it('moves the selected range by dragging the selection border', () => {
        const scene = createFakeScene();
        const control = createControl(undefined, scene);
        const hooks = attachExtension(control, scene);
        const movingRanges: IRangeWithCoord[] = [];
        const endedRanges: IRangeWithCoord[] = [];
        control.selectionMoving$.subscribe((range) => movingRanges.push(range));
        control.selectionMoveEnd$.subscribe((range) => endedRanges.push(range));

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
                startX: 100,
                startY: 20,
                endX: 300,
                endY: 60,
            },
            primaryWithCoord: null,
            style: null,
        });

        control.leftControl.onPointerDown$.emitEvent({ offsetX: 120, offsetY: 30 } as never);
        scene.pointerMove$.emit({ offsetX: 320, offsetY: 80 });
        scene.pointerUp$.emit({});

        expect(movingRanges.at(-1)).toMatchObject({
            startRow: 4,
            endRow: 5,
            startColumn: 3,
            endColumn: 4,
            startX: 300,
            endX: 500,
            startY: 80,
            endY: 120,
        });
        expect(endedRanges.at(-1)).toEqual(movingRanges.at(-1));
        expect(scene.disabledObjectsEventCount).toBe(1);
        expect(scene.enabledObjectsEventCount).toBe(1);
        expect(hooks.moveEndCount).toBe(1);
    });

    it('does not move the range while the selection extension is disabled', () => {
        const scene = createFakeScene();
        const control = createControl(undefined, scene);
        attachExtension(control, scene);
        const movingRanges: IRangeWithCoord[] = [];
        control.selectionMoving$.subscribe((range) => movingRanges.push(range));

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
                startX: 100,
                startY: 20,
                endX: 300,
                endY: 60,
            },
            primaryWithCoord: null,
            style: null,
        });
        control.setControlExtensionDisable(true);

        control.leftControl.onPointerDown$.emitEvent({ offsetX: 120, offsetY: 30 } as never);
        scene.pointerMove$.emit({ offsetX: 320, offsetY: 80 });
        scene.pointerUp$.emit({});

        expect(movingRanges).toEqual([]);
    });

    it('shows the expected cursors for move, resize and autofill affordances', () => {
        const scene = createFakeScene();
        const control = createControl(undefined, scene);
        attachExtension(control, scene);

        control.leftControl.onPointerEnter$.emitEvent({ offsetX: 120, offsetY: 30 } as never);
        expect((control.leftControl as never as { _cursor: CURSOR_TYPE })._cursor).toBe(CURSOR_TYPE.MOVE);
        control.leftControl.onPointerLeave$.emitEvent({ offsetX: 120, offsetY: 30 } as never);

        control.topLeftWidget.onPointerEnter$.emitEvent({ offsetX: 100, offsetY: 20 } as never);
        expect((control.topLeftWidget as never as { _cursor: CURSOR_TYPE })._cursor).toBe(CURSOR_TYPE.NORTH_WEST_RESIZE);
        control.topLeftWidget.onPointerLeave$.emitEvent({ offsetX: 100, offsetY: 20 } as never);

        control.fillControl.onPointerEnter$.emitEvent({ offsetX: 300, offsetY: 60 } as never);
        expect((control.fillControl as never as { _cursor: CURSOR_TYPE })._cursor).toBe(CURSOR_TYPE.CROSSHAIR);
        control.fillControl.onPointerLeave$.emitEvent({ offsetX: 300, offsetY: 60 } as never);
    });

    it('resizes the selected range by dragging a selection widget', () => {
        const scene = createFakeScene();
        const control = createControl(undefined, scene);
        const hooks = attachExtension(control, scene);
        const scalingRanges: IRangeWithCoord[] = [];
        const scaledRanges: IRangeWithCoord[] = [];
        control.selectionScaling$.subscribe((range) => scalingRanges.push(range));
        control.selectionScaled$.subscribe((range) => {
            if (range) {
                scaledRanges.push(range);
            }
        });

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
                startX: 100,
                startY: 20,
                endX: 300,
                endY: 60,
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
            style: createWidgetStyle({ br: true }),
        });

        control.bottomRightWidget.onPointerDown$.emitEvent({ offsetX: 300, offsetY: 60 } as never);
        scene.pointerMove$.emit({ offsetX: 420, offsetY: 90 });
        scene.pointerUp$.emit({});

        expect(scalingRanges.at(-1)).toMatchObject({
            startRow: 1,
            endRow: 4,
            startColumn: 1,
            endColumn: 4,
            startX: 100,
            endX: 500,
            startY: 20,
            endY: 100,
        });
        expect(scaledRanges.at(-1)).toEqual(scalingRanges.at(-1));
        expect(control.getRange()).toMatchObject({
            startRow: 1,
            endRow: 4,
            startColumn: 1,
            endColumn: 4,
        });
        expect(hooks.moveEndCount).toBe(1);
    });

    it('keeps the opposite corner fixed when resizing from the top-left widget', () => {
        const scene = createFakeScene();
        const control = createControl(undefined, scene);
        attachExtension(control, scene);
        const scalingRanges: IRangeWithCoord[] = [];
        control.selectionScaling$.subscribe((range) => scalingRanges.push(range));

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 3,
                endRow: 5,
                startColumn: 3,
                endColumn: 5,
                startX: 300,
                startY: 60,
                endX: 600,
                endY: 120,
            },
            primaryWithCoord: null,
            style: createWidgetStyle({ tl: true }),
        });

        control.topLeftWidget.onPointerDown$.emitEvent({ offsetX: 300, offsetY: 60 } as never);
        scene.pointerMove$.emit({ offsetX: 120, offsetY: 25 });
        scene.pointerUp$.emit({});

        expect(scalingRanges.at(-1)).toMatchObject({
            startRow: 1,
            endRow: 5,
            startColumn: 1,
            endColumn: 5,
            startX: 100,
            endX: 600,
            startY: 20,
            endY: 120,
        });
    });

    it('resizes from each edge handle while keeping the opposite edge anchored', () => {
        const cases = [
            {
                widget: 'topCenterWidget',
                enabledWidget: 'tc',
                down: { offsetX: 400, offsetY: 60 },
                move: { offsetX: 350, offsetY: 25 },
                expected: { startRow: 1, endRow: 5, startColumn: 3, endColumn: 5 },
            },
            {
                widget: 'topRightWidget',
                enabledWidget: 'tr',
                down: { offsetX: 600, offsetY: 60 },
                move: { offsetX: 720, offsetY: 25 },
                expected: { startRow: 1, endRow: 5, startColumn: 3, endColumn: 7 },
            },
            {
                widget: 'middleLeftWidget',
                enabledWidget: 'ml',
                down: { offsetX: 300, offsetY: 90 },
                move: { offsetX: 120, offsetY: 80 },
                expected: { startRow: 3, endRow: 5, startColumn: 1, endColumn: 5 },
            },
            {
                widget: 'middleRightWidget',
                enabledWidget: 'mr',
                down: { offsetX: 600, offsetY: 90 },
                move: { offsetX: 720, offsetY: 80 },
                expected: { startRow: 3, endRow: 5, startColumn: 3, endColumn: 7 },
            },
            {
                widget: 'bottomLeftWidget',
                enabledWidget: 'bl',
                down: { offsetX: 300, offsetY: 120 },
                move: { offsetX: 120, offsetY: 165 },
                expected: { startRow: 3, endRow: 8, startColumn: 1, endColumn: 5 },
            },
            {
                widget: 'bottomCenterWidget',
                enabledWidget: 'bc',
                down: { offsetX: 400, offsetY: 120 },
                move: { offsetX: 350, offsetY: 165 },
                expected: { startRow: 3, endRow: 8, startColumn: 3, endColumn: 5 },
            },
        ] as const;

        for (let i = 0, len = cases.length; i < len; i++) {
            const item = cases[i];
            const scene = createFakeScene();
            const control = createControl(undefined, scene);
            attachExtension(control, scene);
            const scalingRanges: IRangeWithCoord[] = [];
            control.selectionScaling$.subscribe((range) => scalingRanges.push(range));

            control.updateRangeBySelectionWithCoord({
                rangeWithCoord: {
                    startRow: 3,
                    endRow: 5,
                    startColumn: 3,
                    endColumn: 5,
                    startX: 300,
                    startY: 60,
                    endX: 600,
                    endY: 120,
                },
                primaryWithCoord: null,
                style: createWidgetStyle({ [item.enabledWidget]: true }),
            });

            control[item.widget].onPointerDown$.emitEvent(item.down as never);
            scene.pointerMove$.emit(item.move);
            scene.pointerUp$.emit({});

            expect(scalingRanges.at(-1)).toMatchObject(item.expected);
        }
    });

    it('extends the autofill range by dragging the fill handle and commits it on pointer up', () => {
        const scene = createFakeScene();
        const control = createControl(undefined, scene);
        attachExtension(control, scene);
        const fillingRanges: IRangeWithCoord[] = [];
        const filledRanges: IRangeWithCoord[] = [];
        control.selectionFilling$.subscribe((range) => {
            if (range) {
                fillingRanges.push(range);
            }
        });
        control.selectionFilled$.subscribe((range) => {
            if (range) {
                filledRanges.push(range);
            }
        });

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
                startX: 100,
                startY: 20,
                endX: 300,
                endY: 60,
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
        });

        control.fillControl.onPointerDown$.emitEvent({ offsetX: 300, offsetY: 60 } as never);
        scene.pointerMove$.emit({ offsetX: 150, offsetY: 95 });
        scene.pointerUp$.emit({});

        expect(fillingRanges.at(-1)).toMatchObject({
            startRow: 1,
            endRow: 4,
            startColumn: 1,
            endColumn: 2,
            startX: 100,
            endX: 300,
            startY: 20,
            endY: 100,
        });
        expect(filledRanges.at(-1)).toEqual(fillingRanges.at(-1));
    });

    it('autofills horizontally when the fill handle is dragged beyond the selected columns', () => {
        const scene = createFakeScene();
        const control = createControl(undefined, scene);
        attachExtension(control, scene);
        const fillingRanges: IRangeWithCoord[] = [];
        control.selectionFilling$.subscribe((range) => {
            if (range) {
                fillingRanges.push(range);
            }
        });

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 2,
                startX: 100,
                startY: 20,
                endX: 300,
                endY: 60,
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
        });

        control.fillControl.onPointerDown$.emitEvent({ offsetX: 300, offsetY: 60 } as never);
        scene.pointerMove$.emit({ offsetX: 460, offsetY: 45 });
        scene.pointerUp$.emit({});

        expect(fillingRanges.at(-1)).toMatchObject({
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 4,
            startX: 100,
            endX: 500,
            startY: 20,
            endY: 60,
        });
    });

    it('keeps merged autofill ranges aligned to the original merged block size', () => {
        const scene = createFakeScene();
        const control = createControl(undefined, scene);
        attachExtension(control, scene, createFakeSkeleton({ merged: true }));
        const fillingRanges: IRangeWithCoord[] = [];
        control.selectionFilling$.subscribe((range) => {
            if (range) {
                fillingRanges.push(range);
            }
        });

        control.updateRangeBySelectionWithCoord({
            rangeWithCoord: {
                startRow: 1,
                endRow: 2,
                startColumn: 1,
                endColumn: 1,
                startX: 100,
                startY: 20,
                endX: 200,
                endY: 60,
            },
            primaryWithCoord: {
                actualRow: 1,
                actualColumn: 1,
                isMerged: true,
                isMergedMainCell: true,
                startX: 100,
                startY: 20,
                endX: 200,
                endY: 60,
                mergeInfo: {
                    startRow: 1,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 1,
                    startX: 100,
                    startY: 20,
                    endX: 200,
                    endY: 60,
                },
            },
            style: null,
        });

        control.fillControl.onPointerDown$.emitEvent({ offsetX: 200, offsetY: 60 } as never);
        scene.pointerMove$.emit({ offsetX: 150, offsetY: 125 });
        scene.pointerUp$.emit({});

        expect(fillingRanges.at(-1)).toMatchObject({
            startRow: 1,
            endRow: 6,
            startColumn: 1,
            endColumn: 1,
            startX: 100,
            endX: 200,
            startY: 20,
            endY: 140,
        });
    });
});
