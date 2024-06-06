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

import type { ICommandInfo } from '@univerjs/core';
import {
    Disposable,
    ICommandService,
    LifecycleStages,
    OnLifecycle,
} from '@univerjs/core';
import type { IDeleteCustomBlockParams } from '@univerjs/docs';
import { DeleteCustomBlockCommand } from '@univerjs/docs';
import { IDocDrawingService } from '@univerjs/docs-drawing';
import type { IDrawingJsonUndo1, IDrawingSearch } from '@univerjs/drawing';
import { IDrawingManagerService } from '@univerjs/drawing';

@OnLifecycle(LifecycleStages.Steady, DocDrawingRemoveController)
export class DocDrawingRemoveController extends Disposable {
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
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id !== DeleteCustomBlockCommand.id) {
                    return;
                }

                const params = command.params as IDeleteCustomBlockParams;

                const { unitId, drawingId } = params;

                this._removeDrawing(unitId, drawingId);
            })
        );
    }

    private _removeDrawing(unitId: string, drawingId: string) {
        const drawingManagerService = this._drawingManagerService;
        const docDrawingService = this._docDrawingService;

        const jsonOp = this._docDrawingService.getBatchRemoveOp([
            {
                unitId,
                subUnitId: unitId,
                drawingId,
            },
        ] as IDrawingSearch[]) as IDrawingJsonUndo1;

        const { subUnitId, redo: op, objects } = jsonOp;

        drawingManagerService.applyJson1(unitId, subUnitId, op);
        docDrawingService.applyJson1(unitId, subUnitId, op);

        drawingManagerService.removeNotification(objects as IDrawingSearch[]);
        docDrawingService.removeNotification(objects as IDrawingSearch[]);
    }
}
