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

import type { Injector } from '@univerjs/core';
import { toDisposable, UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { EMBED_CANVAS_ROOT_ATTRIBUTE, EMBED_CONTENT_ROOT_ATTRIBUTE, EMBED_FOOTER_SLOT_ATTRIBUTE, EMBED_MENU_SLOT_ATTRIBUTE, EMBED_OVERLAY_ROOT_ATTRIBUTE, EMBED_POPUP_ROOT_ATTRIBUTE } from '../common/embed-runtime-slots';
import { createFullscreenRenderScope, mountFullscreenWorkbenchMenus } from '../components/EmbedHostToolbarMenu';
import { EmbedBlockRegistryService } from './embed-block-registry.service';
import { EmbedFloatingMenuRegistryService } from './embed-floating-menu-registry.service';
import { EmbedProductMenuRegistryService } from './embed-product-menu-registry.service';
import { createEmbedReactRoot, disposeEmbedReactRoot } from './react-root-disposal';

const createRootMock = vi.hoisted(() => vi.fn());

vi.mock('react-dom/client', () => ({
    createRoot: createRootMock,
}));

describe('embed fullscreen helpers and react roots', () => {
    it('creates render scopes from explicit fullscreen slots', () => {
        const viewport = document.createElement('div');
        const menuSlot = document.createElement('div');
        const footerSlot = document.createElement('div');
        const contentRoot = appendSlot(viewport, EMBED_CONTENT_ROOT_ATTRIBUTE);
        const canvasRoot = appendSlot(viewport, EMBED_CANVAS_ROOT_ATTRIBUTE);
        const overlayRoot = appendSlot(viewport, EMBED_OVERLAY_ROOT_ATTRIBUTE);
        const popupRoot = appendSlot(viewport, EMBED_POPUP_ROOT_ATTRIBUTE);
        appendSlot(viewport, EMBED_MENU_SLOT_ATTRIBUTE);
        appendSlot(viewport, EMBED_FOOTER_SLOT_ATTRIBUTE);

        const scope = createFullscreenRenderScope(createDescriptor() as never, 'fixed-ratio' as never, {
            viewport,
            menuSlot,
            footerSlot,
        });

        expect(scope).toMatchObject({
            hostUnitId: 'host-1',
            hostAnchorId: 'anchor-1',
            embedId: 'embed-1',
            childUnitId: 'child-1',
            childType: UniverInstanceType.UNIVER_SHEET,
            layout: 'fixed-ratio',
            mode: 'float',
            fullscreen: true,
        });
        expect(scope.rootElement).toBe(viewport);
        expect(scope.contentRoot).toBe(contentRoot);
        expect(scope.canvasRoot).toBe(canvasRoot);
        expect(scope.overlayRoot).toBe(overlayRoot);
        expect(scope.popupRoot).toBe(popupRoot);
        expect(scope.menuOutlet?.container).toBe(menuSlot);
    });

    it('prefers registered fullscreen ribbon menus and disposes them', () => {
        const productDispose = vi.fn();
        const blockRegistry = new EmbedBlockRegistryService();
        blockRegistry.register({
            childType: UniverInstanceType.UNIVER_SHEET,
            productName: 'Sheets',
            hostChromeMode: 'ribbon',
        } as never);
        const productMenus = {
            mountMenu: vi.fn(() => toDisposable(productDispose)),
        };
        const injector = createInjector([
            [EmbedBlockRegistryService, blockRegistry],
            [EmbedProductMenuRegistryService, productMenus],
        ]);

        const disposable = mountFullscreenWorkbenchMenus({
            injector: injector as never,
            descriptor: createDescriptor() as never,
            childContext: createChildContext() as never,
            menuContainer: document.createElement('div'),
        });

        expect(productMenus.mountMenu).toHaveBeenCalledWith(expect.objectContaining({
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnitId: 'child-1',
            surface: 'ribbon',
        }));
        disposable?.dispose();
        expect(productDispose).toHaveBeenCalled();
    });

    it('falls back to fullscreen floating menus for non-ribbon children', () => {
        const floatingDispose = vi.fn();
        const floatingMenus = new EmbedFloatingMenuRegistryService();
        const mount = vi.fn(() => toDisposable(floatingDispose));
        floatingMenus.register({
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            childType: UniverInstanceType.UNIVER_SHEET,
            mount,
        } as never);
        const blockRegistry = new EmbedBlockRegistryService();
        blockRegistry.register({
            childType: UniverInstanceType.UNIVER_SHEET,
            productName: 'Sheets',
            hostChromeMode: 'none',
        } as never);
        const injector = createInjector([
            [EmbedBlockRegistryService, blockRegistry],
            [EmbedFloatingMenuRegistryService, floatingMenus],
        ]);

        const disposable = mountFullscreenWorkbenchMenus({
            injector: injector as never,
            descriptor: createDescriptor() as never,
            childContext: createChildContext() as never,
            menuContainer: document.createElement('div'),
        });

        expect(mount).toHaveBeenCalledWith(expect.objectContaining({
            active: {
                hostUnitId: 'host-1',
                embedId: 'embed-1',
                childUnitId: 'child-1',
                stage: 'stage2',
            },
        }));
        disposable?.dispose();
        expect(floatingDispose).toHaveBeenCalled();
    });

    it('reuses react roots and skips stale scheduled disposals', () => {
        vi.useFakeTimers();
        const firstRoot = { render: vi.fn(), unmount: vi.fn() };
        const secondRoot = { render: vi.fn(), unmount: vi.fn() };
        createRootMock
            .mockReturnValueOnce(firstRoot)
            .mockReturnValueOnce(secondRoot);
        const container = document.createElement('div');

        const first = createEmbedReactRoot(container);
        expect(createEmbedReactRoot(container)).toBe(first);
        disposeEmbedReactRoot(first);
        createEmbedReactRoot(container);
        vi.runAllTimers();
        expect(firstRoot.unmount).not.toHaveBeenCalled();

        disposeEmbedReactRoot(first);
        vi.runAllTimers();
        expect(firstRoot.unmount).toHaveBeenCalledTimes(1);

        const second = createEmbedReactRoot(container);
        expect(second).toBe(secondRoot);
        disposeEmbedReactRoot(second);
        vi.runAllTimers();
        expect(secondRoot.unmount).toHaveBeenCalledTimes(1);
        vi.useRealTimers();
    });
});

function appendSlot(root: HTMLElement, attribute: string): HTMLElement {
    const element = document.createElement('div');
    element.setAttribute(attribute, 'true');
    root.appendChild(element);
    return element;
}

function createDescriptor() {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_DOC,
        hostAnchorId: 'anchor-1',
        entry: 'docs-custom-block',
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_SHEET,
        source: {
            kind: 'ref',
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-1', type: 'sheet' },
            },
        },
    };
}

function createChildContext() {
    return {
        descriptor: createDescriptor(),
        hostUnitId: 'host-1',
        embedId: 'embed-1',
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_SHEET,
    };
}

function createInjector(entries: Array<[unknown, unknown]>): Pick<Injector, 'get' | 'has'> {
    const map = new Map(entries);
    return {
        get: vi.fn((token: unknown) => map.get(token)),
        has: vi.fn((token: unknown) => map.has(token)),
    } as never;
}
