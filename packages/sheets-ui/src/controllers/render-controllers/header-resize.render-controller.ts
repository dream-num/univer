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

/* eslint-disable max-lines-per-function */
/* eslint-disable complexity */

import type { EventState, IRange, Nullable, Workbook } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, IRenderContext, IRenderModule, SpreadsheetColumnHeader, SpreadsheetHeader } from '@univerjs/engine-render';
import type {
    IDeltaColumnWidthCommandParams,
    IDeltaRowHeightCommand,
    ISetWorksheetRowIsAutoHeightCommandParams,
} from '@univerjs/sheets';
import type { ISetWorksheetColIsAutoWidthCommandParams } from '../../commands/commands/set-worksheet-auto-col-width.command';
import {
    createInterceptorKey,
    Disposable,
    ICommandService,
    Inject,
    InterceptorManager,
    RANGE_TYPE,
} from '@univerjs/core';
import { CURSOR_TYPE, Rect, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';

import {
    DeltaColumnWidthCommand,
    DeltaRowHeightCommand,
    SetWorksheetRowIsAutoHeightCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { Subscription } from 'rxjs';
import { SetWorksheetColAutoWidthCommand } from '../../commands/commands/set-worksheet-auto-col-width.command';
import { SHEET_COMPONENT_HEADER_LAYER_INDEX, SHEET_VIEW_KEY } from '../../common/keys';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import {
    HEADER_MENU_SHAPE_SIZE,
    HEADER_MENU_SHAPE_THUMB_SIZE,
    HEADER_RESIZE_SHAPE_TYPE,
    HeaderMenuResizeShape,
    MAX_HEADER_MENU_SHAPE_SIZE,
} from '../../views/header-resize-shape';
import { getCoordByOffset, getTransformCoord } from '../utils/component-tools';

const HEADER_RESIZE_CONTROLLER_SHAPE_ROW = '__SpreadsheetHeaderResizeControllerShapeRow__';

const HEADER_RESIZE_CONTROLLER_SHAPE_COLUMN = '__SpreadsheetHeaderResizeControllerShapeColumn__';

const HEADER_RESIZE_CONTROLLER_SHAPE_HELPER = '__SpreadsheetHeaderResizeControllerShapeHelper__';

const HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR = 'rgb(199, 199, 199)';

// The minimum move offset of header resize bar, less than this value will not be triggered any actions.
const MINIMAL_OFFSET = 2;

enum HEADER_RESIZE_TYPE {
    ROW,
    COLUMN,
}

export const HEADER_RESIZE_PERMISSION_CHECK = createInterceptorKey<boolean, { row?: number; col?: number }>('headerResizePermissionCheck');

export class HeaderResizeRenderController extends Disposable implements IRenderModule {
    private _currentRow: number = 0;

    private _currentColumn: number = 0;

    private _rowResizeRect: Nullable<HeaderMenuResizeShape>;

    private _columnResizeRect: Nullable<HeaderMenuResizeShape>;

    private _headerPointerSubs: Nullable<Subscription>;
    // private _colHeaderPointerSubs: Array<Subscription>;

    private _scenePointerMoveSub: Nullable<Subscription>;

    private _scenePointerUpSub: Nullable<Subscription>;

    private _resizeHelperShape: Nullable<Rect>;

    private _startOffsetX: number = Number.POSITIVE_INFINITY;

    private _startOffsetY: number = Number.POSITIVE_INFINITY;

    public interceptor = new InterceptorManager({ HEADER_RESIZE_PERMISSION_CHECK });

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(SheetsSelectionsService) private readonly _selectionManagerService: SheetsSelectionsService,
        @ICommandService private readonly _commandService: ICommandService
    ) {
        super();

        this._init();
    }

    override dispose(): void {
        this._rowResizeRect?.dispose();
        this._rowResizeRect = null;

        this._columnResizeRect?.dispose();
        this._columnResizeRect = null;

        this._headerPointerSubs?.unsubscribe();
        this._headerPointerSubs = null;
    }

    private _init() {
        const scene = this._context.scene;

        this._rowResizeRect = new HeaderMenuResizeShape(HEADER_RESIZE_CONTROLLER_SHAPE_ROW, {
            visible: false,
            mode: HEADER_RESIZE_SHAPE_TYPE.HORIZONTAL,
            zIndex: 100,
        });

        this._columnResizeRect = new HeaderMenuResizeShape(HEADER_RESIZE_CONTROLLER_SHAPE_COLUMN, {
            visible: false,
            mode: HEADER_RESIZE_SHAPE_TYPE.VERTICAL,
            zIndex: 100,
        });

        scene.addObjects([this._rowResizeRect, this._columnResizeRect], SHEET_COMPONENT_HEADER_LAYER_INDEX);

        this._initialHover(HEADER_RESIZE_TYPE.ROW);

        this._initialHover(HEADER_RESIZE_TYPE.COLUMN);

        this._initialHoverResize(HEADER_RESIZE_TYPE.ROW);

        this._initialHoverResize(HEADER_RESIZE_TYPE.COLUMN);
    }

    private _initialHover(initialType: HEADER_RESIZE_TYPE = HEADER_RESIZE_TYPE.ROW) {
        const spreadsheetColumnHeader = this._context.components.get(SHEET_VIEW_KEY.COLUMN) as SpreadsheetColumnHeader;
        const spreadsheetRowHeader = this._context.components.get(SHEET_VIEW_KEY.ROW) as SpreadsheetHeader;
        const scene = this._context.scene;

        const eventBindingObject =
            initialType === HEADER_RESIZE_TYPE.ROW ? spreadsheetRowHeader : spreadsheetColumnHeader;

        // this._observers.push(
        //     eventBindingObject?.onPointerMoveObserver.add((evt: IPointerEvent |
        //     eventBindingObject?.onPointerLeave$.subscribeEvent()
        // );
        const pointerLeaveEvent = (_evt: IPointerEvent | IMouseEvent, _state: EventState) => {
            this._rowResizeRect?.hide();
            this._columnResizeRect?.hide();
        };

        const pointerMoveEvent = (evt: IPointerEvent | IMouseEvent, _state: EventState) => {
            const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
            if (skeleton == null || this._rowResizeRect == null || this._columnResizeRect == null) {
                return;
            }

            const { rowHeaderWidth, columnHeaderHeight } = skeleton;

            const { startX, startY, endX, endY, row, column } = getCoordByOffset(
                evt.offsetX,
                evt.offsetY,
                scene,
                skeleton
            );

            const transformCoord = getTransformCoord(evt.offsetX, evt.offsetY, scene, skeleton);

            const { scaleX, scaleY } = scene.getAncestorScale();

            const scale = Math.max(scaleX, scaleY);

            const HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE = HEADER_MENU_SHAPE_SIZE / scale;

            if (initialType === HEADER_RESIZE_TYPE.ROW) {
                let top = startY - HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE / 2;

                if (
                    transformCoord.y <= startY + HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE / 2 &&
                    transformCoord.y >= startY
                ) {
                    this._currentRow = row - 1;
                } else if (
                    transformCoord.y >= endY - HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE / 2 &&
                    transformCoord.y <= endY
                ) {
                    this._currentRow = row;
                    top = endY - HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE / 2;
                } else {
                    this._rowResizeRect.hide();
                    return;
                }

                if (this._currentRow === -1) {
                    return;
                }

                const permissionCheck = this.interceptor.fetchThroughInterceptors(HEADER_RESIZE_PERMISSION_CHECK)(null, { row: this._currentRow });
                if (!permissionCheck) {
                    return false;
                }

                const rowSize = Math.min(MAX_HEADER_MENU_SHAPE_SIZE, rowHeaderWidth / 3);

                this._rowResizeRect.transformByState({
                    left: rowHeaderWidth / 2 - rowSize / 2,
                    top,
                });

                this._rowResizeRect.setShapeProps({
                    size: rowSize,
                });

                this._rowResizeRect.show();
            } else {
                let left = startX - HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE / 2;

                if (
                    transformCoord.x <= startX + HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE / 2 &&
                    transformCoord.x >= startX
                ) {
                    this._currentColumn = column - 1;
                } else if (
                    transformCoord.x >= endX - HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE / 2 &&
                    transformCoord.x <= endX
                ) {
                    this._currentColumn = column;
                    left = endX - HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE / 2;
                } else {
                    this._columnResizeRect.hide();
                    return;
                }

                if (this._currentColumn === -1) {
                    return;
                }

                const permissionCheck = this.interceptor.fetchThroughInterceptors(HEADER_RESIZE_PERMISSION_CHECK)(null, { col: this._currentColumn });
                if (!permissionCheck) {
                    return false;
                }

                // TODO: @jocs remove magic number.
                const columnSize = columnHeaderHeight * 0.7;

                this._columnResizeRect.transformByState({
                    left,
                    top: columnHeaderHeight / 2 - columnSize / 2,
                });
                this._columnResizeRect.setShapeProps({
                    size: columnSize,
                });
                this._columnResizeRect.show();
            }
        };

        this._headerPointerSubs = new Subscription();
        this._headerPointerSubs.add(eventBindingObject?.onPointerMove$.subscribeEvent(pointerMoveEvent));
        this._headerPointerSubs.add(eventBindingObject?.onPointerLeave$.subscribeEvent(pointerLeaveEvent));
    }

    private _initialHoverResize(initialType: HEADER_RESIZE_TYPE = HEADER_RESIZE_TYPE.ROW) {
        const scene = this._context.scene;

        const eventBindingObject =
            initialType === HEADER_RESIZE_TYPE.ROW ? this._rowResizeRect : this._columnResizeRect;

        if (eventBindingObject == null) {
            return;
        }

        this.disposeWithMe(
            eventBindingObject.onPointerEnter$.subscribeEvent(() => {
                if (eventBindingObject == null) {
                    return;
                }

                eventBindingObject.show();

                scene.setCursor(
                    initialType === HEADER_RESIZE_TYPE.ROW ? CURSOR_TYPE.ROW_RESIZE : CURSOR_TYPE.COLUMN_RESIZE
                );
            })
        );

        this.disposeWithMe(
            eventBindingObject.onPointerLeave$.subscribeEvent(() => {
                if (eventBindingObject == null) {
                    return;
                }

                eventBindingObject.hide();

                scene.resetCursor();
            })
        );

        this.disposeWithMe(
            eventBindingObject.onPointerDown$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
                const skeleton = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
                if (skeleton == null) return;

                const scene = this._context.scene;

                const engine = scene.getEngine();
                const canvasMaxHeight = engine?.height || 0;
                const canvasMaxWidth = engine?.width || 0;
                const viewPort = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

                const scrollBarHorizontalHeight = (viewPort?.getScrollBar()?.horizonScrollTrack?.height || 0) + 10;
                const scrollBarVerticalWidth = (viewPort?.getScrollBar()?.verticalScrollTrack?.width || 0) + 10;
                const transformCoord = getTransformCoord(evt.offsetX, evt.offsetY, scene, skeleton);
                const { scaleX, scaleY } = scene.getAncestorScale();

                this._startOffsetX = transformCoord.x;

                this._startOffsetY = transformCoord.y;

                const currentOffsetX = skeleton.getOffsetByColumn(this._currentColumn);
                const currentOffsetY = skeleton.getOffsetByRow(this._currentRow);
                const cell = skeleton.getNoMergeCellWithCoordByIndex(this._currentRow, this._currentColumn);

                let isStartMove = false;
                let moveChangeX = 0;
                let moveChangeY = 0;

                const { columnTotalWidth, rowHeaderWidth, rowTotalHeight, columnHeaderHeight } = skeleton;

                const shapeWidth = canvasMaxWidth > columnTotalWidth + rowHeaderWidth
                    ? canvasMaxWidth
                    : columnTotalWidth + rowHeaderWidth;

                const shapeHeight = canvasMaxHeight > rowTotalHeight + columnHeaderHeight
                    ? canvasMaxHeight
                    : rowTotalHeight + columnHeaderHeight;

                const scale = Math.max(scaleX, scaleY);

                const HEADER_MENU_SHAPE_THUMB_SIZE_SCALE = HEADER_MENU_SHAPE_THUMB_SIZE / scale;

                if (initialType === HEADER_RESIZE_TYPE.ROW) {
                    this._resizeHelperShape = new Rect(HEADER_RESIZE_CONTROLLER_SHAPE_HELPER, {
                        width: shapeWidth,
                        height: HEADER_MENU_SHAPE_THUMB_SIZE_SCALE,
                        fill: HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR,
                        left: 0,
                        top: currentOffsetY - HEADER_MENU_SHAPE_THUMB_SIZE_SCALE / 2,
                    });
                } else {
                    this._resizeHelperShape = new Rect(HEADER_RESIZE_CONTROLLER_SHAPE_HELPER, {
                        width: HEADER_MENU_SHAPE_THUMB_SIZE_SCALE,
                        height: shapeHeight,
                        fill: HEADER_RESIZE_CONTROLLER_SHAPE_HELPER_COLOR,
                        left: currentOffsetX - HEADER_MENU_SHAPE_THUMB_SIZE_SCALE / 2,
                        top: 0,
                    });
                }

                const rowResizeRectX = this._columnResizeRect?.left || 0;
                const rowResizeRectY = this._rowResizeRect?.top || 0;
                scene.addObject(this._resizeHelperShape, SHEET_COMPONENT_HEADER_LAYER_INDEX);
                scene.disableObjectsEvent();

                this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
                    const relativeCoords = scene.getCoordRelativeToViewport(
                        Vector2.FromArray([this._startOffsetX, this._startOffsetY])
                    );

                    const scrollXY = scene.getScrollXYInfoByViewport(relativeCoords, viewPort);

                    const transformCoord = getTransformCoord(moveEvt.offsetX, moveEvt.offsetY, scene, skeleton);

                    const { x: moveOffsetX, y: moveOffsetY } = transformCoord;
                    const { scaleX, scaleY } = scene.getAncestorScale();
                    const scale = Math.max(scaleX, scaleY);
                    const HEADER_MENU_SHAPE_THUMB_SIZE_SCALE = HEADER_MENU_SHAPE_THUMB_SIZE / scale;

                    moveChangeX = moveOffsetX - this._startOffsetX - HEADER_MENU_SHAPE_THUMB_SIZE_SCALE / 2;

                    moveChangeY = moveOffsetY - this._startOffsetY - HEADER_MENU_SHAPE_THUMB_SIZE_SCALE / 2;

                    if (
                        Math.abs(initialType === HEADER_RESIZE_TYPE.ROW ? moveChangeY : moveChangeX) >=
                        MINIMAL_OFFSET
                    ) {
                        isStartMove = true;
                    }

                    if (initialType === HEADER_RESIZE_TYPE.ROW) {
                        if (moveChangeY > canvasMaxHeight - scrollBarHorizontalHeight + scrollXY.y - cell.startY) {
                            moveChangeY = canvasMaxHeight - scrollBarHorizontalHeight + scrollXY.y - cell.startY;
                        }

                        if (moveChangeY < -(cell.endY - cell.startY) + 2) {
                            moveChangeY = -(cell.endY - cell.startY) + 2;
                        }

                        if (isStartMove) {
                            this._resizeHelperShape?.transformByState({
                                top: currentOffsetY + moveChangeY,
                            });

                            this._rowResizeRect?.transformByState({
                                top: rowResizeRectY + moveChangeY + HEADER_MENU_SHAPE_THUMB_SIZE_SCALE / 2,
                            });

                            this._rowResizeRect?.show();

                            scene.setCursor(CURSOR_TYPE.ROW_RESIZE);
                        }
                    } else {
                        if (moveChangeX > canvasMaxWidth - scrollBarVerticalWidth + scrollXY.x - cell.startX) {
                            moveChangeX = canvasMaxWidth - scrollBarVerticalWidth + scrollXY.x - cell.startX;
                        }

                        if (moveChangeX < -(cell.endX - cell.startX) + 2) {
                            moveChangeX = -(cell.endX - cell.startX) + 2;
                        }

                        if (isStartMove) {
                            this._resizeHelperShape?.transformByState({
                                left: currentOffsetX + moveChangeX,
                            });

                            this._columnResizeRect?.transformByState({
                                left: rowResizeRectX + moveChangeX + HEADER_MENU_SHAPE_THUMB_SIZE_SCALE / 2,
                            });

                            this._columnResizeRect?.show();

                            scene.setCursor(CURSOR_TYPE.COLUMN_RESIZE);
                        }
                    }
                });

                this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent((upEvt: IPointerEvent | IMouseEvent) => {
                    const scene = this._context.scene;

                    this._clearObserverEvent();
                    this._resizeHelperShape?.dispose();
                    this._resizeHelperShape = null;

                    scene.enableObjectsEvent();

                    if (isStartMove) {
                        scene.resetCursor();

                        this._rowResizeRect?.hide();
                        this._columnResizeRect?.hide();

                        if (initialType === HEADER_RESIZE_TYPE.ROW) {
                            this._commandService.executeCommand<IDeltaRowHeightCommand>(DeltaRowHeightCommand.id, {
                                deltaY: moveChangeY,
                                anchorRow: this._currentRow,
                            });
                        } else {
                            this._commandService.executeCommand<IDeltaColumnWidthCommandParams>(
                                DeltaColumnWidthCommand.id,
                                {
                                    deltaX: moveChangeX,
                                    anchorCol: this._currentColumn,
                                }
                            );
                        }
                    }
                });
            })
        );

        this.disposeWithMe(
            eventBindingObject.onDblclick$.subscribeEvent(() => {
                const scene = this._context.scene;
                scene.resetCursor();

                const sk = this._sheetSkeletonManagerService.getCurrentParam()?.skeleton;
                if (!sk) return;

                const startRow = 0;
                const startColumn = 0;
                const endRow = sk.worksheet.getRowCount() - 1 || 0;
                const endColumn = sk.worksheet.getColumnCount() - 1 || 0;
                switch (initialType) {
                    case HEADER_RESIZE_TYPE.COLUMN: {
                        const curSelections = this._selectionManagerService.getCurrentSelections();
                        const ranges: IRange[] = [];
                        for (let i = 0; i < curSelections.length; i++) {
                            const selection = curSelections[i];

                            // if dbclick column is in selection range, then the selection range should put into auto col process.
                            if (selection.range.rangeType === RANGE_TYPE.COLUMN && this._currentColumn <= selection.range.endColumn && this._currentColumn >= selection.range.startColumn) {
                                ranges.push({
                                    startColumn: selection.range.startColumn,
                                    endColumn: selection.range.endColumn,
                                    startRow,
                                    endRow,
                                });
                            }
                        }
                        // if _currentColumn (dblick column) is not in selection range, then auto width currentColumn
                        if (ranges.length === 0) {
                            ranges.push({
                                startColumn: this._currentColumn,
                                endColumn: this._currentColumn,
                                startRow,
                                endRow,
                            });
                        }

                        this._commandService.executeCommand<ISetWorksheetColIsAutoWidthCommandParams>(
                            SetWorksheetColAutoWidthCommand.id,
                            { ranges }
                        );
                        this._columnResizeRect?.hide();
                        break;
                    }
                    case HEADER_RESIZE_TYPE.ROW:
                        this._commandService.executeCommand<ISetWorksheetRowIsAutoHeightCommandParams>(
                            SetWorksheetRowIsAutoHeightCommand.id,
                            {
                                ranges: [{
                                    startRow: this._currentRow,
                                    endRow: this._currentRow,
                                    startColumn,
                                    endColumn,
                                }],
                            }
                        );
                        this._rowResizeRect?.hide();
                        break;
                }
            })
        );
    }

    private _clearObserverEvent() {
        // const scene = this._context.scene;

        // scene.onPointerMove$.remove(this._scenePointerMoveSub);
        // scene.onPointerUp$.remove(this._scenePointerUpSub);
        this._scenePointerMoveSub?.unsubscribe();
        this._scenePointerUpSub?.unsubscribe();
        this._scenePointerMoveSub = null;
        this._scenePointerUpSub = null;
    }
}
