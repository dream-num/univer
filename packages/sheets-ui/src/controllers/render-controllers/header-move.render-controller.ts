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

import type { IRange, Nullable, Observer, Workbook } from '@univerjs/core';
import {
    createInterceptorKey,
    Disposable,
    ICommandService,
    InterceptorManager,
    RANGE_TYPE,
} from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, SpreadsheetColumnHeader, SpreadsheetHeader } from '@univerjs/engine-render';
import {
    CURSOR_TYPE,
    Rect,
    ScrollTimer,
    ScrollTimerType,
    SHEET_VIEWPORT_KEY,
    Vector2,
} from '@univerjs/engine-render';
import type { IMoveColsCommandParams, IMoveRowsCommandParams, ISelectionWithStyle } from '@univerjs/sheets';
import {
    MoveColsCommand,
    MoveRowsCommand,
    NORMAL_SELECTION_PLUGIN_NAME,
    SelectionManagerService,
} from '@univerjs/sheets';
import { Inject } from '@wendellhu/redi';

import { Subscription } from 'rxjs';
import { SHEET_COMPONENT_HEADER_LAYER_INDEX, SHEET_VIEW_KEY } from '../../common/keys';
import { ISelectionRenderService } from '../../services/selection/selection-render.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { getCoordByOffset } from '../utils/component-tools';

const HEADER_MOVE_CONTROLLER_BACKGROUND = '__SpreadsheetHeaderMoveControllerBackground__';

const HEADER_MOVE_CONTROLLER_LINE = '__SpreadsheetHeaderMoveControllerShapeLine__';

const HEADER_MOVE_CONTROLLER_BACKGROUND_FILL = 'rgba(0, 0, 0, 0.1)';

const HEADER_MOVE_CONTROLLER_LINE_FILL = 'rgb(119, 119, 119)';

const HEADER_MOVE_CONTROLLER_LINE_SIZE = 4;

enum HEADER_MOVE_TYPE {
    ROW,
    COLUMN,
}

export const HEADER_MOVE_PERMISSION_CHECK = createInterceptorKey<boolean, IRange>('headerMovePermissionCheck');

export class HeaderMoveRenderController extends Disposable implements IRenderModule {
    private _startOffsetX: number = Number.NEGATIVE_INFINITY;

    private _startOffsetY: number = Number.NEGATIVE_INFINITY;

    private _moveHelperBackgroundShape: Nullable<Rect>;

    private _moveHelperLineShape: Nullable<Rect>;

    private _downSubscriptions: Nullable<Subscription>;
    /** @deprecated */
    private _rowOrColumnDownObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _rowOrColumnMoveObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _rowOrColumnLeaveObservers: Array<Nullable<Observer<IPointerEvent | IMouseEvent>>> = [];

    private _scenePointerMoveSub: Nullable<Subscription>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _scrollTimer: Nullable<ScrollTimer>;

    private _changeFromColumn = -1;

    private _changeFromRow = -1;

    private _changeToColumn = -1;

    private _changeToRow = -1;

    public interceptor = new InterceptorManager({ HEADER_MOVE_PERMISSION_CHECK });
    private _colHeaderPointerMoveSub: Nullable<Subscription>;
    private _rowHeaderPointerMoveSub: Nullable<Subscription>;

    override dispose(): void {
        this._moveHelperBackgroundShape?.dispose();
        this._moveHelperLineShape?.dispose();

        const spreadsheetColumnHeader = this._context.components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        const spreadsheetRowHeader = this._context.components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;
        const scene = this._context.scene;

        // this._rowOrColumnMoveObservers.forEach((obs) => {
        //     spreadsheetRowHeader.onPointerMoveObserver.remove(obs);
        //     spreadsheetColumnHeader.onPointerMoveObserver.remove(obs);
        // });
        this._rowHeaderPointerMoveSub?.unsubscribe();
        this._colHeaderPointerMoveSub?.unsubscribe();

        this._rowOrColumnLeaveObservers.forEach((obs) => {
            spreadsheetRowHeader.onPointerLeaveObserver.remove(obs);
            spreadsheetColumnHeader.onPointerLeaveObserver.remove(obs);
        });

        this._downSubscriptions?.unsubscribe();
        this._downSubscriptions = null;

        // scene.onPointerMove$.remove(this._scenePointerMoveSub);
        this._scenePointerMoveSub?.unsubscribe();
        scene.onPointerUpObserver.remove(this._upObserver);

        this._scrollTimer?.dispose();
    }

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._initialRowOrColumn(HEADER_MOVE_TYPE.ROW);

        this._initialRowOrColumn(HEADER_MOVE_TYPE.COLUMN);
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialRowOrColumn(initialType: HEADER_MOVE_TYPE = HEADER_MOVE_TYPE.ROW) {
        const spreadsheetColumnHeader = this._context.components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        const spreadsheetRowHeader = this._context.components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;
        const scene = this._context.scene;
        const eventBindingObject =
            initialType === HEADER_MOVE_TYPE.ROW ? spreadsheetRowHeader : spreadsheetColumnHeader;

        const pointerMoveHandler = (evt: IPointerEvent | IMouseEvent) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
            if (skeleton == null) {
                return;
            }

            const selectionRange = this._selectionManagerService.getLast()?.range;
            if (!selectionRange) return;

            const permissionCheck = this.interceptor.fetchThroughInterceptors(HEADER_MOVE_PERMISSION_CHECK)(false, selectionRange);

            if (!permissionCheck) {
                return;
            }

            const { row, column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);

            const matchSelectionData = this._checkInHeaderRange(
                initialType === HEADER_MOVE_TYPE.ROW ? row : column,
                initialType
            );

            if (matchSelectionData === false) {
                scene.resetCursor();
                this._selectionRenderService.enableSelection();
                return;
            }

            scene.setCursor(CURSOR_TYPE.GRAB);

            this._selectionRenderService.disableSelection();
        };
        if (initialType === HEADER_MOVE_TYPE.ROW) {
            this._rowHeaderPointerMoveSub = spreadsheetRowHeader.onPointerMove$.subscribeEvent(pointerMoveHandler);
        } else {
            this._colHeaderPointerMoveSub = spreadsheetColumnHeader.onPointerMove$.subscribeEvent(pointerMoveHandler);
        }

        this._rowOrColumnLeaveObservers.push(
            eventBindingObject?.onPointerLeaveObserver.add(() => {
                this._moveHelperBackgroundShape?.hide();
                this._moveHelperLineShape?.hide();
                scene.resetCursor();
                this._selectionRenderService.enableSelection();
            })
        );

        this._downSubscriptions = new Subscription();
        this._downSubscriptions.add(
            // eslint-disable-next-line max-lines-per-function
            eventBindingObject?.pointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
                if (skeleton == null) {
                    return;
                }

                const selectionRange = this._selectionManagerService.getLast()?.range;
                if (!selectionRange) return;

                const permissionCheck = this.interceptor.fetchThroughInterceptors(HEADER_MOVE_PERMISSION_CHECK)(false, selectionRange);

                if (!permissionCheck) {
                    return;
                }

                const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

                const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

                const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

                this._startOffsetX = newEvtOffsetX;

                this._startOffsetY = newEvtOffsetY;

                const { row, column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);

                let scrollType: ScrollTimerType;

                if (initialType === HEADER_MOVE_TYPE.ROW) {
                    this._changeFromRow = row;
                    scrollType = ScrollTimerType.Y;
                } else {
                    this._changeFromColumn = column;
                    scrollType = ScrollTimerType.X;
                }

                const matchSelectionData = this._checkInHeaderRange(
                    initialType === HEADER_MOVE_TYPE.ROW ? row : column,
                    initialType
                );

                if (matchSelectionData === false) {
                    return;
                }

                const startScrollXY = scene.getScrollXYByRelativeCoords(
                    Vector2.FromArray([this._startOffsetX, this._startOffsetY])
                );

                this._newBackgroundAndLine();

                scene.setCursor(CURSOR_TYPE.GRABBING);

                scene.disableEvent();

                let scrollTimerInitd = false;
                let scrollTimer: ScrollTimer;

                const initScrollTimer = () => {
                    if (scrollTimerInitd) {
                        return;
                    }

                    scrollTimer = ScrollTimer.create(scene, scrollType);

                    const mainViewport = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

                    scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY, mainViewport);

                    this._scrollTimer = scrollTimer;
                    scrollTimerInitd = true;
                };

                this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
                    initScrollTimer();
                    const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

                    const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(
                        Vector2.FromArray([moveOffsetX, moveOffsetY])
                    );

                    // scene.setCursor(CURSOR_TYPE.GRABBING);

                    this._rowColumnMoving(
                        newMoveOffsetX,
                        newMoveOffsetY,
                        matchSelectionData,
                        startScrollXY,
                        initialType
                    );

                    scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                        this._rowColumnMoving(
                            newMoveOffsetX,
                            newMoveOffsetY,
                            matchSelectionData,
                            startScrollXY,
                            initialType
                        );
                    });
                });

                this._upObserver = scene.onPointerUpObserver.add(() => {
                    this._disposeBackgroundAndLine();
                    scene.resetCursor();
                    scene.enableEvent();
                    this._clearObserverEvent();
                    this._scrollTimer?.dispose();

                    // when multi ranges are selected, we should only move the range that contains
                    // `changeFromRow`
                    const selections = this._selectionManagerService.getSelections();

                    if (initialType === HEADER_MOVE_TYPE.ROW) {
                        if (this._changeFromRow !== this._changeToRow && this._changeToRow !== -1) {
                            const filteredSelections =
                                selections?.filter(
                                    (selection) =>
                                        selection.range.rangeType === RANGE_TYPE.ROW &&
                                        selection.range.startRow <= this._changeFromRow &&
                                        this._changeFromRow <= selection.range.endRow
                                ) || [];
                            const range = filteredSelections[0]?.range;
                            if (range) {
                                this._commandService.executeCommand<IMoveRowsCommandParams>(MoveRowsCommand.id, {
                                    fromRange: range,
                                    toRange: {
                                        ...range,
                                        startRow: this._changeToRow,
                                        endRow: this._changeToRow + range.endRow - range.startRow,
                                    },
                                });
                            }
                        }

                        // reset dragging status
                        this._changeToRow = this._changeFromRow = -1;
                    } else {
                        if (this._changeFromColumn !== this._changeToColumn && this._changeToColumn !== -1) {
                            const filteredSelections =
                                selections?.filter(
                                    (selection) =>
                                        selection.range.rangeType === RANGE_TYPE.COLUMN &&
                                        selection.range.startColumn <= this._changeFromColumn &&
                                        this._changeFromColumn <= selection.range.endColumn
                                ) || [];
                            const range = filteredSelections[0]?.range;
                            if (range) {
                                this._commandService.executeCommand<IMoveColsCommandParams>(MoveColsCommand.id, {
                                    fromRange: range,
                                    toRange: {
                                        ...range,
                                        startColumn: this._changeToColumn,
                                        endColumn: this._changeToColumn + range.endColumn - range.startColumn,
                                    },
                                });
                            }
                        }

                        this._changeToColumn = this._changeFromColumn = -1;
                    }
                });
            })
        );
    }

    private _rowColumnMoving(
        moveOffsetX: number,
        moveOffsetY: number,
        matchSelectionData: ISelectionWithStyle,
        startScrollXY: {
            x: number;
            y: number;
        },
        initialType: HEADER_MOVE_TYPE
    ) {
        const scene = this._context.scene;
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const { rowHeaderWidth, columnHeaderHeight, rowTotalHeight, columnTotalWidth } = skeleton;

        // const scrollXY = scene.getScrollXYByRelativeCoords(Vector2.FromArray([this._startOffsetX, this._startOffsetY]));
        const scrollXY = scene.getScrollXY(scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!);
        const { scaleX, scaleY } = scene.getAncestorScale();

        const moveActualSelection = skeleton.getCellPositionByOffset(
            moveOffsetX,
            moveOffsetY,
            scaleX,
            scaleY,
            scrollXY
        );

        const { row, column } = moveActualSelection;

        const startCell = skeleton.getNoMergeCellPositionByIndex(row, column);

        const { startX: cellStartX, startY: cellStartY, endX: cellEndX, endY: cellEndY } = startCell;

        const selectionWithCoord = this._selectionRenderService.attachRangeWithCoord(matchSelectionData.range);

        if (selectionWithCoord == null) {
            return;
        }

        const scale = Math.max(scaleX, scaleX);

        const {
            startX: selectedStartX,
            endX: selectedEndX,
            startY: selectedStartY,
            endY: selectedEndY,

            startRow: selectedStartRow,
            startColumn: selectedStartColumn,
            endRow: selectedEndRow,
            endColumn: selectedEndColumn,
        } = selectionWithCoord;

        if (initialType === HEADER_MOVE_TYPE.ROW) {
            this._moveHelperBackgroundShape?.transformByState({
                height: selectedEndY - selectedStartY,
                width: columnTotalWidth + rowHeaderWidth,
                left: 0,
                top: selectedStartY + (moveOffsetY - this._startOffsetY) / scale + scrollXY.y - startScrollXY.y,
            });
        } else {
            this._moveHelperBackgroundShape?.transformByState({
                height: rowTotalHeight + columnHeaderHeight,
                width: selectedEndX - selectedStartX,
                left: selectedStartX + (moveOffsetX - this._startOffsetX) / scale + scrollXY.x - startScrollXY.x,
                top: 0,
            });
        }

        this._moveHelperBackgroundShape?.show();

        const HEADER_MOVE_CONTROLLER_LINE_SIZE_SCALE = HEADER_MOVE_CONTROLLER_LINE_SIZE / scale;

        if (initialType === HEADER_MOVE_TYPE.ROW) {
            let top = 0;
            if (row <= selectedStartRow) {
                top = cellStartY - HEADER_MOVE_CONTROLLER_LINE_SIZE_SCALE / 2;
                this._changeToRow = row;
            } else if (row > selectedEndRow) {
                top = cellEndY - HEADER_MOVE_CONTROLLER_LINE_SIZE_SCALE / 2;
                this._changeToRow = row + 1;
            } else {
                return;
            }

            this._moveHelperLineShape?.transformByState({
                height: HEADER_MOVE_CONTROLLER_LINE_SIZE_SCALE,
                width: columnTotalWidth,
                left: rowHeaderWidth,
                top,
            });
        } else {
            let left = 0;
            if (column <= selectedStartColumn) {
                left = cellStartX - HEADER_MOVE_CONTROLLER_LINE_SIZE_SCALE / 2;
                this._changeToColumn = column;
            } else if (column > selectedEndColumn) {
                left = cellEndX - HEADER_MOVE_CONTROLLER_LINE_SIZE_SCALE / 2;
                this._changeToColumn = column + 1;
            } else {
                return;
            }

            this._moveHelperLineShape?.transformByState({
                height: rowTotalHeight,
                width: HEADER_MOVE_CONTROLLER_LINE_SIZE_SCALE,
                left,
                top: columnHeaderHeight,
            });
        }

        this._moveHelperLineShape?.show();
    }

    private _checkInHeaderRange(rowOrColumn: number, type: HEADER_MOVE_TYPE = HEADER_MOVE_TYPE.ROW) {
        const selections = this._selectionManagerService.getSelections();

        const pluginName = this._selectionManagerService.getCurrent()?.pluginName;

        if (pluginName !== NORMAL_SELECTION_PLUGIN_NAME) {
            return false;
        }

        const matchSelectionData = selections?.find((data) => {
            const range = data.range;
            const { startRow, endRow, startColumn, endColumn, rangeType } = range;
            if (type === HEADER_MOVE_TYPE.COLUMN) {
                if (rowOrColumn >= startColumn && rowOrColumn <= endColumn && RANGE_TYPE.COLUMN === rangeType) {
                    return true;
                }
                return false;
            }

            if (rowOrColumn >= startRow && rowOrColumn <= endRow && RANGE_TYPE.ROW === rangeType) {
                return true;
            }
            return false;
        });

        const range = matchSelectionData?.range;
        if (
            matchSelectionData == null ||
            range == null ||
            range.rangeType === RANGE_TYPE.ALL ||
            range.rangeType === RANGE_TYPE.NORMAL ||
            (range.rangeType === RANGE_TYPE.ROW && type !== HEADER_MOVE_TYPE.ROW) ||
            (range.rangeType === RANGE_TYPE.COLUMN && type !== HEADER_MOVE_TYPE.COLUMN)
        ) {
            return false;
        }

        return matchSelectionData;
    }

    private _clearObserverEvent() {
        const scene = this._context.scene;
        // scene.onPointerMove$.remove(this._scenePointerMoveSub);
        this._scenePointerMoveSub?.unsubscribe();
        scene.onPointerUpObserver.remove(this._upObserver);
        this._scenePointerMoveSub = null;
        this._upObserver = null;
    }

    private _newBackgroundAndLine() {
        const scene = this._context.scene;
        this._moveHelperBackgroundShape = new Rect(HEADER_MOVE_CONTROLLER_BACKGROUND, {
            fill: HEADER_MOVE_CONTROLLER_BACKGROUND_FILL,
            evented: false,
            zIndex: 100,
        });

        this._moveHelperLineShape = new Rect(HEADER_MOVE_CONTROLLER_LINE, {
            fill: HEADER_MOVE_CONTROLLER_LINE_FILL,
            evented: false,
            zIndex: 100,
        });
        scene.addObjects(
            [this._moveHelperBackgroundShape, this._moveHelperLineShape],
            SHEET_COMPONENT_HEADER_LAYER_INDEX
        );
    }

    private _disposeBackgroundAndLine() {
        this._moveHelperBackgroundShape?.dispose();
        this._moveHelperLineShape?.dispose();
    }
}
