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

import type { IDisposable, Injector } from '@univerjs/core';
import type { IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedChildContainerContext } from '../types/embed-ui';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE, FOCUSING_UNIT, ICommandService, IContextService, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { EmbedFocusOwnerService } from '@univerjs/embed';
import { describe, expect, it, vi } from 'vitest';
import { EmbedChildViewRegistryService } from './embed-child-view-registry.service';
import { EmbedFloatingActiveService } from './embed-floating-active.service';
import { EmbedFloatingMenuRegistryService } from './embed-floating-menu-registry.service';
import { EmbedHostContainerRegistryService } from './embed-host-container-registry.service';
import { EmbedDuplicateChildUnitError, EmbedMountService } from './embed-mount.service';
import { EmbedOverlayRootService } from './embed-overlay-root.service';

describe('EmbedMountService', () => {
    it('mounts floating sessions, wires focus bridge, floating menu, and disposes in reverse order', () => {
        const hostDispose = vi.fn();
        const childDispose = vi.fn();
        const floatingMenuDispose = vi.fn();
        const hostElement = document.createElement('div');
        const childMount = vi.fn(() => toDisposable(childDispose));
        const hostRegistry = createHostRegistry(() => ({ hostElement, disposable: toDisposable(hostDispose) }));
        const childRegistry = createChildRegistry(childMount);
        const overlayRootService = new EmbedOverlayRootService();
        const focusOwnerService = new EmbedFocusOwnerService();
        const floatingMenuRegistry = new EmbedFloatingMenuRegistryService();
        const floatingActiveService = { getActive: vi.fn(() => ({ embedId: 'embed-1', stage: 'stage2' })) };
        floatingMenuRegistry.register({
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            childType: UniverInstanceType.UNIVER_SHEET,
            mount: vi.fn(() => toDisposable(floatingMenuDispose)),
        });
        const service = createMountService({
            hostRegistry,
            childRegistry,
            overlayRootService,
            injectorEntries: [
                [EmbedFocusOwnerService, focusOwnerService],
                [EmbedFloatingMenuRegistryService, floatingMenuRegistry],
                [EmbedFloatingActiveService, floatingActiveService],
            ],
        });
        const descriptor = createDescriptor();

        const session = service.mount(descriptor);

        expect(session).toMatchObject({
            embedId: 'embed-1',
            childUnitId: 'child-sheet',
            layout: 'doc-width-scale',
            hostElement,
        });
        expect(hostElement.dataset.embedRenderScopeActive).toBe('false');
        expect(overlayRootService.get('child-sheet')).toBe(hostElement.querySelector('[data-embed-overlay-root]'));
        expect(childMount).toHaveBeenCalledWith(expect.objectContaining({
            childUnitId: 'child-sheet',
            renderScope: expect.objectContaining({ mode: 'float', rootElement: hostElement }),
        }));
        expect(service.getSession('embed-1')).toBe(session);
        expect(service.listSessions()).toEqual([session]);

        hostElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
        expect(focusOwnerService.getFocusOwner()).toMatchObject({ embedId: 'embed-1', reason: 'pointer' });

        service.setActive('embed-1', false);
        expect(hostElement.dataset.embedRenderScopeActive).toBe('false');
        service.unmount('embed-1');
        expect(service.getSession('embed-1')).toBeUndefined();
        expect(overlayRootService.get('child-sheet')).toBeNull();
        expect(floatingMenuDispose).toHaveBeenCalled();
        expect(childDispose).toHaveBeenCalled();
        expect(hostDispose).toHaveBeenCalled();
    });

    it('keeps floating render scopes inactive until an existing focus owner matches the embed', () => {
        const firstHost = document.createElement('div');
        const secondHost = document.createElement('div');
        const focusOwnerService = new EmbedFocusOwnerService();
        const inactiveService = createMountService({
            hostRegistry: createHostRegistry(() => ({ hostElement: firstHost })),
            childRegistry: createChildRegistry(),
            injectorEntries: [
                [EmbedFocusOwnerService, focusOwnerService],
            ],
        });

        inactiveService.mount(createDescriptor());

        expect(firstHost.dataset.embedRenderScopeActive).toBe('false');

        focusOwnerService.setFocusOwner({
            hostUnitId: 'host-1',
            embedId: 'embed-1',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            reason: 'pointer',
        });
        const activeService = createMountService({
            hostRegistry: createHostRegistry(() => ({ hostElement: secondHost })),
            childRegistry: createChildRegistry(),
            injectorEntries: [
                [EmbedFocusOwnerService, focusOwnerService],
            ],
        });

        activeService.mount(createDescriptor());

        expect(secondHost.dataset.embedRenderScopeActive).toBe('true');
    });

    it('focuses the child unit in the scoped runtime when a floating child receives pointer focus', () => {
        const hostElement = document.createElement('div');
        const childUnit = { getUnitId: () => 'child-sheet' };
        let childContext: IEmbedChildContainerContext | undefined;
        const instanceService = {
            currentUnitId: 'host-doc',
            getUnit: vi.fn(() => childUnit),
            setCurrentUnitForType: vi.fn((unitId: string) => {
                instanceService.currentUnitId = unitId;
            }),
            getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => instanceService.currentUnitId })),
            getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'host-doc' })),
            focusUnit: vi.fn(),
        };
        const commandService = {
            executeCommand: vi.fn(),
            syncExecuteCommand: vi.fn(),
        };
        const contextService = { setContextValue: vi.fn() };
        const focusOwnerService = new EmbedFocusOwnerService();
        const service = createMountService({
            hostRegistry: createHostRegistry(() => ({ hostElement })),
            childRegistry: createChildRegistry((context) => {
                childContext = context;
            }),
            injectorEntries: [
                [IUniverInstanceService, instanceService],
                [ICommandService, commandService],
                [IContextService, contextService],
                [EmbedFocusOwnerService, focusOwnerService],
            ],
        });

        service.mount(createDescriptor());
        hostElement.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));

        expect(childContext?.runtimeScope.instanceService?.getFocusedUnit()?.getUnitId()).toBe('child-sheet');
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_SHEET, true);
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_DOC, false);
        expect(instanceService.setCurrentUnitForType).not.toHaveBeenCalledWith('child-sheet');
        expect(instanceService.focusUnit).not.toHaveBeenCalledWith('child-sheet');
        expect(focusOwnerService.getFocusOwner()).toMatchObject({ embedId: 'embed-1', childUnitId: 'child-sheet' });
    });

    it('activates tab sessions and updates host focus contexts', () => {
        const firstHost = document.createElement('div');
        const secondHost = document.createElement('div');
        const hosts = [firstHost, secondHost];
        const instanceService = {
            currentUnitId: 'other',
            setCurrentUnitForType: vi.fn((unitId: string) => {
                instanceService.currentUnitId = unitId;
            }),
            getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => instanceService.currentUnitId })),
            getFocusedUnit: vi.fn(() => null),
            focusUnit: vi.fn(),
        };
        const contextService = { setContextValue: vi.fn() };
        const service = createMountService({
            hostRegistry: createHostRegistry(() => ({ hostElement: hosts.shift()! })),
            childRegistry: createChildRegistry(),
            injectorEntries: [
                [IUniverInstanceService, instanceService],
                [IContextService, contextService],
            ],
        });
        const first = createDescriptor({
            embedId: 'tab-1',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_DOC,
            sourceMeta: {
                floating: false,
                tab: {
                    enabled: true,
                    container: 'sheet-tab',
                    replaceHostMenu: true,
                    hideHostFxBar: true,
                    lockHostRibbon: true,
                },
            },
        });
        const second = createDescriptor({
            embedId: 'tab-2',
            childUnitId: 'child-2',
            childType: UniverInstanceType.UNIVER_SHEET,
            sourceMeta: first.sourceMeta,
        });

        const firstSession = service.mount(first);
        const secondSession = service.mount(second);

        expect(firstHost.dataset.embedRenderScopeActive).toBe('false');
        expect(secondHost.dataset.embedRenderScopeActive).toBe('true');
        expect(firstHost.getAttribute('aria-hidden')).toBe('true');
        expect(secondHost.getAttribute('aria-hidden')).toBeNull();
        expect(instanceService.setCurrentUnitForType).toHaveBeenCalledWith('child-2');
        firstHost.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_UNIT, true);
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_DOC, true);
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_SHEET, false);
        expect(contextService.setContextValue).toHaveBeenCalledWith(FOCUSING_SLIDE, false);
        expect(firstHost.dataset.embedRenderScopeActive).toBe('true');
        expect(secondHost.dataset.embedRenderScopeActive).toBe('false');

        expect(service.deactivateTabSessions('tab-1')).toEqual([firstSession]);
        expect(firstHost.dataset.embedRenderScopeActive).toBe('false');
        expect(service.deactivateTabSessions()).toEqual([firstSession, secondSession]);
    });

    it('rejects unresolved, unregistered, duplicate, and host-container-less mounts', () => {
        const hostRegistry = createHostRegistry(() => undefined);
        const childRegistry = createChildRegistry();
        const service = createMountService({ hostRegistry, childRegistry });

        expect(() => service.mount(createDescriptor({ childUnitId: undefined }))).toThrow('EMBED_MOUNT_CHILD_NOT_RESOLVED');
        expect(() => service.mount(createDescriptor({ sourceMeta: { floating: false, tab: false } }))).toThrow('EMBED_MOUNT_LAYOUT_NOT_RESOLVED');
        expect(() => createMountService({
            hostRegistry: new EmbedHostContainerRegistryService(),
            childRegistry,
        }).mount(createDescriptor())).toThrow('EMBED_MOUNT_HOST_NOT_REGISTERED');
        expect(() => createMountService({
            hostRegistry,
            childRegistry: new EmbedChildViewRegistryService(),
        }).mount(createDescriptor())).toThrow('EMBED_MOUNT_CHILD_NOT_REGISTERED');
        expect(() => service.mount(createDescriptor())).toThrow('EMBED_MOUNT_HOST_CONTAINER_NOT_RESOLVED');

        const duplicateService = createMountService({
            hostRegistry: createHostRegistry(() => ({ hostElement: document.createElement('div') })),
            childRegistry,
        });
        duplicateService.mount(createDescriptor());
        expect(() => duplicateService.mount(createDescriptor({ embedId: 'embed-2', hostAnchorId: 'anchor-2' }))).toThrow(EmbedDuplicateChildUnitError);
        duplicateService.mount(createDescriptor());
        expect(duplicateService.listSessions()).toHaveLength(1);
    });
});

function createMountService(options: {
    hostRegistry: EmbedHostContainerRegistryService;
    childRegistry: EmbedChildViewRegistryService;
    overlayRootService?: EmbedOverlayRootService;
    injectorEntries?: Array<[unknown, unknown]>;
}): EmbedMountService {
    return new EmbedMountService(
        options.hostRegistry,
        options.childRegistry,
        options.overlayRootService ?? new EmbedOverlayRootService(),
        { registerContext: vi.fn(() => toDisposable(() => {})) } as never,
        createInjector(options.injectorEntries ?? []) as never
    );
}

function createHostRegistry(mount: () => IDisposable | { hostElement?: HTMLElement; disposable?: IDisposable } | undefined): EmbedHostContainerRegistryService {
    const registry = new EmbedHostContainerRegistryService();
    registry.register({
        hostType: UniverInstanceType.UNIVER_DOC,
        entry: 'docs-custom-block',
        layout: 'doc-width-scale',
        supportedLayouts: ['doc-width-scale', 'tab-peer'],
        menuBehavior: 'floating',
        mount,
    });
    return registry;
}

function createChildRegistry(mount: (context: IEmbedChildContainerContext) => IDisposable | void = vi.fn()): EmbedChildViewRegistryService {
    const registry = new EmbedChildViewRegistryService();
    registry.register({
        childType: UniverInstanceType.UNIVER_SHEET,
        supportedLayouts: ['doc-width-scale', 'tab-peer'],
        mount,
    });
    registry.register({
        childType: UniverInstanceType.UNIVER_DOC,
        supportedLayouts: ['doc-width-scale', 'tab-peer'],
        mount,
    });
    return registry;
}

function createInjector(entries: Array<[unknown, unknown]>): Pick<Injector, 'get' | 'has'> {
    const map = new Map(entries);
    return {
        has: vi.fn((token: unknown) => map.has(token)),
        get: vi.fn((token: unknown) => {
            if (!map.has(token)) {
                throw new Error(`unexpected token: ${String(token)}`);
            }
            return map.get(token);
        }),
    } as never;
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: overrides.embedId ?? 'embed-1',
        hostUnitId: overrides.hostUnitId ?? 'host-1',
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        hostAnchorId: overrides.hostAnchorId ?? 'anchor-1',
        entry: overrides.entry ?? 'docs-custom-block',
        source: overrides.source ?? {
            kind: 'ref',
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-sheet', type: 'sheet' },
            },
        },
        childUnitId: 'childUnitId' in overrides ? overrides.childUnitId : 'child-sheet',
        childType: 'childType' in overrides ? overrides.childType : UniverInstanceType.UNIVER_SHEET,
        mode: overrides.mode ?? 'interactive',
        sourceMeta: overrides.sourceMeta ?? {
            floating: {
                enabled: true,
                layout: 'doc-width-scale',
                fullscreen: true,
            },
            tab: false,
        },
        lifecycle: overrides.lifecycle ?? 'active',
        createdAt: overrides.createdAt,
        updatedAt: overrides.updatedAt,
    };
}
