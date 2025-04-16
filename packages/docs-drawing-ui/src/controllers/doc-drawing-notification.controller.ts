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

import type { ICommandInfo, IDrawingSearch, JSONXActions, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import type { IDrawingJsonUndo1, IDrawingOrderMapParam } from '@univerjs/drawing';
import {
    Disposable,
    ICommandService,
    IUniverInstanceService,
    JSONX,
    RedoCommand,
    UndoCommand,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';

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

export class DocDrawingAddRemoveController extends Disposable {
    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._commandExecutedListener();
    }

    private _commandExecutedListener() {
        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id !== RichTextEditingMutation.id) {
                    return;
                }

                const params = command.params as IRichTextEditingMutationParams;
                const { unitId, actions } = params;

                const addOrRemoveDrawings = getAddOrRemoveDrawings(actions);
                if (addOrRemoveDrawings != null) {
                    for (const { type, drawingId, drawing } of addOrRemoveDrawings) {
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
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== UndoCommand.id && command.id !== RedoCommand.id) {
                    return;
                }

                const unitId = this._univerInstanceService.getCurrentUniverDocInstance()?.getUnitId();
                const focusedDrawings = this._drawingManagerService.getFocusDrawings();

                if (unitId == null || focusedDrawings.length === 0) {
                    return;
                }

                const renderObject = this._renderManagerService.getRenderById(unitId);
                const scene = renderObject?.scene;
                if (scene == null) {
                    return false;
                }
                const transformer = scene.getTransformerByCreate();

                transformer.refreshControls();
            })
        );
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
        const documentDataModel = this._univerInstanceService.getUniverDocInstance(unitId);

        if (documentDataModel == null) {
            return;
        }

        const drawingsOrder = documentDataModel.getSnapshot().drawingsOrder;

        if (drawingsOrder == null) {
            return;
        }

        const drawingManagerService = this._drawingManagerService;
        const docDrawingService = this._docDrawingService;

        drawingManagerService.setDrawingOrder(unitId, unitId, drawingsOrder);
        docDrawingService.setDrawingOrder(unitId, unitId, drawingsOrder);

        // FIXME: @Jocs, Only need to update the affected drawings.
        const objects: IDrawingOrderMapParam = {
            unitId,
            subUnitId: unitId,
            drawingIds: drawingsOrder,
        };

        drawingManagerService.orderNotification(objects);
        docDrawingService.orderNotification(objects);
    }
}
