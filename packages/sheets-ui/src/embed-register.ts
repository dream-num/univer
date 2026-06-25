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
import type { IEmbedDescriptor } from '@univerjs/embed';
import { IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { EmbedModelService } from '@univerjs/embed';
import { createEmbedRenderCanvasPreviewProvider, EmbedActivationService, EmbedBlockRegistryService, EmbedChildViewRegistryService, EmbedContentSizeRegistryService, EmbedFloatDomRenderer, EmbedFloatingMenuRegistryService, EmbedFloatPreviewService, EmbedHostAdapterRegistryService, EmbedHostAnchorModelService, EmbedHostContainerRegistryService, EmbedHostMenuOverrideService, EmbedMountService, EmbedPassiveViewportRegistryService, registerEmbedUIContribution } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ISheetDrawingService } from '@univerjs/sheets-drawing';
import { CanvasFloatDomPreviewService, ComponentManager } from '@univerjs/ui';
import { Subscription } from 'rxjs';
import { createSheetsContentSizeProvider } from './embed-content-size';
import { EMBED_SHEETS_FLOATING_COMPONENT_KEY } from './embed-floating-anchor';
import { createSheetsFloatingObjectHostAdapterContribution, createSheetsFloatingObjectHostContainerContribution, createSheetsSheetTabHostAdapterContribution, createSheetsSheetTabHostContainerContribution } from './embed-host-adapter';
import { createSheetsPassiveViewportProvider } from './embed-passive-viewport';
import { registerSheetsEmbedProductMenus } from './embed-product-menu';
import { createSheetsEmbedBlockContribution, createSheetsEmbedChildViewContribution } from './EmbedBlock';
import { createSheetsFloatingMenuContributions } from './EmbedFloatingMenu';
import { ISheetEmbedRuntimeService } from './services/sheet-embed-runtime.service';
import { ISheetHostChromeOverrideService } from './services/sheet-host-chrome-override.service';

export function registerSheetsEmbedUIContributions(injector: Injector): void {
    registerEmbedUIContribution(injector, 'sheets-ui.embed', registerSheetsEmbedUIContributionsNow);
}

function registerSheetsEmbedUIContributionsNow(injector: Injector): void {
    const adapterRegistry = injector.get(EmbedHostAdapterRegistryService);
    const containerRegistry = injector.get(EmbedHostContainerRegistryService);
    const childViewRegistry = injector.get(EmbedChildViewRegistryService);
    const blockRegistry = injector.get(EmbedBlockRegistryService);
    const floatingMenuRegistry = injector.get(EmbedFloatingMenuRegistryService);
    const previewService = injector.get(EmbedFloatPreviewService);
    const contentSizeRegistry = injector.get(EmbedContentSizeRegistryService);
    const passiveViewportRegistry = injector.get(EmbedPassiveViewportRegistryService);
    const anchorModelService = injector.has(EmbedHostAnchorModelService) ? injector.get(EmbedHostAnchorModelService) : undefined;
    const univerInstanceService = injector.has(IUniverInstanceService) ? injector.get(IUniverInstanceService) : undefined;
    registerSheetsEmbedProductMenus(injector);

    if (!injector.has(ISheetHostChromeOverrideService)) {
        injector.add([ISheetHostChromeOverrideService, { useFactory: () => injector.get(EmbedHostMenuOverrideService) }]);
    }
    if (!injector.has(ISheetEmbedRuntimeService)) {
        injector.add([ISheetEmbedRuntimeService, {
            useFactory: () => createSheetsEmbedRuntimeService({
                embedModelService: injector.get(EmbedModelService),
                mountService: injector.get(EmbedMountService),
                activationService: injector.get(EmbedActivationService),
            }),
        }]);
    }
    if (injector.has(ComponentManager)) {
        injector.get(ComponentManager).register(EMBED_SHEETS_FLOATING_COMPONENT_KEY, EmbedFloatDomRenderer);
    }

    [
        createSheetsFloatingObjectHostAdapterContribution(
            anchorModelService,
            () => injector.has(ISheetDrawingService) ? injector.get(ISheetDrawingService) : undefined,
            () => injector.has(IDrawingManagerService) ? injector.get(IDrawingManagerService) : undefined
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

    createSheetsFloatingMenuContributions().forEach((floatingMenu) => {
        if (!floatingMenuRegistry.get(floatingMenu.hostType, floatingMenu.entry, floatingMenu.childType)) {
            floatingMenuRegistry.register(floatingMenu);
        }
    });

    previewService.registerProvider(createEmbedRenderCanvasPreviewProvider(injector, {
        childType: UniverInstanceType.UNIVER_SHEET,
        renderManagerService: IRenderManagerService,
    }));
    if (!contentSizeRegistry.get(UniverInstanceType.UNIVER_SHEET)) {
        contentSizeRegistry.register(createSheetsContentSizeProvider());
    }
    if (!passiveViewportRegistry.get(UniverInstanceType.UNIVER_SHEET)) {
        passiveViewportRegistry.register(createSheetsPassiveViewportProvider(injector));
    }

    if (injector.has(CanvasFloatDomPreviewService) && injector.has(EmbedModelService)) {
        wireSheetsFloatPreviewBridge({
            previewService,
            embedModelService: injector.get(EmbedModelService),
            canvasFloatDomPreviewService: injector.get(CanvasFloatDomPreviewService),
        });
    }
}

export function createSheetsEmbedRuntimeService(params: {
    embedModelService: EmbedModelService;
    mountService: EmbedMountService;
    activationService: EmbedActivationService;
}): ISheetEmbedRuntimeService {
    return {
        mountSheetTab: ({ hostUnitId, hostAnchorId, embedId }) => {
            const descriptor = params.embedModelService.getDescriptor(hostUnitId, embedId) as IEmbedDescriptor | undefined;
            if (!descriptor || descriptor.hostAnchorId !== hostAnchorId) {
                return undefined;
            }

            params.mountService.mount(descriptor);
            params.activationService.activateTab(descriptor);

            return toDisposable(() => {
                params.mountService.unmount(embedId);
                params.activationService.clearTab(embedId);
            });
        },
        clearTab: (embedId?: string) => {
            params.activationService.clearTab(embedId);
        },
    };
}

export function wireSheetsFloatPreviewBridge(params: {
    previewService: EmbedFloatPreviewService;
    embedModelService: EmbedModelService;
    canvasFloatDomPreviewService: CanvasFloatDomPreviewService;
}): Subscription {
    const subscription = new Subscription();

    subscription.add(params.previewService.previewUpdated$.subscribe((entry) => {
        if (typeof entry.image !== 'string') {
            return;
        }

        const descriptor = params.embedModelService
            .getActiveDescriptorsByChildUnit(entry.childUnitId)
            .find((item) => item.embedId === entry.embedId && item.entry === 'sheets-floating-object');
        if (!descriptor?.hostAnchorId) {
            return;
        }

        params.canvasFloatDomPreviewService.setPreview({
            id: descriptor.hostAnchorId,
            image: entry.image,
            updatedAt: entry.updatedAt,
        });
    }));

    if (!params.canvasFloatDomPreviewService.previewRequested$) {
        return subscription;
    }

    const handlePreviewRequest = (request: Parameters<typeof params.canvasFloatDomPreviewService.requestPreview>[0]) => {
        const data = request.data;
        if (!data || typeof data !== 'object') {
            return;
        }

        const embedId = getString(data, 'embedId');
        const hostUnitId = getString(data, 'hostUnitId');
        if (!embedId || !hostUnitId) {
            return;
        }

        const descriptor = params.embedModelService.getDescriptor(hostUnitId, embedId);
        if (!descriptor || descriptor.entry !== 'sheets-floating-object' || !descriptor.childUnitId || descriptor.childType == null) {
            return;
        }

        params.previewService.requestPreview({
            descriptor,
            childUnitId: descriptor.childUnitId,
            childType: descriptor.childType,
            width: request.width,
            height: request.height,
            dpr: typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1,
            reason: 'initial',
        });
    };

    params.canvasFloatDomPreviewService.getPendingRequests?.().forEach(handlePreviewRequest);
    subscription.add(params.canvasFloatDomPreviewService.previewRequested$.subscribe(handlePreviewRequest));

    return subscription;
}

function getString(data: object, key: string): string | undefined {
    const value = (data as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
}
