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

import type { DrawingTypeEnum, ICommandInfo, INeedCheckDisposable, IRange, Nullable, Workbook, Worksheet } from '@univerjs/core';
import type { BaseObject, IBoundRectNoAngle, IRender, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import type { ISetWorksheetRowAutoHeightMutationParams, ISheetLocationBase } from '@univerjs/sheets';
import type { IPopup } from '@univerjs/ui';
import { Disposable, DisposableCollection, fromEventSubject, ICommandService, Inject, IUniverInstanceService, toDisposable, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { COMMAND_LISTENER_SKELETON_CHANGE, IRefSelectionsService, RefRangeService, SetFrozenMutation, SetWorksheetRowAutoHeightMutation, SheetsSelectionsService } from '@univerjs/sheets';
import { ICanvasPopupService } from '@univerjs/ui';
import { BehaviorSubject, map, throttleTime } from 'rxjs';
import { SetScrollOperation } from '../commands/operations/scroll.operation';
import { SetZoomRatioOperation } from '../commands/operations/set-zoom-ratio.operation';
import { getViewportByCell, transformBound2OffsetBound } from '../common/utils';
import { ISheetSelectionRenderService } from './selection/base-selection-render.service';
import { SheetSkeletonManagerService } from './sheet-skeleton-manager.service';

export interface ICanvasPopup extends Omit<IPopup, 'anchorRect' | 'anchorRect$' | 'unitId' | 'subUnitId' | 'canvasElement'> {
    mask?: boolean;
    extraProps?: Record<string, unknown>;
    showOnSelectionMoving?: boolean;
}

interface IPopupMenuItem {
    label: string;
    index: number;
    commandId: string;
    commandParams: ICommandInfo['params'];
    disable: boolean;
}
type getPopupMenuItemCallback = (unitId: string, subUnitId: string, drawingId: string, drawingType: DrawingTypeEnum) => IPopupMenuItem[];

export class SheetCanvasPopManagerService extends Disposable {
    // the DrawingTypeEnum should refer from drawing package, here we just use type, so no need to import the drawing package
    private _popupMenuFeatureMap = new Map<DrawingTypeEnum, getPopupMenuItemCallback>();
    constructor(
        @Inject(ICanvasPopupService) private readonly _globalPopupManagerService: ICanvasPopupService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(RefRangeService) private readonly _refRangeService: RefRangeService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRefSelectionsService private readonly _refSelectionsService: ISheetSelectionRenderService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService
    ) {
        super();

        this._initMoving();
    }

    private _isSelectionMoving = false;

    private _initMoving() {
        this.disposeWithMe(
            this._refSelectionsService.selectionMoving$.subscribe(() => {
                this._isSelectionMoving = true;
            })
        );
        this.disposeWithMe(
            this._refSelectionsService.selectionMoveEnd$.subscribe(() => {
                this._isSelectionMoving = false;
            })
        );

        this.disposeWithMe(
            this._selectionManagerService.selectionMoving$.subscribe(() => {
                this._isSelectionMoving = true;
            })
        );
        this.disposeWithMe(
            this._selectionManagerService.selectionMoveEnd$.subscribe(() => {
                this._isSelectionMoving = false;
            })
        );
    }

    /**
     * Register a feature menu callback for a specific drawing type.such as image, chart, etc.
     */
    registerFeatureMenu(type: DrawingTypeEnum, getPopupMenuCallBack: getPopupMenuItemCallback) {
        this._popupMenuFeatureMap.set(type, getPopupMenuCallBack);
    }

    /**
     * Get the feature menu by drawing type, the function should be called when a drawing element need trigger popup menu, so the unitId, subUnitId, drawingId should be provided.
     * @param {string} unitId the unit id
     * @param {string} subUnitId the sub unit id
     * @param {string} drawingId the drawing id
     * @param {DrawingTypeEnum} drawingType the feature type
     * @returns the feature menu if it exists, otherwise return undefined
     */
    getFeatureMenu(unitId: string, subUnitId: string, drawingId: string, drawingType: DrawingTypeEnum): Nullable<IPopupMenuItem[]> {
        const callback = this._popupMenuFeatureMap.get(drawingType);
        if (callback) {
            return callback(unitId, subUnitId, drawingId, drawingType);
        }
    }

    override dispose(): void {
        super.dispose();
        this._popupMenuFeatureMap.clear();
    }

    private _createHiddenRectObserver(params: { row: number; column: number; worksheet: Worksheet; skeleton: SpreadsheetSkeleton; currentRender: IRender }) {
        const { row, column, worksheet, skeleton, currentRender } = params;
        const calc = () => {
            const freeze = worksheet.getFreeze();
            const { startRow: freezeStartRow, startColumn: freezeStartColumn, xSplit, ySplit } = freeze;
            const startRow = freezeStartRow - ySplit;
            const startColumn = freezeStartColumn - xSplit;
            const { rowHeightAccumulation, columnWidthAccumulation, rowHeaderWidth, columnHeaderHeight } = skeleton;
            const canvasFreezeWidth = rowHeaderWidth + (startColumn === -1 ? 0 : (columnWidthAccumulation[startColumn + xSplit - 1] - (columnWidthAccumulation[startColumn - 1] ?? 0)));
            const canvasFreezeHeight = columnHeaderHeight + (startRow === -1 ? 0 : (rowHeightAccumulation[startRow + ySplit - 1] - (rowHeightAccumulation[startRow] ?? 0)));
            const canvasElement = currentRender.engine.getCanvasElement();
            const canvasClientRect = canvasElement.getBoundingClientRect();

            // We should take the scale into account when canvas is scaled by CSS.
            const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width
            // const { top, left, width } = canvasClientRect; // real width affected by scale
            const scaleAdjust = canvasClientRect.width / widthOfCanvas;
            const canvasScale = currentRender.scene.getAncestorScale().scaleX;

            const freezeWidth = canvasFreezeWidth * scaleAdjust * canvasScale;
            const freezeHeight = canvasFreezeHeight * scaleAdjust * canvasScale;
            const viewTopLeft = {
                left: -Infinity,
                top: -Infinity,
                right: canvasClientRect.left + freezeWidth,
                bottom: canvasClientRect.top + freezeHeight,
            };

            const viewTopRight = {
                left: canvasClientRect.left + freezeWidth,
                top: -Infinity,
                right: Infinity,
                bottom: canvasClientRect.top + freezeHeight,
            };

            const viewBottomLeft = {
                left: -Infinity,
                top: canvasClientRect.top + freezeHeight,
                right: canvasClientRect.left + freezeWidth,
                bottom: Infinity,
            };
            const position = [];
            if (row < freezeStartRow) {
                position.push(viewTopLeft);
            }
            if (column < freezeStartColumn) {
                position.push(viewBottomLeft);
            }
            if (row < freezeStartRow && column < freezeStartColumn) {
                return [];
            } else if (row < freezeStartRow) {
                return [viewTopLeft];
            } else if (column < freezeStartColumn) {
                return [viewTopLeft];
            } else {
                return [viewTopLeft, viewTopRight, viewBottomLeft];
            }
        };

        const rects = calc();

        const rects$ = new BehaviorSubject(rects);

        const disposable = new DisposableCollection();

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetFrozenMutation.id) {
                rects$.next(calc());
            }
        }));

        disposable.add(fromEventSubject(currentRender.engine.onTransformChange$).pipe(throttleTime(16)).subscribe(() => {
            rects$.next(calc());
        }));

        return {
            rects$,
            disposable,
        };
    }

    // #region attach to object
    // Unlike _createCellPositionObserver, this bind to a certain position.
    private _createPositionObserver(
        bound: IBoundRectNoAngle,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        worksheet: Worksheet
    ) {
        const calc = () => {
            const { scene } = currentRender;
            const offsetBound = transformBound2OffsetBound(bound, scene, skeleton, worksheet);
            const canvasElement = currentRender.engine.getCanvasElement();
            const canvasClientRect = canvasElement.getBoundingClientRect();

            // We should take the scale into account when canvas is scaled by CSS.
            const widthOfCanvas = pxToNum(canvasElement.style.width); // declared width
            // const { top, left, width } = canvasClientRect; // real width affected by scale
            const scaleAdjust = canvasClientRect.width / widthOfCanvas;
            const position = {
                left: (offsetBound.left * scaleAdjust) + canvasClientRect.left,
                right: (offsetBound.right * scaleAdjust) + canvasClientRect.left,
                top: (offsetBound.top * scaleAdjust) + canvasClientRect.top,
                bottom: (offsetBound.bottom * scaleAdjust) + canvasClientRect.top,
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
        if (!worksheet || (this._isSelectionMoving && !popup.showOnSelectionMoving)) {
            return {
                dispose: () => {
                    // empty
                },
                canDispose: () => true,
            };
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).ensureSkeleton(subUnitId);

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
    // #endregion

    // #region attach to position
    attachPopupByPosition(bound: IBoundRectNoAngle, popup: ICanvasPopup, location: ISheetLocationBase): Nullable<INeedCheckDisposable> {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!;
        const worksheet = workbook.getActiveSheet();
        if (!worksheet) {
            return null;
        }

        const unitId = workbook.getUnitId();
        const subUnitId = worksheet.getSheetId();
        if ((unitId !== location.unitId) || (location.subUnitId !== subUnitId)) {
            return null;
        }

        if (this._isSelectionMoving && !popup.showOnSelectionMoving) {
            return;
        }

        const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).getOrCreateSkeleton({
            sheetId: subUnitId,
        });

        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender || !skeleton) {
            return null;
        }

        const { position, position$, disposable } = this._createPositionObserver(bound, currentRender, skeleton, worksheet);
        const { rects$, disposable: rectsObserverDisposable } = this._createHiddenRectObserver({
            row: location.row,
            column: location.col,
            worksheet,
            skeleton,
            currentRender,
        });
        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
            anchorRect$: position$,
            hiddenRects$: rects$,
            canvasElement: currentRender.engine.getCanvasElement(),
        });

        return {
            dispose: () => {
                this._globalPopupManagerService.removePopup(id);
                position$.complete();
                disposable.dispose();
                rectsObserverDisposable.dispose();
            },
            canDispose: () => this._globalPopupManagerService.activePopupId !== id,
        };
    }
    // #endregion

    // #region attach to absolute position
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

        const skeleton = this._renderManagerService.getRenderById(unitId)?.with(SheetSkeletonManagerService).ensureSkeleton(subUnitId);

        const currentRender = this._renderManagerService.getRenderById(unitId);
        if (!currentRender || !skeleton) {
            return null;
        }

        if (this._isSelectionMoving && !popup.showOnSelectionMoving) {
            return;
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
     * Bind popup to the right part of cell at(row, col).
     * This popup would move with the cell.
     * @param row
     * @param col
     * @param popup
     * @param _unitId
     * @param _subUnitId
     * @param viewport
     * @returns
     */
    attachPopupToCell(row: number, col: number, popup: ICanvasPopup, _unitId?: string, _subUnitId?: string, viewport?: Viewport): Nullable<INeedCheckDisposable> {
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
        const skeleton = currentRender?.with(SheetSkeletonManagerService).ensureSkeleton(subUnitId);
        const sheetSelectionRenderService = currentRender?.with(ISheetSelectionRenderService);

        if (!currentRender || !skeleton || !sheetSelectionRenderService) {
            return null;
        }

        if (this._isSelectionMoving && (!popup.showOnSelectionMoving)) {
            return;
        }

        const activeViewport = viewport ?? getViewportByCell(row, col, currentRender.scene, worksheet);
        if (!activeViewport) {
            return null;
        }

        const { position, position$, disposable: positionObserverDisposable, updateRowCol } = this._createCellPositionObserver(row, col, currentRender, skeleton, activeViewport);
        const { rects$, disposable: rectsObserverDisposable } = this._createHiddenRectObserver({
            row,
            column: col,
            worksheet,
            skeleton,
            currentRender,
        });
        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
            anchorRect$: position$,
            canvasElement: currentRender.engine.getCanvasElement(),
            hiddenRects$: rects$,
        });
        const disposableCollection = new DisposableCollection();
        disposableCollection.add(positionObserverDisposable);
        disposableCollection.add(toDisposable(() => {
            this._globalPopupManagerService.removePopup(id);
            position$.complete();
        }));
        disposableCollection.add(rectsObserverDisposable);

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

    /**
     * attach Comp to floatDOM
     * @param range
     * @param popup
     * @param _unitId
     * @param _subUnitId
     * @param viewport
     * @param showOnSelectionMoving
     * @returns
     */
    attachRangePopup(range: IRange, popup: ICanvasPopup, _unitId?: string, _subUnitId?: string, viewport?: Viewport, showOnSelectionMoving = false): Nullable<INeedCheckDisposable> {
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

        const activeViewport = viewport ?? getViewportByCell(range.startRow, range.startColumn, currentRender.scene, worksheet);
        if (!activeViewport) {
            return null;
        }

        const { position, position$, disposable: positionObserverDisposable, updateRowCol, topLeftPos$, rightBottomPos$ } = this._createRangePositionObserver(range, currentRender, skeleton, activeViewport);

        const { rects$, disposable: rectsObserverDisposable } = this._createHiddenRectObserver({
            row: range.startRow,
            column: range.startColumn,
            worksheet,
            skeleton,
            currentRender,
        });
        const id = this._globalPopupManagerService.addPopup({
            ...popup,
            unitId,
            subUnitId,
            anchorRect: position,
            anchorRect$: position$,
            canvasElement: currentRender.engine.getCanvasElement(),
            hiddenRects$: rects$,
        });
        const disposableCollection = new DisposableCollection();
        disposableCollection.add(positionObserverDisposable);
        disposableCollection.add(toDisposable(() => {
            this._globalPopupManagerService.removePopup(id);
            topLeftPos$.complete();
            rightBottomPos$.complete();
        }));
        disposableCollection.add(rectsObserverDisposable);

        // If the range changes, the popup should change with it. And if the range vanished, the popup should be removed.
        const watchedRange = { ...range };
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

    /**
     *
     * @param initialRow
     * @param initialCol
     * @param currentRender
     * @param skeleton
     * @param activeViewport
     * @returns
     */
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
        disposable.add(fromEventSubject(currentRender.engine.onTransformChange$).pipe(throttleTime(16)).subscribe(() => updatePosition()));
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

    // TODO @lumixraku to a normal function, not method.
    private _calcCellPositionByCell(
        row: number,
        col: number,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        activeViewport: Viewport
    ): IBoundRectNoAngle {
        const { scene, engine } = currentRender;

        const primaryWithCoord = skeleton.getCellWithCoordByIndex(row, col);
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

    /**
     * Unlike _createCellPositionObserver, this accept a range not a single cell.
     * @param initialRow
     * @param initialCol
     * @param currentRender
     * @param skeleton
     * @param activeViewport
     */
    private _createRangePositionObserver(
        range: IRange,
        currentRender: IRender,
        skeleton: SpreadsheetSkeleton,
        activeViewport: Viewport
    ) {
        let { startRow, startColumn } = range;
        const topLeftCoord = this._calcCellPositionByCell(startRow, startColumn, currentRender, skeleton, activeViewport);
        const topLeftPos$ = new BehaviorSubject(topLeftCoord);
        const rightBottomCoord = this._calcCellPositionByCell(range.endRow, range.endColumn, currentRender, skeleton, activeViewport);
        const rightBottomPos$ = new BehaviorSubject(rightBottomCoord);

        const updatePosition = () => {
            const topLeftCoord = this._calcCellPositionByCell(startRow, startColumn, currentRender, skeleton, activeViewport);
            const rightBottomCoord = this._calcCellPositionByCell(range.endRow, range.endColumn, currentRender, skeleton, activeViewport);

            topLeftPos$.next(topLeftCoord);
            rightBottomPos$.next(rightBottomCoord);
        };

        const disposable = new DisposableCollection();
        disposable.add(currentRender.engine.clientRect$.subscribe(() => updatePosition()));

        disposable.add(this._commandService.onCommandExecuted((commandInfo) => {
            if (commandInfo.id === SetWorksheetRowAutoHeightMutation.id) {
                const params = commandInfo.params as ISetWorksheetRowAutoHeightMutationParams;
                if (params.rowsAutoHeightInfo.findIndex((item) => item.row === startRow) > -1) {
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
            startRow = newRow;
            startColumn = newCol;

            updatePosition();
        };
        // const position$ = combineLatest(topLeftPos$, rightBottomPos$);
        const position$ = topLeftPos$.pipe(
            map((topLeft) => {
                const rightBottomCoord = this._calcCellPositionByCell(range.endRow, range.endColumn, currentRender, skeleton, activeViewport);
                return {
                    top: topLeft.top,
                    left: topLeft.left,
                    right: rightBottomCoord.right,
                    bottom: rightBottomCoord.bottom,
                };
            })
        );
        const position: IBoundRectNoAngle = {
            top: topLeftCoord.top,
            left: topLeftCoord.left,
            right: rightBottomCoord.right,
            bottom: rightBottomCoord.bottom,
        };
        return {
            position$,
            position,
            updateRowCol,
            topLeftPos$,
            rightBottomPos$,
            disposable,
        };
    }
}

function pxToNum(width: string): number {
    return Number.parseInt(width.replace('px', ''));
}
