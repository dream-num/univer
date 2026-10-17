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
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import type { ISetWorksheetActiveOperationParams } from '@univerjs/sheets';
import type { ISheetDrawing } from '@univerjs/sheets-drawing';
import { Disposable, ICommandService, ILogService, Inject } from '@univerjs/core';
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
        @IDrawingManagerService private readonly _drawingManagerService: IDrawingManagerService,
        @ILogService private readonly _logService: ILogService
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
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id !== SetWorksheetActiveOperation.id) {
                    return;
                }
                const { unitId, subUnitId } = command.params as ISetWorksheetActiveOperationParams;
                const { unit, unitId: contextUnitId } = this._context;
                if (
                    unitId !== contextUnitId || !unit.getSheetBySheetId(subUnitId) ||
                    unit.getActiveSheet().getSheetId() === subUnitId
                ) {
                    return;
                }

                // Restoring the next sheet's viewport can expose offscreen drawings from the previous sheet.
                this._clearDrawings(unitId, subUnitId);
            })
        );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (command.id === SetWorksheetActiveOperation.id) {
                    const { unitId, subUnitId } = command.params as ISetWorksheetActiveOperationParams;
                    if (unitId === this._context.unitId && subUnitId === this._context.unit.getActiveSheet().getSheetId()) {
                        this._updateDrawings(unitId, subUnitId);
                    }
                }
            })
        );

        this.disposeWithMe(
            this._context.activated$.subscribe((activated) => {
                const { unit, unitId } = this._context;
                if (activated) {
                    const subUnitId = unit.getActiveSheet().getSheetId();
                    this._clearDrawings(unitId, subUnitId);
                    this._updateDrawings(unitId, subUnitId);
                } else {
                    this._clearDrawings(unitId);
                }
            })
        );
    }

    private _clearDrawings(unitId: string, keepSubUnitId?: string): void {
        this._cancelPendingRender();
        const subUnitMap = this._drawingManagerService.drawingManagerData[unitId] ?? {};
        const removeDrawings: IDrawingParam[] = [];
        for (const subUnitId of Object.keys(subUnitMap)) {
            if (subUnitId === keepSubUnitId) {
                continue;
            }
            for (const drawing of Object.values(subUnitMap[subUnitId]?.data ?? {})) {
                removeDrawings.push(drawing);
            }
        }

        this._sheetDrawingService.removeNotification(removeDrawings);
        this._drawingManagerService.removeNotification(removeDrawings);
    }

    private _updateDrawings(showUnitId: string, showSubunitId: string): void {
        this._scheduleRender(() => {
            const sheetSkeletonParam = this._sheetSkeletonService.getSkeletonParam(showUnitId, showSubunitId);
            const subUnitMap = this._drawingManagerService.drawingManagerData[showUnitId] ?? {};
            const drawingData = subUnitMap[showSubunitId]?.data ?? {};
            const { successDrawings, refreshedDrawings, failures } = prepareSheetDrawings(
                Object.values(drawingData) as ISheetDrawing[],
                sheetSkeletonParam?.skeleton
            );
            const removeDrawings: IDrawingParam[] = failures.map(({ drawingId }) => drawingData[drawingId]);
            // JSON1 drawing mutations are applied to both stores, so derived geometry must agree.
            this._sheetDrawingService.refreshTransform(refreshedDrawings);
            this._drawingManagerService.refreshTransform(refreshedDrawings);
            this._sheetDrawingService.removeNotification(removeDrawings);
            this._sheetDrawingService.addNotification(successDrawings);
            this._drawingManagerService.removeNotification(removeDrawings);
            this._drawingManagerService.addNotification(successDrawings);
            if (failures.length) {
                this._logService.error('[SheetDrawingActiveRenderController]', {
                    unitId: showUnitId,
                    subUnitId: showSubunitId,
                    failures,
                });
            }
        });
    }
}

function prepareSheetDrawings(drawings: ISheetDrawing[], skeleton?: SpreadsheetSkeleton) {
    const successDrawings: ISheetDrawing[] = [];
    const refreshedDrawings: ISheetDrawing[] = [];
    const failures: Array<Pick<ISheetDrawing, 'drawingId' | 'drawingType' | 'anchorType'> & { error: unknown }> = [];

    for (const drawing of drawings) {
        if (skeleton && drawing.sheetTransform && drawing.anchorType !== SheetDrawingAnchorType.None) {
            try {
                refreshedDrawings.push(applySheetDrawingPlacement(drawing, getSheetDrawingPlacement(drawing), skeleton));
            } catch (error) {
                failures.push({
                    drawingId: drawing.drawingId,
                    drawingType: drawing.drawingType,
                    anchorType: drawing.anchorType ?? SheetDrawingAnchorType.Position,
                    error,
                });
                continue;
            }
        }
        successDrawings.push(drawing);
    }

    return { successDrawings, refreshedDrawings, failures };
}
