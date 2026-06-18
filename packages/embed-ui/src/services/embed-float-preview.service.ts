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
import type {
    EmbedChildContainerContext,
    EmbedFloatPreviewEntry,
    EmbedFloatPreviewProvider,
    EmbedFloatPreviewRenderRequest,
    EmbedFloatPreviewRenderResult,
} from '../types/embed-ui';
import { toDisposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { captureEmbedContextSceneCanvas } from './embed-scene-canvas-capture.service';

export class EmbedFloatPreviewService {
    readonly previewUpdated$ = new Subject<EmbedFloatPreviewEntry>();

    private readonly _providers = new Map<UniverInstanceType, EmbedFloatPreviewProvider<any>>();
    private readonly _entriesByEmbedId = new Map<string, EmbedFloatPreviewEntry>();
    private readonly _entriesByKey = new Map<string, EmbedFloatPreviewEntry>();
    private readonly _queue: EmbedFloatPreviewRenderRequest[] = [];
    private _rendering = false;
    private _activeDrain: Promise<void> | null = null;

    registerProvider(provider: EmbedFloatPreviewProvider<any>): IDisposable {
        this._providers.set(provider.childType, provider);

        return toDisposable(() => {
            if (this._providers.get(provider.childType) === provider) {
                this._providers.delete(provider.childType);
            }
        });
    }

    getProvider(childType: UniverInstanceType): EmbedFloatPreviewProvider<any> | undefined {
        return this._providers.get(childType);
    }

    getPreview(embedId: string): EmbedFloatPreviewEntry | undefined {
        return this._entriesByEmbedId.get(embedId);
    }

    requestPreview<TViewState = unknown>(
        request: EmbedFloatPreviewRenderRequest<TViewState>
    ): EmbedFloatPreviewEntry<TViewState> {
        const key = this.getCacheKey(request);
        const cached = this._entriesByKey.get(key) as EmbedFloatPreviewEntry<TViewState> | undefined;
        if (cached && (cached.status === 'pending' || cached.status === 'ready')) {
            return cached;
        }

        const previous = this._entriesByEmbedId.get(request.descriptor.embedId) as EmbedFloatPreviewEntry<TViewState> | undefined;
        const entry: EmbedFloatPreviewEntry<TViewState> = {
            embedId: request.descriptor.embedId,
            childUnitId: request.childUnitId,
            childType: request.childType,
            status: 'pending',
            width: Math.max(1, Math.round(request.width)),
            height: Math.max(1, Math.round(request.height)),
            dpr: request.dpr,
            viewState: request.viewState ?? previous?.viewState,
            revision: (previous?.revision ?? 0) + 1,
            updatedAt: Date.now(),
        };

        this._entriesByKey.set(key, entry);
        this._entriesByEmbedId.set(entry.embedId, entry);
        this._queue.push(request);
        this._drainQueue();
        this.previewUpdated$.next(entry);
        return entry;
    }

    async collectViewState<TViewState = unknown>(context: EmbedChildContainerContext): Promise<TViewState | undefined> {
        const provider = this._providers.get(context.childType) as EmbedFloatPreviewProvider<TViewState> | undefined;
        if (!provider) {
            return undefined;
        }

        const viewState = await provider.collectViewState(context);
        this.updateViewState(context.embedId, viewState);
        return viewState;
    }

    async restoreViewState<TViewState = unknown>(
        context: EmbedChildContainerContext,
        viewState: TViewState | undefined
    ): Promise<void> {
        if (viewState == null) {
            return;
        }

        const provider = this._providers.get(context.childType) as EmbedFloatPreviewProvider<TViewState> | undefined;
        await provider?.restoreViewState(context, viewState);
    }

    updateViewState<TViewState = unknown>(embedId: string, viewState: TViewState): void {
        const current = this._entriesByEmbedId.get(embedId);
        if (!current) {
            const entry: EmbedFloatPreviewEntry<TViewState> = {
                embedId,
                childUnitId: '',
                childType: undefined as unknown as UniverInstanceType,
                status: 'stale',
                width: 0,
                height: 0,
                dpr: 1,
                viewState,
                revision: 0,
                updatedAt: Date.now(),
            };
            this._entriesByEmbedId.set(embedId, entry);
            this.previewUpdated$.next(entry);
            return;
        }

        current.viewState = viewState;
        current.updatedAt = Date.now();
        this.previewUpdated$.next(current);
    }

    markStale(embedId: string, reason?: string): void {
        const current = this._entriesByEmbedId.get(embedId);
        if (!current) {
            return;
        }

        current.status = 'stale';
        current.error = reason;
        current.updatedAt = Date.now();
        this.previewUpdated$.next(current);
    }

    invalidate(embedId: string): void {
        const current = this._entriesByEmbedId.get(embedId);
        this._entriesByEmbedId.delete(embedId);
        if (!current) {
            return;
        }

        Array.from(this._entriesByKey.entries()).forEach(([key, entry]) => {
            if (entry.embedId === embedId) {
                this._entriesByKey.delete(key);
            }
        });
    }

    getCacheKey(request: EmbedFloatPreviewRenderRequest): string {
        return [
            request.descriptor.embedId,
            request.childUnitId,
            request.childType,
            Math.max(1, Math.round(request.width)),
            Math.max(1, Math.round(request.height)),
            request.dpr,
        ].join('::');
    }

    async flushForTests(): Promise<void> {
        while (this._queue.length > 0 || this._rendering || this._activeDrain) {
            await (this._activeDrain ?? Promise.resolve());
            await Promise.resolve();
        }
    }

    dispose(): void {
        this._providers.clear();
        this._entriesByEmbedId.clear();
        this._entriesByKey.clear();
        this._queue.length = 0;
        this.previewUpdated$.complete();
    }

    private _drainQueue(): void {
        if (this._rendering || this._activeDrain) {
            return;
        }

        this._activeDrain = this._runQueue().finally(() => {
            this._activeDrain = null;
        });
    }

    private async _runQueue(): Promise<void> {
        if (this._rendering) {
            return;
        }

        this._rendering = true;
        try {
            while (this._queue.length > 0) {
                await this._renderOne(this._queue.shift()!);
            }
        } finally {
            this._rendering = false;
        }
    }

    private async _renderOne(request: EmbedFloatPreviewRenderRequest): Promise<void> {
        const key = this.getCacheKey(request);
        const entry = this._entriesByKey.get(key);
        if (!entry || entry.status !== 'pending') {
            return;
        }

        const provider = this._providers.get(request.childType);
        const previous = this._findPreviousReadyEntry(entry.embedId, entry);
        if (!provider) {
            const fallbackImage = request.context ? captureEmbedContextSceneCanvas(request.context) : undefined;
            if (fallbackImage) {
                entry.image = fallbackImage;
                entry.status = 'ready';
                entry.updatedAt = Date.now();
                this._entriesByEmbedId.set(entry.embedId, entry);
                this.previewUpdated$.next(entry);
                return;
            }

            this._setRenderFailure(entry, previous, new Error(`Missing embed float preview provider: ${request.childType}`));
            return;
        }

        try {
            const image = await provider.renderPreview({
                ...request,
                width: entry.width,
                height: entry.height,
                viewState: entry.viewState,
            });
            if (this._entriesByKey.get(key) !== entry || entry.status !== 'pending') {
                return;
            }
            if (!image) {
                this._setRenderFailure(entry, previous, new Error('Empty embed float preview result.'));
                return;
            }

            entry.image = image as EmbedFloatPreviewRenderResult;
            entry.status = 'ready';
            entry.updatedAt = Date.now();
            this._entriesByEmbedId.set(entry.embedId, entry);
            this.previewUpdated$.next(entry);
        } catch (error) {
            this._setRenderFailure(entry, previous, error);
        }
    }

    private _findPreviousReadyEntry(embedId: string, current: EmbedFloatPreviewEntry): EmbedFloatPreviewEntry | undefined {
        const latest = this._entriesByEmbedId.get(embedId);
        if (latest && latest !== current && latest.image) {
            return latest;
        }

        return Array.from(this._entriesByKey.values())
            .reverse()
            .find((entry) => entry.embedId === embedId && entry !== current && entry.image);
    }

    private _setRenderFailure(entry: EmbedFloatPreviewEntry, previous: EmbedFloatPreviewEntry | undefined, error: unknown): void {
        entry.status = previous?.image ? 'stale' : 'error';
        entry.image = previous?.image;
        entry.viewState = entry.viewState ?? previous?.viewState;
        entry.error = error;
        entry.updatedAt = Date.now();
        this._entriesByEmbedId.set(entry.embedId, entry);
        this.previewUpdated$.next(entry);
    }
}
