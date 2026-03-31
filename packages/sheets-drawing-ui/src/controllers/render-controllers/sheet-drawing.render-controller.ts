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

import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, Inject } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import { drawingPositionToTransform, ISheetDrawingService } from '@univerjs/sheets-drawing';

export class SheetsDrawingRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService
    ) {
        super();

        this._init();
    }

    private _init(): void {
        this._drawingInitializeListener();
    }

    private _drawingInitializeListener() {
        // initialize drawing data and add to sheet canvas
        this._sheetDrawingService.initializeNotification(this._context.unitId);
        const data = this._sheetDrawingService.getDrawingDataForUnit(this._context.unitId);
        for (const subUnit in data) {
            const subUnitData = data[subUnit];
            for (const drawingId in subUnitData.data) {
                const drawingData = subUnitData.data[drawingId];
                const { unitId, subUnitId } = drawingData;
                const skeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);

                if (skeletonParam && drawingData.sheetTransform) {
                    drawingData.transform = drawingPositionToTransform(drawingData.sheetTransform, skeletonParam);
                }
            }
        }

        this._drawingManagerService.registerDrawingData(this._context.unitId, this._sheetDrawingService.getDrawingDataForUnit(this._context.unitId));
        this._drawingManagerService.initializeNotification(this._context.unitId);
    }
}
