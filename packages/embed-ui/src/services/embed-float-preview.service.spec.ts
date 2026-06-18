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

import { UniverInstanceType } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmbedFloatPreviewService } from './embed-float-preview.service';

describe('EmbedFloatPreviewService', () => {
    let service: EmbedFloatPreviewService;

    beforeEach(() => {
        service = new EmbedFloatPreviewService();
    });

    it('renders a ready preview through the registered child provider', async () => {
        service.registerProvider({
            childType: UniverInstanceType.UNIVER_SLIDE,
            collectViewState: vi.fn(),
            restoreViewState: vi.fn(),
            renderPreview: vi.fn().mockResolvedValue('data:image/png;base64,slide'),
        });

        const entry = service.requestPreview({
            descriptor: createDescriptor(),
            childUnitId: 'slide-1',
            childType: UniverInstanceType.UNIVER_SLIDE,
            width: 320,
            height: 180,
            dpr: 2,
            reason: 'initial',
        });

        expect(entry.status).toBe('pending');

        await service.flushForTests();

        expect(service.getPreview('embed-1')).toMatchObject({
            embedId: 'embed-1',
            status: 'ready',
            image: 'data:image/png;base64,slide',
            width: 320,
            height: 180,
            dpr: 2,
        });
    });

    it('keeps the last ready preview when a later render fails', async () => {
        const renderPreview = vi.fn()
            .mockResolvedValueOnce('data:image/png;base64,ok')
            .mockRejectedValueOnce(new Error('render failed'));

        service.registerProvider({
            childType: UniverInstanceType.UNIVER_SLIDE,
            collectViewState: vi.fn(),
            restoreViewState: vi.fn(),
            renderPreview,
        });

        const descriptor = createDescriptor();
        service.requestPreview({
            descriptor,
            childUnitId: 'slide-1',
            childType: UniverInstanceType.UNIVER_SLIDE,
            width: 320,
            height: 180,
            dpr: 1,
            reason: 'initial',
        });
        await service.flushForTests();

        service.requestPreview({
            descriptor,
            childUnitId: 'slide-1',
            childType: UniverInstanceType.UNIVER_SLIDE,
            width: 640,
            height: 360,
            dpr: 1,
            reason: 'resize',
        });
        await service.flushForTests();

        expect(service.getPreview('embed-1')).toMatchObject({
            status: 'stale',
            image: 'data:image/png;base64,ok',
            width: 640,
            height: 360,
        });
    });

    it('stores provider view state as opaque data', () => {
        const state = { pageId: 'page-1', scrollTop: 10 };

        service.updateViewState('embed-1', state);

        expect(service.getPreview('embed-1')?.viewState).toBe(state);
    });

    it('collects and restores provider view state through the child type', async () => {
        const state = { pageId: 'page-2' };
        const collectViewState = vi.fn().mockResolvedValue(state);
        const restoreViewState = vi.fn();
        const context = { embedId: 'embed-1', childType: UniverInstanceType.UNIVER_SLIDE } as any;
        service.registerProvider({
            childType: UniverInstanceType.UNIVER_SLIDE,
            collectViewState,
            restoreViewState,
            renderPreview: vi.fn(),
        });

        await expect(service.collectViewState(context)).resolves.toBe(state);
        await service.restoreViewState(context, state);

        expect(collectViewState).toHaveBeenCalledWith(context);
        expect(restoreViewState).toHaveBeenCalledWith(context, state);
        expect(service.getPreview('embed-1')?.viewState).toBe(state);
    });

    it('deduplicates equivalent pending preview requests', async () => {
        const renderPreview = vi.fn().mockResolvedValue('data:image/png;base64,slide');
        const descriptor = createDescriptor();
        service.registerProvider({
            childType: UniverInstanceType.UNIVER_SLIDE,
            collectViewState: vi.fn(),
            restoreViewState: vi.fn(),
            renderPreview,
        });

        const first = service.requestPreview({
            descriptor,
            childUnitId: 'slide-1',
            childType: UniverInstanceType.UNIVER_SLIDE,
            width: 320.4,
            height: 180.4,
            dpr: 2,
            reason: 'initial',
        });
        const second = service.requestPreview({
            descriptor,
            childUnitId: 'slide-1',
            childType: UniverInstanceType.UNIVER_SLIDE,
            width: 320.2,
            height: 180.2,
            dpr: 2,
            reason: 'initial',
        });

        expect(second).toBe(first);

        await service.flushForTests();

        expect(renderPreview).toHaveBeenCalledTimes(1);
    });

    it('falls back to the mounted child scene canvas when no child provider is registered', async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const toDataURL = vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,canvas-preview');
        const canvasRoot = document.createElement('div');
        canvasRoot.appendChild(canvas);
        const descriptor = createDescriptor();

        service.requestPreview({
            descriptor,
            childUnitId: 'slide-1',
            childType: UniverInstanceType.UNIVER_SLIDE,
            width: 320,
            height: 180,
            dpr: 1,
            reason: 'stage-exit',
            context: {
                embedId: 'embed-1',
                childUnitId: 'slide-1',
                childType: UniverInstanceType.UNIVER_SLIDE,
                descriptor,
                renderScope: {
                    canvasRoot,
                },
            } as any,
        });

        await service.flushForTests();

        expect(toDataURL).toHaveBeenCalledWith('image/png');
        expect(service.getPreview('embed-1')).toMatchObject({
            status: 'ready',
            image: 'data:image/png;base64,canvas-preview',
        });
    });
});

function createDescriptor() {
    return {
        embedId: 'embed-1',
        hostUnitId: 'host-1',
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        childUnitId: 'slide-1',
        childType: UniverInstanceType.UNIVER_SLIDE,
    } as any;
}
