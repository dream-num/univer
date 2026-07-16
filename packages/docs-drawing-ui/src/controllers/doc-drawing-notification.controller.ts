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

/* eslint-disable ts/no-explicit-any */

import type { DocumentDataModel, ICommandInfo, IDrawingSearch, JSONXActions, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawing, IUpdateDocDrawingWrappingStyleParams, IUpdateDrawingDocTransformCommandParams } from '@univerjs/docs-drawing';
import type { IDrawingJsonUndo1, IDrawingMapItemData, IDrawingOrderMapParam } from '@univerjs/drawing';
import type { IDocumentSkeletonDrawing, IDocumentSkeletonHeaderFooter, IDocumentSkeletonPage } from '@univerjs/engine-render';
import {
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    JSONX,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    RedoCommand,
    UndoCommand,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import {
    getDocDrawingRenderOrder,
    IDocDrawingService,
    TextWrappingStyle,
    UpdateDocDrawingWrappingStyleCommand,
    UpdateDrawingDocTransformCommand,
} from '@univerjs/docs-drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { DocumentEditArea, IRenderManagerService } from '@univerjs/engine-render';
import { DocRefreshDrawingsService } from '../services/doc-refresh-drawings.service';

interface IAddOrRemoveDrawing {
    type: 'add' | 'remove';
    drawingId: string;
    drawing?: IDocDrawing;
}

interface IDrawingAnchorInPage {
    skeDrawing: IDocumentSkeletonDrawing;
    pageMarginTop: number;
    pageMarginLeft: number;
}

function findDrawingAnchorInPage(
    page: IDocumentSkeletonPage | IDocumentSkeletonHeaderFooter,
    drawingId: string,
    pageMarginTop: number,
    pageMarginLeft: number
): IDrawingAnchorInPage | null {
    const skeDrawing = page.skeDrawings.get(drawingId);
    if (skeDrawing) {
        return { skeDrawing, pageMarginTop, pageMarginLeft };
    }

    for (const table of page.skeTables.values()) {
        for (const row of table.rows) {
            for (const cell of row.cells) {
                const cellAnchor = findDrawingAnchorInPage(cell, drawingId, cell.marginTop, cell.marginLeft);
                if (cellAnchor) {
                    return cellAnchor;
                }
            }
        }
    }

    return null;
}

// Check whether drawings are added or deleted from the mutation and obtain the drawing ID.
// eslint-disable-next-line complexity
function getAddOrRemoveDrawings(actions: JSONXActions): Nullable<IAddOrRemoveDrawing[]> {
    if (JSONX.isNoop(actions) || !Array.isArray(actions)) {
        return null;
    }
    const drawingsOp = actions.find((action) => Array.isArray(action) && action?.[0] === 'drawings');

    if (drawingsOp == null || !Array.isArray(drawingsOp) || drawingsOp.length < 3) {
        return null;
    }

    if (typeof drawingsOp[1] === 'string' && typeof drawingsOp[2] !== 'object') {
        return null;
    }

    if (Array.isArray(drawingsOp[1]) && typeof drawingsOp[1][1] !== 'object') {
        return null;
    }

    const drawings: IAddOrRemoveDrawing[] = [];

    if (Array.isArray(drawingsOp?.[1])) {
        for (const op of drawingsOp) {
            if (Array.isArray(op)) {
                drawings.push({
                    type: (op?.[1] as any)?.i ? 'add' : 'remove',
                    drawingId: op?.[0] as string,
                    drawing: (op?.[1] as any)?.i,
                });
            }
        }
    } else {
        drawings.push({
            type: (drawingsOp[2] as any)?.i ? 'add' : 'remove',
            drawingId: drawingsOp[1] as string,
            drawing: (drawingsOp[2] as any)?.i,
        });
    }

    return drawings;
}

// ReOrderedActions data like bellow:
// [
//     "drawingsOrder",
//     [  4,
//         {
//             "d": 0
//         }
//     ],
//     [  5,
//         {
//             "p": 0
//         }
//     ]
// ]
function getReOrderedDrawings(actions: JSONXActions): number[] {
    if (!Array.isArray(actions) || actions.length < 3 || actions[0] !== 'drawingsOrder') {
        return [];
    }

    const drawingIndexes: number[] = [];

    for (let i = 1; i < actions.length; i++) {
        const action = actions[i];
        if (Array.isArray(action) && typeof action[0] === 'number' && typeof action[1] === 'object') {
            drawingIndexes.push(action[0]);
        } else {
            drawingIndexes.length = 0;
            break;
        }
    }

    return drawingIndexes;
}

function collectUpdatedDrawingIds(actions: JSONXActions, drawingIds = new Set<string>()): Set<string> {
    if (JSONX.isNoop(actions) || !Array.isArray(actions)) {
        return drawingIds;
    }

    if (actions[0] === 'drawings') {
        const drawingKeyOrOps = actions[1];
        if (typeof drawingKeyOrOps === 'string') {
            drawingIds.add(drawingKeyOrOps);
            return drawingIds;
        }

        actions.slice(1).forEach((action) => {
            if (Array.isArray(action) && typeof action[0] === 'string') {
                drawingIds.add(action[0]);
            }
        });
        return drawingIds;
    }

    actions.forEach((action) => {
        if (Array.isArray(action)) {
            collectUpdatedDrawingIds(action as JSONXActions, drawingIds);
        }
    });

    return drawingIds;
}

export class DocDrawingAddRemoveController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocRefreshDrawingsService) private readonly _docRefreshDrawingsService: DocRefreshDrawingsService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._commandExecutedListener();
    }

    // eslint-disable-next-line max-lines-per-function
    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id !== RichTextEditingMutation.id) {
                    return;
                }

                const params = command.params as IRichTextEditingMutationParams;
                const { unitId, actions, isSync, syncer } = params;

                const addOrRemoveDrawings = getAddOrRemoveDrawings(actions);
                if (addOrRemoveDrawings != null) {
                    for (const { type, drawingId, drawing } of addOrRemoveDrawings) {
                        if (isSync && drawing?.unitId === syncer) {
                            continue;
                        }

                        if (type === 'add') {
                            this._addDrawings(unitId, [drawing!]);
                        } else {
                            this._removeDrawings(unitId, [drawingId]);
                        }
                    }
                }
            })
        );

        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id !== UpdateDocDrawingWrappingStyleCommand.id) {
                    return;
                }

                this._preserveWrappingStylePosition(command.params as IUpdateDocDrawingWrappingStyleParams);
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== RichTextEditingMutation.id) {
                    return;
                }

                const params = command.params as IRichTextEditingMutationParams;
                const { unitId, actions } = params;
                const reOrderedDrawings = getReOrderedDrawings(actions);

                if (reOrderedDrawings.length > 0) {
                    this._updateDrawingsOrder(unitId);
                }

                const updatedDrawingIds = [...collectUpdatedDrawingIds(actions)];
                if (updatedDrawingIds.length > 0) {
                    this._syncDrawingDataFromSnapshot(unitId, updatedDrawingIds);
                }
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (
                    command.id !== UpdateDrawingDocTransformCommand.id &&
                    command.id !== UpdateDocDrawingWrappingStyleCommand.id
                ) {
                    return;
                }

                const { unitId } = command.params as IUpdateDrawingDocTransformCommandParams | IUpdateDocDrawingWrappingStyleParams;
                const renderObject = this._renderManagerService.getRenderById(unitId);
                const scene = renderObject?.scene;
                if (renderObject == null || scene == null) {
                    return;
                }

                this._docRefreshDrawingsService.refreshDrawings(renderObject.with(DocSkeletonManagerService).getSkeleton());
                scene.getTransformerByCreate().refreshControls();
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== UndoCommand.id && command.id !== RedoCommand.id) {
                    return;
                }

                const unitId = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)?.getUnitId();
                const focusedDrawings = this._drawingManagerService.getFocusDrawings();

                if (unitId == null || focusedDrawings.length === 0) {
                    return;
                }

                const renderObject = this._renderManagerService.getRenderUnitById(unitId);
                const scene = renderObject?.scene;
                if (scene == null) {
                    return false;
                }
                const transformer = scene.getTransformerByCreate();

                transformer.refreshControls();
            })
        );
    }

    // eslint-disable-next-line max-lines-per-function
    private _preserveWrappingStylePosition(params: IUpdateDocDrawingWrappingStyleParams): void {
        if (params.wrappingStyle === TextWrappingStyle.INLINE) {
            return;
        }

        const { unitId } = params;
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(
            unitId,
            UniverInstanceType.UNIVER_DOC
        );
        const renderObject = this._renderManagerService.getRenderById(unitId);
        const skeletonManager = renderObject?.with(DocSkeletonManagerService);
        const skeletonData = skeletonManager?.getSkeleton().getSkeletonData();
        const viewModel = skeletonManager?.getViewModel();
        if (!documentDataModel || !skeletonData || !viewModel) {
            return;
        }

        const editArea = viewModel.getEditArea();
        const { pages, skeHeaders, skeFooters } = skeletonData;
        const oldDrawings = documentDataModel.getDrawings() ?? {};

        params.drawings = params.drawings.map((drawing) => {
            const oldDrawing = oldDrawings[drawing.drawingId] as IDocDrawing | undefined;
            if (!oldDrawing) {
                return drawing;
            }

            let drawingAnchor: IDrawingAnchorInPage | null = null;
            for (const page of pages) {
                const { headerId, footerId, marginTop, marginLeft, marginBottom, pageWidth, pageHeight } = page;
                if (editArea === DocumentEditArea.HEADER) {
                    const header = skeHeaders.get(headerId)?.get(pageWidth);
                    if (header) {
                        drawingAnchor = findDrawingAnchorInPage(header, drawing.drawingId, header.marginTop, marginLeft);
                    }
                } else if (editArea === DocumentEditArea.FOOTER) {
                    const footer = skeFooters.get(footerId)?.get(pageWidth);
                    if (footer) {
                        drawingAnchor = findDrawingAnchorInPage(
                            footer,
                            drawing.drawingId,
                            pageHeight - marginBottom + footer.marginTop,
                            marginLeft
                        );
                    }
                } else {
                    drawingAnchor = findDrawingAnchorInPage(page, drawing.drawingId, marginTop, marginLeft);
                }

                if (drawingAnchor) {
                    break;
                }
            }

            if (!drawingAnchor) {
                return drawing;
            }

            const { skeDrawing, pageMarginTop, pageMarginLeft } = drawingAnchor;
            const oldPositionH = oldDrawing.docTransform.positionH;
            const oldPositionV = oldDrawing.docTransform.positionV;
            let posOffsetH = skeDrawing.aLeft;
            let posOffsetV = skeDrawing.aTop;

            if (oldPositionH.relativeFrom === ObjectRelativeFromH.MARGIN) {
                posOffsetH -= pageMarginLeft;
            } else if (oldPositionH.relativeFrom === ObjectRelativeFromH.COLUMN) {
                posOffsetH -= skeDrawing.columnLeft;
            }

            if (oldPositionV.relativeFrom === ObjectRelativeFromV.PAGE) {
                posOffsetV += pageMarginTop;
            } else if (oldPositionV.relativeFrom === ObjectRelativeFromV.LINE) {
                posOffsetV -= skeDrawing.lineTop;
            } else if (oldPositionV.relativeFrom === ObjectRelativeFromV.PARAGRAPH) {
                posOffsetV -= skeDrawing.blockAnchorTop;
            }

            return {
                ...oldDrawing,
                ...drawing,
                docTransform: {
                    ...oldDrawing.docTransform,
                    ...drawing.docTransform,
                    positionH: { relativeFrom: oldPositionH.relativeFrom, posOffset: posOffsetH },
                    positionV: { relativeFrom: oldPositionV.relativeFrom, posOffset: posOffsetV },
                },
            };
        });
    }

    private _addDrawings(unitId: string, drawings: IDocDrawing[]) {
        const drawingManagerService = this._drawingManagerService;
        const docDrawingService = this._docDrawingService;

        const jsonOp = this._docDrawingService.getBatchAddOp(drawings) as IDrawingJsonUndo1;

        const { subUnitId, redo: op, objects } = jsonOp;

        drawingManagerService.applyJson1(unitId, subUnitId, op);
        docDrawingService.applyJson1(unitId, subUnitId, op);

        drawingManagerService.addNotification(objects as IDrawingSearch[]);
        docDrawingService.addNotification(objects as IDrawingSearch[]);
    }

    private _removeDrawings(unitId: string, drawingIds: string[]) {
        const drawingManagerService = this._drawingManagerService;
        const docDrawingService = this._docDrawingService;

        const jsonOp = this._docDrawingService.getBatchRemoveOp(drawingIds.map((drawingId) => {
            return {
                unitId,
                subUnitId: unitId,
                drawingId,
            };
        }) as IDrawingSearch[]) as IDrawingJsonUndo1;

        const { subUnitId, redo: op, objects } = jsonOp;

        drawingManagerService.applyJson1(unitId, subUnitId, op);
        docDrawingService.applyJson1(unitId, subUnitId, op);

        drawingManagerService.removeNotification(objects as IDrawingSearch[]);
        docDrawingService.removeNotification(objects as IDrawingSearch[]);
    }

    private _updateDrawingsOrder(unitId: string) {
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

        if (documentDataModel == null) {
            return;
        }

        const { drawings, drawingsOrder } = documentDataModel.getSnapshot();

        if (drawingsOrder == null) {
            return;
        }
        const renderOrder = getDocDrawingRenderOrder(drawingsOrder, drawings);

        const drawingManagerService = this._drawingManagerService;
        const docDrawingService = this._docDrawingService;

        drawingManagerService.setDrawingOrder(unitId, unitId, renderOrder);
        docDrawingService.setDrawingOrder(unitId, unitId, drawingsOrder);

        // FIXME: @Jocs, Only need to update the affected drawings.
        const objects: IDrawingOrderMapParam = {
            unitId,
            subUnitId: unitId,
            drawingIds: renderOrder,
        };

        drawingManagerService.orderNotification(objects);
        docDrawingService.orderNotification({
            unitId,
            subUnitId: unitId,
            drawingIds: drawingsOrder,
        });
    }

    private _syncDrawingDataFromSnapshot(unitId: string, drawingIds: string[]) {
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

        if (documentDataModel == null) {
            return;
        }

        const { drawings = {}, drawingsOrder = [] } = documentDataModel.getSnapshot();
        const drawingData = drawings as IDrawingMapItemData<IDocDrawing>;
        const renderOrder = getDocDrawingRenderOrder(drawingsOrder, drawings);

        this._docDrawingService.setDrawingData(unitId, unitId, drawingData);
        this._drawingManagerService.setDrawingData(unitId, unitId, drawingData);
        this._docDrawingService.setDrawingOrder(unitId, unitId, drawingsOrder);
        this._drawingManagerService.setDrawingOrder(unitId, unitId, renderOrder);

        const objects = drawingIds
            .filter((drawingId) => drawingData[drawingId] != null)
            .map((drawingId) => ({ unitId, subUnitId: unitId, drawingId }));

        if (objects.length === 0) {
            return;
        }

        this._docDrawingService.updateNotification(objects);
        this._drawingManagerService.updateNotification(objects);
    }
}
