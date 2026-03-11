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
import type { IRenderContext } from '@univerjs/engine-render';
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
            return { dispose: () => handlers.delete(handler) };
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
    left: number;
    top: number;
    width: number;
    height: number;
    scrollAnimationFrameId: number | null;
    isWheelPreventDefaultX: boolean;
    isWheelPreventDefaultY: boolean;
    limitedScroll(x: number, y: number): { isLimitedX: boolean; isLimitedY: boolean };
    scrollToViewportPos(params: { viewportScrollX: number; viewportScrollY: number }): void;
    calcViewportInfo(): { viewBound: unknown };
    getScrollBar(): { horizonScrollTrack?: { height: number }; verticalScrollTrack?: { width: number } } | null;
    onScrollAfter$: ITestEvent<any>;
    onScrollByBar$: ITestEvent<any>;
}

export function createFakeViewport(viewportKey: string, options?: Partial<IFakeViewport>): IFakeViewport {
    const viewport: IFakeViewport = {
        viewportKey,
        viewportScrollX: 0,
        viewportScrollY: 0,
        scrollX: 0,
        scrollY: 0,
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
    addObjects(objs: unknown[], layer?: number): void;
    enableLayerCache(...layers: number[]): void;
    makeDirty(dirty: boolean): void;
    getViewport(key: unknown): IFakeViewport | null;
    getViewports(): IFakeViewport[];
    getParent(): { classType: string };
    getCoordRelativeToViewport(vec: any): { x: number; y: number };
    getScrollXYInfoByViewport(_coords: any, viewport?: IFakeViewport | null): { x: number; y: number };
    getAncestorScale(): { scaleX: number; scaleY: number };
    setCursor(cursor: string): void;
    resetCursor(): void;
    getEngine(): { width: number; height: number };
    addObject(obj: unknown, layer?: number): void;
    disableObjectsEvent(): void;
    enableObjectsEvent(): void;
    transformByState(params: { width: number; height: number }): void;
    scale(x: number, y: number): void;
    onPointerMove$: ITestEvent<any>;
    onPointerUp$: ITestEvent<any>;
}

export function createFakeScene(viewportMap: Map<any, IFakeViewport>, options?: { parentClassType?: string }): IFakeScene {
    const scene: IFakeScene = {
        scaleX: 1,
        scaleY: 1,
        onMouseWheel$: createTestEvent<any, { stopPropagation: () => void }>(),
        onPointerMove$: createTestEvent<any>(),
        onPointerUp$: createTestEvent<any>(),
        addObjects: () => { },
        addObject: () => { },
        disableObjectsEvent: () => { },
        enableObjectsEvent: () => { },
        enableLayerCache: () => { },
        makeDirty: () => { },
        getViewport: (key) => viewportMap.get(key) ?? null,
        getViewports: () => Array.from(viewportMap.values()),
        getParent: () => ({ classType: options?.parentClassType ?? 'SCENE' }),
        setCursor: () => { },
        resetCursor: () => { },
        getEngine: () => ({ width: 800, height: 600 }),
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
    getOffsetByRow(row: number): number;
    getOffsetByColumn(col: number): number;
    getOffsetRelativeToRowCol(viewportScrollX: number, viewportScrollY: number): { row: number; column: number; rowOffset: number; columnOffset: number };
    getRangeByViewBound(_viewBound: unknown): { startRow: number; startColumn: number; endRow: number; endColumn: number };
    getWorksheetConfig(): { freeze: any };
    worksheet: {
        getRowCount: () => number;
        getColumnCount: () => number;
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
        worksheet: {
            getRowCount: () => 200,
            getColumnCount: () => 50,
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

    const viewportMap = new Map<any, IFakeViewport>();
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_MAIN, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT));
    viewportMap.set(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP, createFakeViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP));

    const scene = createFakeScene(viewportMap, { parentClassType: options?.parentClassType });
    const engine = createFakeEngine();

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
