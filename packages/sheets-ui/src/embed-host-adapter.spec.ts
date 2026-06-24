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
 * @vitest-environment jsdom
 */

import { UniverInstanceType } from '@univerjs/core';
import { REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID, SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID } from '@univerjs/embed-ui';
import { InsertSheetMutation, RemoveSheetMutation } from '@univerjs/sheets';
import { DrawingApplyType, SetDrawingApplyMutation } from '@univerjs/sheets-drawing';
import { describe, expect, it, vi } from 'vitest';
import { createSheetsFloatingObjectHostAdapterContribution, createSheetsFloatingObjectHostContainerContribution, createSheetsSheetTabHostAdapterContribution, createSheetsSheetTabHostContainerContribution } from './embed-host-adapter';

describe('sheets embed host adapter', () => {
    it('rejects floating anchor creation when drawing services are unavailable', () => {
        const adapter = createSheetsFloatingObjectHostAdapterContribution();
        expect(() => adapter.createAnchorPlan!(createFloatingContext({
            requestedAnchorId: 'float-1',
            hostContext: { subUnitId: 'sheet-1' },
        }) as never)).toThrow('EMBED_SHEETS_FLOATING_ANCHOR_UNAVAILABLE');

        const removePlan = adapter.removeAnchorPlan!({
            ...createFloatingContext({ requestedAnchorId: 'float-1' }),
            hostAnchorId: 'float-1',
        } as never);
        expect(removePlan.redoMutations[0]).toEqual({
            id: REMOVE_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: { hostUnitId: 'host-sheet', hostAnchorId: 'float-1' },
        });
    });

    it('creates drawing mutations for floating object anchors and normalizes slide aspect ratio', () => {
        const drawingService = createDrawingService();
        const adapter = createSheetsFloatingObjectHostAdapterContribution(undefined, drawingService as never);
        const plan = adapter.createAnchorPlan!(createFloatingContext({
            hostContext: {
                subUnitId: 'sheet-1',
                left: 10,
                top: 20,
                width: 320,
                componentKey: 'CustomFloat',
                allowTransform: false,
            },
            descriptor: {
                childType: UniverInstanceType.UNIVER_SLIDE,
            },
        }) as never);

        expect(drawingService.getBatchAddOp).toHaveBeenCalledWith([
            expect.objectContaining({
                componentKey: 'CustomFloat',
                allowTransform: false,
                transform: expect.objectContaining({
                    height: 180,
                    left: 10,
                    top: 20,
                    width: 320,
                }),
                data: expect.objectContaining({
                    aspectRatio: 16 / 9,
                    resizeBehavior: 'aspect-ratio',
                }),
            }),
        ]);
        expect(plan.redoMutations[0]).toEqual({
            id: SetDrawingApplyMutation.id,
            params: expect.objectContaining({
                op: { add: true },
                type: DrawingApplyType.INSERT,
                unitId: 'host-sheet',
                subUnitId: 'sheet-1',
            }),
        });
        expect(plan.undoMutations[1]).toEqual({
            id: SetDrawingApplyMutation.id,
            params: expect.objectContaining({
                objects: [{ drawingId: 'sheets-floating:embed-1', subUnitId: 'sheet-1', unitId: 'host-sheet' }],
                op: { remove: true },
                type: DrawingApplyType.REMOVE,
            }),
        });
    });

    it('creates drawing remove plans from existing floating records', () => {
        const drawingService = createDrawingService();
        const anchorModel = {
            getAnchor: vi.fn(() => ({
                embedId: 'embed-1',
                entry: 'sheets-floating-object',
                hostAnchorId: 'float-1',
                hostContext: { subUnitId: 'sheet-1' },
                hostType: UniverInstanceType.UNIVER_SHEET,
                hostUnitId: 'host-sheet',
                kind: 'sheets-floating',
            })),
        };
        const adapter = createSheetsFloatingObjectHostAdapterContribution(anchorModel as never, () => drawingService as never);
        const plan = adapter.removeAnchorPlan!({
            ...createFloatingContext({}),
            hostAnchorId: 'float-1',
        } as never);

        expect(drawingService.getBatchRemoveOp).toHaveBeenCalledWith([
            { drawingId: 'float-1', subUnitId: 'sheet-1', unitId: 'host-sheet' },
        ]);
        expect(plan.redoMutations[1]).toEqual({
            id: SetDrawingApplyMutation.id,
            params: expect.objectContaining({
                op: { remove: true },
                type: DrawingApplyType.REMOVE,
            }),
        });
        expect(plan.undoMutations[1]).toEqual({
            id: SET_EMBED_HOST_ANCHOR_RECORD_MUTATION_ID,
            params: { record: expect.objectContaining({ lifecycle: 'active' }) },
        });
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

    it('restores floating anchors through both drawing stores without mutations', () => {
        const sheetDrawingService = createDrawingService();
        const drawingManagerService = createDrawingService();
        const adapter = createSheetsFloatingObjectHostAdapterContribution(
            undefined,
            sheetDrawingService as never,
            drawingManagerService as never
        );
        const record = adapter.restoreAnchor?.({
            ...createFloatingContext({
                hostContext: {
                    subUnitId: 'sheet-1',
                    left: 10,
                    top: 20,
                    width: 320,
                },
            }),
            hostAnchorId: 'float-1',
        } as never);

        const drawingSearch = { drawingId: 'float-1', subUnitId: 'sheet-1', unitId: 'host-sheet' };
        expect(record).toMatchObject({
            hostAnchorId: 'float-1',
            kind: 'sheets-floating-object',
        });
        expect(sheetDrawingService.applyJson1).toHaveBeenCalledWith('host-sheet', 'sheet-1', { add: true });
        expect(drawingManagerService.applyJson1).toHaveBeenCalledWith('host-sheet', 'sheet-1', { add: true });
        expect(sheetDrawingService.addNotification).toHaveBeenCalledWith([drawingSearch]);
        expect(drawingManagerService.addNotification).toHaveBeenCalledWith([drawingSearch]);
    });

    it('declares floating and tab containers and resolves tab host elements', () => {
        expect(createSheetsFloatingObjectHostContainerContribution()).toMatchObject({
            entry: 'sheets-floating-object',
            layout: 'doc-width-scale',
            menuBehavior: 'floating',
            supportedLayouts: ['doc-width-scale', 'aspect-fit'],
        });

        const hostElement = document.createElement('div');
        hostElement.setAttribute('data-embed-sheets-sheet-tab-host', 'tab"1');
        document.body.appendChild(hostElement);
        const container = createSheetsSheetTabHostContainerContribution();

        expect(container).toMatchObject({
            entry: 'sheets-sheet-tab',
            layout: 'tab-peer',
            menuBehavior: 'host-override',
        });
        expect(container.mount?.({ descriptor: { hostAnchorId: 'tab"1' } } as never)).toEqual({ hostElement });
        expect(container.mount?.({ descriptor: { hostAnchorId: 'missing' } } as never)).toEqual({});
    });
});

function createFloatingContext(overrides: {
    descriptor?: Record<string, unknown>;
    hostContext?: Record<string, unknown>;
    requestedAnchorId?: string;
}) {
    return {
        descriptor: {
            childType: UniverInstanceType.UNIVER_DOC,
            ...overrides.descriptor,
        },
        embedId: 'embed-1',
        entry: 'sheets-floating-object',
        hostContext: overrides.hostContext,
        hostType: UniverInstanceType.UNIVER_SHEET,
        hostUnitId: 'host-sheet',
        requestedAnchorId: overrides.requestedAnchorId,
    };
}

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

function createDrawingService() {
    return {
        getBatchAddOp: vi.fn(() => ({
            objects: [],
            redo: { add: true },
            subUnitId: 'sheet-1',
            undo: { remove: true },
            unitId: 'host-sheet',
        })),
        getBatchRemoveOp: vi.fn(() => ({
            objects: [],
            redo: { remove: true },
            subUnitId: 'sheet-1',
            undo: { add: true },
            unitId: 'host-sheet',
        })),
        getDrawingData: vi.fn(() => ({})),
        applyJson1: vi.fn(),
        addNotification: vi.fn(),
    };
}
