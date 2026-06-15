import type { EmbedHostAdapterContribution, EmbedHostAnchorContext, EmbedHostAnchorMutationPlan, EmbedHostAnchorRemoveMutationPlan, EmbedHostAnchorRecord, EmbedHostContainerContribution, EmbedHostAnchorModelService } from '@univerjs/embed-ui';
import type { DocumentDataModel, IUniverInstanceService } from '@univerjs/core';
import type { IRenderManagerService } from '@univerjs/engine-render';
import { REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID } from '@univerjs/embed-ui';
import { UniverInstanceType } from '@univerjs/core';
import { createDocsCustomBlockInsertMutation, createDocsCustomBlockRemoveMutation } from './embed-host-anchor';
import { DocPageLayoutService } from './services/doc-page-layout.service';

export function createDocsCustomBlockHostAdapterContribution(
    anchorModelService?: EmbedHostAnchorModelService,
    univerInstanceService?: IUniverInstanceService,
    renderManagerService?: IRenderManagerService
): EmbedHostAdapterContribution {
    return {
        hostType: UniverInstanceType.UNIVER_DOC,
        entry: 'docs-custom-block',
        createAnchorPlan: (context) => createDocsCustomBlockAnchorPlan(context, univerInstanceService) ?? createRecordOnlyCreatePlan(createDocsCustomBlockRecord(context)),
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
        afterCreateAnchor: (context) => refreshDocsCustomBlockLayout(renderManagerService, context.hostUnitId),
        afterRemoveAnchor: (context) => refreshDocsCustomBlockLayout(renderManagerService, context.hostUnitId),
    };
}

export function createDocsCustomBlockHostContainerContribution(): EmbedHostContainerContribution {
    return {
        hostType: UniverInstanceType.UNIVER_DOC,
        entry: 'docs-custom-block',
        layout: 'docs-sticky-sheet',
        supportedLayouts: ['docs-sticky-sheet', 'docs-sticky-base', 'aspect-fit', 'scroll-contained'],
        menuBehavior: 'floating',
    };
}

function createDocsCustomBlockAnchorPlan(
    context: EmbedHostAnchorContext,
    univerInstanceService?: IUniverInstanceService
): EmbedHostAnchorMutationPlan | undefined {
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
    context: EmbedHostAnchorContext & { hostAnchorId: string },
    record: EmbedHostAnchorRecord,
    univerInstanceService?: IUniverInstanceService
): EmbedHostAnchorRemoveMutationPlan | undefined {
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
            }),
            { id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record: { ...record, lifecycle: 'active', hostContext: { ...record.hostContext, startIndex, drawingOrderIndex } } } },
        ],
    };
}

function createDocsCustomBlockRecord(context: EmbedHostAnchorContext): EmbedHostAnchorRecord {
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

function createRecordOnlyCreatePlan(record: EmbedHostAnchorRecord): EmbedHostAnchorMutationPlan {
    return {
        hostAnchorId: record.hostAnchorId,
        redoMutations: [{ id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record } }],
        undoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: record.hostUnitId, hostAnchorId: record.hostAnchorId } }],
    };
}

function getDocsCustomBlockInsertIndex(context: EmbedHostAnchorContext, univerInstanceService?: IUniverInstanceService): number | undefined {
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

function refreshDocsCustomBlockLayout(renderManagerService: IRenderManagerService | undefined, unitId: string): void {
    if (!renderManagerService) {
        return;
    }

    const refresh = () => {
        const render = renderManagerService.getRenderById(unitId);
        if (!render) {
            return;
        }

        render.engine.resize();
        render.with(DocPageLayoutService)?.calculatePagePosition();
        render.components.forEach((component) => {
            component.makeDirty(true);
        });
        render.scene.makeDirty(true);
    };

    refresh();
    let remaining = 4;
    const schedule = typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (callback: FrameRequestCallback) => setTimeout(callback, 16) as unknown as number;
    const run = () => {
        refresh();
        remaining -= 1;
        if (remaining > 0) {
            schedule(run);
        }
    };
    schedule(run);
}
