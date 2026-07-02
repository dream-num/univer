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
import { REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID } from '@univerjs/embed';
import { describe, expect, it, vi } from 'vitest';
import { createDocsCustomBlockHostAdapterContribution, createDocsCustomBlockHostContainerContribution } from './embed-host-adapter';

describe('docs custom block host adapter', () => {
    it('rejects custom block anchor creation when the doc model is not available', () => {
        const adapter = createDocsCustomBlockHostAdapterContribution();

        expect(() => adapter.createAnchorPlan!({
            embedId: 'embed-1',
            hostUnitId: 'doc-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            requestedAnchorId: 'block-1',
            hostContext: { componentKey: 'CustomBlock' },
        })).toThrow('EMBED_DOCS_CUSTOM_BLOCK_ANCHOR_UNAVAILABLE');
    });

    it('creates rich text insert and remove plans from the host document body', () => {
        const renderManagerService = createRenderManagerService();
        const univerInstanceService = createUniverInstanceService({
            body: {
                dataStream: 'hello\r\n',
                customBlocks: [{ blockId: 'block-1', startIndex: 3 }],
            },
            drawingsOrder: ['first', 'block-1', 'last'],
        });
        const adapter = createDocsCustomBlockHostAdapterContribution(undefined, univerInstanceService as never, renderManagerService as never);
        const context = {
            embedId: 'embed-1',
            hostUnitId: 'doc-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block' as const,
            requestedAnchorId: 'block-1',
            hostContext: {
                componentKey: 'CustomBlock',
                interactionMode: 'block',
            },
            descriptor: {
                childUnitId: 'sheet-1',
                childType: UniverInstanceType.UNIVER_SHEET,
            },
        };

        const createPlan = adapter.createAnchorPlan!(context as never);

        expect(createPlan.hostAnchorId).toBe('block-1');
        expect(createPlan.redoMutations).toHaveLength(2);
        expect(createPlan.undoMutations).toHaveLength(2);
        expect(createPlan.redoMutations[1]).toEqual({
            id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: {
                record: expect.objectContaining({
                    hostAnchorId: 'block-1',
                    hostContext: expect.objectContaining({
                        drawingOrderIndex: 3,
                        startIndex: 5,
                    }),
                }),
            },
        });

        const removePlan = adapter.removeAnchorPlan!({ ...context, hostAnchorId: 'block-1' } as never);
        expect(removePlan.redoMutations[0]).toEqual({
            id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: { hostUnitId: 'doc-1', hostAnchorId: 'block-1' },
        });
        expect(removePlan.undoMutations[1]).toEqual({
            id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: {
                record: expect.objectContaining({
                    lifecycle: 'active',
                    hostContext: expect.objectContaining({
                        drawingOrderIndex: 1,
                        startIndex: 3,
                    }),
                }),
            },
        });

        adapter.afterCreateAnchor?.({ hostUnitId: 'doc-1' } as never);
        adapter.afterRemoveAnchor?.({ hostUnitId: 'doc-1' } as never);
        expect(renderManagerService.getRenderById).toHaveBeenCalledWith('doc-1');
    });

    it('falls back to stored anchor data for remove plans and exposes the docs container contribution', () => {
        const anchorModelService = {
            getAnchor: vi.fn(() => ({
                hostAnchorId: 'block-1',
                embedId: 'embed-1',
                hostUnitId: 'doc-1',
                hostType: UniverInstanceType.UNIVER_DOC,
                entry: 'docs-custom-block',
                kind: 'docs-custom-block',
                hostContext: { startIndex: 7, drawingOrderIndex: 2 },
            })),
        };
        const adapter = createDocsCustomBlockHostAdapterContribution(anchorModelService as never);
        const removePlan = adapter.removeAnchorPlan!({
            embedId: 'embed-1',
            hostUnitId: 'doc-1',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            hostAnchorId: 'block-1',
        });

        expect(removePlan.redoMutations).toEqual([{
            id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: { hostUnitId: 'doc-1', hostAnchorId: 'block-1' },
        }]);
        expect(removePlan.undoMutations).toEqual([{
            id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: { record: expect.objectContaining({ lifecycle: 'active' }) },
        }]);

        expect(createDocsCustomBlockHostContainerContribution()).toMatchObject({
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            layout: 'docs-sticky-sheet',
            menuBehavior: 'floating',
            supportedLayouts: expect.arrayContaining(['docs-sticky-sheet', 'docs-sticky-base', 'aspect-fit', 'scroll-contained']),
        });
    });
});

function createUniverInstanceService(params: {
    body: unknown;
    drawingsOrder: string[];
}) {
    const unit = {
        getBody: vi.fn(() => params.body),
        getSnapshot: vi.fn(() => ({ drawingsOrder: params.drawingsOrder })),
    };

    return {
        getUnit: vi.fn(() => unit),
    };
}

function createRenderManagerService() {
    const component = { makeDirty: vi.fn() };
    const render = {
        components: new Map([['component', component]]),
        engine: { resize: vi.fn() },
        scene: { makeDirty: vi.fn() },
        with: vi.fn(() => ({ calculatePagePosition: vi.fn() })),
    };

    return {
        getRenderById: vi.fn(() => render),
    };
}
