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

import type { INeedCheckDisposable, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import { Disposable, DisposableCollection, ICommandService, Inject, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { BaseObject, IBoundRectNoAngle, IRender, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import type { IPopup } from '@univerjs/ui';
import { ICanvasPopupService } from '@univerjs/ui';
import { BehaviorSubject } from 'rxjs';
import type { ISetWorksheetRowAutoHeightMutationParams } from '@univerjs/sheets';
import { COMMAND_LISTENER_SKELETON_CHANGE, RefRangeService, SetWorksheetRowAutoHeightMutation } from '@univerjs/sheets';
import { getViewportByCell, transformBound2OffsetBound } from '../common/utils';
import { SetScrollOperation } from '../commands/operations/scroll.operation';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';
import { ISheetSelectionRenderService } from './selection/base-selection-render.service';

export interface ICanvasPopup extends Pick<IPopup, 'direction' | 'excludeOutside' | 'componentKey' | 'offset' | 'onClickOutside' | 'hideOnInvisible' | 'hiddenType' | 'onClick'> {
    mask?: boolean;
    extraProps?: Record<string, any>;
}

export class SheetCanvasPopManagerService extends Disposable {
    constructor(
        @Inject(ICanvasPopupService) private readonly _globalPopupManagerService: ICanvasPopupService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();
    }

    // #region attach to object
    private _createPositionObserver(
        bound: IBoundRectNoAngle,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        worksheet: Worksheet
    ) {
        const calc = () => {
            const { scene, engine } = currentRender;

            const canvas = engine.getCanvasElement();
            const canvasBound = canvas.getBoundingClientRect();

            const offsetBound = transformBound2OffsetBound(bound, scene, skeleton, worksheet);

            const position = {
                left: offsetBound.left + canvasBound.left,
                right: offsetBound.right + canvasBound.left,
                top: offsetBound.top + canvasBound.top,
                bottom: offsetBound.bottom + canvasBound.top,
            };

            return position;
        };

        const position = calc();
        const position$ = new BehaviorSubject(position);
        const disposable = new DisposableCollection();

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetScrollOperation.id || commandInfo.id === SetZoomRatioOperation.id) {
                position$.next(calc());
            }
        }));

        return {
            position,
            position$,
            disposable,
        };
    }

    /**
     * attach a popup to canvas object
     * @param targetObject target canvas object
     * @param popup popup item
     * @returns disposable
     */
    attachPopupToObject(targetObject: BaseObject, popup: ICanvasPopup): INeedCheckDisposable {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return {
                dispose: () => {
                    // empty
                },
                canDispose: () => true,
            };
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getOrCreateSkeleton({
            sheetId: subUnitId,
        });

        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender || !skeleton) {
            return {
                dispose: () => {
                    // empty
                },
                canDispose: () => true,
            };
        }
        const { left, top, width, height } = targetObject;

        const bound: IBoundRectNoAngle = {
            left,
            right: left + width,
            top,
            bottom: top + height,
        };

        const { position, position$, disposable } = this._createPositionObserver(bound, currentRender, skeleton, worksheet);

        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
            anchorRect$: position$,
            canvasElement: currentRender.engine.getCanvasElement(),
        });

        return {
            dispose: () => {
                this._globalPopupManagerService.removePopup(id);
                position$.complete();
                disposable.dispose();
            },
            canDispose: () => this._globalPopupManagerService.activePopupId !== id,
        };
    }

    attachPopupByPosition(bound: IBoundRectNoAngle, popup: ICanvasPopup, _unitId?: string, _subUnitId?: string): Nullable<INeedCheckDisposable> {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return null;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        if ((_unitId && unitId !== _unitId) || (_subUnitId && _subUnitId !== subUnitId)) {
            return null;
        }

        const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getOrCreateSkeleton({
            sheetId: subUnitId,
        });

        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender || !skeleton) {
            return null;
        }

        const { position, position$, disposable } = this._createPositionObserver(bound, currentRender, skeleton, worksheet);
        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
            anchorRect$: position$,
            canvasElement: currentRender.engine.getCanvasElement(),
        });

        return {
            dispose: () => {
                this._globalPopupManagerService.removePopup(id);
                position$.complete();
                disposable.dispose();
            },
            canDispose: () => this._globalPopupManagerService.activePopupId !== id,
        };
    }

    attachPopupToAbsolutePosition(bound: IBoundRectNoAngle, popup: ICanvasPopup, _unitId?: string, _subUnitId?: string) {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return null;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        if ((_unitId && unitId !== _unitId) || (_subUnitId && _subUnitId !== subUnitId)) {
            return null;
        }

        const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getOrCreateSkeleton({
            sheetId: subUnitId,
        });

        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender || !skeleton) {
            return null;
        }

        const position$ = new BehaviorSubject(bound);
        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: bound,
            anchorRect$: position$.asObservable(),
            canvasElement: currentRender.engine.getCanvasElement(),
        });

        return {
            dispose: () => {
                this._globalPopupManagerService.removePopup(id);
                position$.complete();
            },
            canDispose: () => this._globalPopupManagerService.activePopupId !== id,
        };
    }

    // #endregion

    // #region attach to cell

    /**
     *
     * @param row
     * @param col
     * @param popup
     * @param _unitId
     * @param _subUnitId
     * @param viewport
     * @param showOnSelectionMoving
     * @returns
     */
    attachPopupToCell(row: number, col: number, popup: ICanvasPopup, _unitId?: string, _subUnitId?: string, viewport?: Viewport, showOnSelectionMoving = false): Nullable<INeedCheckDisposable> {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return null;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        if ((_unitId && unitId !== _unitId) || (_subUnitId && subUnitId !== _subUnitId)) {
            return null;
        }
        const currentRender = this._renderManagerService.getRenderById(unitId);
        const skeleton = currentRender?.with(SheetSkeletonManagerService).getOrCreateSkeleton({
            sheetId: subUnitId,
        });
        const sheetSelectionRenderService = currentRender?.with(ISheetSelectionRenderService);

        if (!currentRender || !skeleton || !sheetSelectionRenderService) {
            return null;
        }

        if (sheetSelectionRenderService.selectionMoving && !showOnSelectionMoving) {
            return;
        }

        const activeViewport = viewport ?? getViewportByCell(row, col, currentRender.scene, worksheet);
        if (!activeViewport) {
            return null;
        }

        const { position, position$, disposable: positionObserverDisposable, updateRowCol } = this._createCellPositionObserver(row, col, currentRender, skeleton, activeViewport);
        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
            anchorRect$: position$,
            canvasElement: currentRender.engine.getCanvasElement(),
        });

        const disposableCollection = new DisposableCollection();
        disposableCollection.add(positionObserverDisposable);
        disposableCollection.add(toDisposable(() => {
            this._globalPopupManagerService.removePopup(id);
            position$.complete();
        }));

        // If the range changes, the popup should change with it. And if the range vanished, the popup should be removed.
        const watchedRange: IRange = { startRow: row, endRow: row, startColumn: col, endColumn: col };
        disposableCollection.add(this._refRangeService.watchRange(unitId, subUnitId, watchedRange, (_, after) => {
            if (!after) {
                disposableCollection.dispose();
            } else {
                updateRowCol(after.startRow, after.startColumn);
            }
        }));

        return {
            dispose() {
                disposableCollection.dispose();
            },
            canDispose: () => this._globalPopupManagerService.activePopupId !== id,
        };
    }

    private _createCellPositionObserver(
        initialRow: number,
        initialCol: number,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        activeViewport: Viewport
    ) {
        let row = initialRow;
        let col = initialCol;

        const position = this._calcCellPositionByCell(row, col, currentRender, skeleton, activeViewport);
        const position$ = new BehaviorSubject(position);
        const updatePosition = () => position$.next(this._calcCellPositionByCell(row, col, currentRender, skeleton, activeViewport));

        const disposable = new DisposableCollection();
        disposable.add(currentRender.engine.clientRect$.subscribe(() => updatePosition()));
        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetRowAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowAutoHeightMutationParams;
                if (params.rowsAutoHeightInfo.findIndex((item) => item.row === row) > -1) {
                    updatePosition();
                    return;
                }
            }

            if (
                COMMAND_LISTENER_SKELETON_CHANGE.indexOf(commandInfo.id) > -1 ||
                commandInfo.id === SetScrollOperation.id ||
                commandInfo.id === SetZoomRatioOperation.id
            ) {
                updatePosition();
            }
        }));

        const updateRowCol = (newRow: number, newCol: number) => {
            row = newRow;
            col = newCol;

            updatePosition();
        };

        return {
            position$,
            disposable,
            position,
            updateRowCol,
        };
    }

    private _calcCellPositionByCell(
        row: number,
        col: number,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        activeViewport: Viewport
    ): IBoundRectNoAngle {
        const { scene, engine } = currentRender;

        const primaryWithCoord = skeleton.getCellByIndex(row, col);
        const cellInfo = primaryWithCoord.isMergedMainCell ? primaryWithCoord.mergeInfo : primaryWithCoord;

        const { scaleX, scaleY } = scene.getAncestorScale();
        const scrollXY = {
            x: activeViewport.viewportScrollX,
            y: activeViewport.viewportScrollY,
        };

        const canvasElement = engine.getCanvasElement();
        const canvasClientRect = canvasElement.getBoundingClientRect();

        // We should take the scale into account when canvas is scaled by CSS.
        const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width
        const { top, left, width } = canvasClientRect; // real width affected by scale
        const scaleAdjust = width / widthOfCanvas;

        return {
            left: ((cellInfo.startX - scrollXY.x) * scaleAdjust * scaleX) + left,
            right: (cellInfo.endX - scrollXY.x) * scaleAdjust * scaleX + left,
            top: ((cellInfo.startY - scrollXY.y) * scaleAdjust * scaleY) + top,
            bottom: ((cellInfo.endY - scrollXY.y) * scaleAdjust * scaleY) + top,
        };
    }

    // #endregion
}

function pxToNum(width: string): number {
    return Number.parseInt(width.replace('px', ''));
}
