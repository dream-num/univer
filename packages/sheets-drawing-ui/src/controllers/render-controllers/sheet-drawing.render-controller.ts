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
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { Disposable, DrawingTypeEnum, ICommandService, ILogService, Inject } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SheetSkeletonService } from '@univerjs/sheets';
import {
    DrawingApplyType,
    drawingPositionToTransform,
    ISheetDrawingService,
    refreshSheetDrawingPlacement,
    SetDrawingApplyMutation,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';

export class SheetsDrawingRenderController extends Disposable implements IRenderModule {
    constructor(
        private _context: IRenderContext,
        @ICommandService private readonly _commandService: ICommandService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @ILogService private readonly _logService: ILogService
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
        const updatesBySubUnit = new Map<string, ISheetDrawing[]>();
        for (const subUnit in data) {
            const subUnitData = data[subUnit];
            for (const drawingId in subUnitData.data) {
                const drawingData = subUnitData.data[drawingId];
                const { unitId, subUnitId } = drawingData;
                const skeletonParam = this._sheetSkeletonService.getSkeletonParam(unitId, subUnitId);

                if (
                    skeletonParam &&
                    drawingData.sheetTransform &&
                    !drawingData.groupId &&
                    drawingData.anchorType !== SheetDrawingAnchorType.None
                ) {
                    try {
                        if (drawingData.drawingType === DrawingTypeEnum.DRAWING_GROUP
                            || drawingData.drawingType === DrawingTypeEnum.DRAWING_SLICER
                            || drawingData.drawingType === DrawingTypeEnum.DRAWING_TIMELINE) {
                            const transform = drawingPositionToTransform(drawingData.sheetTransform, skeletonParam);
                            if (!transform) {
                                continue;
                            }
                            const updates = updatesBySubUnit.get(subUnitId) ?? [];
                            updates.push({
                                ...drawingData,
                                transform: {
                                    ...drawingData.transform,
                                    ...transform,
                                    left: drawingData.drawingType === DrawingTypeEnum.DRAWING_GROUP
                                        ? (transform.left ?? 0) - skeletonParam.skeleton.rowHeaderWidthAndMarginLeft
                                        : transform.left,
                                    top: drawingData.drawingType === DrawingTypeEnum.DRAWING_GROUP
                                        ? (transform.top ?? 0) - skeletonParam.skeleton.columnHeaderHeightAndMarginTop
                                        : transform.top,
                                },
                            });
                            updatesBySubUnit.set(subUnitId, updates);
                        } else {
                            const updates = updatesBySubUnit.get(subUnitId) ?? [];
                            updates.push(refreshSheetDrawingPlacement(drawingData, skeletonParam.skeleton));
                            updatesBySubUnit.set(subUnitId, updates);
                        }
                    } catch (error) {
                        this._logService.warn('[SheetsDrawingRenderController]', 'Skipping drawing placement initialization', {
                            unitId,
                            subUnitId,
                            drawingId,
                            transform: drawingData.transform,
                            sheetTransform: drawingData.sheetTransform,
                            error,
                        });
                    }
                }
            }
        }

        this._drawingManagerService.registerDrawingData(this._context.unitId, this._sheetDrawingService.getDrawingDataForUnit(this._context.unitId));
        updatesBySubUnit.forEach((updates) => {
            const { redo, unitId, subUnitId, objects } = this._sheetDrawingService.getBatchUpdateOp(updates);
            if (!redo) {
                return;
            }

            this._commandService.syncExecuteCommand(SetDrawingApplyMutation.id, {
                unitId,
                subUnitId,
                op: redo,
                objects,
                type: DrawingApplyType.UPDATE,
            }, { onlyLocal: true });
        });
        this._drawingManagerService.initializeNotification(this._context.unitId);
    }
}
