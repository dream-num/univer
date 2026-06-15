import type { Injector } from '@univerjs/core';
import { EmbedBlockRegistryService, EmbedChildViewRegistryService, EmbedHostAdapterRegistryService, EmbedHostAnchorModelService, EmbedHostContainerRegistryService, registerEmbedProductMenuContribution, registerEmbedUIContribution } from '@univerjs/embed-ui';
import { IUniverInstanceService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager } from '@univerjs/ui';
import { createDocsEmbedBlockContribution, createDocsEmbedChildViewContribution, createDocsEmbedProductMenuContribution } from './embed-block';
import { EmbedDocsCustomBlockRenderer } from './embed-docs-custom-block-renderer';
import { EMBED_DOCS_CUSTOM_BLOCK_DEFAULT_COMPONENT_KEY } from './embed-host-anchor';
import { createDocsCustomBlockHostAdapterContribution, createDocsCustomBlockHostContainerContribution } from './embed-host-adapter';

export function registerDocsEmbedUIContributions(injector: Injector): void {
    registerEmbedUIContribution(injector, 'docs-ui.embed', registerDocsEmbedUIContributionsNow);
}

function registerDocsEmbedUIContributionsNow(injector: Injector): void {
    const adapterRegistry = injector.get(EmbedHostAdapterRegistryService);
    const containerRegistry = injector.get(EmbedHostContainerRegistryService);
    const childViewRegistry = injector.get(EmbedChildViewRegistryService);
    const blockRegistry = injector.get(EmbedBlockRegistryService);
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

    registerEmbedProductMenuContribution(injector, createDocsEmbedProductMenuContribution());
}
