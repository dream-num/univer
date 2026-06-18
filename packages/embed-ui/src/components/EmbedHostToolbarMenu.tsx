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

import type { IDisposable, UniverInstanceType } from '@univerjs/core';
import type { EmbedLayout, IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedChildContainerContext, IEmbedFullscreenSession, IEmbedRenderScope } from '../types/embed-ui';
import { Injector, toDisposable } from '@univerjs/core';
import { EmbedModelService } from '@univerjs/embed';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { of } from 'rxjs';
import { EMBED_CANVAS_ROOT_ATTRIBUTE, EMBED_CONTENT_ROOT_ATTRIBUTE, EMBED_FOOTER_SLOT_ATTRIBUTE, EMBED_MENU_SLOT_ATTRIBUTE, EMBED_OVERLAY_ROOT_ATTRIBUTE, EMBED_POPUP_ROOT_ATTRIBUTE, ensureEmbedDefaultRuntimeSlots, findEmbedRuntimeSlot } from '../common/embed-runtime-slots';
import { EmbedBlockRegistryService } from '../services/embed-block-registry.service';
import { createEmbedChildRuntimeScope } from '../services/embed-child-runtime-scope';
import { EmbedChildViewRegistryService } from '../services/embed-child-view-registry.service';
import { EmbedFloatingMenuRegistryService } from '../services/embed-floating-menu-registry.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';
import { mountEmbedProductRibbonMenu } from '../services/embed-product-menu-mounting';
import { EmbedProductMenuRegistryService } from '../services/embed-product-menu-registry.service';
import { EmbedHostChromeMode } from '../types/embed-ui';

const EMBED_HOST_TOOLBAR_STYLE_ID = 'univer-embed-host-toolbar-menu-styles';

export function EmbedHostToolbarMenu() {
    return <EmbedFullscreenSurface />;
}

function EmbedFullscreenSurface() {
    ensureEmbedHostToolbarMenuStyles();

    const injector = useDependency(Injector);
    const fullscreenService = useDependency(EmbedFullscreenService);
    const menuRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [session, setSession] = useState<IEmbedFullscreenSession | null>(() => fullscreenService.getSession());

    useEffect(() => {
        const subscription = fullscreenService.session$.subscribe(setSession);
        return () => subscription.unsubscribe();
    }, [fullscreenService]);

    useEffect(() => {
        const viewport = viewportRef.current;
        const menuSlot = menuRef.current;
        const footerSlot = footerRef.current;
        if (!session || !viewport || !menuSlot || !footerSlot) {
            return undefined;
        }

        const descriptor = getEmbedDescriptorById(injector, session.hostUnitId, session.embedId);
        if (!descriptor?.childUnitId || descriptor.childType == null) {
            viewport.dataset.embedFullscreenStatus = 'missing-descriptor';
            return undefined;
        }

        const contribution = injector.get(EmbedChildViewRegistryService).get(descriptor.childType);
        if (!contribution?.supportedLayouts.includes(session.layout)) {
            viewport.dataset.embedFullscreenStatus = 'unsupported-layout';
            return undefined;
        }

        viewport.dataset.embedFullscreenStatus = 'mounting';
        viewport.dataset.embedId = descriptor.embedId;
        viewport.dataset.embedHostEntry = descriptor.entry;
        viewport.dataset.embedHostAnchorId = descriptor.hostAnchorId;
        viewport.dataset.embedLayout = session.layout;
        viewport.dataset.embedChildType = String(descriptor.childType);
        viewport.dataset.embedChildUnitId = descriptor.childUnitId;

        const runtimeSlotsDisposable = ensureEmbedDefaultRuntimeSlots(viewport);
        const renderScope = createFullscreenRenderScope(descriptor, session.layout, {
            viewport,
            menuSlot,
            footerSlot,
        });
        const childContextBase: Omit<IEmbedChildContainerContext, 'runtimeScope'> = {
            descriptor,
            layout: session.layout,
            injector,
            hostElement: viewport,
            container: viewport,
            renderScope,
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId,
            childType: descriptor.childType,
        };
        const { runtimeScope, disposable: runtimeScopeDisposable } = createEmbedChildRuntimeScope(childContextBase, () => {});
        const childContext: IEmbedChildContainerContext = {
            ...childContextBase,
            runtimeScope,
        };
        const disposable = contribution.mount?.(childContext);
        const menuDisposable = mountFullscreenWorkbenchMenus({
            injector,
            descriptor,
            childContext,
            menuContainer: menuSlot,
        });
        viewport.dataset.embedFullscreenStatus = 'mounted';

        return () => {
            scheduleFullscreenCleanupAfterUnmount(() => {
                menuDisposable?.dispose();
                disposable?.dispose();
                runtimeScopeDisposable.dispose();
                runtimeSlotsDisposable.dispose();
                delete viewport.dataset.embedFullscreenStatus;
                delete viewport.dataset.embedId;
                delete viewport.dataset.embedHostEntry;
                delete viewport.dataset.embedHostAnchorId;
                delete viewport.dataset.embedLayout;
                delete viewport.dataset.embedChildType;
                delete viewport.dataset.embedChildUnitId;
                fullscreenService.notifyExited(session);
            });
        };
    }, [fullscreenService, injector, session]);

    if (!session) {
        return null;
    }

    const exitFullscreen = () => {
        fullscreenService.exit(session.embedId);
    };

    return createPortal(
        <div className="univer-embed-fullscreen-shell" data-embed-fullscreen-shell="true">
            <div className="univer-embed-fullscreen-bar" data-embed-fullscreen-bar="true">
                <span className="univer-embed-fullscreen-title">
                    {getChildProductLabel(injector, session.childType)}
                </span>
                <button
                    type="button"
                    className="univer-embed-fullscreen-close"
                    data-embed-fullscreen-close="true"
                    onClick={exitFullscreen}
                >
                    Close
                </button>
            </div>
            <div
                ref={menuRef}
                className="univer-embed-fullscreen-menu"
                data-embed-fullscreen-menu-slot="true"
                {...{ [EMBED_MENU_SLOT_ATTRIBUTE]: 'true' }}
            />
            <div
                ref={viewportRef}
                className="univer-embed-fullscreen-viewport"
                data-embed-fullscreen-viewport="true"
            />
            <div
                ref={footerRef}
                className="univer-embed-fullscreen-footer"
                data-embed-fullscreen-footer-slot="true"
                {...{ [EMBED_FOOTER_SLOT_ATTRIBUTE]: 'true' }}
            />
        </div>,
        document.body
    );
}

function scheduleFullscreenCleanupAfterUnmount(cleanup: () => void): void {
    const schedule = typeof globalThis.requestAnimationFrame === 'function'
        ? globalThis.requestAnimationFrame.bind(globalThis)
        : (callback: FrameRequestCallback) => globalThis.setTimeout(callback, 0);

    schedule(() => cleanup());
}

function getEmbedDescriptorById(injector: Injector, hostUnitId: string, embedId: string): IEmbedDescriptor | undefined {
    try {
        return injector.get(EmbedModelService).getDescriptor(hostUnitId, embedId);
    } catch {
        return undefined;
    }
}

function getChildProductLabel(injector: Injector, childType: UniverInstanceType): string {
    try {
        return injector.get(EmbedBlockRegistryService).get(childType)?.productName ?? 'Embed';
    } catch {
        return 'Embed';
    }
}

export function createFullscreenRenderScope(
    descriptor: IEmbedDescriptor,
    layout: EmbedLayout,
    roots: {
        viewport: HTMLElement;
        menuSlot: HTMLElement;
        footerSlot: HTMLElement;
    }
): IEmbedRenderScope {
    const { viewport, menuSlot, footerSlot } = roots;
    return {
        hostUnitId: descriptor.hostUnitId,
        hostAnchorId: descriptor.hostAnchorId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        layout,
        mode: 'float',
        rootElement: viewport,
        contentRoot: findEmbedRuntimeSlot(viewport, EMBED_CONTENT_ROOT_ATTRIBUTE) ?? viewport,
        canvasRoot: findEmbedRuntimeSlot(viewport, EMBED_CANVAS_ROOT_ATTRIBUTE) ?? viewport,
        overlayRoot: findEmbedRuntimeSlot(viewport, EMBED_OVERLAY_ROOT_ATTRIBUTE) ?? viewport,
        popupRoot: findEmbedRuntimeSlot(viewport, EMBED_POPUP_ROOT_ATTRIBUTE) ?? viewport,
        menuOutlet: { container: menuSlot },
        active$: of(true),
        fullscreen: true,
    };
}

export function mountFullscreenWorkbenchMenus(params: {
    injector: Injector;
    descriptor: IEmbedDescriptor;
    childContext: IEmbedChildContainerContext;
    menuContainer: HTMLElement;
}): IDisposable | undefined {
    const ribbonDisposable = mountFullscreenProductRibbon(params);
    if (ribbonDisposable) {
        return ribbonDisposable;
    }

    return mountFullscreenFloatingMenu(params);
}

function mountFullscreenProductRibbon(params: {
    injector: Injector;
    descriptor: IEmbedDescriptor;
    menuContainer: HTMLElement;
}): IDisposable | undefined {
    if (!params.injector.has(EmbedBlockRegistryService) || params.descriptor.childType == null) {
        return undefined;
    }

    const contribution = params.injector.get(EmbedBlockRegistryService).get(params.descriptor.childType);
    if (contribution?.hostChromeMode !== EmbedHostChromeMode.RIBBON) {
        return undefined;
    }

    if (params.injector.has(EmbedProductMenuRegistryService)) {
        const productMenuDisposable = params.injector.get(EmbedProductMenuRegistryService).mountMenu({
            container: params.menuContainer,
            injector: params.injector,
            childType: params.descriptor.childType,
            childUnitId: params.descriptor.childUnitId,
            menuTitlePrefix: contribution.productName,
            surface: 'ribbon',
        });
        if (productMenuDisposable) {
            return productMenuDisposable;
        }
    }

    return mountEmbedProductRibbonMenu({
        container: params.menuContainer,
        injector: params.injector,
        childType: params.descriptor.childType,
        childUnitId: params.descriptor.childUnitId,
        menuSchema: undefined,
        menuTitlePrefix: contribution.productName,
    });
}

function mountFullscreenFloatingMenu(params: {
    injector: Injector;
    descriptor: IEmbedDescriptor;
    childContext: IEmbedChildContainerContext;
}): IDisposable | undefined {
    if (!params.injector.has(EmbedFloatingMenuRegistryService) || params.descriptor.childType == null || !params.descriptor.childUnitId) {
        return undefined;
    }

    const contribution = params.injector.get(EmbedFloatingMenuRegistryService)
        .get(params.descriptor.hostType, params.descriptor.entry, params.descriptor.childType);
    const disposable = contribution?.mount({
        ...params.childContext,
        active: {
            hostUnitId: params.descriptor.hostUnitId,
            embedId: params.descriptor.embedId,
            childUnitId: params.descriptor.childUnitId,
            stage: 'stage2',
        },
    });

    return disposable ? toDisposable(() => disposable.dispose()) : undefined;
}

function ensureEmbedHostToolbarMenuStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(EMBED_HOST_TOOLBAR_STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = EMBED_HOST_TOOLBAR_STYLE_ID;
    style.textContent = `
.univer-embed-fullscreen-close {
    box-sizing: border-box;
    height: 28px;
    align-self: start;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    background: #ffffff;
    color: #334155;
    cursor: pointer;
    font: inherit;
    font-size: 12px;
    line-height: 1;
    margin: 8px 12px 0 8px;
    padding: 0 10px;
}
.univer-embed-fullscreen-close:hover {
    background: #f8fafc;
    color: #0f172a;
}
.univer-embed-fullscreen-shell {
    position: fixed;
    inset: 0;
    z-index: 9999;
    display: grid;
    grid-template-rows: 44px auto minmax(0, 1fr) auto;
    background: #ffffff;
    color: #0f172a;
}
.univer-embed-fullscreen-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #e2e8f0;
    background: #f8fafc;
    padding: 0 12px 0 16px;
}
.univer-embed-fullscreen-title {
    overflow: hidden;
    color: #334155;
    font-size: 14px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}
.univer-embed-fullscreen-close {
    margin: 0;
}
.univer-embed-fullscreen-viewport {
    position: relative;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
}
.univer-embed-fullscreen-menu:empty,
.univer-embed-fullscreen-footer:empty {
    display: none;
}
.univer-embed-fullscreen-menu,
.univer-embed-fullscreen-footer {
    position: relative;
    z-index: 2;
    min-width: 0;
    background: #ffffff;
}
`;
    document.head.appendChild(style);
}
