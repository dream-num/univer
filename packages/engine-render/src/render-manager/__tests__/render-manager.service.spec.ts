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

import type { Injector } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { Engine } from '../../engine';
import {
    getCurrentTypeOfRenderer,
    isDisposable,
    RenderManagerService,
    withCurrentTypeOfRenderer,
} from '../render-manager.service';
import { RenderUnit } from '../render-unit';

describe('render manager service', () => {
    it('covers render map lifecycle and dark mode listener', () => {
        const darkMode$ = new Subject<boolean>();
        const injector = {
            createInstance: vi.fn(() => new Engine()),
        } as unknown as Injector;
        const instanceService = {
            getUnit: vi.fn(() => null),
            getUnitType: vi.fn(() => UniverInstanceType.UNIVER_SHEET),
            getCurrentUnitOfType: vi.fn(() => null),
        } as any;
        const themeService = { darkMode$ } as any;

        const service = new RenderManagerService(injector, instanceService, themeService);
        const engine = new Engine('render-service-test', { elementWidth: 100, elementHeight: 80, dpr: 1 });

        const component = {
            makeForceDirty: vi.fn(),
            makeDirty: vi.fn(),
            dispose: vi.fn(),
        };
        const render = {
            unitId: 'u-1',
            type: UniverInstanceType.UNIVER_SHEET,
            engine,
            scene: engine.activeScene!,
            components: new Map([['c', component]]),
            with: vi.fn(() => null),
            dispose: vi.fn(),
        } as any;
        if (!render.scene) {
            render.scene = { dispose: vi.fn() };
        }

        service.addRender('u-1', render);
        expect(service.has('u-1')).toBe(true);
        expect(service.getRenderById('u-1')).toBe(render);
        expect(service.getRenderUnitById('u-1')).toBe(render);
        expect(service.getAllRenderersOfType(UniverInstanceType.UNIVER_SHEET).length).toBe(1);

        darkMode$.next(true);
        expect(component.makeForceDirty).toHaveBeenCalledWith(true);
        expect(component.makeDirty).toHaveBeenCalledWith(true);

        service.removeRender('u-1');
        expect(service.has('u-1')).toBe(false);
        service.dispose();
    });

    it('covers dependency registration, render creation branches and helper funcs', () => {
        const darkMode$ = new Subject<boolean>();
        const createdRenderUnit = {
            unitId: 'u-2',
            type: UniverInstanceType.UNIVER_SHEET,
            engine: new Engine('u-2-engine', { elementWidth: 10, elementHeight: 10, dpr: 1 }),
            scene: { dispose: vi.fn() },
            components: new Map(),
            addRenderDependencies: vi.fn(),
            with: vi.fn(() => 'ok'),
            dispose: vi.fn(),
        } as any as RenderUnit;

        const engineForCreate = new Engine('u-2-create', { elementWidth: 20, elementHeight: 20, dpr: 1 });
        const injector = {
            createInstance: vi.fn((Ctor: unknown) => {
                if (Ctor === Engine) {
                    return engineForCreate;
                }
                if (Ctor === RenderUnit) {
                    return createdRenderUnit;
                }
                return null;
            }),
        } as unknown as Injector;

        const unit = {
            getUnitId: () => 'u-2',
        };
        const instanceService = {
            getUnit: vi.fn(() => unit),
            getUnitType: vi.fn(() => UniverInstanceType.UNIVER_SHEET),
            getCurrentUnitOfType: vi.fn(() => null),
        } as any;
        const themeService = { darkMode$ } as any;

        const service = new RenderManagerService(injector, instanceService, themeService);

        const depA = Symbol('dep-a') as any;
        const depB = Symbol('dep-b') as any;
        const disposableA = service.registerRenderModule(UniverInstanceType.UNIVER_SHEET, depA);
        const disposableB = service.registerRenderModules(UniverInstanceType.UNIVER_SHEET, [depB]);

        const created = service.createRender('u-2');
        expect(created).toBe(createdRenderUnit);

        (instanceService.getUnit as any).mockReturnValue(null);
        const thumbnailRender = (service as any)._createRender('slide-unit', new Engine('slide', {
            elementWidth: 10,
            elementHeight: 10,
            dpr: 1,
        }));
        expect(thumbnailRender.isThumbNail).toBe(true);
        expect(service.getRenderById('slide-unit')).toBe(thumbnailRender);

        const current = getCurrentTypeOfRenderer(
            UniverInstanceType.UNIVER_SHEET,
            instanceService,
            service
        );
        expect(current).toBeNull();
        (instanceService.getCurrentUnitOfType as any).mockReturnValue(unit);
        expect(
            withCurrentTypeOfRenderer(
                UniverInstanceType.UNIVER_SHEET,
                Symbol('token') as any,
                instanceService,
                service
            )
        ).toBe('ok');

        expect(isDisposable({ dispose: () => null })).toBe(true);
        expect(isDisposable({})).toBe(false);

        disposableA.dispose();
        disposableB.dispose();
        service.dispose();
    });
});
