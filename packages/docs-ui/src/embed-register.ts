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
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { createEmbedRenderCanvasPreviewProvider, EmbedBlockRegistryService, EmbedChildViewRegistryService, EmbedFloatingMenuRegistryService, EmbedFloatPreviewService, EmbedHostAdapterRegistryService, EmbedHostAnchorModelService, EmbedHostContainerRegistryService, EmbedPassiveViewportRegistryService, registerEmbedUIContribution } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager } from '@univerjs/ui';
import { createDocsEmbedBlockContribution, createDocsEmbedChildViewContribution } from './embed-block';
import { EmbedDocsCustomBlockRenderer } from './embed-docs-custom-block-renderer';
import { createDocsFloatingMenuContributions } from './embed-floating-menu';
import { createDocsCustomBlockHostAdapterContribution, createDocsCustomBlockHostContainerContribution } from './embed-host-adapter';
import { EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY } from './embed-host-anchor';
import { createDocsPassiveViewportProvider } from './embed-passive-viewport';

export function registerDocsEmbedUIContributions(injector: Injector): void {
    registerEmbedUIContribution(injector, 'docs-ui.embed', registerDocsEmbedUIContributionsNow);
}

function registerDocsEmbedUIContributionsNow(injector: Injector): void {
    const adapterRegistry = injector.get(EmbedHostAdapterRegistryService);
    const containerRegistry = injector.get(EmbedHostContainerRegistryService);
    const childViewRegistry = injector.get(EmbedChildViewRegistryService);
    const blockRegistry = injector.get(EmbedBlockRegistryService);
    const floatingMenuRegistry = injector.get(EmbedFloatingMenuRegistryService);
    const previewService = injector.get(EmbedFloatPreviewService);
    const passiveViewportRegistry = injector.get(EmbedPassiveViewportRegistryService);
    const anchorModelService = injector.has(EmbedHostAnchorModelService) ? injector.get(EmbedHostAnchorModelService) : undefined;
    const univerInstanceService = injector.has(IUniverInstanceService) ? injector.get(IUniverInstanceService) : undefined;
    const renderManagerService = injector.has(IRenderManagerService) ? injector.get(IRenderManagerService) : undefined;
    if (injector.has(ComponentManager)) {
        injector.get(ComponentManager).register(EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY, EmbedDocsCustomBlockRenderer);
    }

    const adapter = createDocsCustomBlockHostAdapterContribution(anchorModelService, univerInstanceService, renderManagerService);
    if (!adapterRegistry.get(adapter.hostType, adapter.entry)) {
        adapterRegistry.register(adapter);
    }

    const container = createDocsCustomBlockHostContainerContribution();
    if (!containerRegistry.get(container.hostType, container.entry)) {
        containerRegistry.register(container);
    }

    const childView = createDocsEmbedChildViewContribution();
    if (!childViewRegistry.get(childView.childType)) {
        childViewRegistry.register(childView);
    }

    const block = createDocsEmbedBlockContribution();
    if (!blockRegistry.get(block.childType)) {
        blockRegistry.register(block);
    }

    createDocsFloatingMenuContributions().forEach((floatingMenu) => {
        if (!floatingMenuRegistry.hasExact(floatingMenu.hostType, floatingMenu.entry, floatingMenu.childType)) {
            floatingMenuRegistry.register(floatingMenu);
        }
    });

    previewService.registerProvider(createEmbedRenderCanvasPreviewProvider(injector, {
        childType: UniverInstanceType.UNIVER_DOC,
        renderManagerService: IRenderManagerService,
    }));
    if (!passiveViewportRegistry.get(UniverInstanceType.UNIVER_DOC)) {
        passiveViewportRegistry.register(createDocsPassiveViewportProvider(injector));
    }
}
