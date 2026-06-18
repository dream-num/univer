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
    EmbedFloatPreviewProvider,
    EmbedFloatPreviewRenderRequest,
    EmbedFloatPreviewRenderResult,
} from '../types/embed-ui';
import type { EmbedRenderManagerServiceLike } from './embed-render-child-view-contribution';
import { ensureEmbedChildRender, refreshEmbedChildRender } from './embed-render-child-view-contribution';
import { captureEmbedContextSceneCanvas } from './embed-scene-canvas-capture.service';

export interface CreateEmbedRenderCanvasPreviewProviderOptions {
    childType: UniverInstanceType;
    renderManagerService: DependencyIdentifier<EmbedRenderManagerServiceLike>;
}

export function createEmbedRenderCanvasPreviewProvider(
    injector: Injector,
    options: CreateEmbedRenderCanvasPreviewProviderOptions
): EmbedFloatPreviewProvider {
    return {
        childType: options.childType,
        collectViewState: () => undefined,
        restoreViewState: () => undefined,
        renderPreview: (request) => renderEmbedCanvasPreview(injector, options.renderManagerService, request),
    };
}

function renderEmbedCanvasPreview(
    injector: Injector,
    renderManagerServiceIdentifier: DependencyIdentifier<EmbedRenderManagerServiceLike>,
    request: EmbedFloatPreviewRenderRequest
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

    const renderManagerService = injector.get(renderManagerServiceIdentifier);
    const render = ensureEmbedChildRender(renderManagerService, request.childUnitId);
    if (!render) {
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
        host.remove();
    }
}
