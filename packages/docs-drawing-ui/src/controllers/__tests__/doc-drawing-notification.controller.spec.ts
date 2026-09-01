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

import type { DocumentDataModel, IDocumentData, JSONXActions } from '@univerjs/core';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import type { RenderUnit } from '@univerjs/engine-render';
import {
    BooleanNumber,
    DocumentFlavor,
    DrawingTypeEnum,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    JSONX,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    RedoCommand,
    UndoCommand,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import {
    DocLayoutExecutorService,
    DocSelectionManagerService,
    DocSkeletonManagerService,
    DocStateChangeManagerService,
    DocStateEmitService,
    RichTextEditingMutation,
} from '@univerjs/docs';
import {
    DocDrawingAdapterService,
    DocDrawingController,
    DocDrawingService,
    IDocDrawingAdapterService,
    IDocDrawingService,
    InsertDocDrawingCommand,
    RemoveDocDrawingCommand,
    TextWrappingStyle,
    UpdateDocDrawingWrappingStyleCommand,
    UpdateDrawingDocTransformCommand,
} from '@univerjs/docs-drawing';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocRefreshDrawingsService } from '../../services/doc-refresh-drawings.service';
import { DocDrawingAddRemoveController } from '../doc-drawing-notification.controller';

describe('DocDrawingAddRemoveController with real commands and services', () => {
    const unitId = 'drawing-notifications';
    let univer: Univer;
    let model: DocumentDataModel;
    let render: RenderUnit;
    let commands: ICommandService;
    let manager: IDrawingManagerService;
    let docDrawings: IDocDrawingService;
    let refresh: DocRefreshDrawingsService;

    function drawing(drawingId: string): IDocDrawing {
        return {
            unitId,
            subUnitId: unitId,
            drawingId,
            drawingType: DrawingTypeEnum.DRAWING_IMAGE,
            layoutType: PositionedObjectLayoutType.WRAP_NONE,
            behindDoc: drawingId === 'a' ? BooleanNumber.TRUE : BooleanNumber.FALSE,
            transform: { left: 20, top: 30, width: 40, height: 30 },
            docTransform: {
                size: { width: 40, height: 30 },
                angle: 0,
                positionH: { relativeFrom: ObjectRelativeFromH.MARGIN, posOffset: 20 },
                positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 30 },
            },
        };
    }

    beforeEach(() => {
        const context = new Proxy({
            font: '',
            webkitBackingStorePixelRatio: 1,
            measureText: (text: string) => ({
                width: text.length * 8,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 2,
                fontBoundingBoxAscent: 8,
                fontBoundingBoxDescent: 2,
            }),
        }, { get: (target, key) => key in target ? Reflect.get(target, key) : () => {} });
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([IDrawingManagerService, { useClass: DrawingManagerService }]);
        injector.add([IDocDrawingService, { useClass: DocDrawingService }]);
        injector.add([IDocDrawingAdapterService, { useClass: DocDrawingAdapterService }]);
        injector.add([DocLayoutExecutorService]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocStateEmitService]);
        injector.add([DocStateChangeManagerService]);
        injector.add([DocRefreshDrawingsService]);
        injector.add([DocDrawingController]);
        injector.add([DocDrawingAddRemoveController]);
        commands = injector.get(ICommandService);
        commands.registerCommand(RichTextEditingMutation);
        injector.get(IUndoRedoService);
        injector.get(DocStateChangeManagerService);
        const drawingController = injector.get(DocDrawingController);
        model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: unitId,
            body: {
                dataStream: 'A\b\rB\b\r\n',
                paragraphs: [{ startIndex: 2, paragraphId: 'p1' }, { startIndex: 5, paragraphId: 'p2' }],
                sectionBreaks: [{ startIndex: 6, sectionId: 's1' }],
                customBlocks: [{ startIndex: 1, blockId: 'a' }, { startIndex: 4, blockId: 'b' }],
            },
            drawings: { a: drawing('a'), b: drawing('b') },
            drawingsOrder: ['a', 'b'],
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                autoHyphenation: BooleanNumber.FALSE,
                pageSize: { width: 300, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        injector.get(IUniverInstanceService).setCurrentUnitForType(unitId);
        injector.get(IUniverInstanceService).focusUnit(unitId);
        render = injector.get(IRenderManagerService).createRender(unitId) as RenderUnit;
        render.deactivate();
        render.addRenderDependencies([[DocSkeletonManagerService]]);
        render.with(DocSkeletonManagerService);
        drawingController.loadDrawingDataForUnit(unitId);
        manager = injector.get(IDrawingManagerService);
        docDrawings = injector.get(IDocDrawingService);
        refresh = injector.get(DocRefreshDrawingsService);
        injector.get(DocDrawingAddRemoveController);
    });

    afterEach(() => {
        univer?.dispose();
        vi.restoreAllMocks();
    });

    function mutate(actions: JSONXActions): void {
        commands.syncExecuteCommand(RichTextEditingMutation.id, { unitId, actions, textRanges: null });
    }

    function resize(): void {
        expect(commands.syncExecuteCommand(UpdateDrawingDocTransformCommand.id, {
            unitId,
            subUnitId: unitId,
            drawings: [{ drawingId: 'a', key: 'size', value: { width: 60, height: 45 } }],
        })).toBe(true);
    }

    it('keeps unrelated rendered positions and visibility when one drawing is resized', () => {
        manager.refreshTransform([{ ...drawing('b'), hidden: true, transform: { left: 420, top: 880, width: 40, height: 30 } }]);
        const before = manager.getDrawingByParam({ unitId, subUnitId: unitId, drawingId: 'b' });
        const order = manager.getDrawingOrder(unitId, unitId);
        resize();
        expect(model.getDrawings()!.a.docTransform.size).toEqual({ width: 60, height: 45 });
        expect(manager.getDrawingByParam({ unitId, subUnitId: unitId, drawingId: 'b' })).toBe(before);
        expect(before).toMatchObject({ hidden: true, transform: { left: 420, top: 880 } });
        expect(manager.getDrawingOrder(unitId, unitId)).toBe(order);
    });

    it('does not write layout-only transforms into the persisted drawing snapshot after a resize', () => {
        resize();
        const original = { ...model.getDrawings()!.a.transform };
        manager.refreshTransform([{ ...drawing('a'), transform: { left: 720, top: 990, width: 60, height: 45 } }]);
        expect(model.getDrawings()!.a.transform).toEqual(original);
    });

    it('keeps a thousand-drawing document stable during repeated single-image resizing', ({ task }) => {
        const extraDrawings = Array.from({ length: 998 }, (_, index) => drawing(`extra-${index}`));
        expect(commands.syncExecuteCommand(InsertDocDrawingCommand.id, {
            unitId,
            drawings: extraDrawings,
            textRange: { startOffset: 0, endOffset: 0 },
        })).toBe(true);
        const original = manager.getDrawingByParam({ unitId, subUnitId: unitId, drawingId: 'extra-997' });
        const order = manager.getDrawingOrder(unitId, unitId);
        const mutationMs: number[] = [];
        for (let index = 0; index < 20; index++) {
            const start = performance.now();
            commands.syncExecuteCommand(UpdateDrawingDocTransformCommand.id, {
                unitId,
                subUnitId: unitId,
                drawings: [{ drawingId: 'a', key: 'size', value: { width: 60 + index, height: 45 } }],
            });
            mutationMs.push(performance.now() - start);
        }
        Object.assign(task.meta, { drawingCount: 1000, mutationMs });
        expect(Object.keys(model.getDrawings()!)).toHaveLength(1000);
        expect(model.getDrawings()!.a.docTransform.size.width).toBe(79);
        expect(manager.getDrawingByParam({ unitId, subUnitId: unitId, drawingId: 'extra-997' })).toBe(original);
        expect(manager.getDrawingOrder(unitId, unitId)).toBe(order);
    });

    it('mirrors actual drawing insertion and removal and emits their notifications', () => {
        const added = vi.fn();
        const removed = vi.fn();
        const addSubscription = manager.add$.subscribe(added);
        const removeSubscription = manager.remove$.subscribe(removed);
        expect(commands.syncExecuteCommand(InsertDocDrawingCommand.id, {
            unitId,
            drawings: [drawing('c')],
            textRange: { startOffset: 0, endOffset: 0 },
        })).toBe(true);
        expect(manager.getDrawingByParam({ unitId, subUnitId: unitId, drawingId: 'c' })).toBeDefined();
        expect(added).toHaveBeenCalled();
        expect(commands.syncExecuteCommand(RemoveDocDrawingCommand.id, {
            unitId,
            drawings: [{ unitId, subUnitId: unitId, drawingId: 'c', drawingType: DrawingTypeEnum.DRAWING_IMAGE }],
            textRange: { startOffset: 0, endOffset: 0 },
        })).toBe(true);
        expect(manager.getDrawingByParam({ unitId, subUnitId: unitId, drawingId: 'c' })).toBeUndefined();
        expect(docDrawings.getDrawingByParam({ unitId, subUnitId: unitId, drawingId: 'c' })).toBeUndefined();
        expect(removed).toHaveBeenCalled();
        addSubscription.unsubscribe();
        removeSubscription.unsubscribe();
    });

    it('updates persisted order and keeps behind-text drawings below foreground drawings', () => {
        mutate(JSONX.getInstance().moveOp(['drawingsOrder', 0], ['drawingsOrder', 1]));
        expect(docDrawings.getDrawingOrder(unitId, unitId)).toEqual(['b', 'a']);
        expect(manager.getDrawingOrder(unitId, unitId)).toEqual(['a', 'b']);
    });

    it('still rebuilds render order when wrapping changes the behind-text layer', () => {
        mutate(JSONX.getInstance().moveOp(['drawingsOrder', 0], ['drawingsOrder', 1]));
        expect(manager.getDrawingOrder(unitId, unitId)).toEqual(['a', 'b']);
        expect(commands.syncExecuteCommand(UpdateDocDrawingWrappingStyleCommand.id, {
            unitId,
            subUnitId: unitId,
            drawings: [{ drawingId: 'a' }],
            wrappingStyle: TextWrappingStyle.IN_FRONT_OF_TEXT,
        })).toBe(true);
        expect(manager.getDrawingOrder(unitId, unitId)).toEqual(['b', 'a']);
        expect(docDrawings.getDrawingOrder(unitId, unitId)).toEqual(['b', 'a']);
    });

    it('removes optional metadata from current data while retaining it for old-state comparisons', () => {
        mutate(JSONX.getInstance().insertOp(['drawings', 'a', 'description'], 'caption'));
        mutate(JSONX.getInstance().removeOp(['drawings', 'a', 'description'], 'caption'));
        const search = { unitId, subUnitId: unitId, drawingId: 'a' };
        expect(manager.getDrawingByParam(search)).not.toHaveProperty('description');
        expect(manager.getOldDrawingByParam(search)).toHaveProperty('description', 'caption');
    });

    it('refreshes drawing positions before controls on actual undo and redo', async () => {
        manager.focusDrawing([{ unitId, subUnitId: unitId, drawingId: 'a' }]);
        resize();
        const refreshDrawings = vi.spyOn(refresh, 'refreshDrawings');
        const refreshControls = vi.spyOn(render.scene.getTransformerByCreate(), 'refreshControls');
        for (const [commandId, expectedWidth] of [[UndoCommand.id, 40], [RedoCommand.id, 60]] as const) {
            refreshDrawings.mockClear();
            refreshControls.mockClear();
            expect(await commands.executeCommand(commandId)).toBe(true);
            expect(model.getDrawings()!.a.docTransform.size.width).toBe(expectedWidth);
            expect(refreshDrawings).toHaveBeenCalledWith(render.with(DocSkeletonManagerService).getSkeleton());
            expect(refreshDrawings.mock.invocationCallOrder[0]).toBeLessThan(refreshControls.mock.invocationCallOrder[0]);
        }
    });

    it('preserves the resolved anchor when changing wrapping and refreshes the drawing afterward', () => {
        const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
        const page = skeleton.getSkeletonData()!.pages[0];
        const anchor = page.skeDrawings.get('a')!;
        expect(anchor).toBeDefined();
        const expectedLeft = anchor.aLeft - page.marginLeft;
        const expectedTop = anchor.aTop - anchor.blockAnchorTop;
        const refreshDrawings = vi.spyOn(refresh, 'refreshDrawings');
        expect(commands.syncExecuteCommand(UpdateDocDrawingWrappingStyleCommand.id, {
            unitId,
            subUnitId: unitId,
            drawings: [{ drawingId: 'a' }],
            wrappingStyle: TextWrappingStyle.WRAP_SQUARE,
        })).toBe(true);
        expect(model.getDrawings()!.a.docTransform).toMatchObject({
            positionH: { posOffset: expectedLeft },
            positionV: { posOffset: expectedTop },
        });
        expect(refreshDrawings).toHaveBeenCalledWith(skeleton);
    });
});
