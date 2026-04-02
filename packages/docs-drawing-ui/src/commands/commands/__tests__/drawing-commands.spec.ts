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
import { ArrangeTypeEnum, Direction, ICommandService, IUniverInstanceService, JSONX, PositionedObjectLayoutType, WrapTextType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { DocRefreshDrawingsService } from '../../../services/doc-refresh-drawings.service';
import { DeleteDocDrawingsCommand } from '../delete-doc-drawing.command';
import { InsertDocDrawingCommand } from '../insert-doc-drawing.command';
import { MoveDocDrawingsCommand } from '../move-drawings.command';
import { RemoveDocDrawingCommand } from '../remove-doc-drawing.command';
import { SetDocDrawingArrangeCommand } from '../set-drawing-arrange.command';
import {
    IMoveInlineDrawingCommand,
    TextWrappingStyle,
    UpdateDocDrawingDistanceCommand,
    UpdateDocDrawingWrappingStyleCommand,
    UpdateDocDrawingWrapTextCommand,
    UpdateDrawingDocTransformCommand,
} from '../update-doc-drawing.command';

function createAccessor() {
    const commandService = { syncExecuteCommand: vi.fn(() => true), executeCommand: vi.fn(() => true) };
    const refreshControls = vi.fn();
    const selectionRenderService = {
        getSegment: vi.fn(() => ''),
        setSegment: vi.fn(),
        setSegmentPage: vi.fn(),
    };
    const docDrawingService = {
        getForwardDrawingsOp: vi.fn(() => ({ redo: ['r1', 'r2', 'r3', 'move-forward'], undo: ['undo'], objects: ['shape-1'] })),
        getBackwardDrawingOp: vi.fn(() => ({ redo: ['r1', 'r2', 'r3', 'move-backward'], undo: ['undo'], objects: ['shape-1'] })),
        getFrontDrawingsOp: vi.fn(() => ({ redo: ['r1', 'r2', 'r3', 'move-front'], undo: ['undo'], objects: ['shape-1'] })),
        getBackDrawingsOp: vi.fn(() => ({ redo: ['r1', 'r2', 'r3', 'move-back'], undo: ['undo'], objects: ['shape-1'] })),
        getFocusDrawings: vi.fn(() => [{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-1', drawingType: 'drawing' }]),
    };
    const docRefreshDrawingsService = {
        refreshDrawings: vi.fn(),
    };
    const renderManagerService = {
        getRenderById: vi.fn(() => ({
            scene: { getTransformerByCreate: () => ({ refreshControls }) },
            with: (token: unknown) => {
                if (token === DocSkeletonManagerService) {
                    return {
                        getSkeleton: () => ({
                            getSkeletonData: () => ({
                                pages: [],
                                skeHeaders: new Map(),
                                skeFooters: new Map(),
                            }),
                        }),
                        getViewModel: () => ({
                            getEditArea: () => DocumentEditArea.BODY,
                        }),
                    };
                }

                return selectionRenderService;
            },
        })),
    };
    const currentDocument = {
        getUnitId: vi.fn(() => 'doc-1'),
        getSelfOrHeaderFooterModel: vi.fn(() => ({
            getBody: () => ({ dataStream: 'abc\b\r\n', customBlocks: [{ blockId: 'shape-1', startIndex: 3 }] }),
        })),
        getSnapshot: vi.fn(() => ({
            drawingsOrder: ['shape-1'],
            drawings: {
                'shape-1': {
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    behindDoc: 0,
                    wrapText: WrapTextType.BOTH_SIDES,
                    distT: 1,
                    distB: 1,
                    distL: 1,
                    distR: 1,
                    docTransform: { positionH: { posOffset: 1 }, positionV: { posOffset: 2 } },
                },
            },
        })),
        getDrawings: vi.fn(() => ({ 'shape-1': { id: 'shape-1' } })),
        getDrawingsOrder: vi.fn(() => ['shape-1']),
    };
    const univerInstanceService = {
        getCurrentUniverDocInstance: vi.fn(() => currentDocument),
        getUniverDocInstance: vi.fn(() => ({
            getSnapshot: () => ({
                drawings: {
                    'shape-1': {
                        layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                        docTransform: { positionH: { posOffset: 1 }, positionV: { posOffset: 2 } },
                    },
                    'inline-1': {
                        layoutType: PositionedObjectLayoutType.INLINE,
                        docTransform: { positionH: { posOffset: 1 }, positionV: { posOffset: 2 } },
                    },
                },
            }),
        })),
    };
    const docSelectionManagerService = {
        getActiveTextRange: vi.fn(() => ({ collapsed: true, startOffset: 1, segmentId: '' })),
    };

    return {
        accessor: {
            get(token: unknown) {
                if (token === ICommandService) {
                    return commandService;
                }

                if (token === IDocDrawingService) {
                    return docDrawingService;
                }

                if (token === IRenderManagerService) {
                    return renderManagerService;
                }

                if (token === IUniverInstanceService) {
                    return univerInstanceService;
                }

                if (token === DocSelectionManagerService) {
                    return docSelectionManagerService;
                }

                if (token === DocRefreshDrawingsService) {
                    return docRefreshDrawingsService;
                }

                throw new Error(`Unknown dependency: ${String(token)}`);
            },
        } as IAccessor,
        commandService,
        currentDocument,
        docDrawingService,
        docSelectionManagerService,
        refreshControls,
        selectionRenderService,
        docRefreshDrawingsService,
    };
}

describe('docs drawing commands', () => {
    it('arranges drawings by converting drawing order ops into rich-text mutations', () => {
        const composeSpy = vi.spyOn(JSONX, 'compose').mockReturnValue(['composed'] as never);
        const { accessor, commandService } = createAccessor();

        expect(SetDocDrawingArrangeCommand.handler(accessor, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawingIds: ['shape-1'],
            arrangeType: ArrangeTypeEnum.forward,
        })).toBe(true);
        expect(composeSpy).toHaveBeenCalled();
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(RichTextEditingMutation.id, {
            unitId: 'doc-1',
            actions: ['composed'],
            textRanges: null,
        });
    });

    it('removes focused drawings and delegates deletion to the remove command', async () => {
        const { accessor, commandService, docDrawingService } = createAccessor();
        expect(await DeleteDocDrawingsCommand.handler(accessor)).toBe(true);
        expect(commandService.executeCommand).toHaveBeenCalledWith('doc.command.remove-doc-image', {
            unitId: 'doc-1',
            drawings: [{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-1', drawingType: 'drawing' }],
        });

        docDrawingService.getFocusDrawings.mockReturnValue([]);
        expect(await DeleteDocDrawingsCommand.handler(accessor)).toBe(false);
    });

    it('builds rich-text removal mutations and moves floating drawings with keyboard nudges', () => {
        const { accessor, commandService, docDrawingService } = createAccessor();
        expect(RemoveDocDrawingCommand.handler(accessor, {
            unitId: 'doc-1',
            drawings: [{ unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-1' }],
        } as never)).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(RichTextEditingMutation.id, expect.objectContaining({
            unitId: 'doc-1',
            textRanges: [{ startOffset: 3, endOffset: 3 }],
        }));

        docDrawingService.getFocusDrawings.mockReturnValue([
            { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'shape-1', drawingType: 'drawing' },
            { unitId: 'doc-1', subUnitId: 'doc-1', drawingId: 'inline-1', drawingType: 'drawing' },
        ]);
        expect(MoveDocDrawingsCommand.handler(accessor, { direction: Direction.RIGHT })).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(UpdateDrawingDocTransformCommand.id, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawings: [{ drawingId: 'shape-1', key: 'positionH', value: { posOffset: 3 } }],
        });
    });

    it('inserts drawing placeholders into the active document selection', () => {
        const composeSpy = vi.spyOn(JSONX, 'compose').mockReturnValue(['insert-composed'] as never);
        const editOp = vi.fn(() => ['edit-op']);
        const insertOp = vi.fn((path, value) => ({ path, value }));
        vi.spyOn(JSONX, 'getInstance').mockReturnValue({
            editOp,
            insertOp,
            removeOp: vi.fn(),
        } as never);
        const { accessor, commandService } = createAccessor();

        expect(InsertDocDrawingCommand.handler(accessor, {
            drawings: [{ drawingId: 'shape-2', unitId: 'doc-1', subUnitId: 'doc-1' }],
        } as never)).toBe(true);
        expect(editOp).toHaveBeenCalledTimes(1);
        expect(insertOp).toHaveBeenCalledWith(['drawings', 'shape-2'], expect.objectContaining({ drawingId: 'shape-2' }));
        expect(composeSpy).toHaveBeenCalled();
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(RichTextEditingMutation.id, {
            unitId: 'doc-1',
            actions: ['insert-composed'],
            textRanges: [],
        });
    });

    it('returns false when inserting drawings without an active text range', () => {
        const { accessor, commandService, docSelectionManagerService } = createAccessor();
        docSelectionManagerService.getActiveTextRange.mockReturnValue(null as never);

        expect(InsertDocDrawingCommand.handler(accessor, {
            drawings: [{ drawingId: 'shape-2', unitId: 'doc-1', subUnitId: 'doc-1' }],
        } as never)).toBe(false);
        expect(commandService.syncExecuteCommand).not.toHaveBeenCalled();
    });

    it('updates wrapping style, wrap distance, and wrap text through rich-text mutations', () => {
        const { accessor, commandService, refreshControls } = createAccessor();
        const replaceOp = vi.fn(() => ['replace-op']);
        vi.spyOn(JSONX, 'getInstance').mockReturnValue({
            replaceOp,
            editOp: vi.fn(),
            insertOp: vi.fn(),
            removeOp: vi.fn(),
        } as never);

        expect(UpdateDocDrawingWrappingStyleCommand.handler(accessor, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawings: [{ drawingId: 'shape-1' }],
            wrappingStyle: TextWrappingStyle.BEHIND_TEXT,
        } as never)).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(RichTextEditingMutation.id, expect.objectContaining({
            unitId: 'doc-1',
            textRanges: null,
        }));
        expect(refreshControls).toHaveBeenCalledTimes(1);

        expect(UpdateDocDrawingDistanceCommand.handler(accessor, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawings: [{ drawingId: 'shape-1' }],
            dist: { distT: 4, distB: 5, distL: 6, distR: 7 },
        } as never)).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenLastCalledWith(RichTextEditingMutation.id, expect.objectContaining({
            unitId: 'doc-1',
            textRanges: null,
        }));

        expect(UpdateDocDrawingWrapTextCommand.handler(accessor, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawings: [{ drawingId: 'shape-1' }],
            wrapText: WrapTextType.RIGHT,
        } as never)).toBe(true);
        expect(commandService.syncExecuteCommand).toHaveBeenLastCalledWith(RichTextEditingMutation.id, expect.objectContaining({
            unitId: 'doc-1',
            textRanges: null,
        }));
        expect(replaceOp).toHaveBeenCalled();
    });

    it('moves an inline drawing by rebuilding its custom block location', () => {
        const composeSpy = vi.spyOn(JSONX, 'compose').mockReturnValue(['inline-composed'] as never);
        const editOp = vi.fn(() => ['edit-op']);
        vi.spyOn(JSONX, 'getInstance').mockReturnValue({
            replaceOp: vi.fn(),
            editOp,
            insertOp: vi.fn(),
            removeOp: vi.fn(),
        } as never);

        const { accessor, commandService, refreshControls, selectionRenderService } = createAccessor();

        expect(IMoveInlineDrawingCommand.handler(accessor, {
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            drawing: { drawingId: 'shape-1' },
            offset: 1,
            segmentId: '',
            segmentPage: 0,
        } as never)).toBe(true);

        expect(editOp).toHaveBeenCalled();
        expect(composeSpy).toHaveBeenCalled();
        expect(commandService.syncExecuteCommand).toHaveBeenCalledWith(RichTextEditingMutation.id, {
            unitId: 'doc-1',
            actions: ['inline-composed'],
            textRanges: null,
        });
        expect(selectionRenderService.setSegment).not.toHaveBeenCalled();
        expect(refreshControls).toHaveBeenCalled();
    });
});
