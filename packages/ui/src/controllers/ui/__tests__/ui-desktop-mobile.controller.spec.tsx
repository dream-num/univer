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

import { LifecycleStages } from '@univerjs/core';
import { render, unmount } from '@univerjs/design';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopUIController } from '../ui-desktop.controller';
import { MobileUIController } from '../ui-mobile.controller';

vi.mock('../../../utils/di', () => ({
    connectInjector: vi.fn((Comp: any) => Comp),
}));

vi.mock('@univerjs/design', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        ColorPicker: () => null,
        render: vi.fn((element, _container) => {
            element.props?.onRendered?.(document.createElement('div'));
        }),
        unmount: vi.fn(),
    };
});

function createCommonDeps() {
    return {
        injector: {},
        lifecycleService: {
            onStage: vi.fn().mockResolvedValue(undefined),
            stage: LifecycleStages.Starting,
        },
        renderManagerService: {
            getRenderAll: vi.fn(() => new Map()),
            getRenderById: vi.fn(() => null),
            created$: new Subject<any>(),
            disposed$: new Subject<string>(),
        },
        layoutService: {
            registerRootContainerElement: vi.fn(() => ({ dispose: vi.fn() })),
            registerContentElement: vi.fn(() => ({ dispose: vi.fn() })),
        },
        instanceService: {
            focused$: new Subject<string>(),
            getFocusedUnit: vi.fn(() => null),
        },
    };
}

describe('DesktopUIController', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should bootstrap with existing container id and dispose resources', () => {
        vi.useFakeTimers();
        vi.mocked(render).mockClear();
        vi.mocked(unmount).mockClear();

        const deps = createCommonDeps();
        const container = document.createElement('div');
        container.id = 'existing-container';
        document.body.appendChild(container);

        const menuManagerService = {
            mergeMenu: vi.fn(),
        };
        const uiPartsService = {
            registerComponent: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const componentManager = {
            register: vi.fn(() => ({ dispose: vi.fn() })),
            dispose: vi.fn(),
        };

        const controller = new DesktopUIController(
            { container: 'existing-container' } as any,
            deps.injector as any,
            deps.lifecycleService as any,
            deps.renderManagerService as any,
            deps.layoutService as any,
            deps.instanceService as any,
            menuManagerService as any,
            uiPartsService as any,
            componentManager as any
        );

        vi.advanceTimersByTime(3300);

        expect(menuManagerService.mergeMenu).toHaveBeenCalledTimes(1);
        expect(uiPartsService.registerComponent).toHaveBeenCalledTimes(3);
        expect(componentManager.register).toHaveBeenCalledTimes(6);
        expect(render).toHaveBeenCalledWith(expect.any(Object), container);

        controller.dispose();
        expect(unmount).toHaveBeenCalledWith(container);
        expect(componentManager.dispose).toHaveBeenCalledTimes(1);
    });

    it('should create container when id is missing and when no container is provided', () => {
        vi.useFakeTimers();
        vi.mocked(render).mockClear();
        vi.mocked(unmount).mockClear();

        const deps = createCommonDeps();
        const menuManagerService = { mergeMenu: vi.fn() };
        const uiPartsService = { registerComponent: vi.fn(() => ({ dispose: vi.fn() })) };
        const componentManager = { register: vi.fn(() => ({ dispose: vi.fn() })), dispose: vi.fn() };

        const withMissingId = new DesktopUIController(
            { container: 'missing-container' } as any,
            deps.injector as any,
            deps.lifecycleService as any,
            deps.renderManagerService as any,
            deps.layoutService as any,
            deps.instanceService as any,
            menuManagerService as any,
            uiPartsService as any,
            componentManager as any
        );

        const withDefault = new DesktopUIController(
            {} as any,
            deps.injector as any,
            deps.lifecycleService as any,
            deps.renderManagerService as any,
            deps.layoutService as any,
            deps.instanceService as any,
            menuManagerService as any,
            uiPartsService as any,
            componentManager as any
        );

        vi.advanceTimersByTime(3300);

        const mountContainers = vi.mocked(render).mock.calls.map(([, container]) => container);
        expect(mountContainers).toEqual([
            expect.objectContaining({ id: 'missing-container' }),
            expect.objectContaining({ id: 'univer' }),
        ]);

        withMissingId.dispose();
        withDefault.dispose();
    });

    it('should use HTMLElement container directly', () => {
        vi.useFakeTimers();
        vi.mocked(render).mockClear();
        vi.mocked(unmount).mockClear();

        const deps = createCommonDeps();
        const mountContainer = document.createElement('div');
        const menuManagerService = { mergeMenu: vi.fn() };
        const uiPartsService = { registerComponent: vi.fn(() => ({ dispose: vi.fn() })) };
        const componentManager = { register: vi.fn(() => ({ dispose: vi.fn() })), dispose: vi.fn() };

        const controller = new DesktopUIController(
            { container: mountContainer } as any,
            deps.injector as any,
            deps.lifecycleService as any,
            deps.renderManagerService as any,
            deps.layoutService as any,
            deps.instanceService as any,
            menuManagerService as any,
            uiPartsService as any,
            componentManager as any
        );

        vi.advanceTimersByTime(3300);
        expect(render).toHaveBeenCalledWith(expect.any(Object), mountContainer);

        controller.dispose();
        expect(unmount).toHaveBeenCalledWith(mountContainer);
    });
});

describe('MobileUIController', () => {
    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should bootstrap and register mobile ui parts', () => {
        vi.useFakeTimers();
        vi.mocked(render).mockClear();
        vi.mocked(unmount).mockClear();

        const deps = createCommonDeps();
        const menuManagerService = {
            mergeMenu: vi.fn(),
        };
        const uiPartsService = {
            registerComponent: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const componentManager = {
            register: vi.fn(() => ({ dispose: vi.fn() })),
            dispose: vi.fn(),
        };

        const controller = new MobileUIController(
            { container: 'missing-mobile' } as any,
            deps.injector as any,
            deps.lifecycleService as any,
            deps.renderManagerService as any,
            deps.layoutService as any,
            deps.instanceService as any,
            menuManagerService as any,
            uiPartsService as any,
            componentManager as any
        );

        vi.advanceTimersByTime(3300);

        expect(menuManagerService.mergeMenu).toHaveBeenCalledTimes(1);
        expect(uiPartsService.registerComponent).toHaveBeenCalledTimes(3);
        expect(componentManager.register).toHaveBeenCalledTimes(6);
        expect(render).toHaveBeenCalledWith(expect.any(Object), expect.objectContaining({ id: 'missing-mobile' }));

        controller.dispose();
        expect(unmount).toHaveBeenCalled();
        expect(componentManager.dispose).toHaveBeenCalledTimes(1);
    });

    it('should support existing id, html container and default container', () => {
        vi.useFakeTimers();
        vi.mocked(render).mockClear();
        vi.mocked(unmount).mockClear();

        const deps = createCommonDeps();
        const existing = document.createElement('div');
        existing.id = 'mobile-existing';
        document.body.appendChild(existing);
        const htmlContainer = document.createElement('section');

        const menuManagerService = {
            mergeMenu: vi.fn(),
        };
        const uiPartsService = {
            registerComponent: vi.fn(() => ({ dispose: vi.fn() })),
        };
        const componentManager = {
            register: vi.fn(() => ({ dispose: vi.fn() })),
            dispose: vi.fn(),
        };

        const byExistingId = new MobileUIController(
            { container: 'mobile-existing' } as any,
            deps.injector as any,
            deps.lifecycleService as any,
            deps.renderManagerService as any,
            deps.layoutService as any,
            deps.instanceService as any,
            menuManagerService as any,
            uiPartsService as any,
            componentManager as any
        );

        const byElement = new MobileUIController(
            { container: htmlContainer } as any,
            deps.injector as any,
            deps.lifecycleService as any,
            deps.renderManagerService as any,
            deps.layoutService as any,
            deps.instanceService as any,
            menuManagerService as any,
            uiPartsService as any,
            componentManager as any
        );

        const byDefault = new MobileUIController(
            {} as any,
            deps.injector as any,
            deps.lifecycleService as any,
            deps.renderManagerService as any,
            deps.layoutService as any,
            deps.instanceService as any,
            menuManagerService as any,
            uiPartsService as any,
            componentManager as any
        );

        vi.advanceTimersByTime(3300);

        const mountContainers = vi.mocked(render).mock.calls.map(([, container]) => container);
        expect(mountContainers).toEqual([
            existing,
            htmlContainer,
            expect.objectContaining({ id: 'univer' }),
        ]);

        byExistingId.dispose();
        byElement.dispose();
        byDefault.dispose();
    });
});
