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

import type { IWorkbookData } from '@univerjs/core';
import type { IRender, IRenderManagerService as IRenderManagerServiceType, Scene } from '@univerjs/engine-render';
import type { IFloatDom, IFloatDomLayout } from '@univerjs/ui';
import type { ICanvasFloatDomInfo } from '../canvas-float-dom-manager.service';
import {
    BooleanNumber,
    Disposable,
    DrawingTypeEnum,
    EventSubject,
    LifecycleService,
    LifecycleStages,
    LocaleType,
    UniverInstanceType,
} from '@univerjs/core';
import { IRenderManagerService, Rect, SHEET_VIEWPORT_KEY, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { DrawingApplyType, ISheetDrawingService, RemoveSheetDrawingCommand, SetDrawingApplyMutation, SetSheetDrawingCommand } from '@univerjs/sheets-drawing';
import { ISheetSelectionRenderService, SheetSkeletonManagerService } from '@univerjs/sheets-ui';
import { CanvasFloatDomService } from '@univerjs/ui';
import { BehaviorSubject, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createSheetsDrawingUiTestBed } from '../../__tests__/create-sheets-drawing-ui-test-bed';
import {
    applyFloatDomTransformerConfig,
    calcSheetFloatDomPosition,
    createFloatDomHostClickIntent,
    createFloatDomMoveDragState,
    isCanvasFloatDomDrawingType,
    resolveFloatDomMoveDragTransform,
    SheetCanvasFloatDomManagerService,
    shouldActivateStage2FromHostClickIntent,
    shouldActivateStage2FromHostPointer,
    shouldAutoMountFloatDomRuntime,
    shouldPassThroughFloatDomActivationEvent,
    shouldPassThroughFloatDomRuntimeEvents,
    shouldStartFloatDomMoveFromHandle,
    shouldUseFloatDomPreviewObject,
    syncFloatDomHostSelectionOnStageEnter,
    transformBound2DOMBound,
} from '../canvas-float-dom-manager.service';

const BASE_WORKBOOK_DATA: IWorkbookData = {
    id: 'test',
    appVersion: '3.0.0-alpha',
    locale: LocaleType.EN_US,
    name: '',
    sheetOrder: ['sheet1'],
    styles: {},
    sheets: {
        sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 20,
            columnCount: 20,
            defaultColumnWidth: 72,
            defaultRowHeight: 24,
            rowHeader: { width: 46 },
            columnHeader: { height: 28 },
            cellData: {},
            hidden: BooleanNumber.FALSE,
        },
    },
};

function createWorkbookDataWithFreeze(): IWorkbookData {
    return {
        ...BASE_WORKBOOK_DATA,
        sheets: {
            sheet1: {
                ...BASE_WORKBOOK_DATA.sheets.sheet1,
                freeze: {
                    startRow: 1,
                    startColumn: 1,
                    xSplit: 1,
                    ySplit: 1,
                },
            },
        },
    };
}

function setup(workbookData: IWorkbookData = BASE_WORKBOOK_DATA) {
    const testBed = createSheetsDrawingUiTestBed(workbookData, [
        [IRenderManagerService, { useClass: TestRenderManagerService }],
        [CanvasFloatDomService],
        [SheetCanvasFloatDomManagerService],
    ]);
    const injector = testBed.injector;
    const worksheet = testBed.workbook.getActiveSheet();
    const skeleton = injector.createInstance(
        SpreadsheetSkeleton,
        worksheet,
        testBed.workbook.getStyles()
    ).calculate() as SpreadsheetSkeleton;
    const scene = createScene({
        left: 0,
        top: 0,
        right: 360,
        bottom: 220,
        viewportScrollX: 30,
        viewportScrollY: 18,
    });
    const renderManager = testBed.get(IRenderManagerService) as unknown as TestRenderManagerService;
    renderManager.configure(createRender(skeleton, scene));

    return {
        ...testBed,
        manager: testBed.get(SheetCanvasFloatDomManagerService),
        worksheet,
        skeleton,
        scene,
    };
}

class TestRenderManagerService extends Disposable implements Partial<IRenderManagerServiceType> {
    private _render: IRender | null = null;
    readonly createRender$ = new Subject<string>();
    readonly created$ = new Subject<IRender>();
    readonly disposed$ = new Subject<string>();

    configure(render: IRender): void {
        this._render = render;
    }

    getRenderById(): IRender | null {
        return this._render;
    }

    getRenderUnitById(): IRender | null {
        return this._render;
    }

    has(): boolean {
        return this._render != null;
    }

    getRenderAll(): Map<string, IRender> {
        const renderMap = new Map<string, IRender>();
        if (this._render) {
            renderMap.set(this._render.unitId, this._render);
        }
        return renderMap;
    }
}

class TestSheetSkeletonManager {
    readonly currentSkeleton$: BehaviorSubject<{ sheetId: string } | null>;

    constructor(private readonly _skeleton: SpreadsheetSkeleton) {
        this.currentSkeleton$ = new BehaviorSubject<{ sheetId: string } | null>({ sheetId: 'sheet1' });
    }

    getSkeletonParam() {
        return {
            sheetId: 'sheet1',
            skeleton: this._skeleton,
        };
    }
}

class TestSheetSelectionRenderService {
    getCellWithCoordByOffset(x: number, y: number) {
        const column = Math.max(0, Math.floor(x / 72));
        const row = Math.max(0, Math.floor(y / 24));
        return {
            actualColumn: column,
            actualRow: row,
            startColumn: column,
            endColumn: column,
            startRow: row,
            endRow: row,
            startX: column * 72,
            endX: (column + 1) * 72,
            startY: row * 24,
            endY: (row + 1) * 24,
            isMerged: false,
            isMergedMainCell: false,
        };
    }
}

class TestRenderScene {
    private readonly _objects = new Map<string, Rect>();
    readonly canvasEvents: string[] = [];
    readonly onScrollAfter$ = new EventSubject();
    private readonly _transformer = {
        clearControlByIds: () => undefined,
        clearSelectedObjects: () => undefined,
    };

    constructor(private readonly _viewport: {
        left: number;
        top: number;
        right: number;
        bottom: number;
        viewportScrollX: number;
        viewportScrollY: number;
        onScrollAfter$?: EventSubject<unknown>;
    }) {
        this._viewport.onScrollAfter$ = this.onScrollAfter$;
    }

    getAncestorScale() {
        return { scaleX: 1, scaleY: 1 };
    }

    getViewport(key: string) {
        return key === SHEET_VIEWPORT_KEY.VIEW_MAIN ? this._viewport : null;
    }

    getMainViewport() {
        return this._viewport;
    }

    getTransformerByCreate() {
        return this._transformer;
    }

    getTransformer() {
        return this._transformer;
    }

    addObject(object: Rect) {
        this._objects.set(object.oKey, object);
    }

    removeObject(object: Rect) {
        this._objects.delete(object.oKey);
    }

    getObject(key: string) {
        return this._objects.get(key);
    }

    attachTransformerTo() { }

    detachTransformerFrom() { }

    scrollTo(viewportScrollX: number, viewportScrollY: number): void {
        this._viewport.viewportScrollX = viewportScrollX;
        this._viewport.viewportScrollY = viewportScrollY;
        this.onScrollAfter$.emitEvent({} as never);
    }
}

function createRender(skeleton: SpreadsheetSkeleton, scene: Scene): IRender {
    const sheetSkeletonManager = new TestSheetSkeletonManager(skeleton);
    const sheetSelectionRenderService = new TestSheetSelectionRenderService();
    const canvasElement = document.createElement('div');
    const testScene = scene as unknown as TestRenderScene;
    canvasElement.dispatchEvent = (event: Event) => {
        testScene.canvasEvents.push(event.type);
        return true;
    };
    const activated$ = new BehaviorSubject(true);

    return {
        unitId: 'test',
        type: UniverInstanceType.UNIVER_SHEET,
        engine: {
            clientRect$: new BehaviorSubject({ width: 360, height: 220 }),
            getCanvasElement: () => canvasElement,
        } as unknown as IRender['engine'],
        scene,
        mainComponent: null,
        components: new Map(),
        isMainScene: true,
        render: { scene },
        activated$,
        with: (dependency: unknown) => {
            if (dependency === SheetSkeletonManagerService) {
                return sheetSkeletonManager;
            }
            if (dependency === ISheetSelectionRenderService) {
                return sheetSelectionRenderService;
            }
            return null;
        },
        deactivate: () => activated$.next(false),
        activate: () => activated$.next(true),
        isDisposed: () => false,
    } as unknown as IRender;
}

function createScene(viewport: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    viewportScrollX: number;
    viewportScrollY: number;
}): Scene {
    return new TestRenderScene(viewport) as unknown as Scene;
}

function expectLayout(layout: IFloatDomLayout, expected: IFloatDomLayout): void {
    expect(layout).toEqual(expected);
}

function createService(drawing: unknown) {
    const dispose = vi.fn();
    const removeObject = vi.fn();
    const syncExecuteCommand = vi.fn(() => true);
    const getDrawingByParam = vi.fn(() => drawing);
    const getBatchRemoveOp = vi.fn(() => ({
        unitId: 'unit-1',
        subUnitId: 'sheet-1',
        redo: ['redo-op'],
        objects: ['object-1'],
    }));
    const service = Object.create(SheetCanvasFloatDomManagerService.prototype) as any;

    service._domLayerInfoMap = new Map([
        ['float-dom-1', {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            dispose: { dispose },
            rect: { id: 'rect-1' },
        }],
    ]);
    service._drawingManagerService = { getDrawingByParam };
    service._commandService = { syncExecuteCommand };
    service._sheetDrawingService = { getBatchRemoveOp };
    service._getSceneAndTransformerByDrawingSearch = vi.fn(() => ({
        scene: { removeObject },
    }));

    return { service, dispose, removeObject, syncExecuteCommand, getDrawingByParam, getBatchRemoveOp };
}

describe('SheetCanvasFloatDomManagerService', () => {
    const disposables: Array<ReturnType<typeof setup>> = [];

    it('treats embed block drawings as canvas float dom drawings', () => {
        expect(isCanvasFloatDomDrawingType(DrawingTypeEnum.DRAWING_BLOCK)).toBe(true);
        expect(isCanvasFloatDomDrawingType(DrawingTypeEnum.DRAWING_DOM)).toBe(true);
        expect(isCanvasFloatDomDrawingType(DrawingTypeEnum.DRAWING_CHART)).toBe(true);
        expect(isCanvasFloatDomDrawingType(DrawingTypeEnum.DRAWING_IMAGE)).toBe(false);
    });

    it('does not auto mount embed float doms that opt into stage2 runtime mounting', () => {
        expect(shouldAutoMountFloatDomRuntime({
            data: {
                version: 1,
                embedId: 'embed-slide',
                runtimeMountMode: 'stage2',
            },
        } as any)).toBe(false);
    });

    it('keeps existing float doms auto mounted by default', () => {
        expect(shouldAutoMountFloatDomRuntime({
            data: {
                version: 1,
                embedId: 'embed-doc',
            },
        } as any)).toBe(true);
        expect(shouldAutoMountFloatDomRuntime({
            data: {
                runtimeMountMode: 'stage2',
            },
        } as any)).toBe(true);
    });

    it('does not use host scene preview image objects for embed float doms', () => {
        expect(shouldUseFloatDomPreviewObject({
            data: {
                version: 1,
                embedId: 'embed-slide',
                runtimeMountMode: 'stage2',
            },
        } as any)).toBe(false);
        expect(shouldUseFloatDomPreviewObject({
            data: {
                version: 1,
                embedId: 'embed-slide',
                runtimeMountMode: 'always',
            },
        } as any)).toBe(false);
    });

    it('disables host event pass-through for stage2-only embed runtimes', () => {
        expect(shouldPassThroughFloatDomRuntimeEvents({
            data: {
                version: 1,
                embedId: 'embed-slide',
                runtimeMountMode: 'stage2',
            },
        } as any)).toBe(false);
        expect(shouldPassThroughFloatDomRuntimeEvents({
            data: {
                version: 1,
                embedId: 'embed-chart',
            },
        } as any)).toBe(true);
    });

    it('applies embed transformer config with visual padding and aspect-ratio locking', () => {
        const rect = {};

        applyFloatDomTransformerConfig(rect as any, {
            data: {
                version: 1,
                embedId: 'embed-slide',
                resizeBehavior: 'aspect-ratio',
            },
        } as any);

        expect((rect as any).transformerConfig).toEqual(expect.objectContaining({
            borderEnabled: true,
            borderSpacing: 2,
            keepRatio: true,
            rotateEnabled: false,
            resizeEnabled: true,
        }));
    });

    it('mounts and unmounts lazy float dom runtime from stored runtime config', () => {
        const addFloatDom = vi.fn();
        const removeFloatDom = vi.fn();
        const updateFloatDom = vi.fn();
        const service = Object.create(SheetCanvasFloatDomManagerService.prototype) as any;
        const floatDomConfig = {
            id: 'float-dom-1',
            componentKey: 'Component',
            unitId: 'unit-1',
            data: {
                version: 1,
                embedId: 'embed-slide',
                runtimeMountMode: 'stage2',
            },
        };
        service._canvasFloatDomService = {
            addFloatDom,
            removeFloatDom,
            updateFloatDom,
            domLayers: [['float-dom-1', floatDomConfig]],
        };
        service._domLayerInfoMap = new Map([
            ['float-dom-1', {
                id: 'float-dom-1',
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                floatDomConfig,
                runtimeMounted: false,
            }],
        ]);

        expect(service.isFloatDomRuntimeMounted('float-dom-1')).toBe(false);
        expect(service.mountFloatDomRuntime('float-dom-1')).toBe(true);
        expect(service.isFloatDomRuntimeMounted('float-dom-1')).toBe(true);
        expect(addFloatDom).not.toHaveBeenCalled();
        expect(updateFloatDom).toHaveBeenCalledWith('float-dom-1', expect.objectContaining({
            eventPassThrough: false,
            props: expect.objectContaining({ initialStage: 'stage2' }),
        }));

        expect(service.mountFloatDomRuntime('float-dom-1')).toBe(true);
        expect(updateFloatDom).toHaveBeenCalledTimes(1);

        service.unmountFloatDomRuntime('float-dom-1');
        expect(removeFloatDom).not.toHaveBeenCalled();
        expect(updateFloatDom).toHaveBeenLastCalledWith('float-dom-1', {
            eventPassThrough: true,
            props: undefined,
        });
        expect(service.isFloatDomRuntimeMounted('float-dom-1')).toBe(false);
    });

    it('promotes lazy float dom runtime from inactive to stage2 on the second activation', () => {
        const addFloatDom = vi.fn();
        const updateFloatDom = vi.fn();
        const service = Object.create(SheetCanvasFloatDomManagerService.prototype) as any;
        const floatDomConfig = {
            id: 'float-dom-1',
            componentKey: 'Component',
            unitId: 'unit-1',
            data: {
                version: 1,
                embedId: 'embed-slide',
                runtimeMountMode: 'stage2',
            },
        };
        service._canvasFloatDomService = {
            addFloatDom,
            updateFloatDom,
            removeFloatDom: vi.fn(),
            domLayers: [['float-dom-1', floatDomConfig]],
        };
        service._domLayerInfoMap = new Map([
            ['float-dom-1', {
                id: 'float-dom-1',
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                floatDomConfig,
                runtimeMounted: false,
            }],
        ]);

        expect(service.promoteFloatDomRuntimeStage('float-dom-1')).toBe('stage1');
        expect(addFloatDom).not.toHaveBeenCalled();
        expect(service.promoteFloatDomRuntimeStage('float-dom-1')).toBe('stage2');
        expect(addFloatDom).not.toHaveBeenCalled();
        expect(updateFloatDom).toHaveBeenCalledWith('float-dom-1', expect.objectContaining({
            eventPassThrough: false,
            props: expect.objectContaining({ initialStage: 'stage2' }),
        }));
    });

    it('lets stage1 activation continue to host selection but stops stage2 activation', () => {
        expect(shouldPassThroughFloatDomActivationEvent('stage1')).toBe(true);
        expect(shouldPassThroughFloatDomActivationEvent('stage2')).toBe(false);
        expect(shouldPassThroughFloatDomActivationEvent(undefined)).toBe(true);
    });

    it('syncs host transformer when a lazy float dom enters stage1 or stage2', () => {
        const attachTransformerTo = vi.fn();
        const clearControlByIds = vi.fn();
        const clearSelectedObjects = vi.fn();
        const transformer = {
            cleared: false,
            clearSelectedObjects() {
                this.cleared = true;
                clearSelectedObjects();
            },
        };
        const renderObject = {
            transformer: { clearControlByIds },
            scene: {
                attachTransformerTo,
                getTransformer: () => transformer,
            },
        };
        const rect = { oKey: 'rect-key-1' };

        syncFloatDomHostSelectionOnStageEnter('stage1', renderObject as any, rect as any);
        expect(attachTransformerTo).toHaveBeenCalledWith(rect);

        syncFloatDomHostSelectionOnStageEnter('stage2', renderObject as any, rect as any);
        expect(clearControlByIds).toHaveBeenCalledWith(['rect-key-1']);
        expect(clearSelectedObjects).toHaveBeenCalled();
        expect(transformer.cleared).toBe(true);
    });

    it('allows host-level block body clicks to activate stage2 after stage1 selection', () => {
        const info = {
            runtimeMounted: false,
            runtimeStage: 'stage1',
            position$: {
                getValue: () => ({
                    startX: 100,
                    endX: 420,
                    startY: 80,
                    endY: 260,
                }),
            },
            rect: {
                left: 1000,
                top: 800,
                width: 320,
                height: 180,
            },
        };

        expect(shouldActivateStage2FromHostPointer(info as any, { offsetX: 120, offsetY: 100 } as any)).toBe(true);
        expect(shouldActivateStage2FromHostPointer(info as any, { offsetX: 20, offsetY: 100 } as any)).toBe(false);
        expect(shouldActivateStage2FromHostPointer({ ...info, runtimeStage: 'inactive' } as any, { offsetX: 120, offsetY: 100 } as any)).toBe(false);
    });

    it('activates stage2 from host only on pointerup click intent', () => {
        const info = createStage1FloatDomInfo();
        const intent = createFloatDomHostClickIntent(info as any, {
            type: 'pointerdown',
            pointerId: 1,
            offsetX: 120,
            offsetY: 100,
        } as any);

        expect(intent).toEqual(expect.objectContaining({
            pointerId: 1,
            startOffsetX: 120,
            startOffsetY: 100,
        }));
        expect(shouldActivateStage2FromHostClickIntent(info as any, intent, {
            type: 'pointerdown',
            pointerId: 1,
            offsetX: 120,
            offsetY: 100,
        } as any)).toBe(false);
        expect(shouldActivateStage2FromHostClickIntent(info as any, intent, {
            type: 'pointerup',
            pointerId: 1,
            offsetX: 121,
            offsetY: 101,
        } as any)).toBe(true);
    });

    it('does not activate stage2 from host after drag intent', () => {
        const info = createStage1FloatDomInfo();
        const intent = createFloatDomHostClickIntent(info as any, {
            type: 'pointerdown',
            pointerId: 1,
            offsetX: 120,
            offsetY: 100,
        } as any);

        expect(shouldActivateStage2FromHostClickIntent(info as any, intent, {
            type: 'pointerup',
            pointerId: 1,
            offsetX: 140,
            offsetY: 100,
        } as any)).toBe(false);
    });

    it('starts host float dom moving only from the matching drag handle event', () => {
        const info = {
            id: 'anchor-1',
            unitId: 'host-1',
            rect: {
                left: 100,
                top: 40,
            },
        };

        expect(shouldStartFloatDomMoveFromHandle(info as any, {
            hostAnchorId: 'anchor-1',
            hostUnitId: 'host-1',
            clientX: 20,
            clientY: 30,
            button: 0,
        })).toBe(true);
        expect(shouldStartFloatDomMoveFromHandle(info as any, {
            hostAnchorId: 'other-anchor',
            hostUnitId: 'host-1',
            clientX: 20,
            clientY: 30,
            button: 0,
        })).toBe(false);
        expect(shouldStartFloatDomMoveFromHandle(info as any, {
            hostAnchorId: 'anchor-1',
            hostUnitId: 'other-host',
            clientX: 20,
            clientY: 30,
            button: 0,
        })).toBe(false);
        expect(shouldStartFloatDomMoveFromHandle(info as any, {
            hostAnchorId: 'anchor-1',
            hostUnitId: 'host-1',
            clientX: 20,
            clientY: 30,
            button: 2,
        })).toBe(false);
    });

    it('resolves host float dom drag deltas through the scene scale', () => {
        const dragState = createFloatDomMoveDragState({
            rect: {
                left: 100,
                top: 40,
            },
        } as any, {
            pointerId: 1,
            clientX: 20,
            clientY: 30,
        });

        expect(dragState).toEqual(expect.objectContaining({
            pointerId: 1,
            startLeft: 100,
            startTop: 40,
        }));
        expect(resolveFloatDomMoveDragTransform(dragState!, {
            clientX: 40,
            clientY: 42,
        } as any, {
            getAncestorScale: () => ({ scaleX: 2, scaleY: 3 }),
        } as any)).toEqual({
            left: 110,
            top: 44,
        });
    });

    it('removes drawing-backed float doms through the shared remove path', () => {
        const drawing = {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'float-dom-1',
        };
        const { service, dispose, removeObject, syncExecuteCommand, getDrawingByParam, getBatchRemoveOp } = createService(drawing);

        service.removeFloatDom('float-dom-1');

        expect(dispose).toHaveBeenCalledTimes(1);
        expect(removeObject).toHaveBeenCalledWith({ id: 'rect-1' });
        expect(getDrawingByParam).toHaveBeenCalledWith({
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            drawingId: 'float-dom-1',
        });
        expect(getBatchRemoveOp).toHaveBeenCalledWith([drawing]);
        expect(syncExecuteCommand).toHaveBeenCalledWith(SetDrawingApplyMutation.id, {
            unitId: 'unit-1',
            subUnitId: 'sheet-1',
            op: ['redo-op'],
            objects: ['object-1'],
            type: DrawingApplyType.REMOVE,
        });
        expect(service.getFloatDomInfo('float-dom-1')).toBeUndefined();
    });

    it('removes runtime-only float doms directly', () => {
        const { service, dispose, removeObject, syncExecuteCommand } = createService(null);

        service.removeFloatDom('float-dom-1');

        expect(dispose).toHaveBeenCalledTimes(1);
        expect(removeObject).toHaveBeenCalledWith({ id: 'rect-1' });
        expect(syncExecuteCommand).not.toHaveBeenCalled();
        expect(service.getFloatDomInfo('float-dom-1')).toBeUndefined();
    });

    afterEach(() => {
        while (disposables.length > 0) {
            const current = disposables.pop()!;
            current.univer.dispose();
        }
    });

    it('keeps a normal float dom inside the visible sheet area while the sheet scrolls', () => {
        const fixture = setup();
        disposables.push(fixture);
        const rect = new Rect('float-dom', {
            left: 80,
            top: 50,
            width: 100,
            height: 40,
        });

        expectLayout(calcSheetFloatDomPosition(rect, fixture.scene, fixture.skeleton, fixture.worksheet), {
            rotate: 0,
            startX: 50,
            startY: 32,
            endX: 150,
            endY: 72,
            width: 100,
            height: 40,
            absolute: {
                left: false,
                top: false,
            },
        });
    });

    it('does not scroll a float dom that belongs to the frozen first row and column', () => {
        const fixture = setup(createWorkbookDataWithFreeze());
        disposables.push(fixture);
        const rect = new Rect('frozen-float-dom', {
            left: 60,
            top: 34,
            width: 40,
            height: 12,
        });

        expectLayout(calcSheetFloatDomPosition(rect, fixture.scene, fixture.skeleton, fixture.worksheet), {
            rotate: 0,
            startX: 60,
            startY: 34,
            endX: 100,
            endY: 46,
            width: 40,
            height: 12,
            absolute: {
                left: true,
                top: true,
            },
        });
    });

    it('clips a partially hidden float dom to the sheet headers instead of letting it cover them', () => {
        const fixture = setup();
        disposables.push(fixture);

        expect(transformBound2DOMBound({
            left: 12,
            right: 70,
            top: 10,
            bottom: 64,
        }, fixture.scene, fixture.skeleton, fixture.worksheet)).toEqual({
            left: 46,
            right: 46,
            top: 28,
            bottom: 46,
            absolute: {
                left: false,
                top: false,
            },
        });
    });

    it('keeps float dom bounds stable when the main viewport is unavailable', () => {
        const fixture = setup();
        disposables.push(fixture);
        const scene = createScene({
            left: 0,
            top: 0,
            right: 360,
            bottom: 220,
            viewportScrollX: 30,
            viewportScrollY: 18,
        });
        scene.getViewport = () => undefined;

        expect(transformBound2DOMBound({
            left: 20,
            right: 120,
            top: 30,
            bottom: 90,
        }, scene, fixture.skeleton, fixture.worksheet)).toEqual({
            left: 20,
            right: 120,
            top: 30,
            bottom: 90,
            absolute: {
                left: true,
                top: true,
            },
        });
    });

    it('handles frozen panes when float doms cross or move past the frozen boundary', () => {
        const fixture = setup(createWorkbookDataWithFreeze());
        disposables.push(fixture);

        expect(transformBound2DOMBound({
            left: 100,
            right: 150,
            top: 44,
            bottom: 80,
        }, fixture.scene, fixture.skeleton, fixture.worksheet)).toEqual({
            left: 100,
            right: 120,
            top: 44,
            bottom: 62,
            absolute: {
                left: true,
                top: true,
            },
        });

        expect(transformBound2DOMBound({
            left: 140,
            right: 200,
            top: 70,
            bottom: 110,
        }, fixture.scene, fixture.skeleton, fixture.worksheet)).toEqual({
            left: 110,
            right: 170,
            top: 52,
            bottom: 92,
            absolute: {
                left: false,
                top: false,
            },
        });
    });

    it('can keep horizontal sheet coordinates fixed for vertically responsive float doms', () => {
        const fixture = setup();
        disposables.push(fixture);
        const floatDomInfo = {
            scrollDirectionResponse: 'VERTICAL',
        } as ICanvasFloatDomInfo;

        expect(transformBound2DOMBound({
            left: 100,
            right: 160,
            top: 90,
            bottom: 130,
        }, fixture.scene, fixture.skeleton, fixture.worksheet, floatDomInfo, true)).toEqual({
            left: 100,
            right: 160,
            top: 72,
            bottom: 112,
            absolute: {
                left: false,
                top: false,
            },
        });
    });

    it('adds range and column header float doms to the canvas layer and removes them through their disposables', () => {
        const fixture = setup();
        disposables.push(fixture);
        const canvasFloatDomService = fixture.get(CanvasFloatDomService);

        const rangeDom = fixture.manager.addFloatDomToRange({
            startRow: 1,
            endRow: 2,
            startColumn: 1,
            endColumn: 2,
        }, {
            componentKey: 'RangeCard',
            initPosition: { startX: 0, startY: 0, endX: 0, endY: 0 },
            data: { label: 'Range order' },
            allowTransform: true,
            eventPassThrough: true,
        }, {
            width: 80,
            height: 24,
            horizonOffsetAlign: 'right',
            verticalOffsetAlign: 'bottom',
            marginX: 4,
            marginY: 2,
        }, 'range-card')!;
        const headerDom = fixture.manager.addFloatDomToColumnHeader(2, {
            componentKey: 'ColumnHeaderCard',
            initPosition: { startX: 0, startY: 0, endX: 0, endY: 0 },
            data: { label: 'Column action' },
            allowTransform: false,
            eventPassThrough: true,
        }, {
            width: 96,
            height: 28,
            marginX: 0,
            marginY: 0,
        }, 'header-card')!;
        const chartDom = fixture.manager.addFloatDomToRange({
            startRow: 3,
            endRow: 4,
            startColumn: 3,
            endColumn: 4,
        }, {
            componentKey: 'ChartCard',
            initPosition: { startX: 0, startY: 0, endX: 0, endY: 0 },
            data: { label: 'Revenue', backgroundColor: '#ffffff', border: '#111111' },
            allowTransform: true,
            type: DrawingTypeEnum.DRAWING_CHART,
        }, {
            width: 120,
            height: 72,
            marginX: 0,
            marginY: 0,
        }, 'chart-card')!;

        expect(fixture.manager.getFloatDomsBySubUnitId('test', 'sheet1').length).toBe(3);
        expect(findFloatDom(canvasFloatDomService, 'range-card')).toEqual(expect.objectContaining({
            componentKey: 'RangeCard',
            data: { label: 'Range order' },
            unitId: 'test',
        }));
        expect(findFloatDom(canvasFloatDomService, 'header-card')).toEqual(expect.objectContaining({
            componentKey: 'ColumnHeaderCard',
            data: { label: 'Column action' },
            unitId: 'test',
        }));
        expect(findFloatDom(canvasFloatDomService, 'chart-card')).toEqual(expect.objectContaining({
            componentKey: 'ChartCard',
            data: { label: 'Revenue', backgroundColor: '#ffffff', border: '#111111' },
            unitId: 'test',
        }));
        expect(fixture.manager.getFloatDomInfo('chart-card')?.rect.toJson()).toEqual(expect.objectContaining({
            fill: '#ffffff',
            stroke: '#111111',
            paintFirst: 'stroke',
            radius: 8,
        }));
        findFloatDom(canvasFloatDomService, 'range-card')?.onPointerDown(new MouseEvent('pointerdown'));
        findFloatDom(canvasFloatDomService, 'range-card')?.onPointerMove(new MouseEvent('pointermove'));
        findFloatDom(canvasFloatDomService, 'range-card')?.onPointerUp(new MouseEvent('pointerup'));
        findFloatDom(canvasFloatDomService, 'range-card')?.onWheel(new WheelEvent('wheel'));
        findFloatDom(canvasFloatDomService, 'header-card')?.onPointerDown(new MouseEvent('pointerdown'));
        findFloatDom(canvasFloatDomService, 'header-card')?.onPointerMove(new MouseEvent('pointermove'));
        findFloatDom(canvasFloatDomService, 'header-card')?.onPointerUp(new MouseEvent('pointerup'));
        findFloatDom(canvasFloatDomService, 'header-card')?.onWheel(new WheelEvent('wheel'));
        expect((fixture.scene as unknown as TestRenderScene).canvasEvents).toEqual([
            'pointerdown',
            'pointermove',
            'pointerup',
            'wheel',
            'pointerdown',
            'pointermove',
            'pointerup',
            'wheel',
        ]);

        fixture.manager.updateFloatDomProps('test', 'sheet1', 'range-card', { fill: '#ff0000' });
        expect(fixture.manager.getFloatDomInfo('range-card')?.rect.toJson().fill).toBe('#ff0000');

        rangeDom.dispose();
        expect(findFloatDom(canvasFloatDomService, 'range-card')).toBeUndefined();
        expect(findFloatDom(canvasFloatDomService, 'header-card')).toBeDefined();

        chartDom.dispose();
        expect(findFloatDom(canvasFloatDomService, 'chart-card')).toBeUndefined();

        headerDom.dispose();
        expect(fixture.manager.getFloatDomsBySubUnitId('test', 'sheet1')).toEqual([]);
        expect(findFloatDom(canvasFloatDomService, 'header-card')).toBeUndefined();
    });

    it('adds a position anchored float dom through the sheet drawing pipeline', async () => {
        const fixture = setup();
        disposables.push(fixture);
        const canvasFloatDomService = fixture.get(CanvasFloatDomService);
        const sheetDrawingService = fixture.get(ISheetDrawingService);
        const addedIds: string[] = [];
        const disposable = fixture.manager.add$.subscribe((event) => {
            addedIds.push(event.id);
        });

        fixture.manager.addFloatDomToPosition({
            componentKey: 'PositionCard',
            initPosition: {
                startX: 76,
                startY: 30,
                endX: 176,
                endY: 70,
            },
            data: { label: 'Pinned note' },
            allowTransform: true,
        }, 'position-card')!;
        await Promise.resolve();

        const drawing = sheetDrawingService.getDrawingByParam({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'position-card',
        });
        if (!drawing) {
            throw new Error('position-card drawing should be created');
        }
        expect(addedIds).toEqual(['position-card']);
        expect(drawing).toEqual(expect.objectContaining({
            componentKey: 'PositionCard',
            data: { label: 'Pinned note' },
            transform: {
                left: 76,
                top: 30,
                width: 100,
                height: 40,
            },
            sheetTransform: {
                from: {
                    column: 1,
                    columnOffset: 4,
                    row: 1,
                    rowOffset: 6,
                },
                to: {
                    column: 2,
                    columnOffset: 32,
                    row: 2,
                    rowOffset: 22,
                },
            },
        }));
        expect(findFloatDom(canvasFloatDomService, 'position-card')).toEqual(expect.objectContaining({
            componentKey: 'PositionCard',
            data: { label: 'Pinned note' },
            unitId: 'test',
        }));
        findFloatDom(canvasFloatDomService, 'position-card')?.onPointerDown(new MouseEvent('pointerdown'));
        findFloatDom(canvasFloatDomService, 'position-card')?.onPointerMove(new MouseEvent('pointermove'));
        findFloatDom(canvasFloatDomService, 'position-card')?.onPointerUp(new MouseEvent('pointerup'));
        findFloatDom(canvasFloatDomService, 'position-card')?.onWheel(new WheelEvent('wheel'));
        expect((fixture.scene as unknown as TestRenderScene).canvasEvents).toEqual([
            'pointerdown',
            'pointermove',
            'pointerup',
            'wheel',
        ]);

        const transformChanges: unknown[] = [];
        const transformDisposable = fixture.manager.transformChange$.subscribe((event) => {
            transformChanges.push(event);
        });
        const positions: IFloatDomLayout[] = [];
        const positionSubscription = findFloatDom(canvasFloatDomService, 'position-card')!.position$.subscribe((position) => {
            positions.push(position);
        });

        fixture.manager.getFloatDomInfo('position-card')!.rect.transformByState({
            left: 88,
            top: 36,
            width: 104,
            height: 44,
        });
        expect(positions[positions.length - 1]).toEqual(expect.objectContaining({
            startX: 58,
            startY: 28,
            endX: 162,
            endY: 62,
            width: 104,
            height: 44,
        }));

        await fixture.commandService.executeCommand(SetSheetDrawingCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{
                ...drawing,
                allowTransform: false,
                data: { label: 'Pinned note updated' },
                transform: {
                    left: 96,
                    top: 40,
                    width: 120,
                    height: 48,
                },
            }],
        });
        expect(transformChanges).toEqual([{
            id: 'position-card',
            value: {
                left: 96,
                top: 40,
                width: 120,
                height: 48,
            },
        }]);
        expect(findFloatDom(canvasFloatDomService, 'position-card')).toEqual(expect.objectContaining({
            data: { label: 'Pinned note updated' },
        }));

        await fixture.commandService.executeCommand(RemoveSheetDrawingCommand.id, {
            unitId: 'test',
            subUnitId: 'sheet1',
            drawings: [{
                unitId: 'test',
                subUnitId: 'sheet1',
                drawingId: 'position-card',
                drawingType: drawing.drawingType,
            }],
        });
        expect(sheetDrawingService.getDrawingByParam({
            unitId: 'test',
            subUnitId: 'sheet1',
            drawingId: 'position-card',
        })).toBeUndefined();
        expect(findFloatDom(canvasFloatDomService, 'position-card')).toBeUndefined();

        transformDisposable.unsubscribe();
        positionSubscription.unsubscribe();
        disposable.unsubscribe();
    });

    it('refreshes float dom position when the sheet viewport scrolls', () => {
        const fixture = setup();
        disposables.push(fixture);
        fixture.get(LifecycleService).stage = LifecycleStages.Rendered;
        const canvasFloatDomService = fixture.get(CanvasFloatDomService);

        fixture.manager.addFloatDomToRange({
            startRow: 5,
            endRow: 5,
            startColumn: 5,
            endColumn: 5,
        }, {
            componentKey: 'ScrollAwareCard',
            initPosition: { startX: 0, startY: 0, endX: 0, endY: 0 },
            data: { label: 'Scroll aware' },
            allowTransform: true,
        }, {
            width: 80,
            height: 24,
            marginX: 0,
            marginY: 0,
        }, 'scroll-card')!;

        const positions: IFloatDomLayout[] = [];
        const floatDom = findFloatDom(canvasFloatDomService, 'scroll-card')!;
        const subscription = floatDom.position$.subscribe((position) => {
            positions.push(position);
        });
        const before = positions[positions.length - 1];

        (fixture.scene as unknown as TestRenderScene).scrollTo(60, 42);
        const after = positions[positions.length - 1];

        expect(after).toEqual({
            ...before,
            startX: before.startX - 30,
            endX: before.endX - 30,
            startY: before.startY - 24,
            endY: before.endY - 24,
        });

        subscription.unsubscribe();
    });
});

function findFloatDom(canvasFloatDomService: CanvasFloatDomService, id: string): IFloatDom | undefined {
    for (const [domId, floatDom] of canvasFloatDomService.domLayers) {
        if (domId === id) {
            return floatDom;
        }
    }
}

function createStage1FloatDomInfo() {
    return {
        runtimeMounted: false,
        runtimeStage: 'stage1',
        position$: {
            getValue: () => ({
                startX: 100,
                endX: 420,
                startY: 80,
                endY: 260,
            }),
        },
        rect: {
            left: 1000,
            top: 800,
            width: 320,
            height: 180,
        },
    };
}
