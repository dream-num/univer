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
import type { LocaleKey } from '../locale/types';
import type { IEmbedChildContainerContext, IEmbedFullscreenSession, IEmbedRenderScope } from '../types/embed-ui';
import { Injector, LocaleService, toDisposable } from '@univerjs/core';
import { Button } from '@univerjs/design';
import { EmbedModelService } from '@univerjs/embed';
import { FullscreenIcon } from '@univerjs/icons';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { of } from 'rxjs';
import {
    EMBED_CANVAS_ROOT_ATTRIBUTE,
    EMBED_CONTENT_ROOT_ATTRIBUTE,
    EMBED_FOOTER_SLOT_ATTRIBUTE,
    EMBED_MENU_SLOT_ATTRIBUTE,
    EMBED_OVERLAY_ROOT_ATTRIBUTE,
    EMBED_POPUP_ROOT_ATTRIBUTE,
    ensureEmbedDefaultRuntimeSlots,
    findEmbedRuntimeSlot,
} from '../common/embed-runtime-slots';
import { EmbedBlockRegistryService } from '../services/embed-block-registry.service';
import { createEmbedChildRuntimeScope } from '../services/embed-child-runtime-scope';
import { EmbedChildViewRegistryService } from '../services/embed-child-view-registry.service';
import { EmbedFloatingMenuRegistryService } from '../services/embed-floating-menu-registry.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';
import { mountEmbedProductRibbonMenu } from '../services/embed-product-menu-mounting';
import { EmbedProductMenuRegistryService } from '../services/embed-product-menu-registry.service';
import { EmbedHostChromeMode } from '../types/embed-ui';

export function EmbedHostToolbarMenu() {
    return <EmbedFullscreenSurface />;
}

function EmbedFullscreenSurface() {
    const injector = useDependency(Injector);
    const localeService = useDependency(LocaleService);
    const fullscreenService = useDependency(EmbedFullscreenService);
    const menuRef = useRef<HTMLDivElement>(null);
    const menuContentRef = useRef<HTMLDivElement>(null);
    const viewportRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [session, setSession] = useState<IEmbedFullscreenSession | null>(() => fullscreenService.getSession());

    useEffect(() => {
        const subscription = fullscreenService.session$.subscribe(setSession);
        return () => subscription.unsubscribe();
    }, [fullscreenService]);

    useEffect(() => {
        const viewport = viewportRef.current;
        const menuSlot = menuContentRef.current;
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
    const exitLabel = localeService.t<LocaleKey>('embed-ui.fullscreen.exit');

    return createPortal(
        <div
            className="
              univer-fixed univer-inset-0 univer-z-[9999] univer-grid univer-grid-rows-[auto_minmax(0,1fr)_auto]
              univer-bg-white univer-text-gray-900
              dark:!univer-bg-gray-800 dark:!univer-text-white
            "
            data-embed-fullscreen-shell="true"
        >
            <div
                ref={menuRef}
                className="
                  univer-relative univer-z-[3] univer-min-w-0 univer-bg-white
                  empty:univer-hidden
                  dark:!univer-bg-gray-800
                "
                data-embed-fullscreen-menu="true"
            >
                <div
                    className="
                      univer-pointer-events-none univer-absolute univer-left-3.5 univer-right-3 univer-top-0
                      univer-z-[4] univer-flex univer-h-9 univer-min-w-0 univer-items-center univer-justify-between
                      univer-gap-4
                    "
                    data-embed-fullscreen-header="true"
                >
                    <span
                        className="
                          univer-min-w-0 univer-overflow-hidden univer-text-ellipsis univer-whitespace-nowrap
                          univer-text-sm univer-font-semibold univer-text-gray-700
                          dark:!univer-text-gray-200
                        "
                    >
                        {getChildProductLabel(injector, session.childType)}
                    </span>
                    <Button
                        type="button"
                        size="small"
                        variant="ghost"
                        className="
                          univer-pointer-events-auto univer-gap-1.5
                          [&_svg]:!univer-size-3.5
                        "
                        data-embed-fullscreen-close="true"
                        aria-label={exitLabel}
                        title={exitLabel}
                        onClick={exitFullscreen}
                    >
                        <FullscreenIcon />
                        <span>{exitLabel}</span>
                    </Button>
                </div>
                <div
                    ref={menuContentRef}
                    className="
                      univer-min-w-0
                      [&_[data-u-comp=ribbon-header-menu]]:univer-box-border
                      [&_[data-u-comp=ribbon-header-menu]]:univer-px-24
                    "
                    data-embed-fullscreen-menu-slot="true"
                    {...{ [EMBED_MENU_SLOT_ATTRIBUTE]: 'true' }}
                />
            </div>
            <div className="univer-flex univer-min-h-0 univer-min-w-0 univer-overflow-hidden" data-embed-fullscreen-body="true">
                <div
                    className="
                      univer-relative univer-z-[2] univer-min-h-0 univer-flex-none univer-bg-white
                      empty:univer-hidden
                      dark:!univer-bg-gray-800
                      [&_[data-u-comp=base-left-panel]]:univer-h-full
                    "
                    data-embed-fullscreen-sidebar-slot="true"
                    data-embed-id={session.embedId}
                />
                <div
                    ref={viewportRef}
                    className="
                      univer-relative univer-min-h-0 univer-min-w-0 univer-flex-1 univer-overflow-hidden
                      dark:!univer-bg-gray-900
                    "
                    data-embed-fullscreen-viewport="true"
                />
            </div>
            <div
                ref={footerRef}
                className="
                  univer-relative univer-z-[2] univer-min-w-0 univer-bg-white
                  empty:univer-hidden
                  dark:!univer-bg-gray-800
                "
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
    const { viewport, menuSlot } = roots;
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
            embedId: params.descriptor.embedId,
            surface: 'ribbon',
            headerMenu: true,
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
        embedId: params.descriptor.embedId,
        menuSchema: undefined,
        headerMenu: true,
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
