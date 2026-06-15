import type { Injector } from '@univerjs/core';
import { EmbedBlockRegistryService, EmbedChildViewRegistryService, EmbedFloatDomRenderer, EmbedHostAdapterRegistryService, EmbedHostAnchorModelService, EmbedHostContainerRegistryService, registerEmbedProductMenuContribution, registerEmbedUIContribution } from '@univerjs/embed-ui';
import { IUniverInstanceService } from '@univerjs/core';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { ComponentManager } from '@univerjs/ui';
import { createSheetsEmbedBlockContribution, createSheetsEmbedChildViewContribution, createSheetsEmbedProductMenuContribution } from './embed-block';
import { EMBED_SHEETS_FLOATING_COMPONENT_KEY } from './embed-floating-anchor';
import { createSheetsFloatingObjectHostAdapterContribution, createSheetsFloatingObjectHostContainerContribution, createSheetsSheetTabHostAdapterContribution, createSheetsSheetTabHostContainerContribution } from './embed-host-adapter';

export function registerSheetsEmbedUIContributions(injector: Injector): void {
    registerEmbedUIContribution(injector, 'sheets-ui.embed', registerSheetsEmbedUIContributionsNow);
}

function registerSheetsEmbedUIContributionsNow(injector: Injector): void {
    const adapterRegistry = injector.get(EmbedHostAdapterRegistryService);
    const containerRegistry = injector.get(EmbedHostContainerRegistryService);
    const childViewRegistry = injector.get(EmbedChildViewRegistryService);
    const blockRegistry = injector.get(EmbedBlockRegistryService);
    const anchorModelService = injector.has(EmbedHostAnchorModelService) ? injector.get(EmbedHostAnchorModelService) : undefined;
    const univerInstanceService = injector.has(IUniverInstanceService) ? injector.get(IUniverInstanceService) : undefined;
    if (injector.has(ComponentManager)) {
        injector.get(ComponentManager).register(EMBED_SHEETS_FLOATING_COMPONENT_KEY, EmbedFloatDomRenderer);
    }

    [
        createSheetsFloatingObjectHostAdapterContribution(
            anchorModelService,
            () => injector.has(ISheetDrawingService) ? injector.get(ISheetDrawingService) : undefined
        ),
        createSheetsSheetTabHostAdapterContribution(anchorModelService, univerInstanceService),
    ].forEach((adapter) => {
        if (!adapterRegistry.get(adapter.hostType, adapter.entry)) {
            adapterRegistry.register(adapter);
        }
    });

    [
        createSheetsFloatingObjectHostContainerContribution(),
        createSheetsSheetTabHostContainerContribution(),
    ].forEach((container) => {
        if (!containerRegistry.get(container.hostType, container.entry)) {
            containerRegistry.register(container);
        }
    });

    const childView = createSheetsEmbedChildViewContribution();
    if (!childViewRegistry.get(childView.childType)) {
        childViewRegistry.register(childView);
    }

    const block = createSheetsEmbedBlockContribution();
    if (!blockRegistry.get(block.childType)) {
        blockRegistry.register(block);
    }

    registerEmbedProductMenuContribution(injector, createSheetsEmbedProductMenuContribution());
}
