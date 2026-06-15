import type { EmbedDescriptor, EmbedLayout } from '@univerjs/embed';
import type { UniverInstanceType } from '@univerjs/core';
import type { EmbedChildContainerContext, EmbedFullscreenSession, EmbedRenderScope } from '../types/embed-ui';
import { EmbedModelService } from '@univerjs/embed';
import { Injector } from '@univerjs/core';
import { useDependency } from '@univerjs/ui';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { of } from 'rxjs';
import { EMBED_CANVAS_ROOT_ATTRIBUTE, EMBED_OVERLAY_ROOT_ATTRIBUTE, ensureEmbedDefaultRuntimeSlots, findEmbedRuntimeSlot } from '../common/embed-runtime-slots';
import { EmbedBlockRegistryService } from '../services/embed-block-registry.service';
import { createEmbedChildRuntimeScope } from '../services/embed-child-runtime-scope';
import { EmbedChildViewRegistryService } from '../services/embed-child-view-registry.service';
import { EmbedFullscreenService } from '../services/embed-fullscreen.service';

const EMBED_HOST_TOOLBAR_STYLE_ID = 'univer-embed-host-toolbar-menu-styles';

export function EmbedHostToolbarMenu() {
    return <EmbedFullscreenSurface />;
}

function EmbedFullscreenSurface() {
    ensureEmbedHostToolbarMenuStyles();

    const injector = useDependency(Injector);
    const fullscreenService = useDependency(EmbedFullscreenService);
    const viewportRef = useRef<HTMLDivElement>(null);
    const [session, setSession] = useState<EmbedFullscreenSession | null>(() => fullscreenService.getSession());

    useEffect(() => {
        const subscription = fullscreenService.session$.subscribe(setSession);
        return () => subscription.unsubscribe();
    }, [fullscreenService]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!session || !viewport) {
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
        const renderScope = createFullscreenRenderScope(descriptor, session.layout, viewport);
        const childContextBase: Omit<EmbedChildContainerContext, 'runtimeScope'> = {
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
        const disposable = contribution.mount?.({
            ...childContextBase,
            runtimeScope,
        });
        viewport.dataset.embedFullscreenStatus = 'mounted';

        return () => {
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
        };
    }, [injector, session]);

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
                ref={viewportRef}
                className="univer-embed-fullscreen-viewport"
                data-embed-fullscreen-viewport="true"
            />
        </div>,
        document.body
    );
}

function getEmbedDescriptorById(injector: Injector, hostUnitId: string, embedId: string): EmbedDescriptor | undefined {
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

function createFullscreenRenderScope(descriptor: EmbedDescriptor, layout: EmbedLayout, viewport: HTMLElement): EmbedRenderScope {
    return {
        hostUnitId: descriptor.hostUnitId,
        hostAnchorId: descriptor.hostAnchorId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        layout,
        mode: 'float',
        rootElement: viewport,
        canvasRoot: findEmbedRuntimeSlot(viewport, EMBED_CANVAS_ROOT_ATTRIBUTE) ?? viewport,
        overlayRoot: findEmbedRuntimeSlot(viewport, EMBED_OVERLAY_ROOT_ATTRIBUTE) ?? viewport,
        active$: of(true),
    };
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
    grid-template-rows: 44px minmax(0, 1fr);
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
`;
    document.head.appendChild(style);
}
