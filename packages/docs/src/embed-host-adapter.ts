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

import type { DocumentDataModel, IUniverInstanceService } from '@univerjs/core';
import type { EmbedHostAnchorModelService, IEmbedHostAdapterContribution, IEmbedHostAnchorContext, IEmbedHostAnchorMutationPlan, IEmbedHostAnchorRecord, IEmbedHostAnchorRemoveMutationPlan } from '@univerjs/embed';
import type { EmbedDocsCustomBlockInteractionMode } from './embed-host-anchor';
import { UniverInstanceType } from '@univerjs/core';
import { REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID } from '@univerjs/embed';
import { createDocsCustomBlockInsertMutation, createDocsCustomBlockRemoveMutation } from './embed-host-anchor';

export function createDocsCustomBlockHostAdapterContribution(
    anchorModelService?: EmbedHostAnchorModelService,
    univerInstanceService?: IUniverInstanceService
): IEmbedHostAdapterContribution {
    return {
        hostType: UniverInstanceType.UNIVER_DOC,
        entry: 'docs-custom-block',
        createAnchorPlan: (context) => requireAnchorPlan(
            createDocsCustomBlockAnchorPlan(context, univerInstanceService),
            'EMBED_DOCS_CUSTOM_BLOCK_ANCHOR_UNAVAILABLE'
        ),
        removeAnchorPlan: (context) => {
            const previous = anchorModelService?.getAnchor(context.hostUnitId, context.hostAnchorId);
            const record = previous ?? createDocsCustomBlockRecord(context);
            const plan = createDocsCustomBlockRemoveAnchorPlan(context, record, univerInstanceService);
            if (plan) {
                return plan;
            }

            return {
                redoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: context.hostUnitId, hostAnchorId: context.hostAnchorId } }],
                undoMutations: [{ id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record: { ...record, lifecycle: 'active' } } }],
            };
        },
    };
}

function createDocsCustomBlockAnchorPlan(
    context: IEmbedHostAnchorContext,
    univerInstanceService?: IUniverInstanceService
): IEmbedHostAnchorMutationPlan | undefined {
    if (!univerInstanceService) {
        return undefined;
    }

    const record = createDocsCustomBlockRecord(context);
    const startIndex = getDocsCustomBlockInsertIndex(context, univerInstanceService);
    if (startIndex == null) {
        return undefined;
    }
    const drawingOrderIndex = getDocDrawingsOrder(univerInstanceService, context.hostUnitId)?.length ?? 0;

    record.hostContext = {
        ...record.hostContext,
        startIndex,
        drawingOrderIndex,
    };

    return {
        hostAnchorId: record.hostAnchorId,
        redoMutations: [
            createDocsCustomBlockInsertMutation({
                unitId: record.hostUnitId,
                blockId: record.hostAnchorId,
                startIndex,
                drawingOrderIndex,
                embedId: record.embedId,
                childUnitId: context.descriptor?.childUnitId,
                childType: context.descriptor?.childType,
                componentKey: getString(record.hostContext, 'componentKey') ?? undefined,
                interactionMode: getInteractionMode(record.hostContext),
            }),
            { id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record } },
        ],
        undoMutations: [
            { id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: record.hostUnitId, hostAnchorId: record.hostAnchorId } },
            createDocsCustomBlockRemoveMutation({
                unitId: record.hostUnitId,
                blockId: record.hostAnchorId,
                startIndex,
                drawingOrderIndex,
            }),
        ],
    };
}

function createDocsCustomBlockRemoveAnchorPlan(
    context: IEmbedHostAnchorContext & { hostAnchorId: string },
    record: IEmbedHostAnchorRecord,
    univerInstanceService?: IUniverInstanceService
): IEmbedHostAnchorRemoveMutationPlan | undefined {
    if (!univerInstanceService) {
        return undefined;
    }

    const startIndex = getDocsCustomBlockStartIndex(univerInstanceService, context.hostUnitId, context.hostAnchorId) ??
        getNumber(record.hostContext, 'startIndex');
    const drawingOrderIndex = getDocDrawingOrderIndex(univerInstanceService, context.hostUnitId, context.hostAnchorId) ??
        getNumber(record.hostContext, 'drawingOrderIndex') ??
        0;
    if (startIndex == null) {
        return undefined;
    }

    return {
        redoMutations: [
            { id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: context.hostUnitId, hostAnchorId: context.hostAnchorId } },
            createDocsCustomBlockRemoveMutation({
                unitId: context.hostUnitId,
                blockId: context.hostAnchorId,
                startIndex,
                drawingOrderIndex,
            }),
        ],
        undoMutations: [
            createDocsCustomBlockInsertMutation({
                unitId: context.hostUnitId,
                blockId: context.hostAnchorId,
                startIndex,
                drawingOrderIndex,
                embedId: record.embedId,
                childUnitId: context.descriptor?.childUnitId,
                childType: context.descriptor?.childType,
                componentKey: getString(record.hostContext, 'componentKey') ?? undefined,
                interactionMode: getInteractionMode(record.hostContext),
            }),
            { id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record: { ...record, lifecycle: 'active', hostContext: { ...record.hostContext, startIndex, drawingOrderIndex } } } },
        ],
    };
}

function createDocsCustomBlockRecord(context: IEmbedHostAnchorContext): IEmbedHostAnchorRecord {
    const hostAnchorId = context.requestedAnchorId ?? `docs-custom-block:${context.embedId}`;
    return {
        hostAnchorId,
        embedId: context.embedId,
        hostUnitId: context.hostUnitId,
        hostType: context.hostType,
        entry: context.entry,
        kind: 'docs-custom-block',
        hostContext: context.hostContext,
        lifecycle: 'active',
    };
}

function getDocsCustomBlockInsertIndex(context: IEmbedHostAnchorContext, univerInstanceService?: IUniverInstanceService): number | undefined {
    const explicit = getNumber(context.hostContext, 'startIndex');
    if (explicit != null) {
        return explicit;
    }

    const body = getDocBody(univerInstanceService, context.hostUnitId);
    if (!body?.dataStream) {
        return undefined;
    }

    return Math.max(0, body.dataStream.length - 2);
}

function getDocsCustomBlockStartIndex(univerInstanceService: IUniverInstanceService | undefined, unitId: string, blockId: string): number | undefined {
    return getDocBody(univerInstanceService, unitId)?.customBlocks?.find((block) => block.blockId === blockId)?.startIndex;
}

function getDocBody(univerInstanceService: IUniverInstanceService | undefined, unitId: string) {
    return univerInstanceService?.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC)?.getBody();
}

function getDocDrawingsOrder(univerInstanceService: IUniverInstanceService | undefined, unitId: string): string[] | undefined {
    return univerInstanceService?.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC)?.getSnapshot?.().drawingsOrder;
}

function getDocDrawingOrderIndex(univerInstanceService: IUniverInstanceService | undefined, unitId: string, blockId: string): number | undefined {
    const index = getDocDrawingsOrder(univerInstanceService, unitId)?.indexOf(blockId);
    return index == null || index < 0 ? undefined : index;
}

function getNumber(hostContext: Record<string, unknown> | undefined, key: string): number | undefined {
    return typeof hostContext?.[key] === 'number' ? hostContext[key] : undefined;
}

function getString(hostContext: Record<string, unknown> | undefined, key: string): string | undefined {
    return typeof hostContext?.[key] === 'string' ? hostContext[key] : undefined;
}

function getInteractionMode(hostContext: Record<string, unknown> | undefined): EmbedDocsCustomBlockInteractionMode | undefined {
    const value = getString(hostContext, 'interactionMode');
    return value === 'inline' || value === 'block' ? value : undefined;
}

function requireAnchorPlan(plan: IEmbedHostAnchorMutationPlan | undefined, errorCode: string): IEmbedHostAnchorMutationPlan {
    if (!plan) {
        throw new Error(errorCode);
    }

    return plan;
}
