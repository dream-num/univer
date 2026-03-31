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

import type { IAccessor } from '@univerjs/core';
import { ArrangeTypeEnum, DrawingTypeEnum, ICommandService, IUndoRedoService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SheetInterceptorService } from '@univerjs/sheets';
import { DrawingApplyType, InsertSheetDrawingCommand, ISheetDrawingService, RemoveSheetDrawingCommand, SetDrawingApplyMutation, SetDrawingArrangeCommand } from '@univerjs/sheets-drawing';
import { ISheetSelectionRenderService } from '@univerjs/sheets-ui';
import { describe, expect, it, vi } from 'vitest';

function createSelectionRenderService() {
    return {
        getCellWithCoordByOffset(left: number, top: number) {
            const actualColumn = Math.floor(left / 10);
            const actualRow = Math.floor(top / 10);

            return {
                actualColumn,
                actualRow,
                startX: actualColumn * 10,
                startY: actualRow * 10,
            };
        },
    };
}

function createAccessor() {
    const commandService = { syncExecuteCommand: vi.fn(() => true) };
    const pushUndoRedo = vi.fn();
    const selectionRenderService = createSelectionRenderService();
    const sheetDrawingService = {
        getForwardDrawingsOp: vi.fn(() => ({ redo: ['redo-forward'], undo: ['undo-forward'], objects: ['shape-1'] })),
        getBackwardDrawingOp: vi.fn(() => ({ redo: ['redo-backward'], undo: ['undo-backward'], objects: ['shape-1'] })),
        getFrontDrawingsOp: vi.fn(() => ({ redo: ['redo-front'], undo: ['undo-front'], objects: ['shape-1'] })),
        getBackDrawingsOp: vi.fn(() => ({ redo: ['redo-back'], undo: ['undo-back'], objects: ['shape-1'] })),
        getBatchRemoveOp: vi.fn(() => ({ unitId: 'book-1', subUnitId: 'sheet-1', redo: ['remove-redo'], undo: ['remove-undo'], objects: ['shape-1'] })),
        getBatchAddOp: vi.fn(() => ({ unitId: 'book-1', subUnitId: 'sheet-1', redo: ['add-redo'], undo: ['add-undo'], objects: ['shape-2'] })),
        getBatchUpdateOp: vi.fn(() => ({ unitId: 'book-1', subUnitId: 'sheet-1', redo: ['update-redo'], undo: ['update-undo'], objects: ['shape-1'] })),
        getDrawingData: vi.fn(() => ({
            'shape-1': {
                drawingId: 'shape-1',
                drawingType: DrawingTypeEnum.DRAWING_SHAPE,
                transform: { left: 10, top: 20, flipX: false, flipY: false },
            },
        })),
        getFocusDrawings: vi.fn(() => [{ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'shape-1', transform: { left: 10, top: 20 } }]),
    };
    const renderManagerService = {
        getRenderById: vi.fn(() => ({
            scene: null,
            with: vi.fn((token: unknown) => (token === ISheetSelectionRenderService ? selectionRenderService : null)),
        })),
    };
    const sheetInterceptorService = {
        onCommandExecute: vi.fn(() => ({
            preRedos: [{ id: 'pre-redo', params: { ok: true } }],
            redos: [{ id: 'redo-extra', params: { ok: true } }],
            preUndos: [{ id: 'pre-undo', params: { ok: true } }],
            undos: [{ id: 'undo-extra', params: { ok: true } }],
        })),
    };
    const accessor = {
        get(token: unknown) {
            if (token === ICommandService) {
                return commandService;
            }

            if (token === IUndoRedoService) {
                return { pushUndoRedo };
            }

            if (token === ISheetDrawingService) {
                return sheetDrawingService;
            }

            if (token === SheetInterceptorService) {
                return sheetInterceptorService;
            }

            if (token === ISheetSelectionRenderService) {
                return selectionRenderService;
            }

            if (token === IRenderManagerService) {
                return renderManagerService;
            }

            throw new Error(`Unknown dependency: ${String(token)}`);
        },
    } as IAccessor;

    return { accessor, commandService, pushUndoRedo, renderManagerService, sheetDrawingService, sheetInterceptorService };
}

describe('sheet drawing commands', () => {
    it('arranges drawing order and records undo/redo mutations', () => {
        const { accessor, commandService, pushUndoRedo } = createAccessor();
        expect(SetDrawingArrangeCommand.handler(accessor, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            drawingIds: ['shape-1'],
            arrangeType: ArrangeTypeEnum.front,
        })).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(SetDrawingApplyMutation.id, {
            op: ['redo-front'],
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            objects: ['shape-1'],
            type: DrawingApplyType.ARRANGE,
        });
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            unitID: 'book-1',
            undoMutations: [expect.objectContaining({ id: SetDrawingApplyMutation.id })],
            redoMutations: [expect.objectContaining({ id: SetDrawingApplyMutation.id })],
        }));
    });

    it('removes drawings through the interceptor pipeline and clears transformers in undo/redo', () => {
        const { accessor, commandService, pushUndoRedo, sheetInterceptorService } = createAccessor();
        expect(RemoveSheetDrawingCommand.handler(accessor, {
            drawings: [{ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'shape-1' }],
        } as never)).toBe(true);
        expect(sheetInterceptorService.onCommandExecute).toHaveBeenCalled();
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(1, 'pre-redo', { ok: true }, undefined);
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(2, SetDrawingApplyMutation.id, {
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            op: ['remove-redo'],
            objects: ['shape-1'],
            type: DrawingApplyType.REMOVE,
        }, undefined);
        expect(pushUndoRedo).toHaveBeenCalledWith(expect.objectContaining({
            undoMutations: expect.arrayContaining([expect.objectContaining({ id: SetDrawingApplyMutation.id })]),
            redoMutations: expect.arrayContaining([expect.objectContaining({ id: SetDrawingApplyMutation.id })]),
        }));
    });

    it('inserts drawings through sheet interceptors and records undo/redo mutations', () => {
        const { accessor, commandService, sheetInterceptorService } = createAccessor();
        const params = {
            drawings: [{ unitId: 'book-1', subUnitId: 'sheet-1', drawingId: 'shape-2' }],
        };

        expect(InsertSheetDrawingCommand.handler(accessor, params as never)).toBe(true);
        expect(sheetInterceptorService.onCommandExecute).toHaveBeenCalledWith({ id: InsertSheetDrawingCommand.id, params });
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(1, 'pre-redo', { ok: true }, undefined);
        expect(commandService.syncExecuteCommand).toHaveBeenNthCalledWith(2, SetDrawingApplyMutation.id, {
            op: ['add-redo'],
            unitId: 'book-1',
            subUnitId: 'sheet-1',
            objects: ['shape-2'],
            type: DrawingApplyType.INSERT,
        }, undefined);

        expect(InsertSheetDrawingCommand.handler(accessor, undefined)).toBe(false);
    });
});
