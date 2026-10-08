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

import type { ICommandInfo, IDrawingParam, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import type { ISetWorksheetActiveOperationParams } from '@univerjs/sheets';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { Disposable, ICommandService, Inject } from '@univerjs/core';
import { IDrawingManagerService } from '@univerjs/drawing';
import { SetWorksheetActiveOperation, SheetSkeletonService } from '@univerjs/sheets';
import {
    applySheetDrawingPlacement,
    getSheetDrawingPlacement,
    ISheetDrawingService,
    SheetDrawingAnchorType,
} from '@univerjs/sheets-drawing';

export class SheetDrawingActiveRenderController extends Disposable implements IRenderModule {
    private _renderTimeout: ReturnType<typeof setTimeout> | undefined;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetSkeletonService) private readonly _sheetSkeletonService: SheetSkeletonService,
        @ISheetDrawingService private readonly _sheetDrawingService: ISheetDrawingService,
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService
    ) {
        super();
        this._commandListener();
    }

    override dispose(): void {
        this._cancelPendingRender();
        super.dispose();
    }

    private _cancelPendingRender(): void {
        if (this._renderTimeout !== undefined) {
            clearTimeout(this._renderTimeout);
            this._renderTimeout = undefined;
        }
    }

    private _scheduleRender(callback: () => void): void {
        this._cancelPendingRender();
        this._renderTimeout = setTimeout(() => {
            this._renderTimeout = undefined;
            callback();
        }, 0);
    }

    private _commandListener() {
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetActiveOperation.id) {
                    const { unitId, subUnitId } = command.params as ISetWorksheetActiveOperationParams;
                    this._updateDrawings(unitId, subUnitId);
                }
            })
        );

        this.disposeWithMe(
            this._context.activated$.subscribe((activated) => {
                const { unit, unitId } = this._context;
                if (activated) {
                    this._updateDrawings(unitId, unit.getActiveSheet().getSheetId());
                } else {
                    this._clearDrawings(unitId);
                }
            })
        );
    }

    private _clearDrawings(selfUnitId: string): void {
        this._scheduleRender(() => {
            const drawingMap = this._drawingManagerService.drawingManagerData;
            const removeDrawings: IDrawingParam[] = [];

            Object.keys(drawingMap ?? {}).forEach((unitId) => {
                const subUnitMap = drawingMap[unitId] ?? {};
                Object.keys(subUnitMap).forEach((subUnitId) => {
                    const drawingData = subUnitMap[subUnitId]?.data ?? {};
                    Object.keys(drawingData).forEach((drawingId) => {
                        if (unitId === selfUnitId) {
                            removeDrawings.push(drawingData[drawingId]);
                        }
                    });
                });
            });

            this._sheetDrawingService.removeNotification(removeDrawings);
            this._drawingManagerService.removeNotification(removeDrawings);
        });
    }

    private _updateDrawings(showUnitId: string, showSubunitId: string): void {
        this._scheduleRender(() => {
            const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(showUnitId, showSubunitId);
            const drawingMap = this._drawingManagerService.drawingManagerData;
            const insertDrawings: IDrawingParam[] = [];
            const refreshedDrawings: ISheetDrawing[] = [];
            const removeDrawings: IDrawingParam[] = [];

            Object.keys(drawingMap ?? {}).forEach((unitId) => {
                if (unitId !== showUnitId) {
                    return;
                }

                const subUnitMap = drawingMap[unitId] ?? {};
                Object.keys(subUnitMap).forEach((subUnitId) => {
                    const drawingData = subUnitMap[subUnitId]?.data ?? {};
                    Object.keys(drawingData).forEach((drawingId) => {
                        if (unitId === showUnitId && subUnitId === showSubunitId) {
                            const drawing = drawingData[drawingId] as ISheetDrawing;
                            if (sheetSkeletonParam && drawing.sheetTransform && drawing.anchorType !== SheetDrawingAnchorType.None) {
                                refreshedDrawings.push(applySheetDrawingPlacement(
                                    drawing,
                                    getSheetDrawingPlacement(drawing),
                                    sheetSkeletonParam.skeleton
                                ));
                            }
                            insertDrawings.push(drawingData[drawingId]);
                        } else {
                            removeDrawings.push(drawingData[drawingId]);
                        }
                    });
                });
            });

            // JSON1 drawing mutations are applied to both stores, so derived geometry must agree.
            this._sheetDrawingService.refreshTransform(refreshedDrawings);
            this._drawingManagerService.refreshTransform(refreshedDrawings);
            this._sheetDrawingService.removeNotification(removeDrawings);
            this._sheetDrawingService.addNotification(insertDrawings);
            this._drawingManagerService.removeNotification(removeDrawings);
            this._drawingManagerService.addNotification(insertDrawings);
        });
    }
}
