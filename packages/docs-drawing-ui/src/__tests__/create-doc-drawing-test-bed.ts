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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import type { RenderUnit } from '@univerjs/engine-render';
import {
    BooleanNumber,
    DocumentFlavor,
    DrawingTypeEnum,
    ICommandService,
    IUndoRedoService,
    IUniverInstanceService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
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
} from '@univerjs/docs-drawing';
import { DrawingManagerService, IDrawingManagerService } from '@univerjs/drawing';
import {
    CanvasColorService,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
} from '@univerjs/engine-render';
import { vi } from 'vitest';
import { DocDrawingAddRemoveController } from '../controllers/doc-drawing-notification.controller';
import { DocRefreshDrawingsService } from '../services/doc-refresh-drawings.service';

export function createDocDrawing(unitId: string, drawingId: string): IDocDrawing {
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

export function createDocDrawingTestBed(unitId: string): { univer: Univer; model: DocumentDataModel; render: RenderUnit } {
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
    const univer = new Univer();
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
    const commands = injector.get(ICommandService);
    commands.registerCommand(RichTextEditingMutation);
    injector.get(IUndoRedoService);
    injector.get(DocStateChangeManagerService);
    const drawingController = injector.get(DocDrawingController);
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: unitId,
        body: {
            dataStream: 'A\b\rB\b\r\n',
            paragraphs: [{ startIndex: 2, paragraphId: 'p1' }, { startIndex: 5, paragraphId: 'p2' }],
            sectionBreaks: [{ startIndex: 6, sectionId: 's1' }],
            customBlocks: [{ startIndex: 1, blockId: 'a' }, { startIndex: 4, blockId: 'b' }],
        },
        drawings: { a: createDocDrawing(unitId, 'a'), b: createDocDrawing(unitId, 'b') },
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
    const render = injector.get(IRenderManagerService).createRender(unitId) as RenderUnit;
    render.deactivate();
    render.addRenderDependencies([[DocSkeletonManagerService]]);
    render.with(DocSkeletonManagerService);
    drawingController.loadDrawingDataForUnit(unitId);
    injector.get(DocDrawingAddRemoveController);
    return { univer, model, render };
}
