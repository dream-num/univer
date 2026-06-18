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

/**
 * @vitest-environment jsdom
 */

import type { IEmbedDescriptor } from '@univerjs/embed';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EmbedFocusOwnerService } from '@univerjs/embed';
import { describe, expect, it, vi } from 'vitest';
import { EmbedMountService } from './embed-mount.service';

describe('EmbedMountService focus bridge', () => {
    it('preserves explicit runtime roots when normalizing a host mount result', () => {
        const runtimeRoots = {
            content: document.createElement('div'),
            canvas: document.createElement('div'),
            overlay: document.createElement('div'),
            popup: document.createElement('div'),
        };
        const service = Object.create(EmbedMountService.prototype) as unknown as {
            _normalizeHostMountResult: (result: unknown) => { runtimeRoots?: typeof runtimeRoots };
        };

        expect(service._normalizeHostMountResult({ hostElement: document.createElement('div'), runtimeRoots }).runtimeRoots)
            .toBe(runtimeRoots);
    });

    it('does not promote floating child units to the global current unit on pointer focus', () => {
        const instanceService = createInstanceService();
        const focusOwnerService = createFocusOwnerService();
        const root = document.createElement('div');
        const disposable = registerFocusBridge(root, 'float', instanceService, focusOwnerService);

        root.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

        expect(instanceService.setCurrentUnitForType).not.toHaveBeenCalled();
        expect(focusOwnerService.setFocusOwner).toHaveBeenCalledWith({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_DOC,
            reason: 'pointer',
        });
        expect(disposable.activateSession).toHaveBeenCalledWith('embed-1');

        disposable.dispose();
    });

    it('does not activate child focus bridge when pointer starts from floating menu chrome', () => {
        const instanceService = createInstanceService();
        const focusOwnerService = createFocusOwnerService();
        const root = document.createElement('div');
        const menu = document.createElement('div');
        const button = document.createElement('button');
        menu.dataset.embedFloatingMenu = 'true';
        menu.appendChild(button);
        root.appendChild(menu);
        const disposable = registerFocusBridge(root, 'float', instanceService, focusOwnerService);

        button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

        expect(instanceService.setCurrentUnitForType).not.toHaveBeenCalled();
        expect(focusOwnerService.setFocusOwner).not.toHaveBeenCalled();
        expect(disposable.activateSession).not.toHaveBeenCalled();

        disposable.dispose();
    });

    it('promotes tab child units to the global current unit on pointer focus', () => {
        const instanceService = createInstanceService();
        const focusOwnerService = createFocusOwnerService();
        const root = document.createElement('div');
        const disposable = registerFocusBridge(root, 'tab', instanceService, focusOwnerService);

        root.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

        expect(instanceService.setCurrentUnitForType).toHaveBeenCalledWith('child-1');
        expect(focusOwnerService.setFocusOwner).toHaveBeenCalledWith({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_DOC,
            reason: 'pointer',
        });
        expect(disposable.activateSession).toHaveBeenCalledWith('embed-1');

        disposable.dispose();
    });

    it('keeps only one floating session active per host when activating a floating session', () => {
        const firstSetActive = vi.fn();
        const secondSetActive = vi.fn();
        const service = Object.create(EmbedMountService.prototype) as unknown as {
            _sessions: Map<string, { session: { hostUnitId: string; embedId: string; layout: string }; setActive: (active: boolean) => void }>;
            _injector: { has: () => boolean };
            activateSession: (embedId: string) => void;
        };
        service._injector = { has: () => false };
        service._sessions = new Map([
            ['float-1', {
                session: { hostUnitId: 'host-1', embedId: 'float-1', layout: 'scroll-contained' },
                setActive: firstSetActive,
            }],
            ['float-2', {
                session: { hostUnitId: 'host-1', embedId: 'float-2', layout: 'doc-width-scale' },
                setActive: secondSetActive,
            }],
        ]);

        service.activateSession('float-2');

        expect(firstSetActive).toHaveBeenCalledWith(false);
        expect(secondSetActive).toHaveBeenCalledWith(true);
    });

    it('initializes later floating sessions as inactive when the same host already has a floating session', () => {
        const setActive = vi.fn();
        const service = Object.create(EmbedMountService.prototype) as unknown as {
            _sessions: Map<string, { session: { hostUnitId: string; embedId: string; layout: string }; setActive: (active: boolean) => void }>;
            _injector: { has: () => boolean };
            _initializeFloatingSessionActiveState: (
                descriptor: IEmbedDescriptor,
                layout: string,
                setActive: (active: boolean) => void
            ) => void;
        };
        service._injector = { has: () => false };
        service._sessions = new Map([
            ['float-1', {
                session: { hostUnitId: 'host-1', embedId: 'float-1', layout: 'scroll-contained' },
                setActive: vi.fn(),
            }],
        ]);

        service._initializeFloatingSessionActiveState({
            ...createDescriptor(),
            embedId: 'float-2',
            hostUnitId: 'host-1',
        }, 'doc-width-scale', setActive);

        expect(setActive).toHaveBeenCalledWith(false);
    });

    it('keeps floating render roots visible when their active signal is false', () => {
        const root = document.createElement('div');
        const service = createRenderScopeService();

        const { setActive } = service._createRenderScope(createDescriptor(), 'scroll-contained', root);
        setActive(false);

        expect(root.dataset.embedRenderScopeActive).toBe('false');
        expect(root.style.display).toBe('');
        expect(root.hasAttribute('inert')).toBe(false);
    });

    it('hides inactive tab render roots', () => {
        const root = document.createElement('div');
        const service = createRenderScopeService();

        const { setActive } = service._createRenderScope({
            ...createDescriptor(),
            sourceMeta: {
                tab: {
                    enabled: true,
                    container: 'sheet-tab',
                    replaceHostMenu: true,
                    hideHostFxBar: true,
                    lockHostRibbon: true,
                },
            },
        }, 'tab-peer', root);
        setActive(false);

        expect(root.dataset.embedRenderScopeActive).toBe('false');
        expect(root.style.display).toBe('none');
        expect(root.hasAttribute('inert')).toBe(true);
    });
});

function registerFocusBridge(
    rootElement: HTMLElement,
    mode: 'tab' | 'float' | 'inline',
    instanceService: ReturnType<typeof createInstanceService>,
    focusOwnerService: ReturnType<typeof createFocusOwnerService>
) {
    const service = Object.create(EmbedMountService.prototype) as unknown as {
        _injector: {
            has: (identifier: unknown) => boolean;
            get: (identifier: unknown) => unknown;
        };
        _registerChildFocusBridge: (
            descriptor: IEmbedDescriptor,
            rootElement: HTMLElement,
            mode: 'tab' | 'float' | 'inline'
        ) => { dispose: () => void };
        activateSession: ReturnType<typeof vi.fn>;
    };
    service.activateSession = vi.fn();
    service._injector = {
        has: (identifier: unknown) => identifier === IUniverInstanceService || identifier === EmbedFocusOwnerService,
        get: (identifier: unknown) => {
            if (identifier === IUniverInstanceService) {
                return instanceService;
            }
            if (identifier === EmbedFocusOwnerService) {
                return focusOwnerService;
            }
            throw new Error('Unexpected dependency');
        },
    };

    const disposable = service._registerChildFocusBridge(createDescriptor(), rootElement, mode);
    return {
        ...disposable,
        activateSession: service.activateSession,
    };
}

function createInstanceService() {
    return {
        getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'other-child' })),
        setCurrentUnitForType: vi.fn(),
    };
}

function createFocusOwnerService() {
    return {
        getFocusOwner: vi.fn(() => null),
        setFocusOwner: vi.fn(),
    };
}

function createRenderScopeService() {
    const service = Object.create(EmbedMountService.prototype) as unknown as {
        _overlayRootService: { register: () => { dispose: () => void } };
        _createRenderScope: (
            descriptor: IEmbedDescriptor,
            layout: string,
            rootElement: HTMLElement
        ) => { setActive: (active: boolean) => void };
    };
    service._overlayRootService = {
        register: () => ({ dispose: vi.fn() }),
    };

    return service;
}

function createDescriptor(): IEmbedDescriptor {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        hostAnchorId: 'anchor-1',
        source: {
            kind: 'empty',
            unitType: UniverInstanceType.UNIVER_DOC,
        },
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_DOC,
    };
}
