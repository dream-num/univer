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
import { LifecycleStages, LifecycleUnreachableError } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
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

function createRenderer(unitId: string) {
    return {
        unitId,
        activate: vi.fn(),
        deactivate: vi.fn(),
        engine: {
            mount: vi.fn(),
            unmount: vi.fn(),
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
            getRenderById: vi.fn((id: string) => rendererMap.get(id)),
            created$,
            disposed$,
        };

        const instanceService = {
            focused$,
            getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'render-3' })),
        };

        const lifecycleService = {
            onStage: vi.fn().mockResolvedValue(undefined),
            stage: LifecycleStages.Starting,
        };

        const controller = new TestSingleUnitUIController(
            {} as any,
            instanceService,
            layoutService,
            lifecycleService,
            renderManagerService,
            document.createElement('div'),
            document.createElement('div')
        );

        controller.runBootstrap();

        await controller.callbackPromise;
        expect(layoutService.registerRootContainerElement).toHaveBeenCalledTimes(1);
        expect(layoutService.registerContentElement).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(300);
        expect(render2.engine.mount).toHaveBeenCalledTimes(1);
        expect(render2.activate).toHaveBeenCalledTimes(1);
        expect(lifecycleService.stage).toBe(LifecycleStages.Rendered);

        focused$.next('render-2');
        expect(render2.engine.mount).toHaveBeenCalledTimes(1);

        focused$.next('render-3');
        expect(render2.deactivate).toHaveBeenCalledTimes(1);
        expect(render2.engine.unmount).toHaveBeenCalledTimes(1);
        expect(render3.engine.mount).toHaveBeenCalledTimes(1);

        created$.next({ unitId: 'render-3' });
        expect(render3.engine.mount).toHaveBeenCalledTimes(1);

        disposed$.next('render-3');
        focused$.next('render-3');
        expect(render3.engine.mount).toHaveBeenCalledTimes(2);

        vi.advanceTimersByTime(3000);
        expect(lifecycleService.stage).toBe(LifecycleStages.Steady);

        const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
        controller.dispose();
        expect(clearTimeoutSpy).toHaveBeenCalled();
    });

    it('should ignore LifecycleUnreachableError during bootstrap callback', async () => {
        const layoutService = {
            registerRootContainerElement: vi.fn(() => ({ dispose: vi.fn() })),
            registerContentElement: vi.fn(() => ({ dispose: vi.fn() })),
        };

        const controller = new TestSingleUnitUIController(
            {} as any,
            {
                focused$: new Subject<string>(),
                getFocusedUnit: vi.fn(() => null),
            },
            layoutService,
            {
                onStage: vi.fn().mockRejectedValue(new LifecycleUnreachableError(LifecycleStages.Ready)),
                stage: LifecycleStages.Starting,
            },
            {
                getRenderAll: vi.fn(() => new Map()),
                getRenderById: vi.fn(() => null),
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
            {} as any,
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
                getRenderById: vi.fn(() => null),
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
