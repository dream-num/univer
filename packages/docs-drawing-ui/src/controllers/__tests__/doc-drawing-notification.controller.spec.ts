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

import { RedoCommand, UndoCommand } from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { describe, expect, it, vi } from 'vitest';
import { DocDrawingAddRemoveController } from '../doc-drawing-notification.controller';

describe('DocDrawingAddRemoveController', () => {
    it('applies add and remove notifications before rich-text mutations execute', () => {
        let beforeHandler: ((command: { id: string; params: unknown }) => void) | undefined;
        const drawingManagerService = {
            applyJson1: vi.fn(),
            addNotification: vi.fn(),
            removeNotification: vi.fn(),
        };
        const docDrawingService = {
            getBatchAddOp: vi.fn(() => ({ subUnitId: 'doc-1', redo: ['add-redo'], objects: [{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-1' }] })),
            getBatchRemoveOp: vi.fn(() => ({ subUnitId: 'doc-1', redo: ['remove-redo'], objects: [{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-2' }] })),
            applyJson1: vi.fn(),
            addNotification: vi.fn(),
            removeNotification: vi.fn(),
        };

        const controller = new DocDrawingAddRemoveController(
            {} as never,
            {
                beforeCommandExecuted: vi.fn((handler) => {
                    beforeHandler = handler;
                    return { dispose: vi.fn() };
                }),
                onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
            } as never,
            drawingManagerService as never,
            docDrawingService as never,
            {} as never
        );

        expect(controller).toBeTruthy();

        beforeHandler!({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-1',
                actions: [['drawings', 'shape-1', { i: { drawingId: 'shape-1', unitId: 'doc-1', subUnitId: 'doc-1' } }]],
            },
        });
        beforeHandler!({
            id: RichTextEditingMutation.id,
            params: {
                unitId: 'doc-1',
                actions: [['drawings', 'shape-2', { d: { drawingId: 'shape-2' } }]],
            },
        });

        expect(docDrawingService.getBatchAddOp).toHaveBeenCalledWith([
            expect.objectContaining({ drawingId: 'shape-1', unitId: 'doc-1', subUnitId: 'doc-1' }),
        ]);
        expect(docDrawingService.getBatchRemoveOp).toHaveBeenCalledWith([
            { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-2' },
        ]);
        expect(drawingManagerService.applyJson1).toHaveBeenNthCalledWith(1, 'doc-1', 'doc-1', ['add-redo']);
        expect(docDrawingService.applyJson1).toHaveBeenNthCalledWith(2, 'doc-1', 'doc-1', ['remove-redo']);
        expect(drawingManagerService.addNotification).toHaveBeenCalledWith([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-1' }]);
        expect(docDrawingService.removeNotification).toHaveBeenCalledWith([{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-2' }]);
    });

    it('updates drawing order after reorder mutations and refreshes transformers on undo redo', () => {
        const onHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
        const refreshControls = vi.fn();
        const drawingManagerService = {
            setDrawingOrder: vi.fn(),
            orderNotification: vi.fn(),
            getFocusDrawings: vi.fn(() => [{ drawingId: 'shape-1' }]),
        };
        const docDrawingService = {
            setDrawingOrder: vi.fn(),
            orderNotification: vi.fn(),
        };

        const controller = new DocDrawingAddRemoveController(
            {
                getUniverDocInstance: vi.fn(() => ({ getSnapshot: vi.fn(() => ({ drawingsOrder: ['shape-2', 'shape-1'] })) })),
                getCurrentUniverDocInstance: vi.fn(() => ({ getUnitId: vi.fn(() => 'doc-1') })),
            } as never,
            {
                beforeCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })),
                onCommandExecuted: vi.fn((handler) => {
                    onHandlers.push(handler);
                    return { dispose: vi.fn() };
                }),
            } as never,
            drawingManagerService as never,
            docDrawingService as never,
            {
                getRenderById: vi.fn(() => ({
                    scene: { getTransformerByCreate: vi.fn(() => ({ refreshControls })) },
                })),
            } as never
        );

        expect(controller).toBeTruthy();

        onHandlers.forEach((handler) => {
            handler({
                id: RichTextEditingMutation.id,
                params: { unitId: 'doc-1', actions: ['drawingsOrder', [0, { d: 0 }], [1, { p: 0 }]] },
            });
        });

        expect(drawingManagerService.setDrawingOrder).toHaveBeenCalledWith('doc-1', 'doc-1', ['shape-2', 'shape-1']);
        expect(docDrawingService.orderNotification).toHaveBeenCalledWith({ unitId: 'doc-1', subUnitId: 'doc-1', drawingIds: ['shape-2', 'shape-1'] });

        onHandlers.forEach((handler) => handler({ id: UndoCommand.id }));
        onHandlers.forEach((handler) => handler({ id: RedoCommand.id }));
        expect(refreshControls).toHaveBeenCalledTimes(2);
    });
});
