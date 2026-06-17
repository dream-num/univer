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

import type { IDisposable, IWorkbookData, Workbook } from '@univerjs/core';
import type { IRenderContext } from '@univerjs/engine-render';
import type { ISelectionWithStyle } from '@univerjs/sheets';
import {
    IContextService,
    ILogService,
    Inject,
    Injector,
    IUniverInstanceService,
    LocaleService,
    LocaleType,
    LogLevel,
    Plugin,
    RANGE_TYPE,
    toDisposable,
    Tools,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import {
    IRefSelectionsService,
    REF_SELECTIONS_ENABLED,
    RefSelectionsService,
    SelectionMoveType,
    SELECTIONS_ENABLED,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { SHEET_VIEW_KEY, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { IShortcutService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { RefSelectionsRenderService } from '../ref-selections.render.service';

function createTestEvent<TEvent, TState = { stopPropagation: () => void }>() {
    const handlers = new Set<(evt: TEvent, state: TState) => void>();
    return {
        subscribeEvent(handler: (evt: TEvent, state: TState) => void): IDisposable {
            handlers.add(handler);
            const dispose = () => handlers.delete(handler);
            return { dispose, unsubscribe: dispose } as unknown as IDisposable;
        },
        emit(evt: TEvent, state: TState): void {
            for (const handler of handlers) {
                handler(evt, state);
            }
        },
    };
}

function createFakeEngine() {
    return {
        width: 800,
        height: 600,
        beginFrame$: new Subject<void>(),
        endFrame$: new Subject<unknown>(),
        renderFrameTimeMetric$: new Subject<[string, number]>(),
        renderFrameTags$: new Subject<[string, unknown]>(),
        runRenderLoop: (cb: () => void) => cb(),
        stopRenderLoop: () => undefined,
    };
}

function createFakeViewport(viewportKey: string, options: { canvasWidth: number; canvasHeight: number }) {
    return {
        viewportKey,
        viewportScrollX: 0,
        viewportScrollY: 0,
        scrollX: 0,
        scrollY: 0,
        isActive: true,
        left: 0,
        top: 0,
        width: options.canvasWidth,
        height: options.canvasHeight,
        marginLeft: 0,
        marginTop: 0,
        onScrollAfter$: createTestEvent<unknown>(),
        onScrollByBar$: createTestEvent<unknown>(),
        limitedScroll: () => ({ isLimitedX: false, isLimitedY: false }),
        scrollToViewportPos: ({ viewportScrollX, viewportScrollY }: { viewportScrollX: number; viewportScrollY: number }) => {
            return { viewportScrollX, viewportScrollY };
        },
        updateScrollVal: () => undefined,
        scrollByViewportDeltaVal: () => true,
        transViewportScroll2ScrollValue: (x: number, y: number) => ({ x, y }),
        transScroll2ViewportScrollValue: (x: number, y: number) => ({ x, y }),
        enable: () => undefined,
        disable: () => undefined,
        setMargin: () => undefined,
        setViewportSize: () => undefined,
        setPadding: () => undefined,
        resetPadding: () => undefined,
        resizeWhenFreezeChange: () => undefined,
        calcViewportInfo: () => ({ viewBound: null }),
        getScrollBar: () => null,
    };
}

function createFakeScene(viewportMap: Map<unknown, ReturnType<typeof createFakeViewport>>, engine: ReturnType<typeof createFakeEngine>) {
    const layers = new Map<number, unknown>();
    const scene = {
        scaleX: 1,
        scaleY: 1,
        onMouseWheel$: createTestEvent<unknown>(),
        onTransformChange$: createTestEvent<unknown>(),
        onPointerMove$: createTestEvent<unknown>(),
        onPointerUp$: createTestEvent<unknown>(),
        addObjects: (objects: Array<{ parent?: unknown }>) => {
            for (const object of objects) {
                object.parent = scene;
            }
        },
        addObject: (object: { parent?: unknown }) => {
            object.parent = scene;
        },
        removeObject: () => undefined,
        addLayer: (layer: { zIndex?: number }) => {
            if (typeof layer.zIndex === 'number') {
                layers.set(layer.zIndex, layer);
            }
        },
        findLayerByZIndex: (zIndex: number) => layers.get(zIndex) ?? null,
        disableObjectsEvent: () => undefined,
        enableObjectsEvent: () => undefined,
        enableLayerCache: () => undefined,
        makeDirty: () => undefined,
        getViewport: (key: unknown) => viewportMap.get(key) ?? null,
        getMainViewport: () => viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN)!,
        getViewports: () => Array.from(viewportMap.values()),
        getActiveViewportByCoord: () => viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) ?? null,
        findViewportByPosToScene: () => viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) ?? null,
        getViewportScrollXY: (viewport: { viewportScrollX: number; viewportScrollY: number }) => ({ x: viewport.viewportScrollX, y: viewport.viewportScrollY }),
        getParent: () => ({ classType: 'SCENE' }),
        getTransformer: () => ({
            clearSelectedObjects: () => undefined,
        }),
        getCoordRelativeToViewport: (vec: { x?: number; y?: number } | number[]) => ({
            x: Array.isArray(vec) ? vec[0] : vec.x ?? 0,
            y: Array.isArray(vec) ? vec[1] : vec.y ?? 0,
        }),
        getScrollXYInfoByViewport: (_coords: unknown, viewport?: { viewportScrollX: number; viewportScrollY: number } | null) => ({ x: viewport?.viewportScrollX ?? 0, y: viewport?.viewportScrollY ?? 0 }),
        getAncestorScale: () => ({ scaleX: scene.scaleX, scaleY: scene.scaleY }),
        setCursor: () => undefined,
        resetCursor: () => undefined,
        getEngine: () => engine,
        transformByState: () => undefined,
        scale: (x: number, y: number) => {
            scene.scaleX = x;
            scene.scaleY = y;
        },
    };
    return scene;
}

function createFakeSkeleton(options?: {
    getLocation?: () => [string, string];
    worksheet?: {
        getRowCount: () => number;
        getColumnCount: () => number;
        getSheetId: () => string;
        getCellInfoInMergeData: (row: number, col: number) => {
            startRow: number;
            startColumn: number;
            endRow: number;
            endColumn: number;
            isMerged: boolean;
            isMergedMainCell: boolean;
        };
    };
}) {
    const rowHeight = 20;
    const colWidth = 100;
    return {
        rowHeaderWidth: 46,
        columnHeaderHeight: 20,
        rowHeaderWidthAndMarginLeft: 46,
        columnHeaderHeightAndMarginTop: 20,
        getCellWithCoordByIndex: (row: number, col: number) => ({
            startX: col * colWidth,
            startY: row * rowHeight,
            endX: (col + 1) * colWidth,
            endY: (row + 1) * rowHeight,
        }),
        getNoMergeCellWithCoordByIndex: (row: number, col: number) => ({
            startX: col * colWidth,
            startY: row * rowHeight,
            endX: (col + 1) * colWidth,
            endY: (row + 1) * rowHeight,
        }),
        getCellIndexByOffset: (x: number, y: number) => ({
            row: Math.max(0, Math.floor(y / rowHeight)),
            column: Math.max(0, Math.floor(x / colWidth)),
        }),
        getCellByOffset: (x: number, y: number) => {
            const row = Math.max(0, Math.floor(y / rowHeight));
            const column = Math.max(0, Math.floor(x / colWidth));
            return {
                startRow: row,
                endRow: row,
                startColumn: column,
                endColumn: column,
                actualRow: row,
                actualColumn: column,
                isMerged: false,
                isMergedMainCell: false,
            };
        },
        getColumnCount: () => 20,
        getRowCount: () => 20,
        getWorksheetConfig: () => ({ freeze: { startRow: 0, startColumn: 0, xSplit: 0, ySplit: 0 } }),
        getLocation: options?.getLocation ?? (() => ['test', 'sheet1'] as [string, string]),
        worksheet: options?.worksheet ?? {
            getRowCount: () => 20,
            getColumnCount: () => 20,
            getSheetId: () => 'sheet1',
            getCellInfoInMergeData: (row: number, col: number) => ({
                startRow: row,
                startColumn: col,
                endRow: row,
                endColumn: col,
                isMerged: false,
                isMergedMainCell: false,
            }),
        },
    };
}

const WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1', 'sheet2'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
        sheet2: {
            id: 'sheet2',
            name: 'Sheet2',
            rowCount: 20,
            columnCount: 20,
            cellData: {},
        },
    },
};

class TestShortcutService {
    forceEscape(): IDisposable {
        return toDisposable(() => undefined);
    }
}

class TestSheetSkeletonManagerService {
    private readonly _currentSkeleton$ = new BehaviorSubject<unknown>(null);
    readonly currentSkeleton$ = this._currentSkeleton$.asObservable();
    private _currentParam: unknown;

    emitCurrentSkeleton(param: unknown): void {
        this._currentParam = param;
        this._currentSkeleton$.next(param);
    }

    getCurrentParam(): unknown {
        return this._currentParam;
    }

    getCurrentSkeleton() {
        return (this._currentParam as { skeleton?: unknown } | null)?.skeleton ?? null;
    }

    getSkeletonParam() {
        return this._currentParam;
    }
}

function createSelection(startRow: number, startColumn: number): ISelectionWithStyle {
    return {
        range: {
            startRow,
            endRow: startRow,
            startColumn,
            endColumn: startColumn,
            rangeType: RANGE_TYPE.NORMAL,
        },
        primary: {
            startRow,
            endRow: startRow,
            startColumn,
            endColumn: startColumn,
            actualRow: startRow,
            actualColumn: startColumn,
            isMerged: false,
            isMergedMainCell: false,
        },
        style: null,
    };
}

function createRefSelectionTestBed() {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'ref-selection-render-test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(Injector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            this._injector.add([SheetsSelectionsService]);
            this._injector.add([IRefSelectionsService, { useClass: RefSelectionsService }]);
            this._injector.add([IShortcutService, { useClass: TestShortcutService as never }]);
            this._injector.add([SheetSkeletonManagerService, { useClass: TestSheetSkeletonManagerService as never }]);
        }
    }

    univer.registerPlugin(TestPlugin);
    const workbook = univer.createUnit<IWorkbookData, Workbook>(
        UniverInstanceType.UNIVER_SHEET,
        Tools.deepClone(WORKBOOK_DATA)
    );

    injector.get(IUniverInstanceService).focusUnit(workbook.getUnitId());
    const localeService = injector.get(LocaleService);
    localeService.setLocale(LocaleType.EN_US);
    injector.get(ILogService).setLogLevel(LogLevel.SILENT);
    const contextService = injector.get(IContextService);
    contextService.setContextValue(SELECTIONS_ENABLED, true);
    contextService.setContextValue(REF_SELECTIONS_ENABLED, true);

    const engine = createFakeEngine();
    const viewportMap = new Map<unknown, ReturnType<typeof createFakeViewport>>();
    const viewportKeys = [
        SHEET_VIEWPORT_KEY.VIEW_MAIN,
        SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP,
        SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT,
        SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP,
    ];
    for (const viewportKey of viewportKeys) {
        viewportMap.set(viewportKey, createFakeViewport(viewportKey, { canvasWidth: engine.width, canvasHeight: engine.height }));
    }

    const scene = createFakeScene(viewportMap, engine);
    const components = new Map<unknown, unknown>();
    components.set(SHEET_VIEW_KEY.ROW, { zIndex: 2, onPointerDown$: createTestEvent<unknown>(), dispose: () => undefined });
    components.set(SHEET_VIEW_KEY.COLUMN, { zIndex: 2, onPointerDown$: createTestEvent<unknown>(), dispose: () => undefined });
    components.set(SHEET_VIEW_KEY.LEFT_TOP, { onPointerDown$: createTestEvent<unknown>(), dispose: () => undefined });
    const mainComponent = {
        zIndex: 1,
        onPointerDown$: createTestEvent<unknown>(),
        makeForceDirty: () => undefined,
    };
    const context = {
        unitId: workbook.getUnitId(),
        unit: workbook,
        type: UniverInstanceType.UNIVER_SHEET,
        engine,
        scene,
        mainComponent,
        components,
        isMainScene: true,
        activated$: new BehaviorSubject(true),
        activate: () => undefined,
        deactivate: () => undefined,
    } as unknown as IRenderContext<Workbook>;
    const skeleton = createFakeSkeleton();
    const skeletonManager = injector.get(SheetSkeletonManagerService) as unknown as TestSheetSkeletonManagerService;
    const service = injector.createInstance(RefSelectionsRenderService, context);

    skeletonManager.emitCurrentSkeleton({
        unitId: workbook.getUnitId(),
        sheetId: 'sheet1',
        skeleton,
    });

    return {
        univer,
        injector,
        workbook,
        service,
        scene,
        mainComponent,
        rowHeader: components.get(SHEET_VIEW_KEY.ROW) as { onPointerDown$: ReturnType<typeof createTestEvent<unknown>> },
        columnHeader: components.get(SHEET_VIEW_KEY.COLUMN) as { onPointerDown$: ReturnType<typeof createTestEvent<unknown>> },
        leftTop: components.get(SHEET_VIEW_KEY.LEFT_TOP) as { onPointerDown$: ReturnType<typeof createTestEvent<unknown>> },
        skeleton,
        skeletonManager,
        refSelectionsService: injector.get(IRefSelectionsService),
    };
}

describe('RefSelectionsRenderService', () => {
    const disposables: Array<ReturnType<typeof createRefSelectionTestBed>> = [];

    afterEach(() => {
        while (disposables.length > 0) {
            disposables.pop()!.univer.dispose();
        }
    });

    it('renders formula reference selections from the ref selection model', () => {
        const testBed = createRefSelectionTestBed();
        disposables.push(testBed);
        const { service, refSelectionsService, workbook } = testBed;

        refSelectionsService.setSelections(workbook.getUnitId(), 'sheet1', [
            createSelection(1, 1),
            createSelection(2, 2),
        ], SelectionMoveType.ONLY_SET);

        expect(service.getSelectionControls()).toHaveLength(2);
        expect(service.getSelectionDataWithStyle()).toEqual([
            expect.objectContaining({
                rangeWithCoord: expect.objectContaining({
                    unitId: workbook.getUnitId(),
                    sheetId: 'sheet1',
                    startRow: 1,
                    startColumn: 1,
                }),
            }),
            expect.objectContaining({
                rangeWithCoord: expect.objectContaining({
                    unitId: workbook.getUnitId(),
                    sheetId: 'sheet1',
                    startRow: 2,
                    startColumn: 2,
                }),
            }),
        ]);

        service.clearLastSelection();
        expect(service.getSelectionControls()).toHaveLength(1);
    });

    it('syncs user-driven formula selections back to the ref selection model', () => {
        const testBed = createRefSelectionTestBed();
        disposables.push(testBed);
        const { service, refSelectionsService, workbook } = testBed;

        service.resetSelectionsByModelData([createSelection(4, 3)]);
        service.refreshSelectionMoveStart();
        service.refreshSelectionMoveEnd();

        const workbookSelections = refSelectionsService.getWorkbookSelections(workbook.getUnitId());
        expect(workbookSelections.getCurrentSelections()).toEqual([
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 4,
                    startColumn: 3,
                    rangeType: RANGE_TYPE.NORMAL,
                }),
            }),
        ]);
    });

    it('clears old controls when the active sheet skeleton changes', () => {
        const testBed = createRefSelectionTestBed();
        disposables.push(testBed);
        const { service, skeletonManager, workbook } = testBed;

        service.resetSelectionsByModelData([createSelection(1, 1)]);
        expect(service.getSelectionControls()).toHaveLength(1);

        const sheet2Skeleton = createFakeSkeleton({
            getLocation: () => [workbook.getUnitId(), 'sheet2'],
            worksheet: {
                getRowCount: () => 20,
                getColumnCount: () => 20,
                getSheetId: () => 'sheet2',
                getCellInfoInMergeData: (row: number, col: number) => ({
                    startRow: row,
                    startColumn: col,
                    endRow: row,
                    endColumn: col,
                    isMerged: false,
                    isMergedMainCell: false,
                }),
            },
        });

        skeletonManager.emitCurrentSkeleton({
            unitId: workbook.getUnitId(),
            sheetId: 'sheet2',
            skeleton: sheet2Skeleton,
        });

        expect(service.getLocation()).toEqual([workbook.getUnitId(), 'sheet2']);
        expect(service.getSelectionControls()).toHaveLength(0);
    });

    it('enables and disables formula ref-selection interaction mode idempotently', () => {
        const testBed = createRefSelectionTestBed();
        disposables.push(testBed);
        const { service } = testBed;

        service.setRemainLastEnabled(false);
        service.setSkipLastEnabled(true);
        const disposable = service.enableSelectionChanging();
        service.disableSelectionChanging();
        disposable.dispose();

        expect(service.getSelectionControls()).toEqual([]);
    });

    it('updates formula reference selections from spreadsheet pointer selection', () => {
        const testBed = createRefSelectionTestBed();
        disposables.push(testBed);
        const { service, mainComponent, scene, refSelectionsService, workbook } = testBed;
        const stoppedEvents: string[] = [];

        const selectionChanging = service.enableSelectionChanging();
        mainComponent.onPointerDown$.emit({
            offsetX: 150,
            offsetY: 45,
            button: 0,
            shiftKey: false,
            ctrlKey: false,
        }, {
            stopPropagation: () => stoppedEvents.push('spreadsheet'),
        });

        expect(stoppedEvents).toEqual(['spreadsheet']);
        expect(service.getSelectionControls()).toHaveLength(1);
        expect(service.getSelectionDataWithStyle()[0].rangeWithCoord).toEqual(expect.objectContaining({
            startRow: 2,
            endRow: 2,
            startColumn: 1,
            endColumn: 1,
            rangeType: RANGE_TYPE.NORMAL,
        }));

        scene.onPointerUp$.emit({}, { stopPropagation: () => undefined });
        const workbookSelections = refSelectionsService.getWorkbookSelections(workbook.getUnitId());
        expect(workbookSelections.getCurrentSelections()).toEqual([
            expect.objectContaining({
                range: expect.objectContaining({
                    startRow: 2,
                    endRow: 2,
                    startColumn: 1,
                    endColumn: 1,
                }),
            }),
        ]);

        selectionChanging.dispose();
    });

    it('updates formula reference selections from row, column and sheet header gestures', () => {
        const testBed = createRefSelectionTestBed();
        disposables.push(testBed);
        const { service, rowHeader, columnHeader, leftTop, scene } = testBed;
        const stoppedEvents: string[] = [];
        const selectionChanging = service.enableSelectionChanging();

        rowHeader.onPointerDown$.emit({
            offsetX: 10,
            offsetY: 65,
            button: 0,
            shiftKey: false,
            ctrlKey: false,
        }, {
            stopPropagation: () => stoppedEvents.push('row'),
        });
        expect(service.getSelectionDataWithStyle()[0].rangeWithCoord).toEqual(expect.objectContaining({
            startRow: 3,
            endRow: 3,
            startColumn: 0,
            endColumn: 19,
            rangeType: RANGE_TYPE.ROW,
        }));
        scene.onPointerUp$.emit({}, { stopPropagation: () => undefined });
        service.clearLastSelection();

        columnHeader.onPointerDown$.emit({
            offsetX: 250,
            offsetY: 10,
            button: 0,
            shiftKey: false,
            ctrlKey: false,
        }, {
            stopPropagation: () => stoppedEvents.push('column'),
        });
        expect(service.getSelectionDataWithStyle()[0].rangeWithCoord).toEqual(expect.objectContaining({
            startRow: 0,
            endRow: 19,
            startColumn: 2,
            endColumn: 2,
            rangeType: RANGE_TYPE.COLUMN,
        }));
        scene.onPointerUp$.emit({}, { stopPropagation: () => undefined });

        leftTop.onPointerDown$.emit({
            offsetX: 5,
            offsetY: 5,
            button: 0,
        }, {
            stopPropagation: () => stoppedEvents.push('all'),
        });
        expect(service.getSelectionDataWithStyle()[0].rangeWithCoord).toEqual(expect.objectContaining({
            startRow: 0,
            endRow: 19,
            startColumn: 0,
            endColumn: 19,
        }));
        scene.onPointerUp$.emit({}, { stopPropagation: () => undefined });

        expect(stoppedEvents).toEqual(['row', 'column', 'all']);
        selectionChanging.dispose();
    });
});
