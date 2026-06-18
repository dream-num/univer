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

import type { IUniverInstanceService } from '@univerjs/core';
import type { IDrawingJsonUndo1 } from '@univerjs/drawing';
import type { EmbedHostAnchorModelService, IEmbedHostAdapterContribution, IEmbedHostAnchorContext, IEmbedHostAnchorMutationPlan, IEmbedHostAnchorRecord, IEmbedHostAnchorRemoveMutationPlan, IEmbedHostContainerContribution } from '@univerjs/embed-ui';
import type { ISheetDrawingPosition, ISheetDrawingService } from '@univerjs/sheets-drawing';
import { UniverInstanceType } from '@univerjs/core';
import { REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID } from '@univerjs/embed-ui';
import { InsertSheetMutation, RemoveSheetMutation } from '@univerjs/sheets';
import { DrawingApplyType, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import { createEmbedSheetsFloatingDrawing, EMBED_SHEETS_FLOATING_COMPONENT_KEY, resolveEmbedSheetsFloatingObjectSize } from './embed-floating-anchor';
import { createEmbedSheetsTabCustomData, createEmbedSheetsTabSnapshot } from './embed-tab-anchor';

export function createSheetsFloatingObjectHostAdapterContribution(
    anchorModelService?: EmbedHostAnchorModelService,
    sheetDrawingService?: ISheetDrawingService | (() => ISheetDrawingService | undefined)
): IEmbedHostAdapterContribution {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        createAnchorPlan: (context) => createSheetsFloatingObjectAnchorPlan(context, getSheetDrawingService(sheetDrawingService)) ?? createRecordOnlyCreatePlan(createSheetsFloatingObjectRecord(context)),
        removeAnchorPlan: (context) => {
            const previous = anchorModelService?.getAnchor(context.hostUnitId, context.hostAnchorId);
            const record = previous ?? createSheetsFloatingObjectRecord(context);
            const plan = createSheetsFloatingObjectRemoveAnchorPlan(context, record, getSheetDrawingService(sheetDrawingService));
            return plan ?? createRecordOnlyRemovePlan(context, record);
        },
    };
}

export function createSheetsSheetTabHostAdapterContribution(
    anchorModelService?: EmbedHostAnchorModelService,
    univerInstanceService?: IUniverInstanceService
): IEmbedHostAdapterContribution {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-sheet-tab',
        createAnchorPlan: createSheetsSheetTabAnchorPlan,
        removeAnchorPlan: (context) => {
            const record = anchorModelService?.getAnchor(context.hostUnitId, context.hostAnchorId) ?? createSheetsSheetTabRecord(context);
            return createSheetsSheetTabRemoveAnchorPlan(context, record);
        },
        activateAnchor: (context) => {
            const workbook = univerInstanceService?.getUnit(context.hostUnitId, UniverInstanceType.UNIVER_SHEET) as {
                getSheetBySheetId?: (sheetId: string) => unknown;
                setActiveSheet?: (worksheet: unknown) => void;
            } | undefined;
            const worksheet = workbook?.getSheetBySheetId?.(context.hostAnchorId);
            if (worksheet) {
                workbook?.setActiveSheet?.(worksheet);
            }
        },
    };
}

export function createSheetsFloatingObjectHostContainerContribution(): IEmbedHostContainerContribution {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-floating-object',
        layout: 'doc-width-scale',
        supportedLayouts: ['doc-width-scale', 'aspect-fit'],
        menuBehavior: 'floating',
    };
}

export function createSheetsSheetTabHostContainerContribution(): IEmbedHostContainerContribution {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-sheet-tab',
        layout: 'tab-peer',
        supportedLayouts: ['tab-peer'],
        menuBehavior: 'host-override',
        mount: (context) => {
            const hostElement = queryEmbedHostElement('data-embed-sheets-sheet-tab-host', context.descriptor.hostAnchorId);
            return hostElement ? { hostElement } : {};
        },
    };
}

function createSheetsFloatingObjectAnchorPlan(
    context: IEmbedHostAnchorContext,
    sheetDrawingService?: ISheetDrawingService
): IEmbedHostAnchorMutationPlan | undefined {
    const hostSubUnitId = getHostSubUnitId(context.hostContext);
    if (!sheetDrawingService || !hostSubUnitId) {
        return undefined;
    }

    const record = createSheetsFloatingObjectRecord(context);
    const drawing = createEmbedSheetsFloatingDrawing({
        embedId: record.embedId,
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
    sheetDrawingService?: ISheetDrawingService
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

function createSheetsSheetTabAnchorPlan(context: IEmbedHostAnchorContext): IEmbedHostAnchorMutationPlan {
    const record = createSheetsSheetTabRecord(context);
    const sheetIndex = getSheetIndex(record.hostContext);
    const sheetName = getSheetName(record.hostContext) ?? context.embedId;
    const sheet = createEmbedSheetsTabSnapshot({
        embedId: record.embedId,
        hostAnchorId: record.hostAnchorId,
        name: sheetName,
    });

    return {
        hostAnchorId: record.hostAnchorId,
        redoMutations: [
            { id: InsertSheetMutation.id, params: { unitId: record.hostUnitId, index: sheetIndex, sheet } },
            { id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record } },
        ],
        undoMutations: [
            { id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: record.hostUnitId, hostAnchorId: record.hostAnchorId } },
            { id: RemoveSheetMutation.id, params: { unitId: record.hostUnitId, subUnitId: record.hostAnchorId, subUnitName: sheet.name } },
        ],
    };
}

function createSheetsSheetTabRemoveAnchorPlan(
    context: IEmbedHostAnchorContext & { hostAnchorId: string },
    record: IEmbedHostAnchorRecord
): IEmbedHostAnchorRemoveMutationPlan {
    const sheetIndex = getSheetIndex(record.hostContext);
    const sheetName = getSheetName(record.hostContext) ?? record.embedId;
    const sheet = createEmbedSheetsTabSnapshot({
        embedId: record.embedId,
        hostAnchorId: record.hostAnchorId,
        name: sheetName,
    });

    return {
        redoMutations: [
            { id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: context.hostUnitId, hostAnchorId: context.hostAnchorId } },
            { id: RemoveSheetMutation.id, params: { unitId: context.hostUnitId, subUnitId: context.hostAnchorId, subUnitName: sheet.name } },
        ],
        undoMutations: [
            { id: InsertSheetMutation.id, params: { unitId: context.hostUnitId, index: sheetIndex, sheet } },
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

function createSheetsSheetTabRecord(context: IEmbedHostAnchorContext): IEmbedHostAnchorRecord {
    const hostAnchorId = context.requestedAnchorId ?? `sheets-tab:${context.embedId}`;
    return {
        hostAnchorId,
        embedId: context.embedId,
        hostUnitId: context.hostUnitId,
        hostType: context.hostType,
        entry: context.entry,
        kind: 'sheets-sheet-tab',
        hostContext: {
            ...context.hostContext,
            sheetIndex: getSheetIndex(context.hostContext),
            sheetName: getSheetName(context.hostContext) ?? context.embedId,
            sheetTab: createEmbedSheetsTabCustomData({
                embedId: context.embedId,
                hostAnchorId,
            }),
        },
        lifecycle: 'active',
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

function createRecordOnlyCreatePlan(record: IEmbedHostAnchorRecord): IEmbedHostAnchorMutationPlan {
    return {
        hostAnchorId: record.hostAnchorId,
        redoMutations: [{ id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { record } }],
        undoMutations: [{ id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, params: { hostUnitId: record.hostUnitId, hostAnchorId: record.hostAnchorId } }],
    };
}

function getSheetIndex(hostContext: Record<string, unknown> | undefined): number {
    return typeof hostContext?.sheetIndex === 'number' ? hostContext.sheetIndex : Number.MAX_SAFE_INTEGER;
}

function getSheetName(hostContext: Record<string, unknown> | undefined): string | undefined {
    return typeof hostContext?.sheetName === 'string' ? hostContext.sheetName : undefined;
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

function getSheetDrawingService(sheetDrawingService: ISheetDrawingService | (() => ISheetDrawingService | undefined) | undefined): ISheetDrawingService | undefined {
    return typeof sheetDrawingService === 'function' ? sheetDrawingService() : sheetDrawingService;
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

function queryEmbedHostElement(attribute: string, value: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`[${attribute}="${escapeAttributeValue(value)}"]`);
}

function escapeAttributeValue(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
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

export { EMBED_SHEETS_FLOATING_COMPONENT_KEY };
