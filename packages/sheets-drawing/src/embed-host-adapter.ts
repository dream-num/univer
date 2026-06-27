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

import type { IDrawingSearch, Injector } from '@univerjs/core';
import type { IDrawingJsonUndo1, IDrawingManagerService as IDrawingManagerServiceType } from '@univerjs/drawing';
import type {
    IEmbedHostAdapterContribution,
    IEmbedHostAnchorContext,
    IEmbedHostAnchorMutationPlan,
    IEmbedHostAnchorRecord,
    IEmbedHostAnchorRemoveMutationPlan,
} from '@univerjs/embed';
import type { ISheetDrawingPosition, ISheetDrawingService as ISheetDrawingServiceType, ISheetFloatDom } from './services/sheet-drawing.service';
import { UniverInstanceType } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import {
    EmbedHostAnchorModelService,
    registerEmbedHostAdapterContributions,
    REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
} from '@univerjs/embed';
import { SheetSkeletonService } from '@univerjs/sheets';
import { drawingPositionToTransform, transformToAxisAlignPosition } from './basics/transform-position';
import { DrawingApplyType, SetDrawingApplyMutation } from './commands/mutations/set-drawing-apply.mutation';
import { createEmbedSheetsFloatingDrawing, resolveEmbedSheetsFloatingObjectSize } from './embed-floating-anchor';
import { ISheetDrawingService } from './services/sheet-drawing.service';

export function registerSheetsDrawingEmbedHostAdapters(injector: Injector): void {
    registerEmbedHostAdapterContributions(injector, [
        createSheetsFloatingObjectHostAdapterContribution(
            injector.has(EmbedHostAnchorModelService) ? injector.get(EmbedHostAnchorModelService) : undefined,
            () => injector.has(ISheetDrawingService) ? injector.get(ISheetDrawingService) : undefined,
            () => injector.has(IDrawingManagerService) ? injector.get(IDrawingManagerService) : undefined,
            () => injector.has(SheetSkeletonService) ? injector.get(SheetSkeletonService) : undefined
        ),
    ]);
}

export function createSheetsFloatingObjectHostAdapterContribution(
    anchorModelService?: EmbedHostAnchorModelService,
    sheetDrawingService?: ISheetDrawingServiceType | (() => ISheetDrawingServiceType | undefined),
    drawingManagerService?: IDrawingManagerServiceType | (() => IDrawingManagerServiceType | undefined),
    sheetSkeletonService?: SheetSkeletonService | (() => SheetSkeletonService | undefined)
): IEmbedHostAdapterContribution {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        createAnchorPlan: (context) => requireAnchorPlan(
            createSheetsFloatingObjectAnchorPlan(
                context,
                getSheetDrawingService(sheetDrawingService),
                getSheetSkeletonService(sheetSkeletonService)
            ),
            'EMBED_SHEETS_FLOATING_ANCHOR_UNAVAILABLE'
        ),
        restoreAnchor: (context) => requireAnchorRecord(
            restoreSheetsFloatingObjectAnchor(
                context,
                getSheetDrawingService(sheetDrawingService),
                getDrawingManagerService(drawingManagerService),
                getSheetSkeletonService(sheetSkeletonService)
            ),
            'EMBED_SHEETS_FLOATING_ANCHOR_UNAVAILABLE'
        ),
        removeAnchorPlan: (context) => {
            const previous = anchorModelService?.getAnchor(context.hostUnitId, context.hostAnchorId);
            const record = previous ?? createSheetsFloatingObjectRecord(context);
            const plan = createSheetsFloatingObjectRemoveAnchorPlan(context, record, getSheetDrawingService(sheetDrawingService));
            return plan ?? createRecordOnlyRemovePlan(context, record);
        },
    };
}

function createSheetsFloatingObjectAnchorPlan(
    context: IEmbedHostAnchorContext,
    sheetDrawingService?: ISheetDrawingServiceType,
    sheetSkeletonService?: SheetSkeletonService
): IEmbedHostAnchorMutationPlan | undefined {
    const hostSubUnitId = getHostSubUnitId(context.hostContext);
    if (!sheetDrawingService || !hostSubUnitId) {
        return undefined;
    }

    const record = createSheetsFloatingObjectRecord(context);
    const drawing = createSheetsFloatingObjectDrawing(context, record, hostSubUnitId, sheetSkeletonService);
    if (!drawing) {
        return undefined;
    }

    const jsonOp = sheetDrawingService.getBatchAddOp([drawing]) as IDrawingJsonUndo1;
    const drawingSearch = { unitId: record.hostUnitId, subUnitId: hostSubUnitId, drawingId: record.hostAnchorId };

    return {
        hostAnchorId: record.hostAnchorId,
        redoMutations: [
            toSetDrawingMutation(jsonOp, DrawingApplyType.INSERT, 'redo'),
            { id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record } },
        ],
        undoMutations: [
            { id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: record.hostUnitId, hostAnchorId: record.hostAnchorId } },
            toSetDrawingMutation({ ...jsonOp, objects: [drawingSearch] }, DrawingApplyType.REMOVE, 'undo'),
        ],
    };
}

function createSheetsFloatingObjectRemoveAnchorPlan(
    context: IEmbedHostAnchorContext & { hostAnchorId: string },
    record: IEmbedHostAnchorRecord,
    sheetDrawingService?: ISheetDrawingServiceType
): IEmbedHostAnchorRemoveMutationPlan | undefined {
    const hostSubUnitId = getHostSubUnitId(record.hostContext);
    if (!sheetDrawingService || !hostSubUnitId) {
        return undefined;
    }

    const jsonOp = sheetDrawingService.getBatchRemoveOp([{
        unitId: context.hostUnitId,
        subUnitId: hostSubUnitId,
        drawingId: context.hostAnchorId,
    }]) as IDrawingJsonUndo1;

    return {
        redoMutations: [
            { id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: context.hostUnitId, hostAnchorId: context.hostAnchorId } },
            toSetDrawingMutation(jsonOp, DrawingApplyType.REMOVE, 'redo'),
        ],
        undoMutations: [
            toSetDrawingMutation(jsonOp, DrawingApplyType.INSERT, 'undo'),
            { id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record: { ...record, lifecycle: 'active' } } },
        ],
    };
}

function createSheetsFloatingObjectRecord(context: IEmbedHostAnchorContext): IEmbedHostAnchorRecord {
    return createRecord({
        ...context,
        hostContext: normalizeSheetsFloatingObjectHostContext(context),
    }, 'sheets-floating-object', 'sheets-floating');
}

function restoreSheetsFloatingObjectAnchor(
    context: IEmbedHostAnchorContext & { hostAnchorId: string },
    sheetDrawingService?: ISheetDrawingServiceType,
    drawingManagerService?: IDrawingManagerServiceType,
    sheetSkeletonService?: SheetSkeletonService
): IEmbedHostAnchorRecord | undefined {
    const hostSubUnitId = getHostSubUnitId(context.hostContext);
    if (!sheetDrawingService || !drawingManagerService || !hostSubUnitId) {
        return undefined;
    }

    const record = createSheetsFloatingObjectRecord({
        ...context,
        requestedAnchorId: context.hostAnchorId,
    });
    const drawing = createSheetsFloatingObjectDrawing(context, record, hostSubUnitId, sheetSkeletonService);
    if (!drawing) {
        return undefined;
    }

    const drawingSearch = { unitId: record.hostUnitId, subUnitId: hostSubUnitId, drawingId: record.hostAnchorId };
    const existing = sheetDrawingService.getDrawingData(record.hostUnitId, hostSubUnitId)?.[record.hostAnchorId];
    if (!existing) {
        const jsonOp = sheetDrawingService.getBatchAddOp([drawing]) as IDrawingJsonUndo1;
        drawingManagerService.applyJson1(record.hostUnitId, hostSubUnitId, jsonOp.redo);
        sheetDrawingService.applyJson1(record.hostUnitId, hostSubUnitId, jsonOp.redo);
        drawingManagerService.addNotification([drawingSearch] as IDrawingSearch[]);
        sheetDrawingService.addNotification([drawingSearch] as IDrawingSearch[]);
    }

    return record;
}

function createSheetsFloatingObjectDrawing(
    context: IEmbedHostAnchorContext,
    record: IEmbedHostAnchorRecord,
    hostSubUnitId: string,
    sheetSkeletonService?: SheetSkeletonService
): ISheetFloatDom | undefined {
    const drawing = createEmbedSheetsFloatingDrawing({
        embedId: record.embedId,
        childType: context.descriptor?.childType,
        hostUnitId: record.hostUnitId,
        hostSubUnitId,
        hostAnchorId: record.hostAnchorId,
        componentKey: getString(record.hostContext, 'componentKey') ?? undefined,
        left: getNumber(record.hostContext, 'left'),
        top: getNumber(record.hostContext, 'top'),
        width: getNumber(record.hostContext, 'width'),
        height: getNumber(record.hostContext, 'height'),
        sheetTransform: getSheetTransform(record.hostContext),
        allowTransform: getBoolean(record.hostContext, 'allowTransform'),
        resizeBehavior: getString(record.hostContext, 'resizeBehavior') === 'aspect-ratio' || context.descriptor?.childType === UniverInstanceType.UNIVER_SLIDE
            ? 'aspect-ratio'
            : undefined,
        aspectRatio: getNumber(record.hostContext, 'aspectRatio') ?? (context.descriptor?.childType === UniverInstanceType.UNIVER_SLIDE ? 16 / 9 : undefined),
    });
    sheetSkeletonService?.ensureSkeleton(record.hostUnitId, hostSubUnitId);
    const skeletonParam = sheetSkeletonService?.getSkeletonParam(record.hostUnitId, hostSubUnitId);
    if (!skeletonParam) {
        return undefined;
    }

    const transform = drawingPositionToTransform(drawing.sheetTransform, skeletonParam);
    if (!transform) {
        return undefined;
    }

    return {
        ...drawing,
        transform,
        axisAlignSheetTransform: transformToAxisAlignPosition(transform, skeletonParam.skeleton) ?? drawing.sheetTransform,
    };
}

function createRecord(context: IEmbedHostAnchorContext, kind: IEmbedHostAnchorRecord['kind'], prefix: string): IEmbedHostAnchorRecord {
    return {
        hostAnchorId: context.requestedAnchorId ?? `${prefix}:${context.embedId}`,
        embedId: context.embedId,
        hostUnitId: context.hostUnitId,
        hostType: context.hostType,
        entry: context.entry,
        kind,
        hostContext: context.hostContext,
        lifecycle: 'active',
    };
}

function createRecordOnlyRemovePlan(
    context: IEmbedHostAnchorContext & { hostAnchorId: string },
    record: IEmbedHostAnchorRecord
): IEmbedHostAnchorRemoveMutationPlan {
    return {
        redoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: context.hostUnitId, hostAnchorId: context.hostAnchorId } }],
        undoMutations: [{ id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record: { ...record, lifecycle: 'active' } } }],
    };
}

function getHostSubUnitId(hostContext: Record<string, unknown> | undefined): string | undefined {
    return typeof hostContext?.subUnitId === 'string' ? hostContext.subUnitId : undefined;
}

function getNumber(hostContext: Record<string, unknown> | undefined, key: string): number | undefined {
    return typeof hostContext?.[key] === 'number' ? hostContext[key] : undefined;
}

function getString(hostContext: Record<string, unknown> | undefined, key: string): string | undefined {
    return typeof hostContext?.[key] === 'string' ? hostContext[key] : undefined;
}

function getBoolean(hostContext: Record<string, unknown> | undefined, key: string): boolean | undefined {
    return typeof hostContext?.[key] === 'boolean' ? hostContext[key] : undefined;
}

function getSheetTransform(hostContext: Record<string, unknown> | undefined): ISheetDrawingPosition | undefined {
    const value = hostContext?.sheetTransform;
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const candidate = value as Partial<ISheetDrawingPosition>;
    if (!candidate.from || !candidate.to) {
        return undefined;
    }

    return candidate as ISheetDrawingPosition;
}

function getSheetDrawingService(sheetDrawingService: ISheetDrawingServiceType | (() => ISheetDrawingServiceType | undefined) | undefined): ISheetDrawingServiceType | undefined {
    return typeof sheetDrawingService === 'function' ? sheetDrawingService() : sheetDrawingService;
}

function getDrawingManagerService(drawingManagerService: IDrawingManagerServiceType | (() => IDrawingManagerServiceType | undefined) | undefined): IDrawingManagerServiceType | undefined {
    return typeof drawingManagerService === 'function' ? drawingManagerService() : drawingManagerService;
}

function getSheetSkeletonService(sheetSkeletonService: SheetSkeletonService | (() => SheetSkeletonService | undefined) | undefined): SheetSkeletonService | undefined {
    return typeof sheetSkeletonService === 'function' ? sheetSkeletonService() : sheetSkeletonService;
}

function requireAnchorPlan(plan: IEmbedHostAnchorMutationPlan | undefined, errorCode: string): IEmbedHostAnchorMutationPlan {
    if (!plan) {
        throw new Error(errorCode);
    }

    return plan;
}

function requireAnchorRecord(record: IEmbedHostAnchorRecord | undefined, errorCode: string): IEmbedHostAnchorRecord {
    if (!record) {
        throw new Error(errorCode);
    }

    return record;
}

function normalizeSheetsFloatingObjectHostContext(context: IEmbedHostAnchorContext): Record<string, unknown> | undefined {
    const hostContext = context.hostContext;
    const configuredResizeBehavior = getSheetsFloatingResizeBehavior(hostContext);
    const resizeBehavior = configuredResizeBehavior === 'aspect-ratio' || context.descriptor?.childType === UniverInstanceType.UNIVER_SLIDE
        ? 'aspect-ratio'
        : configuredResizeBehavior;
    const aspectRatio = getNumber(hostContext, 'aspectRatio') ?? (context.descriptor?.childType === UniverInstanceType.UNIVER_SLIDE ? 16 / 9 : undefined);

    if (resizeBehavior !== 'aspect-ratio' || aspectRatio == null) {
        return hostContext;
    }

    const size = resolveEmbedSheetsFloatingObjectSize({
        width: getNumber(hostContext, 'width'),
        height: getNumber(hostContext, 'height'),
        resizeBehavior,
        aspectRatio,
    });

    return {
        ...hostContext,
        width: size.width,
        height: size.height,
        resizeBehavior,
        aspectRatio,
    };
}

function getSheetsFloatingResizeBehavior(hostContext: Record<string, unknown> | undefined): 'free' | 'aspect-ratio' | 'height-auto' | 'disabled' | undefined {
    const value = getString(hostContext, 'resizeBehavior');
    return value === 'free' || value === 'aspect-ratio' || value === 'height-auto' || value === 'disabled'
        ? value
        : undefined;
}

function toSetDrawingMutation(jsonOp: IDrawingJsonUndo1, type: DrawingApplyType, direction: 'redo' | 'undo') {
    return {
        id: SetDrawingApplyMutation.id,
        params: {
            unitId: jsonOp.unitId,
            subUnitId: jsonOp.subUnitId,
            op: direction === 'redo' ? jsonOp.redo : jsonOp.undo,
            objects: jsonOp.objects,
            type,
        },
    };
}
