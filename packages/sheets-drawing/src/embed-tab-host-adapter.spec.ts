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
import {
    EmbedHostAdapterRegistryService,
    REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
    SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
} from '@univerjs/embed';
import { InsertSheetMutation, RemoveSheetMutation } from '@univerjs/sheets';
import { describe, expect, it, vi } from 'vitest';
import { createSheetsSheetTabHostAdapterContribution, registerSheetsSheetTabEmbedHostAdapters } from './embed-tab-host-adapter';

describe('sheets sheet-tab embed host adapter', () => {
    it('registers the sheet-tab adapter in the embed host adapter registry', () => {
        const registry = new EmbedHostAdapterRegistryService();
        registerSheetsSheetTabEmbedHostAdapters(createInjector([
            [EmbedHostAdapterRegistryService, registry],
        ]) as never);

        expect(registry.get(UniverInstanceType.UNIVER_SHEET, 'sheets-sheet-tab')).toBeDefined();
    });

    it('creates sheet-tab insert and remove plans and activates the matching worksheet', () => {
        const worksheet = { id: 'sheet-tab-1' };
        const workbook = {
            getSheetBySheetId: vi.fn(() => worksheet),
            setActiveSheet: vi.fn(),
        };
        const adapter = createSheetsSheetTabHostAdapterContribution(undefined, {
            getUnit: vi.fn(() => workbook),
        } as never);
        const context = createTabContext({
            hostContext: {
                sheetIndex: 2,
                sheetName: 'Embedded Doc',
            },
            requestedAnchorId: 'sheet-tab-1',
        });

        const plan = adapter.createAnchorPlan!(context as never);
        expect(plan.redoMutations[0]).toEqual({
            id: InsertSheetMutation.id,
            params: expect.objectContaining({
                index: 2,
                sheet: expect.objectContaining({
                    id: 'sheet-tab-1',
                    name: 'Embedded Doc',
                }),
                unitId: 'host-sheet',
            }),
        });
        expect(plan.redoMutations[1]).toEqual({
            id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: { record: expect.objectContaining({ hostAnchorId: 'sheet-tab-1' }) },
        });
        expect(plan.undoMutations[1]).toEqual({
            id: RemoveSheetMutation.id,
            params: { subUnitId: 'sheet-tab-1', subUnitName: 'Embedded Doc', unitId: 'host-sheet' },
        });

        const removePlan = adapter.removeAnchorPlan!({ ...context, hostAnchorId: 'sheet-tab-1' } as never);
        expect(removePlan.undoMutations[0]).toEqual({
            id: InsertSheetMutation.id,
            params: expect.objectContaining({ index: 2 }),
        });

        adapter.activateAnchor?.({ ...context, hostAnchorId: 'sheet-tab-1' } as never);
        expect(workbook.setActiveSheet).toHaveBeenCalledWith(worksheet);
    });

    it('restores sheet-tab anchors and refreshes the current sheet without switching to the block tab', () => {
        const activeWorksheet = { id: 'active-sheet' };
        const workbook = {
            addWorksheet: vi.fn(() => true),
            getActiveSheet: vi.fn(() => activeWorksheet),
            getSheetBySheetId: vi.fn(() => undefined),
            setActiveSheet: vi.fn(),
        };
        const adapter = createSheetsSheetTabHostAdapterContribution(undefined, {
            getUnit: vi.fn(() => workbook),
        } as never);
        const context = createTabContext({
            hostContext: {
                sheetIndex: 0,
                sheetName: 'Embedded Doc',
            },
            requestedAnchorId: 'sheet-tab-1',
        });

        const record = adapter.restoreAnchor?.({
            ...context,
            hostAnchorId: 'sheet-tab-1',
        } as never);

        expect(record).toMatchObject({
            hostAnchorId: 'sheet-tab-1',
            kind: 'sheets-sheet-tab',
        });
        expect(workbook.addWorksheet).toHaveBeenCalledWith('sheet-tab-1', 0, expect.objectContaining({
            id: 'sheet-tab-1',
            name: 'Embedded Doc',
        }));
        expect(workbook.setActiveSheet).toHaveBeenCalledWith(activeWorksheet);
    });

    it('uses existing anchor records when removing sheet-tab anchors', () => {
        const adapter = createSheetsSheetTabHostAdapterContribution({
            getAnchor: vi.fn(() => ({
                embedId: 'embed-1',
                entry: 'sheets-sheet-tab',
                hostAnchorId: 'sheet-tab-1',
                hostContext: {
                    sheetIndex: 3,
                    sheetName: 'Existing Tab',
                },
                hostType: UniverInstanceType.UNIVER_SHEET,
                hostUnitId: 'host-sheet',
                kind: 'sheets-sheet-tab',
                lifecycle: 'active',
            })),
        } as never);
        const plan = adapter.removeAnchorPlan!({
            ...createTabContext({}),
            hostAnchorId: 'sheet-tab-1',
        } as never);

        expect(plan.redoMutations[0]).toEqual({
            id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: { hostAnchorId: 'sheet-tab-1', hostUnitId: 'host-sheet' },
        });
        expect(plan.redoMutations[1]).toEqual({
            id: RemoveSheetMutation.id,
            params: { subUnitId: 'sheet-tab-1', subUnitName: 'Existing Tab', unitId: 'host-sheet' },
        });
    });
});

function createTabContext(overrides: {
    hostContext?: Record<string, unknown>;
    requestedAnchorId?: string;
}) {
    return {
        descriptor: {
            childType: UniverInstanceType.UNIVER_DOC,
        },
        embedId: 'embed-1',
        entry: 'sheets-sheet-tab',
        hostContext: overrides.hostContext,
        hostType: UniverInstanceType.UNIVER_SHEET,
        hostUnitId: 'host-sheet',
        requestedAnchorId: overrides.requestedAnchorId,
    };
}

function createInjector(entries: Array<[unknown, unknown]>) {
    const map = new Map(entries);
    return {
        get: vi.fn((token: unknown) => map.get(token)),
        has: vi.fn((token: unknown) => map.has(token)),
    };
}
