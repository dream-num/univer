import type { IDisposable, UniverInstanceType } from '@univerjs/core';
import type { EmbedChildContainerContext } from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';

export type EmbedScreenshotResult = string | HTMLCanvasElement | ImageBitmap;

export interface EmbedScreenshotProvider {
    childType: UniverInstanceType;
    capture(context: EmbedChildContainerContext): Promise<EmbedScreenshotResult | null | undefined> | EmbedScreenshotResult | null | undefined;
}

export class EmbedScreenshotService {
    private readonly _providers = new Map<UniverInstanceType, EmbedScreenshotProvider>();
    private readonly _contextsByEmbedId = new Map<string, EmbedChildContainerContext>();
    private readonly _contextsByHostAnchorId = new Map<string, EmbedChildContainerContext>();
    private readonly _contextsByChildUnitId = new Map<string, EmbedChildContainerContext>();

    register(provider: EmbedScreenshotProvider): IDisposable {
        this._providers.set(provider.childType, provider);

        return toDisposable(() => {
            if (this._providers.get(provider.childType) === provider) {
                this._providers.delete(provider.childType);
            }
        });
    }

    get(childType: UniverInstanceType): EmbedScreenshotProvider | undefined {
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

    capture(context: EmbedChildContainerContext): Promise<EmbedScreenshotResult | null | undefined> {
        const provider = this.get(context.childType);
        if (provider) {
            return Promise.resolve(provider.capture(context));
        }

        return Promise.resolve(captureEmbedContextCanvasScreenshot(context));
    }

    captureByEmbedId(embedId: string): Promise<EmbedScreenshotResult | null | undefined> {
        const context = this.getContextByEmbedId(embedId);
        return context ? this.capture(context) : Promise.resolve(undefined);
    }

    captureByHostAnchorId(hostAnchorId: string): Promise<EmbedScreenshotResult | null | undefined> {
        const context = this.getContextByHostAnchorId(hostAnchorId);
        return context ? this.capture(context) : Promise.resolve(undefined);
    }

    captureByChildUnitId(childUnitId: string): Promise<EmbedScreenshotResult | null | undefined> {
        const context = this.getContextByChildUnitId(childUnitId);
        return context ? this.capture(context) : Promise.resolve(undefined);
    }
}

export function captureEmbedContextCanvasScreenshot(context: EmbedChildContainerContext): string | undefined {
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
            // Ignore tainted or transient canvases and try the next visible render layer.
        }
    }

    return undefined;
}
