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

import {
    BooleanNumber,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    UndoCommand,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { TextWrappingStyle, UpdateDocDrawingWrappingStyleCommand } from '@univerjs/docs-drawing';
import { DocumentEditArea } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { DocDrawingAddRemoveController } from '../doc-drawing-notification.controller';

function createController() {
    const beforeHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
    const executedHandlers: Array<(command: { id: string; params?: unknown }) => void> = [];
    const refreshControls = vi.fn();
    const refreshDrawings = vi.fn();
    const drawing = {
        unitId: 'doc-1',
        subUnitId: 'doc-1',
        drawingId: 'drawing-1',
        layoutType: PositionedObjectLayoutType.WRAP_NONE,
        behindDoc: BooleanNumber.TRUE,
        docTransform: {
            size: { width: 100, height: 60 },
            angle: 0,
            positionH: { relativeFrom: ObjectRelativeFromH.MARGIN, posOffset: 1 },
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 2 },
        },
    };
    const skeleton = {
        getSkeletonData: () => ({
            pages: [{
                marginTop: 20,
                marginLeft: 30,
                marginBottom: 20,
                pageWidth: 600,
                pageHeight: 800,
                headerId: '',
                footerId: '',
                skeDrawings: new Map([['drawing-1', {
                    drawingId: 'drawing-1',
                    aLeft: 130,
                    aTop: 180,
                    columnLeft: 30,
                    lineTop: 150,
                    blockAnchorTop: 140,
                    drawingOrigin: drawing,
                }]]),
                skeTables: new Map(),
            }],
            skeHeaders: new Map(),
            skeFooters: new Map(),
        }),
    };
    const renderObject = {
        scene: { getTransformerByCreate: () => ({ refreshControls }) },
        with: () => ({
            getSkeleton: () => skeleton,
            getViewModel: () => ({ getEditArea: () => DocumentEditArea.BODY }),
        }),
    };
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
                getDrawings: () => ({
                    'drawing-1': drawing,
                    'drawing-2': {
                        layoutType: PositionedObjectLayoutType.WRAP_NONE,
                        behindDoc: BooleanNumber.FALSE,
                    },
                }),
                getSnapshot: () => ({
                    drawings: {
                        'drawing-1': drawing,
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
            getRenderById: vi.fn(() => renderObject),
            getRenderUnitById: vi.fn(() => renderObject),
        } as never,
        { refreshDrawings } as never
    );

    return {
        controller,
        beforeHandlers,
        executedHandlers,
        drawingManagerService,
        docDrawingService,
        drawing,
        refreshControls,
        refreshDrawings,
        skeleton,
    };
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
        executedHandlers.forEach((handler) => handler({ id: UndoCommand.id }));

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

    it('preserves skeleton position before wrapping changes and refreshes drawings afterward', () => {
        const {
            controller,
            beforeHandlers,
            executedHandlers,
            drawing,
            refreshControls,
            refreshDrawings,
            skeleton,
        } = createController();
        const params = {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawings: [{ drawingId: 'drawing-1' }],
            wrappingStyle: TextWrappingStyle.WRAP_SQUARE,
        };
        const command = { id: UpdateDocDrawingWrappingStyleCommand.id, params };

        beforeHandlers.forEach((handler) => handler(command));

        expect(params.drawings[0]).toMatchObject({
            drawingId: 'drawing-1',
            docTransform: {
                positionH: { relativeFrom: ObjectRelativeFromH.MARGIN, posOffset: 100 },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 40 },
            },
        });
        expect(drawing.docTransform).toMatchObject({
            positionH: { posOffset: 1 },
            positionV: { posOffset: 2 },
        });

        executedHandlers.forEach((handler) => handler(command));

        expect(refreshDrawings).toHaveBeenCalledWith(skeleton);
        expect(refreshControls).toHaveBeenCalled();
        controller.dispose();
    });
});
