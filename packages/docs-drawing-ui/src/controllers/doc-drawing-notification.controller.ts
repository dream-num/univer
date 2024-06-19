/**
 * Copyright 2023-present DreamNum Inc.
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

import type { ICommandInfo, JSONXActions, Nullable } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    JSONX,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import { RichTextEditingMutation } from '@univerjs/docs';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import type { IDrawingJsonUndo1, IDrawingSearch } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';

interface IAddOrRemoveDrawing {
    type: 'add' | 'remove';
    drawingId: string;
    drawing?: IDocDrawing;
}

// Check whether drawings are added or deleted from the mutation and obtain the drawing ID.
function getAddOrRemoveDrawings(actions: JSONXActions): Nullable<IAddOrRemoveDrawing[]> {
    if (JSONX.isNoop(actions) || !Array.isArray(actions)) {
        return null;
    }
    const drawingsOp = actions.find((action) => Array.isArray(action) && action?.[0] === 'drawings');

    if (drawingsOp == null || !Array.isArray(drawingsOp) || drawingsOp.length !== 3) {
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
@OnLifecycle(LifecycleStages.Steady, DocDrawingAddRemoveController)
export class DocDrawingAddRemoveController extends Disposable {
    constructor(
        @ICommandService private readonly _commandService: ICommandService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @IDocDrawingService private readonly _docDrawingService: IDocDrawingService
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

                if (addOrRemoveDrawings == null) {
                    return;
                }

                for (const { type, drawingId, drawing } of addOrRemoveDrawings) {
                    if (type === 'add') {
                        this._addDrawings(unitId, [drawing!]);
                    } else {
                        this._removeDrawings(unitId, [drawingId]);
                    }
                }
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

    private _updateDrawingsOrder() {

    }
}
