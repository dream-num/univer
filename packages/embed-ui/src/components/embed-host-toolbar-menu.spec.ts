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

import type { EmbedDescriptor } from '@univerjs/embed';
import type { EmbedChildContainerContext } from '../types/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { EmbedBlockRegistryService } from '../services/embed-block-registry.service';
import { EmbedFloatingMenuRegistryService } from '../services/embed-floating-menu-registry.service';
import { EmbedProductMenuRegistryService } from '../services/embed-product-menu-registry.service';
import { EmbedHostChromeMode } from '../types/embed-ui';
import { createFullscreenRenderScope, mountFullscreenWorkbenchMenus } from './embed-host-toolbar-menu';

describe('Embed fullscreen workbench', () => {
    it('creates standard runtime slots for fullscreen product chrome', () => {
        const viewport = document.createElement('div');
        const menuSlot = document.createElement('div');
        const footerSlot = document.createElement('div');
        const descriptor = createDescriptor();

        const scope = createFullscreenRenderScope(descriptor, 'scroll-contained', {
            viewport,
            menuSlot,
            footerSlot,
        });

        expect(scope.menuOutlet?.container).toBe(menuSlot);
        expect(scope.fullscreen).toBe(true);
        expect(scope.rootElement).toBe(viewport);
    });

    it('mounts the child floating menu in fullscreen when the child does not expose a ribbon', () => {
        const descriptor = createDescriptor({ childType: UniverInstanceType.UNIVER_BASE });
        const childContext = {
            descriptor,
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId,
            childType: descriptor.childType,
            layout: 'scroll-contained',
            renderScope: {
                fullscreen: true,
                mode: 'float',
            },
        } as EmbedChildContainerContext;
        const dispose = vi.fn();
        const mount = vi.fn(() => ({ dispose }));
        const floatingRegistry = {
            get: vi.fn(() => ({ mount })),
        };
        const blockRegistry = {
            get: vi.fn(() => ({
                childType: UniverInstanceType.UNIVER_BASE,
                productName: 'Bases',
                hostChromeMode: EmbedHostChromeMode.TITLE_ONLY,
            })),
        };
        const injector = {
            has: vi.fn((token) => token === EmbedFloatingMenuRegistryService || token === EmbedBlockRegistryService),
            get: vi.fn((token) => {
                if (token === EmbedFloatingMenuRegistryService) {
                    return floatingRegistry;
                }
                if (token === EmbedBlockRegistryService) {
                    return blockRegistry;
                }
                throw new Error('unexpected token');
            }),
        };

        const disposable = mountFullscreenWorkbenchMenus({
            injector: injector as never,
            descriptor,
            childContext,
            menuContainer: document.createElement('div'),
        });

        expect(floatingRegistry.get).toHaveBeenCalledWith(
            UniverInstanceType.UNIVER_DOC,
            'docs-custom-block',
            UniverInstanceType.UNIVER_BASE
        );
        expect(mount).toHaveBeenCalledWith(expect.objectContaining({
            active: {
                hostUnitId: 'host-1',
                embedId: 'embed-1',
                childUnitId: 'child-1',
                stage: 'stage2',
            },
        }));

        disposable?.dispose();

        expect(dispose).toHaveBeenCalled();
    });

    it('mounts registered product ribbon menus before using the fullscreen fallback ribbon', () => {
        const descriptor = createDescriptor();
        const childContext = {
            descriptor,
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId,
            childType: descriptor.childType,
            layout: 'scroll-contained',
            renderScope: {
                fullscreen: true,
                mode: 'float',
            },
        } as EmbedChildContainerContext;
        const dispose = vi.fn();
        const productMenuRegistry = {
            mountMenu: vi.fn(() => ({ dispose })),
        };
        const floatingRegistry = {
            get: vi.fn(),
        };
        const blockRegistry = {
            get: vi.fn(() => ({
                childType: UniverInstanceType.UNIVER_SHEET,
                productName: 'Sheets',
                hostChromeMode: EmbedHostChromeMode.RIBBON,
            })),
        };
        const injector = {
            has: vi.fn((token) => token === EmbedFloatingMenuRegistryService || token === EmbedBlockRegistryService || token === EmbedProductMenuRegistryService),
            get: vi.fn((token) => {
                if (token === EmbedFloatingMenuRegistryService) {
                    return floatingRegistry;
                }
                if (token === EmbedBlockRegistryService) {
                    return blockRegistry;
                }
                if (token === EmbedProductMenuRegistryService) {
                    return productMenuRegistry;
                }
                throw new Error('unexpected token');
            }),
        };
        const menuContainer = document.createElement('div');

        const disposable = mountFullscreenWorkbenchMenus({
            injector: injector as never,
            descriptor,
            childContext,
            menuContainer,
        });

        expect(productMenuRegistry.mountMenu).toHaveBeenCalledWith(expect.objectContaining({
            container: menuContainer,
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnitId: 'child-1',
            menuTitlePrefix: 'Sheets',
            surface: 'ribbon',
        }));
        expect(floatingRegistry.get).not.toHaveBeenCalled();

        disposable?.dispose();

        expect(dispose).toHaveBeenCalled();
    });
});

function createDescriptor(overrides: Partial<EmbedDescriptor> = {}): EmbedDescriptor {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_DOC,
        entry: 'docs-custom-block' as const,
        hostAnchorId: 'anchor-1',
        childUnitId: 'child-1',
        childType: UniverInstanceType.UNIVER_SHEET,
        source: { kind: 'empty' as const, unitType: UniverInstanceType.UNIVER_SHEET },
        sourceMeta: {
            floating: {
                enabled: true,
                layout: 'scroll-contained' as const,
                fullscreen: true,
            },
            tab: false,
        },
        ...overrides,
    };
}
