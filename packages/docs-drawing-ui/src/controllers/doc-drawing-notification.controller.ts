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

import type { DocumentDataModel, ICommandInfo, IDrawingSearch, JSONXActions, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type {
    IDocDrawing,
    IUpdateDocDrawingWrappingStyleParams,
    IUpdateDrawingDocTransformCommandParams,
} from '@univerjs/docs-drawing';
import type { IDrawingJsonUndo1, IDrawingMapItemData, IDrawingOrderMapParam } from '@univerjs/drawing';
import type { IDrawingAnchorInPage } from '../utils/drawing-anchor-position';
import {
    BooleanNumber,
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
    JSONX,
    PositionedObjectLayoutType,
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
import { findDrawingAnchorInPage, resolveDrawingAnchorOffsets } from '../utils/drawing-anchor-position';

interface IAddOrRemoveDrawing {
    type: 'add' | 'remove';
    drawingId: string;
    drawing?: IDocDrawing;
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
                const renderObject = this._renderManagerService.getRenderUnitById(unitId);
                const scene = renderObject?.scene;
                if (renderObject == null || scene == null) {
                    return;
                }

                // Transform mutations are already refreshed incrementally by
                // DocDrawingTransformUpdateController from the nested rich-text
                // mutation. Wrapping changes can move anchors and still need a
                // conservative full refresh.
                if (command.id === UpdateDocDrawingWrappingStyleCommand.id) {
                    this._docRefreshDrawingsService.refreshDrawings(renderObject.with(DocSkeletonManagerService).getSkeleton());
                }
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
                if (renderObject == null || scene == null) {
                    return false;
                }
                this._docRefreshDrawingsService.refreshDrawings(renderObject.with(DocSkeletonManagerService).getSkeleton());
                const transformer = scene.getTransformerByCreate();

                transformer.refreshControls();
            })
        );
    }

    private _preserveWrappingStylePosition(params: IUpdateDocDrawingWrappingStyleParams): void {
        if (params.wrappingStyle === TextWrappingStyle.INLINE) {
            return;
        }

        const { unitId } = params;
        const documentDataModel = this._univerInstanceService.getUnit<DocumentDataModel>(
            unitId,
            UniverInstanceType.UNIVER_DOC
        );
        const renderObject = this._renderManagerService.getRenderUnitById(unitId);
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

            const oldPositionH = oldDrawing.docTransform.positionH;
            const oldPositionV = oldDrawing.docTransform.positionV;
            const { horizontal: posOffsetH, vertical: posOffsetV } = resolveDrawingAnchorOffsets(
                drawingAnchor,
                oldPositionH,
                oldPositionV
            );

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
        const previousDrawings = this._docDrawingService.getDrawingData(unitId, unitId);
        const orderChanged = drawingsOrder !== this._docDrawingService.getDrawingOrder(unitId, unitId) ||
            drawingIds.some((drawingId) => {
                const previous = previousDrawings[drawingId];
                const current = drawingData[drawingId];
                const wasBehind = previous?.layoutType === PositionedObjectLayoutType.WRAP_NONE &&
                    previous.behindDoc === BooleanNumber.TRUE;
                const isBehind = current?.layoutType === PositionedObjectLayoutType.WRAP_NONE &&
                    current.behindDoc === BooleanNumber.TRUE;
                return wasBehind !== isBehind;
            });

        const renderedDrawings = { ...this._drawingManagerService.getDrawingData(unitId, unitId) };
        for (const drawingId of drawingIds) {
            const current = drawingData[drawingId];
            if (current) {
                // Layout mutates render transforms. Never share the persisted drawing object or
                // replace unrelated drawings whose published positions are still authoritative.
                renderedDrawings[drawingId] = { ...current };
            } else {
                delete renderedDrawings[drawingId];
            }
        }

        this._docDrawingService.setDrawingData(unitId, unitId, drawingData);
        this._drawingManagerService.setDrawingData(unitId, unitId, renderedDrawings);
        if (orderChanged) {
            this._docDrawingService.setDrawingOrder(unitId, unitId, drawingsOrder);
            this._drawingManagerService.setDrawingOrder(unitId, unitId, getDocDrawingRenderOrder(drawingsOrder, drawings));
        }

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
