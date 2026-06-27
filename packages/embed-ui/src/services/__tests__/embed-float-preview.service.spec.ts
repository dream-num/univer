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

// @vitest-environment jsdom

import type { IEmbedDescriptor } from '@univerjs/embed';
import type {
    IEmbedChildContainerContext,
    IEmbedFloatPreviewProvider,
    IEmbedFloatPreviewRenderRequest,
} from '../../types/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { EmbedFloatPreviewService } from '../embed-float-preview.service';

describe('EmbedFloatPreviewService', () => {
    it('renders previews through providers and reuses pending or ready cache entries', async () => {
        const service = new EmbedFloatPreviewService();
        const updates: string[] = [];
        service.previewUpdated$.subscribe((entry) => updates.push(entry.status));
        const provider = createProvider({
            renderPreview: vi.fn(async (request) => `image:${request.width}x${request.height}:${request.viewState?.scrollTop ?? 0}`),
        });

        service.registerProvider(provider);

        const request = createRequest({ width: 10.4, height: 19.6, viewState: { scrollTop: 12 } });
        const pending = service.requestPreview(request);
        const cachedPending = service.requestPreview(request);

        expect(cachedPending).toBe(pending);
        expect(pending).toMatchObject({
            status: 'pending',
            width: 10,
            height: 20,
            revision: 1,
            viewState: { scrollTop: 12 },
        });

        await service.flushForTests();

        const ready = service.getPreview('embed-1');
        expect(ready).toBe(pending);
        expect(ready).toMatchObject({
            status: 'ready',
            image: 'image:10x20:12',
        });
        expect(provider.renderPreview).toHaveBeenCalledWith(expect.objectContaining({
            width: 10,
            height: 20,
            viewState: { scrollTop: 12 },
        }));
        expect(service.requestPreview(request)).toBe(ready);
        expect(updates).toEqual(['pending', 'ready']);
    });

    it('keeps previous ready image when a later render fails', async () => {
        const service = new EmbedFloatPreviewService();
        const provider = createProvider({
            renderPreview: vi.fn()
                .mockResolvedValueOnce('first-image')
                .mockResolvedValueOnce(null)
                .mockRejectedValueOnce(new Error('render failed')),
        });
        service.registerProvider(provider);

        service.requestPreview(createRequest({ width: 100, height: 50, viewState: { page: 1 } }));
        await service.flushForTests();
        expect(service.getPreview('embed-1')).toMatchObject({ status: 'ready', image: 'first-image' });

        service.requestPreview(createRequest({ width: 101, height: 50 }));
        await service.flushForTests();
        expect(service.getPreview('embed-1')).toMatchObject({
            status: 'stale',
            image: 'first-image',
            viewState: { page: 1 },
        });

        service.requestPreview(createRequest({ width: 102, height: 50, viewState: { page: 2 } }));
        await service.flushForTests();
        expect(service.getPreview('embed-1')).toMatchObject({
            status: 'stale',
            image: 'first-image',
            viewState: { page: 2 },
        });
        expect(service.getPreview('embed-1')?.error).toBeInstanceOf(Error);
    });

    it('marks missing providers as errors and supports view state lifecycle', async () => {
        const service = new EmbedFloatPreviewService();
        const updates: unknown[] = [];
        service.previewUpdated$.subscribe((entry) => updates.push(entry));

        service.requestPreview(createRequest({ childType: UniverInstanceType.UNIVER_BASE }));
        await service.flushForTests();
        expect(service.getPreview('embed-1')).toMatchObject({
            status: 'error',
            childType: UniverInstanceType.UNIVER_BASE,
        });

        service.updateViewState('standalone', { scrollLeft: 20 });
        expect(service.getPreview('standalone')).toMatchObject({
            status: 'stale',
            viewState: { scrollLeft: 20 },
        });
        service.markStale('standalone', 'manual');
        expect(service.getPreview('standalone')).toMatchObject({
            status: 'stale',
            error: 'manual',
        });
        service.invalidate('standalone');
        expect(service.getPreview('standalone')).toBeUndefined();
        expect(updates.length).toBeGreaterThan(1);
    });

    it('collects, restores, unregisters providers, and disposes state', async () => {
        const service = new EmbedFloatPreviewService();
        const provider = createProvider({
            collectViewState: vi.fn(async () => ({ scrollTop: 5 })),
            restoreViewState: vi.fn(),
        });
        const disposable = service.registerProvider(provider);
        const childContainerContext = createChildContainerContext();

        await expect(service.collectViewState(childContainerContext)).resolves.toEqual({ scrollTop: 5 });
        expect(service.getPreview('embed-1')).toMatchObject({ viewState: { scrollTop: 5 } });
        await service.restoreViewState(childContainerContext, { scrollTop: 6 });
        await service.restoreViewState(childContainerContext, undefined);
        expect(provider.restoreViewState).toHaveBeenCalledTimes(1);
        expect(provider.restoreViewState).toHaveBeenCalledWith(childContainerContext, { scrollTop: 6 });

        disposable.dispose();
        expect(service.getProvider(UniverInstanceType.UNIVER_SHEET)).toBeUndefined();
        await expect(service.collectViewState(childContainerContext)).resolves.toBeUndefined();
        await expect(service.restoreViewState(childContainerContext, { scrollTop: 7 })).resolves.toBeUndefined();

        service.requestPreview(createRequest());
        service.dispose();
        expect(service.getPreview('embed-1')).toBeUndefined();
        await service.flushForTests();
    });
});

function createProvider(overrides: Partial<IEmbedFloatPreviewProvider<{ scrollTop?: number; page?: number }>> = {}): IEmbedFloatPreviewProvider<{ scrollTop?: number; page?: number }> {
    return {
        childType: UniverInstanceType.UNIVER_SHEET,
        collectViewState: overrides.collectViewState ?? vi.fn(() => ({ scrollTop: 0 })),
        restoreViewState: overrides.restoreViewState ?? vi.fn(),
        renderPreview: overrides.renderPreview ?? vi.fn(() => 'preview-image'),
        invalidateKeys: overrides.invalidateKeys,
    };
}

function createRequest(overrides: Partial<IEmbedFloatPreviewRenderRequest<{ scrollTop?: number; page?: number }>> = {}): IEmbedFloatPreviewRenderRequest<{ scrollTop?: number; page?: number }> {
    return {
        descriptor: overrides.descriptor ?? createDescriptor(),
        childUnitId: overrides.childUnitId ?? 'child-sheet',
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
        width: overrides.width ?? 100,
        height: overrides.height ?? 80,
        dpr: overrides.dpr ?? 2,
        viewState: overrides.viewState,
        reason: overrides.reason ?? 'initial',
        context: overrides.context,
    };
}

function createChildContainerContext(): IEmbedChildContainerContext {
    const descriptor = createDescriptor();
    return {
        descriptor,
        layout: 'doc-width-scale',
        injector: {} as never,
        hostElement: document.createElement('div'),
        container: document.createElement('div'),
        hostUnitId: descriptor.hostUnitId,
        embedId: descriptor.embedId,
        childUnitId: descriptor.childUnitId!,
        childType: descriptor.childType!,
        renderScope: {} as never,
        runtimeScope: {} as never,
    };
}

function createDescriptor(overrides: Partial<IEmbedDescriptor> = {}): IEmbedDescriptor {
    return {
        embedId: overrides.embedId ?? 'embed-1',
        hostUnitId: overrides.hostUnitId ?? 'host-1',
        hostType: overrides.hostType ?? UniverInstanceType.UNIVER_DOC,
        hostAnchorId: overrides.hostAnchorId ?? 'anchor-1',
        entry: overrides.entry ?? 'docs-custom-block',
        source: overrides.source ?? {
            kind: 'ref',
            unitType: UniverInstanceType.UNIVER_SHEET,
            ref: {
                file: { kind: 'self' },
                unit: { selector: 'child-sheet', type: 'sheet' },
            },
        },
        childUnitId: overrides.childUnitId ?? 'child-sheet',
        childType: overrides.childType ?? UniverInstanceType.UNIVER_SHEET,
        mode: overrides.mode ?? 'interactive',
        sourceMeta: overrides.sourceMeta ?? {
            floating: {
                enabled: true,
                layout: 'doc-width-scale',
                fullscreen: true,
            },
            tab: false,
        },
        lifecycle: overrides.lifecycle ?? 'active',
        createdAt: overrides.createdAt,
        updatedAt: overrides.updatedAt,
    };
}
