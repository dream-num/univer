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
import type { EmbedChildContainerContext } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';

export type EmbedSceneCanvasCaptureResult = string | HTMLCanvasElement | ImageBitmap;

export interface EmbedSceneCanvasCaptureProvider {
    childType: UniverInstanceType;
    capture(context: EmbedChildContainerContext): Promise<EmbedSceneCanvasCaptureResult | null | undefined> | EmbedSceneCanvasCaptureResult | null | undefined;
}

export class EmbedSceneCanvasCaptureService {
    private readonly _providers = new Map<UniverInstanceType, EmbedSceneCanvasCaptureProvider>();
    private readonly _contextsByEmbedId = new Map<string, EmbedChildContainerContext>();
    private readonly _contextsByHostAnchorId = new Map<string, EmbedChildContainerContext>();
    private readonly _contextsByChildUnitId = new Map<string, EmbedChildContainerContext>();

    register(provider: EmbedSceneCanvasCaptureProvider): IDisposable {
        this._providers.set(provider.childType, provider);

        return toDisposable(() => {
            if (this._providers.get(provider.childType) === provider) {
                this._providers.delete(provider.childType);
            }
        });
    }

    get(childType: UniverInstanceType): EmbedSceneCanvasCaptureProvider | undefined {
        return this._providers.get(childType);
    }

    registerContext(context: EmbedChildContainerContext): IDisposable {
        this._contextsByEmbedId.set(context.embedId, context);
        this._contextsByHostAnchorId.set(context.descriptor.hostAnchorId, context);
        this._contextsByChildUnitId.set(context.childUnitId, context);

        return toDisposable(() => {
            if (this._contextsByEmbedId.get(context.embedId) === context) {
                this._contextsByEmbedId.delete(context.embedId);
            }
            if (this._contextsByHostAnchorId.get(context.descriptor.hostAnchorId) === context) {
                this._contextsByHostAnchorId.delete(context.descriptor.hostAnchorId);
            }
            if (this._contextsByChildUnitId.get(context.childUnitId) === context) {
                this._contextsByChildUnitId.delete(context.childUnitId);
            }
        });
    }

    getContextByEmbedId(embedId: string): EmbedChildContainerContext | undefined {
        return this._contextsByEmbedId.get(embedId);
    }

    getContextByHostAnchorId(hostAnchorId: string): EmbedChildContainerContext | undefined {
        return this._contextsByHostAnchorId.get(hostAnchorId);
    }

    getContextByChildUnitId(childUnitId: string): EmbedChildContainerContext | undefined {
        return this._contextsByChildUnitId.get(childUnitId);
    }

    capture(context: EmbedChildContainerContext): Promise<EmbedSceneCanvasCaptureResult | null | undefined> {
        const provider = this.get(context.childType);
        if (provider) {
            return Promise.resolve(provider.capture(context));
        }

        return Promise.resolve(captureEmbedContextSceneCanvas(context));
    }

    captureByEmbedId(embedId: string): Promise<EmbedSceneCanvasCaptureResult | null | undefined> {
        const context = this.getContextByEmbedId(embedId);
        return context ? this.capture(context) : Promise.resolve(undefined);
    }

    captureByHostAnchorId(hostAnchorId: string): Promise<EmbedSceneCanvasCaptureResult | null | undefined> {
        const context = this.getContextByHostAnchorId(hostAnchorId);
        return context ? this.capture(context) : Promise.resolve(undefined);
    }

    captureByChildUnitId(childUnitId: string): Promise<EmbedSceneCanvasCaptureResult | null | undefined> {
        const context = this.getContextByChildUnitId(childUnitId);
        return context ? this.capture(context) : Promise.resolve(undefined);
    }
}

export function captureEmbedContextSceneCanvas(context: EmbedChildContainerContext): string | undefined {
    if (!context.renderScope) {
        return undefined;
    }

    const root = context.renderScope.canvasRoot ?? context.renderScope.rootElement;
    const canvases = Array.from(root.querySelectorAll('canvas'))
        .filter((canvas) => canvas.width > 1 && canvas.height > 1)
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));

    for (const canvas of canvases) {
        try {
            return canvas.toDataURL('image/png');
        } catch {
            // Ignore tainted or transient scene canvases and try the next render layer.
        }
    }

    return undefined;
}
