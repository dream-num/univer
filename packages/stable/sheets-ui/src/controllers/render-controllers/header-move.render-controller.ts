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

import type {
    EventState,
    IRange,
    Nullable,
    Workbook,
} from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, SpreadsheetColumnHeader, SpreadsheetHeader } from '@univerjs/engine-render';
import type { IMoveColsCommandParams, IMoveRowsCommandParams, ISelectionWithStyle, WorkbookSelectionModel } from '@univerjs/sheets';
import {
    createInterceptorKey,
    Disposable,
    ICommandService,
    Inject,
    InterceptorManager,
    RANGE_TYPE,
} from '@univerjs/core';
import {
    CURSOR_TYPE,
    Rect,
    ScrollTimer,
    ScrollTimerType,
    SHEET_VIEWPORT_KEY,
    Vector2,
} from '@univerjs/engine-render';
import {
    MoveColsCommand,
    MoveRowsCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';

import { Subscription } from 'rxjs';
import { SHEET_COMPONENT_HEADER_LAYER_INDEX, SHEET_VIEW_KEY } from '../../common/keys';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import { getCoordByOffset } from '../utils/component-tools';
import { matchedSelectionByRowColIndex } from '../utils/selections-tools';

const HEADER_MOVE_CONTROLLER_BACKGROUND = '__SpreadsheetHeaderMoveControllerBackground__';
const HEADER_MOVE_CONTROLLER_LINE = '__SpreadsheetHeaderMoveControllerShapeLine__';
const HEADER_MOVE_CONTROLLER_BACKGROUND_FILL = 'rgba(0, 0, 0, 0.1)';
const HEADER_MOVE_CONTROLLER_LINE_FILL = 'rgb(119, 119, 119)';
const HEADER_MOVE_CONTROLLER_LINE_SIZE = 4;
export const HEADER_MOVE_PERMISSION_CHECK = createInterceptorKey<boolean, IRange>('headerMovePermissionCheck');

export class HeaderMoveRenderController extends Disposable implements IRenderModule {
    private _startOffsetX: number = Number.NEGATIVE_INFINITY;
    private _startOffsetY: number = Number.NEGATIVE_INFINITY;

    private _moveHelperBackgroundShape: Nullable<Rect>;
    private _moveHelperLineShape: Nullable<Rect>;

    private _headerPointerDownSubs: Nullable<Subscription>;
    private _headerPointerMoveSubs: Nullable<Subscription>;
    private _headerPointerLeaveSubs: Nullable<Subscription>;

    private _dragHeaderMoveSub: Nullable<Subscription>;
    private _scenePointerUpSub: Nullable<Subscription>;

    private _scrollTimer: Nullable<ScrollTimer>;

    private _changeFromColumn = -1;
    private _changeFromRow = -1;
    private _changeToColumn = -1;
    private _changeToRow = -1;

    public readonly interceptor = new InterceptorManager({ HEADER_MOVE_PERMISSION_CHECK });

    private readonly _workbookSelections: WorkbookSelectionModel;

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetsSelectionsService) selectionManagerService: SheetsSelectionsService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._workbookSelections = selectionManagerService.getWorkbookSelections(this._context.unitId);
        this._init();
    }

    override dispose(): void {
        this._moveHelperBackgroundShape?.dispose();
        this._moveHelperLineShape?.dispose();

        this._headerPointerMoveSubs?.unsubscribe();
        this._headerPointerLeaveSubs?.unsubscribe();
        this._headerPointerDownSubs?.unsubscribe();
        this._headerPointerMoveSubs = null;
        this._headerPointerLeaveSubs = null;
        this._headerPointerDownSubs = null;

        // scene.onPointerMove$.remove(this._scenePointerMoveSub);
        // scene.onPointerUp$.remove(this._scenePointerUpSub);
        this._dragHeaderMoveSub?.unsubscribe();
        this._scenePointerUpSub?.unsubscribe();
        this._dragHeaderMoveSub = null;
        this._scenePointerUpSub = null;
        this._scrollTimer?.dispose();
    }

    private _init() {
        this._initialRowOrColumn(RANGE_TYPE.ROW);
        this._initialRowOrColumn(RANGE_TYPE.COLUMN);
    }

    // eslint-disable-next-line max-lines-per-function
    private _initialRowOrColumn(initialType: RANGE_TYPE.ROW | RANGE_TYPE.COLUMN = RANGE_TYPE.ROW) {
        const spreadsheetColumnHeader = this._context.components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        const spreadsheetRowHeader = this._context.components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;
        const scene = this._context.scene;
        const eventBindingObject =
            initialType === RANGE_TYPE.ROW ? spreadsheetRowHeader : spreadsheetColumnHeader;

        // only style cursor style when pointer move
        const pointerMoveHandler = (evt: IPointerEvent | IMouseEvent) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
            if (skeleton == null) {
                return;
            }

            const selectionRange = this._workbookSelections.getCurrentLastSelection()?.range;
            if (!selectionRange) return;

            const permissionCheck = this.interceptor.fetchThroughInterceptors(HEADER_MOVE_PERMISSION_CHECK)(false, selectionRange);

            if (!permissionCheck) {
                return;
            }

            const currentSelections = this._workbookSelections.getCurrentSelections();
            const { row, column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);
            const matchSelectionData = matchedSelectionByRowColIndex(
                currentSelections,
                initialType === RANGE_TYPE.ROW ? row : column,
                initialType
            );

            if (!matchSelectionData) {
                scene.resetCursor();
                return;
            }

            scene.setCursor(CURSOR_TYPE.GRAB);
        };

        const pointerLeaveHandler = () => {
            this._moveHelperBackgroundShape?.hide();
            this._moveHelperLineShape?.hide();
            scene.resetCursor();
        };

        // eslint-disable-next-line max-lines-per-function
        const pointerDownHandler = (evt: IPointerEvent | IMouseEvent, state: EventState) => {
            if (state.isStopPropagation) return;

            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
            if (skeleton == null) {
                return;
            }

            const selectionRange = this._workbookSelections.getCurrentLastSelection()?.range;
            if (!selectionRange) return;

            const permissionCheck = this.interceptor.fetchThroughInterceptors(HEADER_MOVE_PERMISSION_CHECK)(false, selectionRange);
            if (!permissionCheck) {
                return;
            }

            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

            const relativeCoords = scene.getCoordRelativeToViewport(Vector2.FromArray([evtOffsetX, evtOffsetY]));

            const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

            this._startOffsetX = newEvtOffsetX;

            this._startOffsetY = newEvtOffsetY;

            const { row, column } = getCoordByOffset(evt.offsetX, evt.offsetY, scene, skeleton);

            let scrollType: ScrollTimerType;

            if (initialType === RANGE_TYPE.ROW) {
                this._changeFromRow = row;
                scrollType = ScrollTimerType.Y;
            } else {
                this._changeFromColumn = column;
                scrollType = ScrollTimerType.X;
            }

            const currentSelections = this._workbookSelections.getCurrentSelections();
            const matchSelectionData = matchedSelectionByRowColIndex(
                currentSelections,
                initialType === RANGE_TYPE.ROW ? row : column,
                initialType
            );

            if (!matchSelectionData) {
                return;
            }
            // if matchSelectionData true, then into grab header mode.

            const startScrollXY = scene.getScrollXYInfoByViewport(
                Vector2.FromArray([this._startOffsetX, this._startOffsetY])
            );

            this._newBackgroundAndLine();

            scene.setCursor(CURSOR_TYPE.GRABBING);

            scene.disableObjectsEvent();

            let scrollTimerInitd = false;
            let scrollTimer: ScrollTimer;

            const initScrollTimer = () => {
                if (scrollTimerInitd) {
                    return;
                }

                scrollTimer = ScrollTimer.create(scene, scrollType);
                this._scrollTimer = scrollTimer;
                const mainViewport = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);
                scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY, mainViewport);
                scrollTimerInitd = true;
            };

            this._dragHeaderMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
                initScrollTimer();
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

                const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getCoordRelativeToViewport(
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

            this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
                this._disposeBackgroundAndLine();
                scene.resetCursor();
                scene.enableObjectsEvent();
                this._clearObserverEvent();
                this._scrollTimer?.dispose();

                // when multi ranges are selected, we should only move the range that contains
                // `changeFromRow`
                const selections = this._workbookSelections.getCurrentSelections();

                if (initialType === RANGE_TYPE.ROW) {
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
        };
        // if (initialType === HEADER_MOVE_TYPE.ROW) {
        //     this._rowHeaderPointerMoveSub = spreadsheetRowHeader.onPointerMove$.subscribeEvent(pointerMoveHandler);
        // } else {
        //     this._colHeaderPointerMoveSub = spreadsheetColumnHeader.onPointerMove$.subscribeEvent(pointerMoveHandler);
        // }

        this._headerPointerMoveSubs = new Subscription();
        this._headerPointerMoveSubs.add(eventBindingObject.onPointerMove$.subscribeEvent(pointerMoveHandler));

        this._headerPointerLeaveSubs = new Subscription();
        this._headerPointerLeaveSubs.add(eventBindingObject?.onPointerLeave$.subscribeEvent(pointerLeaveHandler));

        this._headerPointerDownSubs = new Subscription();
        this._headerPointerDownSubs.add(eventBindingObject?.onPointerDown$.subscribeEvent(pointerDownHandler));
    }

    // eslint-disable-next-line max-lines-per-function
    private _rowColumnMoving(
        moveOffsetX: number,
        moveOffsetY: number,
        matchSelectionData: ISelectionWithStyle,
        startScrollXY: {
            x: number;
            y: number;
        },
        initialType: RANGE_TYPE.ROW | RANGE_TYPE.COLUMN
    ) {
        const scene = this._context.scene;
        const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
        if (skeleton == null) {
            return;
        }

        const { rowHeaderWidth, columnHeaderHeight, rowTotalHeight, columnTotalWidth } = skeleton;

        // const scrollXY = scene.getScrollXYByRelativeCoords(Vector2.FromArray([this._startOffsetX, this._startOffsetY]));
        const scrollXY = scene.getViewportScrollXY(scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!);
        const { scaleX, scaleY } = scene.getAncestorScale();

        const moveActualSelection = skeleton.getCellIndexByOffset(
            moveOffsetX,
            moveOffsetY,
            scaleX,
            scaleY,
            scrollXY
        );

        const { row, column } = moveActualSelection;

        const startCell = skeleton.getNoMergeCellWithCoordByIndex(row, column);

        const { startX: cellStartX, startY: cellStartY, endX: cellEndX, endY: cellEndY } = startCell;

        const selectionWithCoord = this._sheetSkeletonManagerService.attachRangeWithCoord(matchSelectionData.range);

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

        if (initialType === RANGE_TYPE.ROW) {
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

        if (initialType === RANGE_TYPE.ROW) {
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

    private _clearObserverEvent() {
        // const scene = this._context.scene;
        // scene.onPointerMove$.remove(this._scenePointerMoveSub);
        // scene.onPointerUp$.remove(this._scenePointerUpSub);
        this._dragHeaderMoveSub?.unsubscribe();
        this._scenePointerUpSub?.unsubscribe();
        this._dragHeaderMoveSub = null;
        this._scenePointerUpSub = null;
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
