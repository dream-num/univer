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

import type { IDisposable } from '@univerjs/core';
import {
    ContextService,
    DesktopLogService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    LifecycleStages,
    LifecycleUnreachableError,
    UniverInstanceService,
} from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { IWorkbenchService, WorkbenchService } from '../../../services/workbench/workbench.service';
import { SingleUnitUIController } from '../ui-shared.controller';

class TestSingleUnitUIController extends SingleUnitUIController {
    callbackPromise: Promise<void> | null = null;

    constructor(
        injector: any,
        instanceService: any,
        layoutService: any,
        lifecycleService: any,
        renderManagerService: any,
        private readonly _contentElement: HTMLElement,
        private readonly _containerElement: HTMLElement
    ) {
        super(injector, instanceService, layoutService, lifecycleService, renderManagerService);
    }

    runBootstrap() {
        this._bootstrapWorkbench();
    }

    override bootstrap(callback: (contentElement: HTMLElement, containerElement: HTMLElement) => void): IDisposable {
        this.callbackPromise = Promise.resolve(callback(this._contentElement, this._containerElement));
        return {
            dispose: vi.fn(),
        };
    }
}

function createRenderer(unitId: string, isMainScene = true) {
    const canvas = document.createElement('canvas');

    return {
        unitId,
        isMainScene,
        activate: vi.fn(),
        deactivate: vi.fn(),
        engine: {
            getCanvasElement: () => canvas,
            mount: vi.fn((element: HTMLElement) => element.appendChild(canvas)),
            unmount: vi.fn(() => canvas.remove()),
        },
    };
}

describe('SingleUnitUIController', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should bootstrap and switch renderers with lifecycle updates', async () => {
        vi.useFakeTimers();
        vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
            callback(0);
            return 0;
        });

        const injector = new Injector([
            [IContextService, { useClass: ContextService }],
            [ILogService, { useClass: DesktopLogService }],
            [IUniverInstanceService, { useClass: UniverInstanceService }],
            [IWorkbenchService, { useClass: WorkbenchService }],
        ]);
        const skeletonStates: boolean[] = [];
        injector.get(IWorkbenchService).skeletonVisible$.subscribe((visible) => skeletonStates.push(visible));

        const layoutService = {
            registerRootContainerElement: vi.fn(() => ({ dispose: vi.fn() })),
            registerContentElement: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const focused$ = new Subject<string>();
        const created$ = new Subject<any>();
        const disposed$ = new Subject<string>();

        const render1 = createRenderer('__INTERNAL_EDITOR__skip');
        const render2 = createRenderer('render-2');
        const render3 = createRenderer('render-3');
        const rendererMap = new Map<string, any>([
            ['render-1', render1],
            ['render-2', render2],
            ['render-3', render3],
        ]);

        const renderManagerService = {
            getRenderAll: vi.fn(() => rendererMap),
            getRenderUnitById: vi.fn((id: string) => rendererMap.get(id)),
            created$,
            disposed$,
        };

        const instanceService = {
            focused$,
            getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'render-3' })),
            getUnitCreateOptions: vi.fn(() => null),
        };

        const lifecycleService = {
            onStage: vi.fn().mockResolvedValue(undefined),
            stage: LifecycleStages.Starting,
        };

        const controller = new TestSingleUnitUIController(
            injector,
            instanceService,
            layoutService,
            lifecycleService,
            renderManagerService,
            document.createElement('div'),
            document.createElement('div')
        );

        controller.runBootstrap();
        expect(skeletonStates).toEqual([false, true]);

        await controller.callbackPromise;
        expect(layoutService.registerRootContainerElement).toHaveBeenCalledTimes(1);
        expect(layoutService.registerContentElement).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(300);
        expect(render2.engine.mount).toHaveBeenCalledTimes(1);
        expect(render2.activate).toHaveBeenCalledTimes(1);
        expect(lifecycleService.stage).toBe(LifecycleStages.Rendered);
        expect(skeletonStates).toEqual([false, true, false]);

        focused$.next('render-2');
        expect(render2.engine.mount).toHaveBeenCalledTimes(1);

        render2.engine.getCanvasElement().remove();
        focused$.next('render-2');
        expect(render2.engine.mount).toHaveBeenCalledTimes(2);

        focused$.next('render-3');
        expect(render2.deactivate).toHaveBeenCalledTimes(1);
        expect(render2.engine.unmount).toHaveBeenCalledTimes(1);
        expect(render3.engine.mount).toHaveBeenCalledTimes(1);

        created$.next({ unitId: 'render-3' });
        expect(render3.engine.mount).toHaveBeenCalledTimes(1);

        disposed$.next('render-3');
        focused$.next('render-3');
        expect(render3.engine.mount).toHaveBeenCalledTimes(1);
        expect(render3.activate).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(3000);
        expect(lifecycleService.stage).toBe(LifecycleStages.Steady);

        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
        controller.dispose();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('preserves a renderer mounted in a product-owned workbench host', async () => {
        vi.useFakeTimers();

        const contentElement = document.createElement('div');
        const productCanvasHost = document.createElement('div');
        const renderer = createRenderer('render-1');
        productCanvasHost.appendChild(renderer.engine.getCanvasElement());
        contentElement.appendChild(productCanvasHost);

        const renderManagerService = {
            getRenderAll: vi.fn(() => new Map([['render-1', renderer]])),
            getRenderUnitById: vi.fn(() => renderer),
            created$: new Subject<unknown>(),
            disposed$: new Subject<string>(),
        };
        const controller = new TestSingleUnitUIController(
            new Injector(),
            {
                focused$: new Subject<string>(),
                getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'render-1' })),
                getUnitCreateOptions: vi.fn(() => null),
            },
            {
                registerRootContainerElement: vi.fn(() => ({ dispose: vi.fn() })),
                registerContentElement: vi.fn(() => ({ dispose: vi.fn() })),
            },
            {
                onStage: vi.fn().mockResolvedValue(undefined),
                stage: LifecycleStages.Starting,
            },
            renderManagerService,
            contentElement,
            document.createElement('div')
        );

        controller.runBootstrap();
        await controller.callbackPromise;
        vi.advanceTimersByTime(300);

        expect(renderer.engine.mount).not.toHaveBeenCalled();
        expect(renderer.engine.getCanvasElement().parentElement).toBe(productCanvasHost);
        expect(renderer.activate).toHaveBeenCalledTimes(1);
    });

    it('should not switch the global workbench to a non-main renderer', async () => {
        vi.useFakeTimers();

        const layoutService = {
            registerRootContainerElement: vi.fn(() => ({ dispose: vi.fn() })),
            registerContentElement: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const focused$ = new Subject<string>();
        const created$ = new Subject<any>();
        const normalRender = createRenderer('normal-render');
        const embeddedRender = createRenderer('embedded-render', false);
        const productCanvasHost = document.createElement('div');
        productCanvasHost.appendChild(embeddedRender.engine.getCanvasElement());
        const rendererMap = new Map<string, any>([
            ['normal-render', normalRender],
            ['embedded-render', embeddedRender],
        ]);

        const renderManagerService = {
            getRenderAll: vi.fn(() => rendererMap),
            getRenderUnitById: vi.fn((id: string) => rendererMap.get(id)),
            created$,
            disposed$: new Subject<string>(),
        };

        const instanceService = {
            focused$,
            getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'embedded-render' })),
            getUnitCreateOptions: vi.fn(() => null),
        };

        const lifecycleService = {
            onStage: vi.fn().mockResolvedValue(undefined),
            stage: LifecycleStages.Starting,
        };

        const controller = new TestSingleUnitUIController(
            new Injector(),
            instanceService,
            layoutService,
            lifecycleService,
            renderManagerService,
            document.createElement('div'),
            document.createElement('div')
        );

        controller.runBootstrap();

        await controller.callbackPromise;
        vi.advanceTimersByTime(300);

        expect(normalRender.engine.mount).toHaveBeenCalledTimes(1);
        expect(embeddedRender.engine.mount).not.toHaveBeenCalled();

        focused$.next('embedded-render');
        expect(normalRender.deactivate).not.toHaveBeenCalled();
        expect(normalRender.engine.unmount).not.toHaveBeenCalled();
        expect(embeddedRender.engine.mount).not.toHaveBeenCalled();
        expect(embeddedRender.engine.getCanvasElement().parentElement).toBe(productCanvasHost);
        expect(embeddedRender.activate).not.toHaveBeenCalled();

        created$.next({ unitId: 'embedded-render' });
        expect(embeddedRender.engine.mount).not.toHaveBeenCalled();
    });

    it('should ignore LifecycleUnreachableError during bootstrap callback', async () => {
        const layoutService = {
            registerRootContainerElement: vi.fn(() => ({ dispose: vi.fn() })),
            registerContentElement: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const controller = new TestSingleUnitUIController(
            new Injector(),
            {
                focused$: new Subject<string>(),
                getFocusedUnit: vi.fn(() => null),
                getUnitCreateOptions: vi.fn(() => null),
            },
            layoutService,
            {
                onStage: vi.fn().mockRejectedValue(new LifecycleUnreachableError(LifecycleStages.Ready)),
                stage: LifecycleStages.Starting,
            },
            {
                getRenderAll: vi.fn(() => new Map()),
                getRenderUnitById: vi.fn(() => null),
                created$: new Subject<any>(),
                disposed$: new Subject<string>(),
            },
            document.createElement('div'),
            document.createElement('div')
        );

        controller.runBootstrap();
        await expect(controller.callbackPromise).resolves.toBeUndefined();
    });

    it('should rethrow non-lifecycle errors from bootstrap callback', async () => {
        const error = new Error('unexpected');
        const controller = new TestSingleUnitUIController(
            new Injector(),
            {
                focused$: new Subject<string>(),
                getFocusedUnit: vi.fn(() => null),
            },
            {
                registerRootContainerElement: vi.fn(() => ({ dispose: vi.fn() })),
                registerContentElement: vi.fn(() => ({ dispose: vi.fn() })),
            },
            {
                onStage: vi.fn().mockRejectedValue(error),
                stage: LifecycleStages.Starting,
            },
            {
                getRenderAll: vi.fn(() => new Map()),
                getRenderUnitById: vi.fn(() => null),
                created$: new Subject<any>(),
                disposed$: new Subject<string>(),
            },
            document.createElement('div'),
            document.createElement('div')
        );

        controller.runBootstrap();
        await expect(controller.callbackPromise).rejects.toThrow('unexpected');
    });
});
