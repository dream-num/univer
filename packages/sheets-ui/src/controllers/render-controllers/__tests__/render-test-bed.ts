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

import type { Dependency, IDisposable, Injector, IWorkbookData, Workbook } from '@univerjs/core';
import type { IRenderContext, Vector2 } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import { ICommandService, IContextService, ILogService, Inject, IUniverInstanceService, LocaleService, LocaleType, LogLevel, Plugin, Tools, Univer, Injector as UniverInjector, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService, SHEET_VIEWPORT_KEY } from '@univerjs/engine-render';
import { SheetInterceptorService, SheetsSelectionsService } from '@univerjs/sheets';
import { BehaviorSubject, Subject } from 'rxjs';
import { SHEET_VIEW_KEY } from '../../../common/keys';
import enUS from '../../../locale/en-US';
import { SheetSkeletonManagerService } from '../../../services/sheet-skeleton-manager.service';

export interface ITestEvent<TEvent, TState = { stopPropagation: () => void }> {
    subscribeEvent(handler: (evt: TEvent, state: TState) => void): IDisposable;
    emit(evt: TEvent, state: TState): void;
}

export function createTestEvent<TEvent, TState = { stopPropagation: () => void }>(): ITestEvent<TEvent, TState> {
    const handlers = new Set<(evt: TEvent, state: TState) => void>();
    return {
        subscribeEvent(handler) {
            handlers.add(handler);
            const dispose = () => handlers.delete(handler);
            return { dispose, unsubscribe: dispose } as unknown as IDisposable;
        },
        emit(evt, state) {
            handlers.forEach((handler) => handler(evt, state));
        },
    };
}

export interface IFakeViewport {
    viewportKey: string;
    viewportScrollX: number;
    viewportScrollY: number;
    scrollX: number;
    scrollY: number;
    isActive: boolean;
    left: number;
    top: number;
    width: number;
    height: number;
    scrollAnimationFrameId: number | null;
    isWheelPreventDefaultX: boolean;
    isWheelPreventDefaultY: boolean;
    padding?: { startX: number; endX: number; startY: number; endY: number };
    limitedScroll(x: number, y: number): { isLimitedX: boolean; isLimitedY: boolean };
    scrollToViewportPos(params: { viewportScrollX: number; viewportScrollY: number }): void;
    updateScrollVal(params: { scrollX?: number; scrollY?: number; viewportScrollX?: number; viewportScrollY?: number }): void;
    scrollByViewportDeltaVal(params: { viewportScrollX: number; viewportScrollY: number }): boolean;
    transScroll2ViewportScrollValue(viewportScrollX: number, viewportScrollY: number): { x: number; y: number };
    enable(): void;
    disable(): void;
    setPadding(padding: { startX: number; endX: number; startY: number; endY: number }): void;
    resetPadding(): void;
    resizeWhenFreezeChange(params: { left?: number; top?: number; right?: number; bottom?: number; width?: number; height?: number }): void;
    calcViewportInfo(): { viewBound: unknown };
    getScrollBar(): { horizonScrollTrack?: { height: number }; verticalScrollTrack?: { width: number } } | null;
    onScrollAfter$: ITestEvent<any>;
    onScrollByBar$: ITestEvent<any>;
}

export function createFakeViewport(viewportKey: string, options?: Partial<IFakeViewport> & { canvasWidth?: number; canvasHeight?: number }): IFakeViewport {
    const canvasWidth = options?.canvasWidth ?? 800;
    const canvasHeight = options?.canvasHeight ?? 600;
    const viewport: IFakeViewport = {
        viewportKey,
        viewportScrollX: 0,
        viewportScrollY: 0,
        scrollX: 0,
        scrollY: 0,
        isActive: true,
        left: 0,
        top: 0,
        width: 800,
        height: 600,
        scrollAnimationFrameId: null,
        isWheelPreventDefaultX: false,
        isWheelPreventDefaultY: false,
        onScrollAfter$: createTestEvent<any>(),
        onScrollByBar$: createTestEvent<any>(),
        limitedScroll: () => ({ isLimitedX: false, isLimitedY: false }),
        scrollToViewportPos: ({ viewportScrollX, viewportScrollY }) => {
            viewport.viewportScrollX = viewportScrollX;
            viewport.viewportScrollY = viewportScrollY;
        },
        updateScrollVal: ({ scrollX, scrollY, viewportScrollX, viewportScrollY }) => {
            if (typeof scrollX === 'number') viewport.scrollX = scrollX;
            if (typeof scrollY === 'number') viewport.scrollY = scrollY;
            if (typeof viewportScrollX === 'number') viewport.viewportScrollX = viewportScrollX;
            if (typeof viewportScrollY === 'number') viewport.viewportScrollY = viewportScrollY;
        },
        scrollByViewportDeltaVal: ({ viewportScrollX, viewportScrollY }) => {
            viewport.viewportScrollX += viewportScrollX;
            viewport.viewportScrollY += viewportScrollY;
            return true;
        },
        transScroll2ViewportScrollValue: (viewportScrollX, viewportScrollY) => ({ x: viewportScrollX, y: viewportScrollY }),
        enable: () => {
            viewport.isActive = true;
        },
        disable: () => {
            viewport.isActive = false;
        },
        setPadding: (padding) => {
            viewport.padding = padding;
        },
        resetPadding: () => {
            viewport.padding = { startX: 0, endX: 0, startY: 0, endY: 0 };
        },
        resizeWhenFreezeChange: ({ left, top, right, bottom, width, height }) => {
            if (typeof left === 'number') viewport.left = left;
            if (typeof top === 'number') viewport.top = top;

            if (typeof width === 'number') viewport.width = width;
            if (typeof height === 'number') viewport.height = height;

            if (typeof right === 'number') {
                viewport.width = Math.max(0, canvasWidth - (viewport.left ?? 0) - right);
            }
            if (typeof bottom === 'number') {
                viewport.height = Math.max(0, canvasHeight - (viewport.top ?? 0) - bottom);
            }
        },
        calcViewportInfo: () => ({ viewBound: null }),
        getScrollBar: () => null,
        ...options,
    };

    return viewport;
}

export interface IFakeScene {
    scaleX: number;
    scaleY: number;
    onMouseWheel$: ITestEvent<any>;
    onTransformChange$: ITestEvent<any>;
    addObjects(objs: unknown[], layer?: number): void;
    enableLayerCache(...layers: number[]): void;
    makeDirty(dirty: boolean): void;
    getViewport(key: unknown): IFakeViewport | null;
    getViewports(): IFakeViewport[];
    getActiveViewportByCoord(_coord: Vector2): IFakeViewport | null;
    findViewportByPosToScene(_coord: Vector2): IFakeViewport | null;
    getViewportScrollXY(viewport: IFakeViewport): { x: number; y: number };
    getParent(): { classType: string };
    getCoordRelativeToViewport(vec: any): { x: number; y: number };
    getScrollXYInfoByViewport(_coords: any, viewport?: IFakeViewport | null): { x: number; y: number };
    getAncestorScale(): { scaleX: number; scaleY: number };
    setCursor(cursor: string): void;
    resetCursor(): void;
    getEngine(): { width: number; height: number };
    addObject(obj: unknown, layer?: number): void;
    removeObject(obj: unknown): void;
    addLayer(layer: unknown): void;
    findLayerByZIndex(zIndex: number): unknown | null;
    disableObjectsEvent(): void;
    enableObjectsEvent(): void;
    transformByState(params: { width: number; height: number }): void;
    scale(x: number, y: number): void;
    onPointerMove$: ITestEvent<any>;
    onPointerUp$: ITestEvent<any>;
}

export function createFakeScene(
    viewportMap: Map<any, IFakeViewport>,
    options?: { parentClassType?: string; engine?: IFakeEngine }
): IFakeScene {
    const layers = new Map<number, unknown>();
    const scene: IFakeScene = {
        scaleX: 1,
        scaleY: 1,
        onMouseWheel$: createTestEvent<any, { stopPropagation: () => void }>(),
        onTransformChange$: createTestEvent<any>(),
        onPointerMove$: createTestEvent<any>(),
        onPointerUp$: createTestEvent<any>(),
        addObjects: (objs) => {
            objs.forEach((obj) => {
                (obj as any).parent = scene;
            });
        },
        addObject: (obj) => {
            (obj as any).parent = scene;
        },
        removeObject: () => { },
        addLayer: (layer) => {
            // We only need zIndex tracking for tests; render pipeline is not exercised here.
            const zIndex = (layer as any)?.zIndex;
            if (typeof zIndex === 'number') layers.set(zIndex, layer);
        },
        findLayerByZIndex: (zIndex) => layers.get(zIndex) ?? null,
        disableObjectsEvent: () => { },
        enableObjectsEvent: () => { },
        enableLayerCache: () => { },
        makeDirty: () => { },
        getViewport: (key) => viewportMap.get(key) ?? null,
        getViewports: () => Array.from(viewportMap.values()),
        getActiveViewportByCoord: () => viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) ?? null,
        findViewportByPosToScene: () => viewportMap.get(SHEET_VIEWPORT_KEY.VIEW_MAIN) ?? null,
        getViewportScrollXY: (viewport) => ({ x: viewport.viewportScrollX, y: viewport.viewportScrollY }),
        getParent: () => ({ classType: options?.parentClassType ?? 'SCENE' }),
        setCursor: () => { },
        resetCursor: () => { },
        getEngine: () => (options?.engine as any) ?? ({ width: 800, height: 600 }),
        getCoordRelativeToViewport: (vec: any) => ({ x: vec?.x ?? vec?.[0] ?? 0, y: vec?.y ?? vec?.[1] ?? 0 }),
        getScrollXYInfoByViewport: (_coords, viewport) => ({ x: viewport?.viewportScrollX ?? 0, y: viewport?.viewportScrollY ?? 0 }),
        getAncestorScale: () => ({ scaleX: scene.scaleX, scaleY: scene.scaleY }),
        transformByState: () => { },
        scale: (x, y) => {
            scene.scaleX = x;
            scene.scaleY = y;
        },
    };
    return scene;
}

export interface IFakeEngine {
    width: number;
    height: number;
    runRenderLoop(cb: () => void): void;
    stopRenderLoop(cb: () => void): void;
    beginFrame$: Observable<void>;
    endFrame$: Observable<any>;
    renderFrameTimeMetric$: Observable<[string, number]>;
    renderFrameTags$: Observable<[string, any]>;
}

export function createFakeEngine(): IFakeEngine {
    const beginFrame$ = new Subject<void>();
    const endFrame$ = new Subject<any>();
    const renderFrameTimeMetric$ = new Subject<[string, number]>();
    const renderFrameTags$ = new Subject<[string, any]>();

    return {
        width: 800,
        height: 600,
        beginFrame$,
        endFrame$,
        renderFrameTimeMetric$,
        renderFrameTags$,
        runRenderLoop: (cb) => {
            cb();
            beginFrame$.next();
            endFrame$.next({ FPS: 60, elapsedTime: 1, frameTime: 16 });
        },
        stopRenderLoop: () => { },
    };
}

export interface IFakeSkeleton {
    rowHeaderWidth: number;
    columnHeaderHeight: number;
    rowTotalHeight: number;
    columnTotalWidth: number;
    rowHeaderWidthAndMarginLeft: number;
    columnHeaderHeightAndMarginTop: number;
    rowHeightAccumulation: number[];
    columnWidthAccumulation: number[];
    getCellWithCoordByIndex(row: number, col: number, _ignoreMerge?: boolean): { startX: number; startY: number; endX: number; endY: number };
    getNoMergeCellWithCoordByIndex(row: number, col: number): { startX: number; startY: number; endX: number; endY: number };
    getCellIndexByOffset(
        x: number,
        y: number,
        scaleX: number,
        scaleY: number,
        scrollXY: { x: number; y: number },
        _options?: { closeFirst?: boolean }
    ): { row: number; column: number };
    getOffsetByRow(row: number): number;
    getOffsetByColumn(col: number): number;
    getOffsetRelativeToRowCol(viewportScrollX: number, viewportScrollY: number): { row: number; column: number; rowOffset: number; columnOffset: number };
    getRangeByViewBound(_viewBound: unknown): { startRow: number; startColumn: number; endRow: number; endColumn: number };
    getWorksheetConfig(): { freeze: any };
    getLocation(): [string, string];
    worksheet: {
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
}

export function createFakeSkeleton(options?: Partial<IFakeSkeleton>): IFakeSkeleton {
    const rowHeight = 20;
    const colWidth = 100;

    const skeleton: IFakeSkeleton = {
        rowHeaderWidth: 46,
        columnHeaderHeight: 20,
        rowTotalHeight: rowHeight * 200,
        columnTotalWidth: colWidth * 50,
        rowHeaderWidthAndMarginLeft: 46,
        columnHeaderHeightAndMarginTop: 20,
        rowHeightAccumulation: Array.from({ length: 200 }, (_, i) => (i + 1) * rowHeight),
        columnWidthAccumulation: Array.from({ length: 50 }, (_, i) => (i + 1) * colWidth),
        getCellWithCoordByIndex: (row, col) => ({
            startX: col * colWidth,
            startY: row * rowHeight,
            endX: col * colWidth + colWidth,
            endY: row * rowHeight + rowHeight,
        }),
        getNoMergeCellWithCoordByIndex: (row, col) => ({
            startX: col * colWidth,
            startY: row * rowHeight,
            endX: col * colWidth + colWidth,
            endY: row * rowHeight + rowHeight,
        }),
        getCellIndexByOffset: (x, y, scaleX, scaleY, scrollXY) => {
            const actualX = x / (scaleX || 1) + (scrollXY?.x ?? 0);
            const actualY = y / (scaleY || 1) + (scrollXY?.y ?? 0);
            return {
                row: Math.max(0, Math.floor(actualY / rowHeight)),
                column: Math.max(0, Math.floor(actualX / colWidth)),
            };
        },
        getOffsetByRow: (row) => row * rowHeight,
        getOffsetByColumn: (col) => col * colWidth,
        getOffsetRelativeToRowCol: (viewportScrollX, viewportScrollY) => {
            const column = Math.max(0, Math.floor(viewportScrollX / colWidth));
            const row = Math.max(0, Math.floor(viewportScrollY / rowHeight));
            return {
                row,
                column,
                rowOffset: viewportScrollY - row * rowHeight,
                columnOffset: viewportScrollX - column * colWidth,
            };
        },
        getRangeByViewBound: () => ({ startRow: 0, startColumn: 0, endRow: 20, endColumn: 10 }),
        getWorksheetConfig: () => ({ freeze: { startRow: 0, startColumn: 0, xSplit: 0, ySplit: 0 } }),
        getLocation: () => ['test', 'sheet1'],
        worksheet: {
            getRowCount: () => 200,
            getColumnCount: () => 50,
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
        ...options,
    };

    return skeleton;
}

export interface IRenderTestBed {
    univer: Univer;
    injector: Injector;
    get: Injector['get'];
    sheet: Workbook;
    context: IRenderContext<Workbook>;
    viewportMap: Map<any, IFakeViewport>;
    scene: IFakeScene;
    engine: IFakeEngine;
    skeleton: IFakeSkeleton;
    commandService: ICommandService;
    contextService: IContextService;
    sheetSkeletonManagerService: {
        currentSkeleton$: Observable<any>;
        currentSkeletonBefore$: Observable<any>;
        getCurrentParam: () => { unitId: string; sheetId: string; skeleton: IFakeSkeleton };
        getCurrentSkeleton: () => IFakeSkeleton;
        getSkeletonParam: (sheetId: string) => { skeleton: IFakeSkeleton } | null;
        attachRangeWithCoord: (range: { startRow: number; startColumn: number; endRow: number; endColumn: number; rangeType?: unknown }) => any;
        emitCurrentSkeleton: (value: any) => void;
        emitCurrentSkeletonBefore: (value: any) => void;
    };
    renderManagerService: IRenderManagerService;
}

// eslint-disable-next-line max-lines-per-function
export function createRenderTestBed(options?: { workbookData?: IWorkbookData; dependencies?: Dependency[]; parentClassType?: string }): IRenderTestBed {
    const univer = new Univer();
    const injector = univer.__getInjector();

    class TestPlugin extends Plugin {
        static override pluginName = 'render-test-plugin';
        static override type = UniverInstanceType.UNIVER_SHEET;

        constructor(
            _config: undefined,
            @Inject(UniverInjector) override readonly _injector: Injector
        ) {
            super();
        }

        override onStarting(): void {
            this._injector.add([SheetsSelectionsService]);
            this._injector.add([SheetInterceptorService]);
            options?.dependencies?.forEach((d) => this._injector.add(d));
        }
    }

    univer.registerPlugin(TestPlugin);

    const snapshot = Tools.deepClone(options?.workbookData ?? {
        id: 'test',
        appVersion: '3.0.0-alpha',
        locale: LocaleType.ZH_CN,
        name: '',
        sheetOrder: [],
        styles: {},
        sheets: {
            sheet1: {
                id: 'sheet1',
                cellData: {},
            },
        },
    } satisfies IWorkbookData);

    const sheet = univer.createUnit<IWorkbookData, Workbook>(UniverInstanceType.UNIVER_SHEET, snapshot);
    injector.get(IUniverInstanceService).focusUnit(snapshot.id);

    const localeService = injector.get(LocaleService);
    localeService.setLocale(LocaleType.EN_US);
    localeService.load({ enUS });

    injector.get(ILogService).setLogLevel(LogLevel.SILENT);

    const contextService = injector.get(IContextService);
    const commandService = injector.get(ICommandService);

    const engine = createFakeEngine();

    const viewportMap = new Map<any, IFakeViewport>();
    const viewportFactory = (key: string) => createFakeViewport(key, { canvasWidth: engine.width, canvasHeight: engine.height });
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_MAIN, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_MAIN));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_ROW_TOP));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP, viewportFactory(SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP));

    const scene = createFakeScene(viewportMap, { parentClassType: options?.parentClassType, engine });

    const components = new Map<any, any>();
    components.set(SHEET_VIEW_KEY.ROW, { onPointerDown$: createTestEvent<any>(), onPointerMove$: createTestEvent<any>(), onPointerLeave$: createTestEvent<any>() });
    components.set(SHEET_VIEW_KEY.COLUMN, { onPointerDown$: createTestEvent<any>(), onPointerMove$: createTestEvent<any>(), onPointerLeave$: createTestEvent<any>() });
    components.set(SHEET_VIEW_KEY.LEFT_TOP, { onPointerDown$: createTestEvent<any>() });

    const mainComponent = {
        zIndex: 1,
        makeForceDirty: () => { },
        onPointerDown$: createTestEvent<any>(),
    };

    const context: IRenderContext<Workbook> = {
        unitId: sheet.getUnitId(),
        unit: sheet,
        type: UniverInstanceType.UNIVER_SHEET,
        engine: engine as any,
        scene: scene as any,
        mainComponent: mainComponent as any,
        components,
        isMainScene: true,
        activated$: new BehaviorSubject(true),
        activate: () => { },
        deactivate: () => { },
    } as unknown as IRenderContext<Workbook>;

    const skeleton = createFakeSkeleton();
    const currentSkeleton$ = new BehaviorSubject<any>(null);
    const currentSkeletonBefore$ = new BehaviorSubject<any>(null);
    const sheetSkeletonManagerService = {
        currentSkeleton$: currentSkeleton$.asObservable(),
        currentSkeletonBefore$: currentSkeletonBefore$.asObservable(),
        getCurrentParam: () => ({ unitId: sheet.getUnitId(), sheetId: 'sheet1', skeleton }),
        getCurrentSkeleton: () => skeleton,
        getSkeletonParam: (_sheetId: string) => ({ skeleton }),
        attachRangeWithCoord: (range: { startRow: number; startColumn: number; endRow: number; endColumn: number; rangeType?: unknown }) => {
            const { startRow, startColumn, endRow, endColumn, rangeType } = range;
            const startCell = skeleton.getNoMergeCellWithCoordByIndex(startRow, startColumn);
            const endCell = skeleton.getNoMergeCellWithCoordByIndex(endRow, endColumn);
            return {
                startRow,
                startColumn,
                endRow,
                endColumn,
                rangeType,
                startX: startCell?.startX ?? 0,
                startY: startCell?.startY ?? 0,
                endX: endCell?.endX ?? 0,
                endY: endCell?.endY ?? 0,
            };
        },
        emitCurrentSkeleton: (value: any) => currentSkeleton$.next(value),
        emitCurrentSkeletonBefore: (value: any) => currentSkeletonBefore$.next(value),
    };

    injector.add([SheetSkeletonManagerService, { useValue: sheetSkeletonManagerService as any }]);

    const renderManagerService: IRenderManagerService = {
        getRenderById: (unitId: string) => {
            if (unitId !== sheet.getUnitId()) return null as any;
            return {
                unitId,
                engine,
                scene,
                mainComponent,
                components,
            } as any;
        },
    } as IRenderManagerService;

    injector.add([IRenderManagerService, { useValue: renderManagerService as any }]);

    return {
        univer,
        injector,
        get: injector.get.bind(injector),
        sheet,
        context,
        viewportMap,
        scene,
        engine,
        skeleton,
        commandService,
        contextService,
        sheetSkeletonManagerService,
        renderManagerService,
    };
}
