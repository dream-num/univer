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
import {
    ContextService,
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    InterceptorEffectEnum,
    IUniverInstanceService,
    LocaleType,
    ThemeService,
    toDisposable,
    UniverInstanceService,
    Workbook,
} from '@univerjs/core';
import { Engine, IRenderManagerService, RenderManagerService, RenderUnit, Scene } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import { ILayoutService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { SheetLoadingRenderService } from '../sheet-loading-render.service';

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const original = await importOriginal<typeof import('@univerjs/engine-render')>();

    class MockScene {
        disableObjectsEvent = vi.fn();
        makeDirty = vi.fn();
        render = vi.fn();
        requestRender = vi.fn(async () => {});
        dispose = vi.fn();
    }

    class MockEngine {
        private readonly _canvasElement = document.createElement('canvas');

        constructor() {
            this._canvasElement.style.position = 'absolute';
            this._canvasElement.style.zIndex = '8';
        }

        getCanvas() {
            return {
                setId: (id: string) => { this._canvasElement.id = id; },
                getCanvasEle: () => this._canvasElement,
            };
        }

        getCanvasElement() {
            return this._canvasElement;
        }

        mount(element: HTMLElement) {
            element.append(this._canvasElement);
        }

        dispose() {
            this._canvasElement.remove();
        }
    }

    class MockRenderUnit {
        readonly components = new Map();
        readonly mainComponent = null;
        readonly engine: MockEngine;
        readonly scene: MockScene;
        private readonly _skeletonManager = {
            setCurrent: vi.fn(),
            makeDirty: vi.fn(),
            reCalculate: vi.fn(),
        };

        constructor(options: { engine: MockEngine; scene: MockScene }) {
            this.engine = options.engine;
            this.scene = options.scene;
        }

        addRenderDependencies() { }

        with() {
            return this._skeletonManager;
        }

        dispose() { }
    }

    return {
        ...original,
        Engine: MockEngine,
        RenderUnit: MockRenderUnit,
        Scene: MockScene,
    };
});

function createLayoutService(getContentElement: () => HTMLElement): ILayoutService {
    return {
        isFocused: false,
        rootContainerElement: null,
        focus() { },
        registerFocusHandler: () => toDisposable(() => {}),
        registerRootContainerElement: () => toDisposable(() => {}),
        registerContentElement: () => toDisposable(() => {}),
        registerContainerElement: () => toDisposable(() => {}),
        getContentElement,
        checkElementInCurrentContainers: () => false,
        checkContentIsFocused: () => false,
    };
}

describe('SheetLoadingRenderService', () => {
    it('skips the preview and completes handoff when workbench content is not registered', async () => {
        const contentElements: HTMLElement[] = [];
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([ThemeService]);
        injector.add([SheetInterceptorService]);
        injector.add([ILayoutService, { useValue: createLayoutService(() => contentElements[0]) }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        const service = injector.createInstance(SheetLoadingRenderService);
        const workbookData = {
            id: 'unit-1',
            name: 'Workbook',
            appVersion: '',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: { 'sheet-1': { id: 'sheet-1', cellData: {} } },
            resources: [],
        } satisfies IWorkbookData;

        service.showSkeleton(workbookData, 'sheet-1');
        service.show(workbookData, 'sheet-1', {});

        expect(service.loading$.value).toBe(true);
        expect(service.previewReady$.value).toBe(false);
        await expect(service.handoff('unit-1', 10_000)).resolves.toBe(true);
        expect(service.loading$.value).toBe(false);
        service.dispose();
        injector.get(IRenderManagerService).dispose();
    });

    it('renders intercepted display values without owning the global workbook or pointer events', async () => {
        const contentElement = document.createElement('div');
        contentElement.style.pointerEvents = 'auto';
        vi.spyOn(contentElement, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 640, 480));
        const animationFrames: FrameRequestCallback[] = [];
        const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            animationFrames.push(callback);
            return animationFrames.length;
        });

        const layoutService = createLayoutService(() => contentElement);
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([ThemeService]);
        injector.add([SheetInterceptorService]);
        const interceptorService = injector.get(SheetInterceptorService);
        const displayInterceptor = vi.fn((cell, context, next) => next({ ...cell, v: '1,234' }));
        interceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            effect: InterceptorEffectEnum.Value | InterceptorEffectEnum.Style,
            handler: displayInterceptor,
        });

        injector.add([ILayoutService, { useValue: layoutService }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        const service = injector.createInstance(SheetLoadingRenderService);
        const workbookData = {
            id: 'unit-1',
            name: 'Workbook',
            appVersion: '',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: {
                'sheet-1': {
                    id: 'sheet-1',
                    cellData: {},
                },
            },
            resources: [],
        } satisfies IWorkbookData;
        const finalWorkbook = injector.createInstance(Workbook, workbookData);
        const finalEngine = new Engine('unit-1');
        const finalScene = new Scene('unit-1-scene', finalEngine);
        const finalRender = injector.createInstance(RenderUnit, {
            unit: finalWorkbook,
            engine: finalEngine,
            scene: finalScene,
            isMainScene: true,
        });
        injector.get(IRenderManagerService).addRender('unit-1', finalRender);

        service.showSkeleton(workbookData, 'sheet-1');

        expect(service.loading$.value).toBe(true);
        expect(service.previewReady$.value).toBe(false);
        expect(contentElement.querySelector('canvas')).toBeNull();

        service.show(workbookData, 'sheet-1', { 2: { 3: { v: 1234 } } });
        finalEngine.mount(contentElement);
        animationFrames[0](0);
        await vi.waitFor(() => expect(finalEngine.getCanvasElement().style.visibility).toBe('hidden'));

        const previewWorkbook = service.workbook$.value;
        expect(contentElement.style.pointerEvents).toBe('auto');
        expect(contentElement.querySelector('canvas')?.style.pointerEvents).toBe('none');
        expect(Array.from(contentElement.querySelectorAll('canvas')).map((canvas) => canvas.style.zIndex)).toEqual(['9', '8']);
        expect(service.previewReady$.value).toBe(true);
        expect(previewWorkbook?.getSheetBySheetId('sheet-1')?.getCellRaw(2, 3)?.v).toBe('1,234');
        expect(displayInterceptor).toHaveBeenCalledWith(
            { v: 1234 },
            expect.objectContaining({
                unitId: 'unit-1',
                subUnitId: 'sheet-1',
                workbook: previewWorkbook,
                row: 2,
                col: 3,
                rawData: { v: 1234 },
            }),
            expect.any(Function)
        );

        const handoff = service.handoff('unit-1', 10_000);
        await vi.waitFor(() => expect(animationFrames).toHaveLength(2));

        expect(finalScene.makeDirty).toHaveBeenCalledWith(true);
        expect(finalScene.requestRender).toHaveBeenCalledTimes(1);
        expect(service.loading$.value).toBe(true);
        expect(contentElement.querySelectorAll('canvas')).toHaveLength(2);
        expect(finalEngine.getCanvasElement().style.visibility).toBe('hidden');

        animationFrames[1](0);
        await expect(handoff).resolves.toBe(true);

        expect(service.loading$.value).toBe(false);
        expect(service.previewReady$.value).toBe(false);
        expect(contentElement.querySelectorAll('canvas')).toHaveLength(1);
        expect(contentElement.querySelector('canvas')?.style.zIndex).toBe('8');
        expect(finalEngine.getCanvasElement().style.visibility).toBe('');
        service.dispose();
        injector.get(IRenderManagerService).dispose();
        finalWorkbook.dispose();
        finalEngine.dispose();
        requestAnimationFrame.mockRestore();
    });

    it('keeps the preview mounted when the final renderer times out', async () => {
        vi.useFakeTimers();
        const contentElement = document.createElement('div');
        vi.spyOn(contentElement, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 640, 480));
        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([ThemeService]);
        injector.add([SheetInterceptorService]);
        injector.add([ILayoutService, { useValue: createLayoutService(() => contentElement) }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        const service = injector.createInstance(SheetLoadingRenderService);
        const workbookData = {
            id: 'unit-1',
            name: 'Workbook',
            appVersion: '',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: { 'sheet-1': { id: 'sheet-1', cellData: {} } },
            resources: [],
        } satisfies IWorkbookData;
        service.showSkeleton(workbookData, 'sheet-1');
        service.show(workbookData, 'sheet-1', {});

        const handoff = service.handoff('unit-1', 10_000);
        await vi.advanceTimersByTimeAsync(10_000);

        await expect(handoff).resolves.toBe(false);
        expect(service.loading$.value).toBe(true);
        expect(contentElement.querySelector('canvas')).not.toBeNull();
        service.dispose();
        injector.get(IRenderManagerService).dispose();
        vi.useRealTimers();
    });

    it('keeps the preview mounted until workbench content and the final canvas are mounted', async () => {
        const contentElement = document.createElement('div');
        const contentElements = [contentElement];
        vi.spyOn(contentElement, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 640, 480));
        const animationFrames: FrameRequestCallback[] = [];
        const requestAnimationFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
            animationFrames.push(callback);
            return animationFrames.length;
        });

        const injector = new Injector();
        injector.add([ILogService, { useClass: DesktopLogService }]);
        injector.add([IContextService, { useClass: ContextService }]);
        injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
        injector.add([ThemeService]);
        injector.add([SheetInterceptorService]);
        injector.add([ILayoutService, { useValue: createLayoutService(() => contentElements[0]) }]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        const service = injector.createInstance(SheetLoadingRenderService);
        const workbookData = {
            id: 'unit-1',
            name: 'Workbook',
            appVersion: '',
            locale: LocaleType.EN_US,
            styles: {},
            sheetOrder: ['sheet-1'],
            sheets: { 'sheet-1': { id: 'sheet-1', cellData: {} } },
            resources: [],
        } satisfies IWorkbookData;
        const finalWorkbook = injector.createInstance(Workbook, workbookData);
        const finalEngine = new Engine('unit-1');
        const finalScene = new Scene('unit-1-scene', finalEngine);
        const finalRender = injector.createInstance(RenderUnit, {
            unit: finalWorkbook,
            engine: finalEngine,
            scene: finalScene,
            isMainScene: true,
        });
        injector.get(IRenderManagerService).addRender('unit-1', finalRender);

        service.showSkeleton(workbookData, 'sheet-1');
        service.show(workbookData, 'sheet-1', {});

        contentElements.length = 0;
        const handoff = service.handoff('unit-1', 10_000);
        await vi.waitFor(() => expect(animationFrames).toHaveLength(2));

        expect(finalScene.requestRender).not.toHaveBeenCalled();
        expect(service.loading$.value).toBe(true);
        expect(contentElement.querySelectorAll('canvas')).toHaveLength(1);

        animationFrames[1](0);
        await vi.waitFor(() => expect(animationFrames).toHaveLength(3));
        expect(finalScene.requestRender).not.toHaveBeenCalled();

        contentElements.push(contentElement);
        finalEngine.mount(contentElement);
        animationFrames[2](0);
        await vi.waitFor(() => expect(animationFrames).toHaveLength(4));

        expect(finalScene.requestRender).toHaveBeenCalledTimes(1);
        expect(service.loading$.value).toBe(true);
        expect(contentElement.querySelectorAll('canvas')).toHaveLength(2);
        expect(finalEngine.getCanvasElement().style.visibility).toBe('hidden');

        animationFrames[3](0);
        await expect(handoff).resolves.toBe(true);

        expect(service.loading$.value).toBe(false);
        expect(contentElement.querySelectorAll('canvas')).toHaveLength(1);
        expect(finalEngine.getCanvasElement().style.visibility).toBe('');
        service.dispose();
        injector.get(IRenderManagerService).dispose();
        finalWorkbook.dispose();
        finalEngine.dispose();
        requestAnimationFrame.mockRestore();
    });
});
