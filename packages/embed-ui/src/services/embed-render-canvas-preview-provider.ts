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

import type { DependencyIdentifier, Injector, UniverInstanceType } from '@univerjs/core';
import type {
    EmbedFloatPreviewRenderResult,
    IEmbedChildContainerContext,
    IEmbedFloatPreviewProvider,
    IEmbedFloatPreviewRenderRequest,
} from '../types/embed-ui';
import type { IEmbedRenderManagerServiceLike } from './embed-render-child-view-contribution';
import { of } from 'rxjs';
import { createEmbedChildUnitScopedInjector } from './embed-child-unit-scoped-injector';
import { ensureEmbedChildRender, refreshEmbedChildRender } from './embed-render-child-view-contribution';
import { captureEmbedContextSceneCanvas } from './embed-scene-canvas-capture.service';

export interface ICreateEmbedRenderCanvasPreviewProviderOptions {
    childType: UniverInstanceType;
    renderManagerService: DependencyIdentifier<IEmbedRenderManagerServiceLike>;
}

export function createEmbedRenderCanvasPreviewProvider(
    injector: Injector,
    options: ICreateEmbedRenderCanvasPreviewProviderOptions
): IEmbedFloatPreviewProvider {
    return {
        childType: options.childType,
        collectViewState: () => undefined,
        restoreViewState: () => undefined,
        renderPreview: (request) => renderEmbedCanvasPreview(injector, options.renderManagerService, request),
    };
}

function renderEmbedCanvasPreview(
    injector: Injector,
    renderManagerServiceIdentifier: DependencyIdentifier<IEmbedRenderManagerServiceLike>,
    request: IEmbedFloatPreviewRenderRequest
): EmbedFloatPreviewRenderResult | undefined {
    if (request.context) {
        const contextResult = captureEmbedContextSceneCanvas(request.context);
        if (contextResult) {
            return contextResult;
        }
    }

    if (typeof document === 'undefined') {
        return undefined;
    }

    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-100000px';
    host.style.top = '-100000px';
    host.style.width = `${Math.max(1, Math.round(request.width))}px`;
    host.style.height = `${Math.max(1, Math.round(request.height))}px`;
    host.style.pointerEvents = 'none';
    document.body.appendChild(host);

    const renderManagerService = injector.get(renderManagerServiceIdentifier);
    const ownedScopedInjector = request.context?.runtimeScope?.injector
        ? undefined
        : createEmbedChildUnitScopedInjector(createPreviewChildContext(injector, request, host));
    const renderParentInjector = request.context?.runtimeScope?.injector ?? ownedScopedInjector;
    const render = ensureEmbedChildRender(renderManagerService, request.childUnitId, renderParentInjector);
    if (!render) {
        ownedScopedInjector?.dispose();
        host.remove();
        return undefined;
    }

    try {
        render.engine.mount(host);
        refreshEmbedChildRender(render, { activate: false });
        const canvas = render.engine.getCanvasElement?.() ?? render.engine.getCanvas?.()?.getCanvasEle?.();
        if (!canvas || canvas.width <= 1 || canvas.height <= 1 || typeof canvas.toDataURL !== 'function') {
            return undefined;
        }

        return canvas.toDataURL('image/png');
    } catch {
        return undefined;
    } finally {
        try {
            render.engine.unmount?.();
        } catch {
            // The render engine may already have been detached by the render service.
        }
        if (ownedScopedInjector) {
            renderManagerService.removeRender?.(request.childUnitId);
            ownedScopedInjector.dispose();
        }
        host.remove();
    }
}

function createPreviewChildContext(
    injector: Injector,
    request: IEmbedFloatPreviewRenderRequest,
    host: HTMLElement
): IEmbedChildContainerContext {
    const layout = resolvePreviewLayout(request);
    const noop = () => {};

    return {
        descriptor: request.descriptor,
        layout,
        injector,
        hostElement: host,
        container: host,
        hostUnitId: request.descriptor.hostUnitId,
        embedId: request.descriptor.embedId,
        childUnitId: request.childUnitId,
        childType: request.childType,
        renderScope: {
            hostUnitId: request.descriptor.hostUnitId,
            hostAnchorId: request.descriptor.hostAnchorId,
            embedId: request.descriptor.embedId,
            childUnitId: request.childUnitId,
            childType: request.childType,
            layout,
            mode: 'float',
            rootElement: host,
            contentRoot: host,
            canvasRoot: host,
            active$: of(false),
        },
        runtimeScope: {
            descriptor: request.descriptor,
            host: {
                unitId: request.descriptor.hostUnitId,
                type: request.descriptor.hostType,
                anchorId: request.descriptor.hostAnchorId,
                entry: request.descriptor.entry,
                layout: 'float',
            },
            child: {
                unitId: request.childUnitId,
                type: request.childType,
            },
            injector,
            roots: {
                root: host,
                content: host,
                canvas: host,
                overlay: host,
                popup: host,
            },
            activate: noop,
            deactivate: noop,
            dispose: noop,
        },
    };
}

function resolvePreviewLayout(request: IEmbedFloatPreviewRenderRequest): IEmbedChildContainerContext['layout'] {
    const floating = request.descriptor.sourceMeta?.floating;
    if (floating && typeof floating === 'object' && typeof floating.layout === 'string') {
        return floating.layout as IEmbedChildContainerContext['layout'];
    }

    return request.context?.layout ?? 'scroll-contained';
}
