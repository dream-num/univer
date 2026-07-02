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
import { toDisposable, UniverInstanceType } from '@univerjs/core';
import { EmbedModelService } from '@univerjs/embed';
import { createEmbedRenderCanvasPreviewProvider, EmbedActivationService, EmbedBlockRegistryService, EmbedChildViewRegistryService, EmbedContentSizeRegistryService, EmbedFloatDomRenderer, EmbedFloatingMenuRegistryService, EmbedFloatPreviewService, EmbedHostContainerRegistryService, EmbedHostMenuOverrideService, EmbedHostRestoreService, EmbedMountService, EmbedPassiveViewportRegistryService, registerEmbedUIContribution } from '@univerjs/embed-ui';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CanvasFloatDomPreviewService, ComponentManager } from '@univerjs/ui';
import { Subscription } from 'rxjs';
import { createSheetsContentSizeProvider } from './embed-content-size';
import { EMBED_SHEETS_FLOATING_COMPONENT_KEY } from './embed-floating-anchor';
import { createSheetsFloatingObjectHostContainerContribution, createSheetsSheetTabHostContainerContribution } from './embed-host-adapter';
import { createSheetsPassiveViewportProvider } from './embed-passive-viewport';
import { registerSheetsEmbedProductMenus } from './embed-product-menu';
import { createSheetsEmbedBlockContribution, createSheetsEmbedChildViewContribution } from './EmbedBlock';
import { createSheetsFloatingMenuContributions } from './EmbedFloatingMenu';
import { ISheetEmbedRuntimeService } from './services/sheet-embed-runtime.service';
import { ISheetHostChromeOverrideService } from './services/sheet-host-chrome-override.service';

const SHEETS_FLOAT_PREVIEW_BRIDGE_SUBSCRIPTIONS = new WeakMap<object, Subscription>();
const SHEETS_FLOAT_PREVIEW_BRIDGE_RETRYING = new WeakSet<object>();
const SHEETS_FLOAT_PREVIEW_BRIDGE_MAX_RETRIES = 240;
const SHEETS_FLOAT_PREVIEW_BRIDGE_RETRY_DELAY = 250;

export function registerSheetsEmbedUIContributions(injector: Injector): void {
    registerEmbedUIContribution(injector, 'sheets-ui.embed', registerSheetsEmbedUIContributionsNow);
}

function registerSheetsEmbedUIContributionsNow(injector: Injector): void {
    const containerRegistry = injector.get(EmbedHostContainerRegistryService);
    const childViewRegistry = injector.get(EmbedChildViewRegistryService);
    const blockRegistry = injector.get(EmbedBlockRegistryService);
    const floatingMenuRegistry = injector.get(EmbedFloatingMenuRegistryService);
    const previewService = injector.get(EmbedFloatPreviewService);
    const contentSizeRegistry = injector.get(EmbedContentSizeRegistryService);
    const passiveViewportRegistry = injector.get(EmbedPassiveViewportRegistryService);
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
                restoreService: injector.get(EmbedHostRestoreService),
            }),
        }]);
    }
    if (injector.has(ComponentManager)) {
        injector.get(ComponentManager).register(EMBED_SHEETS_FLOATING_COMPONENT_KEY, EmbedFloatDomRenderer);
    }

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

    ensureSheetsFloatPreviewBridge({ injector, previewService });
}

export function createSheetsEmbedRuntimeService(params: {
    embedModelService: EmbedModelService;
    mountService: EmbedMountService;
    activationService: EmbedActivationService;
    restoreService: EmbedHostRestoreService;
}): ISheetEmbedRuntimeService {
    return {
        mountSheetTab: ({ hostUnitId, hostAnchorId, embedId }) => {
            const descriptor = params.embedModelService.getDescriptor(hostUnitId, embedId) as IEmbedDescriptor | undefined;
            if (!descriptor || descriptor.hostAnchorId !== hostAnchorId) {
                return undefined;
            }

            let disposed = false;
            let mounted = false;
            let errorElement: HTMLElement | undefined;
            void params.restoreService.materializeDescriptor({ descriptor }).then((materializedDescriptor) => {
                if (disposed) {
                    return;
                }

                errorElement?.remove();
                errorElement = undefined;
                params.mountService.mount(materializedDescriptor);
                params.activationService.activateTab(materializedDescriptor);
                mounted = true;
            }).catch((error) => {
                if (disposed) {
                    return;
                }

                errorElement = renderSheetsSheetTabEmbedError(hostAnchorId, error);
            });

            return toDisposable(() => {
                disposed = true;
                errorElement?.remove();
                if (mounted) {
                    params.mountService.unmount(embedId);
                }
                params.activationService.clearTab(embedId);
            });
        },
        clearTab: (embedId?: string) => {
            params.activationService.clearTab(embedId);
        },
    };
}

function renderSheetsSheetTabEmbedError(hostAnchorId: string, error: unknown): HTMLElement | undefined {
    const hostElement = querySheetsSheetTabHostElement(hostAnchorId);
    if (!hostElement) {
        return undefined;
    }

    const element = document.createElement('div');
    element.dataset.embedSheetsSheetTabError = 'true';
    element.style.padding = '12px';
    element.style.color = '#b91c1c';
    element.style.fontSize = '13px';
    element.textContent = error instanceof Error && error.message
        ? error.message
        : 'Failed to load embedded sheet.';
    hostElement.replaceChildren(element);
    return element;
}

function querySheetsSheetTabHostElement(hostAnchorId: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[data-embed-sheets-sheet-tab-host="${escapeSheetsSheetTabHostAttribute(hostAnchorId)}"]`);
}

function escapeSheetsSheetTabHostAttribute(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function wireSheetsFloatPreviewBridge(params: {
    previewService: EmbedFloatPreviewService;
    embedModelService: EmbedModelService;
    canvasFloatDomPreviewService: CanvasFloatDomPreviewService;
}): Subscription {
    const subscription = new Subscription();
    let pendingDrainAttempts = 0;
    let pendingDrainTimer: ReturnType<typeof setTimeout> | undefined;

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

    const schedulePendingDrain = () => {
        if (pendingDrainTimer || pendingDrainAttempts >= SHEETS_FLOAT_PREVIEW_BRIDGE_MAX_RETRIES) {
            return;
        }

        pendingDrainTimer = globalThis.setTimeout(() => {
            pendingDrainTimer = undefined;
            pendingDrainAttempts += 1;
            drainPendingPreviewRequests();
        }, SHEETS_FLOAT_PREVIEW_BRIDGE_RETRY_DELAY);
    };
    const handlePreviewRequest = (request: Parameters<typeof params.canvasFloatDomPreviewService.requestPreview>[0]): boolean => {
        const data = request.data;
        if (!data || typeof data !== 'object') {
            return true;
        }

        const embedId = getString(data, 'embedId');
        const hostUnitId = getString(data, 'hostUnitId');
        if (!embedId || !hostUnitId) {
            return true;
        }

        const descriptor = params.embedModelService.getDescriptor(hostUnitId, embedId);
        if (!descriptor || descriptor.entry !== 'sheets-floating-object' || !descriptor.childUnitId || descriptor.childType == null) {
            return false;
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
        return true;
    };
    const drainPendingPreviewRequests = () => {
        let hasUnresolvedRequest = false;
        params.canvasFloatDomPreviewService.getPendingRequests?.().forEach((request) => {
            if (!handlePreviewRequest(request)) {
                hasUnresolvedRequest = true;
            }
        });
        if (hasUnresolvedRequest) {
            schedulePendingDrain();
        }
    };

    drainPendingPreviewRequests();
    subscription.add(params.canvasFloatDomPreviewService.previewRequested$.subscribe((request) => {
        if (!handlePreviewRequest(request)) {
            schedulePendingDrain();
        }
    }));
    subscription.add(() => {
        if (pendingDrainTimer) {
            globalThis.clearTimeout(pendingDrainTimer);
        }
    });

    return subscription;
}

export function ensureSheetsFloatPreviewBridge(params: {
    injector: Pick<Injector, 'get' | 'has'>;
    previewService: EmbedFloatPreviewService;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
}): Subscription | undefined {
    const injectorKey = params.injector as object;
    const existing = SHEETS_FLOAT_PREVIEW_BRIDGE_SUBSCRIPTIONS.get(injectorKey);
    if (existing) {
        return existing;
    }

    const services = resolveSheetsFloatPreviewBridgeServices(params.injector);
    if (services === null) {
        return undefined;
    }

    if (services) {
        const subscription = wireSheetsFloatPreviewBridge({
            previewService: params.previewService,
            embedModelService: services.embedModelService,
            canvasFloatDomPreviewService: services.canvasFloatDomPreviewService,
        });
        SHEETS_FLOAT_PREVIEW_BRIDGE_SUBSCRIPTIONS.set(injectorKey, subscription);
        return subscription;
    }

    if (params.retry === false || SHEETS_FLOAT_PREVIEW_BRIDGE_RETRYING.has(injectorKey)) {
        return undefined;
    }

    SHEETS_FLOAT_PREVIEW_BRIDGE_RETRYING.add(injectorKey);
    retryEnsureSheetsFloatPreviewBridge(params, 0);

    return undefined;
}

function retryEnsureSheetsFloatPreviewBridge(
    params: Parameters<typeof ensureSheetsFloatPreviewBridge>[0],
    attempt: number
): void {
    const maxRetries = params.maxRetries ?? SHEETS_FLOAT_PREVIEW_BRIDGE_MAX_RETRIES;
    const retryDelay = params.retryDelay ?? SHEETS_FLOAT_PREVIEW_BRIDGE_RETRY_DELAY;
    const injectorKey = params.injector as object;

    globalThis.setTimeout(() => {
        const subscription = ensureSheetsFloatPreviewBridge({
            ...params,
            retry: false,
        });
        if (subscription || attempt + 1 >= maxRetries) {
            SHEETS_FLOAT_PREVIEW_BRIDGE_RETRYING.delete(injectorKey);
            return;
        }

        retryEnsureSheetsFloatPreviewBridge(params, attempt + 1);
    }, retryDelay);
}

function resolveSheetsFloatPreviewBridgeServices(injector: Pick<Injector, 'get' | 'has'>): {
    embedModelService: EmbedModelService;
    canvasFloatDomPreviewService: CanvasFloatDomPreviewService;
} | undefined | null {
    try {
        if (!injector.has(CanvasFloatDomPreviewService) || !injector.has(EmbedModelService)) {
            return undefined;
        }

        return {
            embedModelService: injector.get(EmbedModelService),
            canvasFloatDomPreviewService: injector.get(CanvasFloatDomPreviewService),
        };
    } catch {
        return null;
    }
}

function getString(data: object, key: string): string | undefined {
    const value = (data as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : undefined;
}
