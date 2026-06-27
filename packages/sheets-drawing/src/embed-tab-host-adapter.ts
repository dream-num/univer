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

import type { Injector, IWorkbookData } from '@univerjs/core';
import type {
    IEmbedHostAdapterContribution,
    IEmbedHostAnchorContext,
    IEmbedHostAnchorMutationPlan,
    IEmbedHostAnchorRecord,
    IEmbedHostAnchorRemoveMutationPlan,
} from '@univerjs/embed';
import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import {
    EmbedHostAnchorModelService,
    registerEmbedHostAdapterContributions,
    REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
} from '@univerjs/embed';
import { InsertSheetMutation, RemoveSheetMutation } from '@univerjs/sheets';
import { createEmbedSheetsTabCustomData, createEmbedSheetsTabSnapshot } from './embed-tab-anchor';

export function registerSheetsSheetTabEmbedHostAdapters(injector: Injector): void {
    registerEmbedHostAdapterContributions(injector, [
        createSheetsSheetTabHostAdapterContribution(
            injector.has(EmbedHostAnchorModelService) ? injector.get(EmbedHostAnchorModelService) : undefined,
            injector.has(IUniverInstanceService) ? injector.get(IUniverInstanceService) : undefined
        ),
    ]);
}

export function createSheetsSheetTabHostAdapterContribution(
    anchorModelService?: EmbedHostAnchorModelService,
    univerInstanceService?: IUniverInstanceService
): IEmbedHostAdapterContribution {
    return {
        hostType: UniverInstanceType.UNIVER_SHEET,
        entry: 'sheets-sheet-tab',
        createAnchorPlan: createSheetsSheetTabAnchorPlan,
        restoreAnchor: (context) => requireAnchorRecord(
            restoreSheetsSheetTabAnchor(context, univerInstanceService),
            'EMBED_SHEETS_TAB_ANCHOR_UNAVAILABLE'
        ),
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

function restoreSheetsSheetTabAnchor(
    context: IEmbedHostAnchorContext & { hostAnchorId: string },
    univerInstanceService?: IUniverInstanceService
): IEmbedHostAnchorRecord | undefined {
    const workbook = getWorkbook(univerInstanceService, context.hostUnitId);
    if (!workbook) {
        return undefined;
    }

    const record = createSheetsSheetTabRecord({
        ...context,
        requestedAnchorId: context.hostAnchorId,
    });
    const sheetName = getSheetName(record.hostContext) ?? context.embedId;
    const sheetIndex = getSheetIndex(record.hostContext);
    if (!workbook.getSheetBySheetId?.(record.hostAnchorId)) {
        const activeWorksheet = workbook.getActiveSheet?.(true);
        workbook.addWorksheet(record.hostAnchorId, sheetIndex, createEmbedSheetsTabSnapshot({
            embedId: record.embedId,
            hostAnchorId: record.hostAnchorId,
            name: sheetName,
        }));
        if (activeWorksheet) {
            workbook.setActiveSheet?.(activeWorksheet);
        }
    }

    return {
        ...record,
        hostContext: {
            ...record.hostContext,
            sheetIndex,
            sheetName,
        },
    };
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

function getSheetIndex(hostContext: Record<string, unknown> | undefined): number {
    return typeof hostContext?.sheetIndex === 'number' ? hostContext.sheetIndex : Number.MAX_SAFE_INTEGER;
}

function getSheetName(hostContext: Record<string, unknown> | undefined): string | undefined {
    return typeof hostContext?.sheetName === 'string' ? hostContext.sheetName : undefined;
}

function requireAnchorRecord(record: IEmbedHostAnchorRecord | undefined, errorCode: string): IEmbedHostAnchorRecord {
    if (!record) {
        throw new Error(errorCode);
    }

    return record;
}

function getWorkbook(univerInstanceService: IUniverInstanceService | undefined, unitId: string): {
    addWorksheet: (id: string, index: number, worksheetSnapshot: Partial<IWorkbookData['sheets'][string]>) => boolean;
    getActiveSheet?: (allowNull?: true) => unknown;
    getSheetBySheetId?: (sheetId: string) => unknown;
    setActiveSheet?: (worksheet: unknown) => void;
} | undefined {
    return univerInstanceService?.getUnit(unitId, UniverInstanceType.UNIVER_SHEET) as {
        addWorksheet: (id: string, index: number, worksheetSnapshot: Partial<IWorkbookData['sheets'][string]>) => boolean;
        getActiveSheet?: (allowNull?: true) => unknown;
        getSheetBySheetId?: (sheetId: string) => unknown;
        setActiveSheet?: (worksheet: unknown) => void;
    } | undefined;
}
