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

import { BooleanNumber, PositionedObjectLayoutType, UndoCommand } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { describe, expect, it, vi } from 'vitest';
import { DocDrawingAddRemoveController } from '../doc-drawing-notification.controller';

function createController() {
    const beforeHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
    const executedHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
    const refreshControls = vi.fn();
    const drawingManagerService = {
        applyJson1: vi.fn(),
        addNotification: vi.fn(),
        removeNotification: vi.fn(),
        getFocusDrawings: vi.fn(() => [{ drawingId: 'drawing-1' }]),
        setDrawingOrder: vi.fn(),
        orderNotification: vi.fn(),
    };
    const docDrawingService = {
        getBatchAddOp: vi.fn(() => ({ subUnitId: 'doc-1', redo: 'add-op', objects: [{ drawingId: 'drawing-1' }] })),
        getBatchRemoveOp: vi.fn(() => ({ subUnitId: 'doc-1', redo: 'remove-op', objects: [{ drawingId: 'drawing-1' }] })),
        applyJson1: vi.fn(),
        addNotification: vi.fn(),
        removeNotification: vi.fn(),
        setDrawingOrder: vi.fn(),
        orderNotification: vi.fn(),
    };
    const controller = new DocDrawingAddRemoveController(
        {
            getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'doc-1' })),
            getUnit: vi.fn(() => ({
                getSnapshot: () => ({
                    drawings: {
                        'drawing-1': {
                            layoutType: PositionedObjectLayoutType.WRAP_NONE,
                            behindDoc: BooleanNumber.TRUE,
                        },
                        'drawing-2': {
                            layoutType: PositionedObjectLayoutType.WRAP_NONE,
                            behindDoc: BooleanNumber.FALSE,
                        },
                    },
                    drawingsOrder: ['drawing-2', 'drawing-1'],
                }),
            })),
        } as never,
        {
            beforeCommandExecuted: vi.fn((handler) => {
                beforeHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
            onCommandExecuted: vi.fn((handler) => {
                executedHandlers.push(handler);
                return { dispose: vi.fn() };
            }),
        } as never,
        drawingManagerService as never,
        docDrawingService as never,
        {
            getRenderById: vi.fn(() => ({ scene: { getTransformerByCreate: () => ({ refreshControls }) } })),
            getRenderUnitById: vi.fn(() => ({ scene: { getTransformerByCreate: () => ({ refreshControls }) } })),
        } as never
    );

    return { controller, beforeHandlers, executedHandlers, drawingManagerService, docDrawingService, refreshControls };
}

describe('DocDrawingAddRemoveController', () => {
    it('mirrors added and removed doc drawings into drawing services when rich text mutates drawings', () => {
        const { controller, beforeHandlers, drawingManagerService, docDrawingService } = createController();
        const drawing = { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'drawing-1' };

        beforeHandlers[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-1',
                actions: [['drawings', 'drawing-1', { i: drawing }]],
            },
        });
        beforeHandlers[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-1',
                actions: [['drawings', 'drawing-1', { d: drawing }]],
            },
        });

        expect(docDrawingService.getBatchAddOp).toHaveBeenCalledWith([drawing]);
        expect(drawingManagerService.applyJson1).toHaveBeenCalledWith('doc-1', 'doc-1', 'add-op');
        expect(docDrawingService.applyJson1).toHaveBeenCalledWith('doc-1', 'doc-1', 'add-op');
        expect(drawingManagerService.addNotification).toHaveBeenCalledWith([{ drawingId: 'drawing-1' }]);
        expect(docDrawingService.addNotification).toHaveBeenCalledWith([{ drawingId: 'drawing-1' }]);

        expect(docDrawingService.getBatchRemoveOp).toHaveBeenCalledWith([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'drawing-1' }]);
        expect(drawingManagerService.removeNotification).toHaveBeenCalledWith([{ drawingId: 'drawing-1' }]);
        expect(docDrawingService.removeNotification).toHaveBeenCalledWith([{ drawingId: 'drawing-1' }]);

        controller.dispose();
    });

    it('updates drawing order and refreshes controls after reorder and undo commands', () => {
        const { controller, executedHandlers, drawingManagerService, docDrawingService, refreshControls } = createController();

        executedHandlers[0]({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-1',
                actions: ['drawingsOrder', [0, { d: 0 }], [1, { p: 0 }]],
            },
        });
        executedHandlers[1]({ id: UndoCommand.id });

        expect(drawingManagerService.setDrawingOrder).toHaveBeenCalledWith('doc-1', 'doc-1', ['drawing-1', 'drawing-2']);
        expect(docDrawingService.setDrawingOrder).toHaveBeenCalledWith('doc-1', 'doc-1', ['drawing-2', 'drawing-1']);
        expect(drawingManagerService.orderNotification).toHaveBeenCalledWith({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingIds: ['drawing-1', 'drawing-2'],
        });
        expect(docDrawingService.orderNotification).toHaveBeenCalledWith({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingIds: ['drawing-2', 'drawing-1'],
        });
        expect(refreshControls).toHaveBeenCalled();

        controller.dispose();
    });
});
