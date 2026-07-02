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

import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { EmbedHostAdapterRegistryService, EmbedHostAnchorModelService } from '@univerjs/embed';
import { EmbedBlockRegistryService, EmbedChildViewRegistryService, EmbedContentSizeRegistryService, EmbedFloatingMenuRegistryService, EmbedFloatPreviewService, EmbedHostContainerRegistryService, EmbedPassiveViewportRegistryService, EmbedProductMenuRegistryService, EmbedReadonlyPreviewRegistryService, flushPendingEmbedUIContributions } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY } from './embed-host-anchor';
import { registerDocsEmbedUIContributions } from './embed-register';
import { EmbedDocsCustomBlockRenderer } from './EmbedDocsCustomBlockRenderer';

describe('registerDocsEmbedUIContributions', () => {
    it('queues before embed-ui registries exist and flushes the docs embed contributions once', () => {
        const injector = createDocsEmbedInjector(false);

        registerDocsEmbedUIContributions(injector as never);
        expect(injector.adapterRegistry.list()).toEqual([]);

        injector.enableRegistries();
        flushPendingEmbedUIContributions(injector as never);

        expect(injector.adapterRegistry.get(UniverInstanceType.UNIVER_DOC, 'docs-custom-block')).toBeDefined();
        expect(injector.containerRegistry.get(UniverInstanceType.UNIVER_DOC, 'docs-custom-block')).toMatchObject({
            menuBehavior: 'floating',
        });
        expect(injector.childViewRegistry.get(UniverInstanceType.UNIVER_DOC)).toMatchObject({
            supportedLayouts: expect.arrayContaining(['tab-peer', 'doc-width-scale', 'scroll-contained']),
        });
        expect(injector.blockRegistry.get(UniverInstanceType.UNIVER_DOC)).toMatchObject({
            productName: 'Docs',
        });
        expect(injector.productMenuRegistry.getMergedMenuSchema(UniverInstanceType.UNIVER_DOC, 'ribbon')).toBeDefined();
        expect(injector.floatingMenuRegistry.get(UniverInstanceType.UNIVER_SHEET, 'sheets-floating-object', UniverInstanceType.UNIVER_DOC)).toBeDefined();
        expect(injector.previewService.registerProvider).toHaveBeenCalledTimes(1);
        expect(injector.passiveViewportRegistry.get(UniverInstanceType.UNIVER_DOC)).toBeDefined();
        expect(injector.componentManager.register).toHaveBeenCalledWith(
            EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY,
            EmbedDocsCustomBlockRenderer
        );

        registerDocsEmbedUIContributions(injector as never);
        expect(injector.adapterRegistry.list()).toHaveLength(1);
        expect(injector.previewService.registerProvider).toHaveBeenCalledTimes(2);
    });

    it('registers immediately when embed-ui registries are already present', () => {
        const injector = createDocsEmbedInjector(true);

        registerDocsEmbedUIContributions(injector as never);

        expect(injector.adapterRegistry.get(UniverInstanceType.UNIVER_DOC, 'docs-custom-block')).toBeDefined();
        expect(injector.containerRegistry.get(UniverInstanceType.UNIVER_DOC, 'docs-custom-block')).toBeDefined();
        expect(injector.blockRegistry.get(UniverInstanceType.UNIVER_DOC)).toBeDefined();
    });
});

function createDocsEmbedInjector(hasRegistries: boolean) {
    const adapterRegistry = new EmbedHostAdapterRegistryService();
    const containerRegistry = new EmbedHostContainerRegistryService();
    const childViewRegistry = new EmbedChildViewRegistryService();
    const blockRegistry = new EmbedBlockRegistryService();
    const productMenuRegistry = new EmbedProductMenuRegistryService();
    const floatingMenuRegistry = new EmbedFloatingMenuRegistryService();
    const contentSizeRegistry = new EmbedContentSizeRegistryService();
    const passiveViewportRegistry = new EmbedPassiveViewportRegistryService();
    const readonlyPreviewRegistry = new EmbedReadonlyPreviewRegistryService();
    const previewService = { registerProvider: vi.fn() };
    const componentManager = { register: vi.fn() };
    const renderManagerService = {};
    const anchorModelService = new EmbedHostAnchorModelService();
    const univerInstanceService = {};
    let registriesEnabled = hasRegistries;
    const map = new Map<unknown, unknown>([
        [EmbedHostAdapterRegistryService, adapterRegistry],
        [EmbedHostContainerRegistryService, containerRegistry],
        [EmbedChildViewRegistryService, childViewRegistry],
        [EmbedBlockRegistryService, blockRegistry],
        [EmbedProductMenuRegistryService, productMenuRegistry],
        [EmbedFloatingMenuRegistryService, floatingMenuRegistry],
        [EmbedFloatPreviewService, previewService],
        [EmbedContentSizeRegistryService, contentSizeRegistry],
        [EmbedPassiveViewportRegistryService, passiveViewportRegistry],
        [EmbedReadonlyPreviewRegistryService, readonlyPreviewRegistry],
        [ComponentManager, componentManager],
        [EmbedHostAnchorModelService, anchorModelService],
        [IUniverInstanceService, univerInstanceService],
        [IRenderManagerService, renderManagerService],
    ]);
    const registryTokens = new Set([
        EmbedHostAdapterRegistryService,
        EmbedHostContainerRegistryService,
        EmbedChildViewRegistryService,
        EmbedBlockRegistryService,
        EmbedProductMenuRegistryService,
        EmbedFloatingMenuRegistryService,
        EmbedFloatPreviewService,
        EmbedContentSizeRegistryService,
        EmbedPassiveViewportRegistryService,
        EmbedReadonlyPreviewRegistryService,
    ]);
    const injector = {
        adapterRegistry,
        blockRegistry,
        childViewRegistry,
        componentManager,
        containerRegistry,
        enableRegistries: () => {
            registriesEnabled = true;
        },
        floatingMenuRegistry,
        get: vi.fn((token: unknown) => map.get(token)),
        has: vi.fn((token: unknown) => registriesEnabled || !registryTokens.has(token as never) ? map.has(token) : false),
        passiveViewportRegistry,
        previewService,
        productMenuRegistry,
    };

    return injector;
}
