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

/* eslint-disable max-lines-per-function */
import type { IFreeze, Injector, IRangeWithCoord, Nullable, ThemeService } from '@univerjs/core';
import { ColorKit, Quantity, UniverInstanceType } from '@univerjs/core';
import type { IMouseEvent, IPointerEvent, Scene, SpreadsheetSkeleton, Viewport } from '@univerjs/engine-render';
import { CURSOR_TYPE, IRenderManagerService, isRectIntersect, Rect, ScrollTimer, ScrollTimerType, SHEET_VIEWPORT_KEY, Vector2 } from '@univerjs/engine-render';
import { getNormalSelectionStyle, SELECTION_CONTROL_BORDER_BUFFER_WIDTH } from '@univerjs/sheets';

import type { Subscription } from 'rxjs';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';
import { ISheetSelectionRenderService } from './base-selection-render.service';
import { RANGE_FILL_PERMISSION_CHECK, RANGE_MOVE_PERMISSION_CHECK } from './const';
import type { SelectionControl } from './selection-shape';

const HELPER_SELECTION_TEMP_NAME = '__SpreadsheetHelperSelectionTempRect';

const SELECTION_CONTROL_DELETING_LIGHTEN = 35;

export interface ISelectionShapeTargetSelection {
    originControl: SelectionControl;
    targetSelection: IRangeWithCoord;
}

/**
 * for auto-fill (crosshair expand selection range)
 * drag selection range
 */
export class SelectionShapeExtension {
    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _relativeSelectionPositionRow = 0;

    private _relativeSelectionPositionColumn = 0;

    private _relativeSelectionRowLength = 0;

    private _relativeSelectionColumnLength = 0;

    private _scenePointerMoveSub: Nullable<Subscription>;

    private _scenePointerUpSub: Nullable<Subscription>;

    private _helperSelection: Nullable<Rect>;

    private _scrollTimer!: ScrollTimer;

    private _activeViewport!: Viewport;

    private _targetSelection: IRangeWithCoord = {
        startY: 0,
        endY: 0,
        startX: 0,
        endX: 0,
        startRow: -1,
        endRow: -1,
        startColumn: -1,
        endColumn: -1,
    };

    private _isInMergeState: boolean = false;

    private _fillControlColors: string[] = [];

    constructor(
        private _control: SelectionControl,
        private _skeleton: SpreadsheetSkeleton,
        private _scene: Scene,
        private readonly _themeService: ThemeService,

        /** @deprecated injection in extensions should be strictly limited. */
        // TODO@ybzky: remove injector here, permission control should be update from the outside.
        private readonly _injector: Injector,
        private _selectionHooks: Record<string, () => void>
    ) {
        this._initialControl();
        this._initialWidget();
        this._initialFill();

        this._control.dispose$.subscribe(() => {
            this.dispose();
        });
    }

    get isHelperSelection() {
        return this._control.isHelperSelection;
    }

    dispose() {
        this._scrollTimer?.dispose();
        this._fillControlColors = [];
        this._clearObserverEvent();
        this._helperSelection?.dispose();
    }

    private _getFreeze() {
        const renderManagerService = this._injector.get(IRenderManagerService);
        const freeze = renderManagerService.withCurrentTypeOfUnit(UniverInstanceType.UNIVER_SHEET, SheetSkeletonManagerService)
            ?.getCurrent()?.skeleton.getWorksheetConfig().freeze;
        return freeze;
    }

    private _isSelectionInViewport(selection: IRangeWithCoord, viewport: Viewport) {
        const freeze: IFreeze = this._getFreeze() || {
            startRow: -1,
            startColumn: -1,
            xSplit: 0,
            ySplit: 0,
        };

        switch (viewport.viewportKey) {
            case SHEET_VIEWPORT_KEY.VIEW_MAIN:
                return selection.endRow >= freeze.startRow && selection.endColumn >= freeze.startColumn;

            case SHEET_VIEWPORT_KEY.VIEW_MAIN_TOP:
            case SHEET_VIEWPORT_KEY.VIEW_COLUMN_RIGHT:
                return selection.endColumn >= freeze.startColumn && selection.startRow < freeze.startRow;

            case SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT:
            case SHEET_VIEWPORT_KEY.VIEW_ROW_BOTTOM:
                return selection.endRow >= freeze.startRow && selection.startColumn < freeze.startColumn;

            case SHEET_VIEWPORT_KEY.VIEW_MAIN_LEFT_TOP:
            case SHEET_VIEWPORT_KEY.VIEW_COLUMN_LEFT:
            case SHEET_VIEWPORT_KEY.VIEW_ROW_TOP:
            case SHEET_VIEWPORT_KEY.VIEW_LEFT_TOP:
                return selection.startRow < freeze.startRow && selection.startColumn < freeze.startColumn;
            default:
                break;
        }
    }

    private _clearObserverEvent() {
        this._scenePointerMoveSub?.unsubscribe();
        this._scenePointerUpSub?.unsubscribe();
        this._scenePointerMoveSub = null;
        this._scenePointerUpSub = null;
    }

    private _initialControl() {
        const { leftControl, rightControl, topControl, bottomControl } = this._control;

        [leftControl, rightControl, topControl, bottomControl].forEach((control) => {
            control.onPointerEnter$.subscribeEvent(() => {
                const permissionCheck = this._injector.get(ISheetSelectionRenderService, Quantity.OPTIONAL)
                    ?.interceptor.fetchThroughInterceptors(RANGE_MOVE_PERMISSION_CHECK)(false, null);
                if (permissionCheck === false) {
                    return;
                }

                control.setCursor(CURSOR_TYPE.MOVE);
            });

            control.onPointerLeave$.subscribeEvent(() => {
                control.resetCursor();
            });

            control.onPointerDown$.subscribeEvent(this._controlEvent.bind(this));
        });
    }

    /**
     * Dragging the whole selection and moving (when cursor is crosshair), not for 8 control points.
     * Now only ref selection can do this.
     * @param moveOffsetX
     * @param moveOffsetY
     */
    private _controlMoving(moveOffsetX: number, moveOffsetY: number): void {
        const scene = this._scene;

        const scrollXY = scene.getVpScrollXYInfoByPosToVp(Vector2.FromArray([moveOffsetX, moveOffsetY]));

        const { scaleX, scaleY } = scene.getAncestorScale();

        const moveActualSelection = this._skeleton.getCellPositionByOffset(
            moveOffsetX,
            moveOffsetY,
            scaleX,
            scaleY,
            scrollXY
        );

        const { row, column } = moveActualSelection;

        const maxRow = this._skeleton.getRowCount() - 1;

        const maxColumn = this._skeleton.getColumnCount() - 1;

        let startRow = row + this._relativeSelectionPositionRow;

        if (startRow < 0) {
            startRow = 0;
        }

        let endRow = startRow + this._relativeSelectionRowLength;

        if (endRow > maxRow) {
            endRow = maxRow;

            if (endRow - startRow < this._relativeSelectionRowLength) {
                startRow = endRow - this._relativeSelectionRowLength;
            }
        }

        let startColumn = column + this._relativeSelectionPositionColumn;

        if (startColumn < 0) {
            startColumn = 0;
        }

        let endColumn = startColumn + this._relativeSelectionColumnLength;

        if (endColumn > maxColumn) {
            endColumn = maxColumn;

            if (endColumn - startColumn < this._relativeSelectionColumnLength) {
                startColumn = endColumn - this._relativeSelectionColumnLength;
            }
        }

        const startCell = this._skeleton.getNoMergeCellPositionByIndex(startRow, startColumn);
        const endCell = this._skeleton.getNoMergeCellPositionByIndex(endRow, endColumn);

        const startY = startCell?.startY || 0;
        const endY = endCell?.endY || 0;
        const startX = startCell?.startX || 0;
        const endX = endCell?.endX || 0;

        this._helperSelection?.transformByState({
            left: startX,
            top: startY,
            width: endX - startX,
            height: endY - startY,
        });

        this._targetSelection = {
            startY,
            endY,
            startX,
            endX,
            startRow,
            endRow,
            startColumn,
            endColumn,
        };

        this._control.selectionMoving$.next(this._targetSelection);
    }

    /**
     * Pointer down event for whole selectionControl (when cursor turns to crosshair). Not for dragging 8 control points.
     * Also handle pointermove and pointerup for whole selectionControl.
     * @param evt
     */
    private _controlEvent(evt: IMouseEvent | IPointerEvent): void {
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const scene = this._scene;

        const relativeCoords = scene.getRelativeToViewportCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        const scrollXY = scene.getVpScrollXYInfoByPosToVp(relativeCoords);

        const { scaleX, scaleY } = scene.getAncestorScale();

        const actualSelection = this._skeleton.getCellPositionByOffset(
            newEvtOffsetX,
            newEvtOffsetY,
            scaleX,
            scaleY,
            scrollXY
        );

        this._startOffsetX = newEvtOffsetX;
        this._startOffsetY = newEvtOffsetY;

        const { row, column } = actualSelection;

        const {
            startRow: originStartRow,
            startColumn: originStartColumn,
            endRow: originEndRow,
            endColumn: originEndColumn,
        } = this._control.model;

        let fixRow = 0;
        let fixColumn = 0;

        if (row < originStartRow) {
            fixRow -= 1;
        } else if (row > originEndRow) {
            fixRow += 1;
        }

        if (column < originStartColumn) {
            fixColumn -= 1;
        } else if (column > originEndColumn) {
            fixColumn += 1;
        }

        this._relativeSelectionPositionRow = originStartRow - row + fixRow;
        this._relativeSelectionPositionColumn = originStartColumn - column + fixColumn;
        this._relativeSelectionRowLength = originEndRow - originStartRow;
        this._relativeSelectionColumnLength = originEndColumn - originStartColumn;

        const style = this._control.currentStyle!;
        const scale = this._getScale();

        if (this.isHelperSelection) {
            this._helperSelection = new Rect(HELPER_SELECTION_TEMP_NAME, {
                stroke: style.stroke,
                strokeWidth: style.strokeWidth / scale,
            });
            scene.addObject(this._helperSelection);
        }

        // const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));
        // const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;
        const viewMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN)!;
        const scrollTimer = ScrollTimer.create(scene);
        this._scrollTimer = scrollTimer;
        scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY, viewMain);

        scene.disableEvent();

        this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const permissionCheck = this._injector.get(ISheetSelectionRenderService, Quantity.OPTIONAL)
                ?.interceptor.fetchThroughInterceptors(RANGE_MOVE_PERMISSION_CHECK)(false, null);
            if (permissionCheck === false) {
                return;
            }

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeToViewportCoord(
                Vector2.FromArray([moveOffsetX, moveOffsetY])
            );

            this._controlMoving(newMoveOffsetX, newMoveOffsetY);

            scene.setCursor(CURSOR_TYPE.MOVE);

            scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                this._controlMoving(newMoveOffsetX, newMoveOffsetY);
            });
        });

        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
            this._helperSelection?.dispose();
            const scene = this._scene;
            scene.resetCursor();
            this._clearObserverEvent();
            scene.enableEvent();
            this._scrollTimer?.dispose();
            this._control.selectionMoved$.next(this._targetSelection);

            // _selectionHooks.selectionMoveEnd should placed after this._control.selectionMoved$,
            // because selectionMoveEnd will dispose all selectionControls, then this._control will be null.
            this._selectionHooks.selectionMoveEnd?.();
        });
    }

    private _initialWidget() {
        const {
            topLeftWidget,
            topCenterWidget,
            topRightWidget,
            middleLeftWidget,
            middleRightWidget,
            bottomLeftWidget,
            bottomCenterWidget,
            bottomRightWidget,
        } = this._control;

        const cursors: CURSOR_TYPE[] = [
            CURSOR_TYPE.NORTH_WEST_RESIZE,
            CURSOR_TYPE.NORTH_RESIZE,
            CURSOR_TYPE.NORTH_EAST_RESIZE,
            CURSOR_TYPE.WEST_RESIZE,
            CURSOR_TYPE.EAST_RESIZE,
            CURSOR_TYPE.SOUTH_WEST_RESIZE,
            CURSOR_TYPE.SOUTH_RESIZE,
            CURSOR_TYPE.SOUTH_EAST_RESIZE,
        ];

        [
            topLeftWidget,
            topCenterWidget,
            topRightWidget,
            middleLeftWidget,
            middleRightWidget,
            bottomLeftWidget,
            bottomCenterWidget,
            bottomRightWidget,
        ].forEach((control, index) => {
            control.onPointerEnter$.subscribeEvent(() => {
                control.setCursor(cursors[index]);
            });

            control.onPointerLeave$.subscribeEvent(() => {
                control.resetCursor();
            });

            control.onPointerDown$.subscribeEvent((evt: IMouseEvent | IPointerEvent) => {
                this._widgetPointerDownEvent(evt, cursors[index]);
            });
        });
    }

    /**
     * Pointer down Events for 8 control point.
     * @param evt
     * @param cursor
     */
    private _widgetPointerDownEvent(evt: IMouseEvent | IPointerEvent, cursor: CURSOR_TYPE) {
        const scene = this._scene;

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
        const relativeCoords = scene.getRelativeToViewportCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));
        const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;

        const {
            startRow: originStartRow,
            startColumn: originStartColumn,
            endRow: originEndRow,
            endColumn: originEndColumn,
        } = this._control.model;

        // When dragging the bottom line of the selection area over the previous top line, at this time, endRow < startRow
        // when dragging top line lower than the previous bottom line, at this time, startRow > endRow
        // see https://github.com/dream-num/univer-pro/issues/1451
        const startRow = Math.min(originStartRow, originEndRow);
        const startColumn = Math.min(originStartColumn, originEndColumn);
        const endRow = Math.max(originStartRow, originEndRow);
        const endColumn = Math.max(originStartColumn, originEndColumn);

        this._relativeSelectionPositionRow = startRow;
        this._relativeSelectionPositionColumn = startColumn;
        this._relativeSelectionRowLength = endRow - startRow;
        this._relativeSelectionColumnLength = endColumn - startColumn;

        if (cursor === CURSOR_TYPE.NORTH_WEST_RESIZE) {
            this._relativeSelectionPositionRow = endRow;
            this._relativeSelectionPositionColumn = endColumn;
        } else if (cursor === CURSOR_TYPE.NORTH_RESIZE) {
            this._relativeSelectionPositionRow = endRow;
        } else if (cursor === CURSOR_TYPE.NORTH_EAST_RESIZE) {
            this._relativeSelectionPositionRow = endRow;
        } else if (cursor === CURSOR_TYPE.WEST_RESIZE) {
            this._relativeSelectionPositionColumn = endColumn;
        } else if (cursor === CURSOR_TYPE.SOUTH_WEST_RESIZE) {
            this._relativeSelectionPositionColumn = endColumn;
        } else if (cursor === CURSOR_TYPE.SOUTH_RESIZE) {
            this._relativeSelectionPositionRow = startRow;
        }

        const scrollTimer = ScrollTimer.create(scene);
        scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY);
        this._scrollTimer = scrollTimer;

        scene.disableEvent();

        this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeToViewportCoord(
                Vector2.FromArray([moveOffsetX, moveOffsetY])
            );

            this._widgetMoving(newMoveOffsetX, newMoveOffsetY, cursor);

            scene.setCursor(cursor);

            scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                this._widgetMoving(newMoveOffsetX, newMoveOffsetY, cursor);
            });
        });

        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
            const scene = this._scene;
            scene.resetCursor();
            this._clearObserverEvent();
            scene.enableEvent();
            this._scrollTimer?.dispose();
            this._control.selectionScaled$.next(this._targetSelection);

            // _selectionHooks.selectionMoveEnd should placed after this._control.selectionMoved$,
            // because selectionMoveEnd will dispose all selectionControls, then this._control will be null.
            this._selectionHooks.selectionMoveEnd?.();
        });
    }

    /**
     * Pointer move Events for 8 control point.
     * @param moveOffsetX
     * @param moveOffsetY
     * @param cursor
     */
    private _widgetMoving(moveOffsetX: number, moveOffsetY: number, cursor: CURSOR_TYPE) {
        const scene = this._scene;

        const scrollXY = scene.getVpScrollXYInfoByPosToVp(Vector2.FromArray([this._startOffsetX, this._startOffsetY]));
        const { scaleX, scaleY } = scene.getAncestorScale();
        const moveActualSelection = this._skeleton.getCellPositionByOffset(
            moveOffsetX,
            moveOffsetY,
            scaleX,
            scaleY,
            scrollXY
        );

        const { row, column } = moveActualSelection;
        const { rowHeaderWidth, columnHeaderHeight } = this._skeleton;
        // const maxRow = this._skeleton.getRowCount() - 1;
        // const maxColumn = this._skeleton.getColumnCount() - 1;
        let startRow = this._relativeSelectionPositionRow;
        let startColumn = this._relativeSelectionPositionColumn;
        let endRow = row;
        let endColumn = column;

        if (cursor === CURSOR_TYPE.NORTH_WEST_RESIZE) {
            startRow = row;
            startColumn = column;
            endRow = this._relativeSelectionPositionRow;
            endColumn = this._relativeSelectionPositionColumn;
        } else if (cursor === CURSOR_TYPE.NORTH_RESIZE) {
            startRow = row;
            startColumn = this._relativeSelectionPositionColumn;
            endRow = this._relativeSelectionPositionRow;
            endColumn = this._relativeSelectionPositionColumn + this._relativeSelectionColumnLength;
        } else if (cursor === CURSOR_TYPE.NORTH_EAST_RESIZE) {
            startRow = row;
            startColumn = this._relativeSelectionPositionColumn;
            endRow = this._relativeSelectionPositionRow;
            endColumn = column;
        } else if (cursor === CURSOR_TYPE.WEST_RESIZE) {
            startRow = this._relativeSelectionPositionRow;
            startColumn = column;
            endRow = this._relativeSelectionPositionRow + this._relativeSelectionRowLength;
            endColumn = this._relativeSelectionPositionColumn;
        } else if (cursor === CURSOR_TYPE.EAST_RESIZE) {
            endRow = this._relativeSelectionPositionRow + this._relativeSelectionRowLength;
        } else if (cursor === CURSOR_TYPE.SOUTH_WEST_RESIZE) {
            startRow = this._relativeSelectionPositionRow;
            startColumn = column;
            endRow = row;
            endColumn = this._relativeSelectionPositionColumn;
        } else if (cursor === CURSOR_TYPE.SOUTH_RESIZE) {
            startRow = this._relativeSelectionPositionRow;
            startColumn = this._relativeSelectionPositionColumn;
            endRow = row;
            endColumn = this._relativeSelectionPositionColumn + this._relativeSelectionColumnLength;
        }

        const {
            startRow: finalStartRow,
            startColumn: finalStartColumn,
            endRow: finalEndRow,
            endColumn: finalEndColumn,
        } = this._swapPositions(startRow, startColumn, endRow, endColumn);

        const startCell = this._skeleton.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn);
        const endCell = this._skeleton.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn);

        const startY = startCell?.startY || 0;
        const endY = endCell?.endY || 0;
        const startX = startCell?.startX || 0;
        const endX = endCell?.endX || 0;

        this._targetSelection = {
            startY,
            endY,
            startX,
            endX,
            startRow,
            endRow,
            startColumn,
            endColumn,
        };

        this._control.update(this._targetSelection, rowHeaderWidth, columnHeaderHeight, this._control.currentStyle);
        this._control.clearHighlight();
        this._control.selectionScaling$.next(this._targetSelection);
    }

    private _initialFill() {
        const { fillControl } = this._control;

        fillControl.onPointerEnter$.subscribeEvent((evt: IPointerEvent | IMouseEvent) => {
            const permissionCheck = this._injector.get(ISheetSelectionRenderService).interceptor.fetchThroughInterceptors(RANGE_FILL_PERMISSION_CHECK)(false, { x: evt.offsetX, y: evt.offsetY, skeleton: this._skeleton, scene: this._scene });

            if (!permissionCheck) {
                return;
            }
            fillControl.setCursor(CURSOR_TYPE.CROSSHAIR);
        });

        fillControl.onPointerLeave$.subscribeEvent(() => {
            fillControl.resetCursor();
        });

        fillControl.onPointerDown$.subscribeEvent(this._fillEvent.bind(this));
    }

    // eslint-disable-next-line complexity
    private _fillMoving(moveOffsetX: number, moveOffsetY: number) {
        const scene = this._scene;
        // const activeViewport = scene.getActiveViewportByCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));
        // const scrollXY = activeViewport ? scene.getScrollXY(activeViewport) : { x: 0, y: 0 };
        const scrollXY = scene.getViewportScrollXY(this._activeViewport);

        const { scaleX, scaleY } = scene.getAncestorScale();

        const moveActualSelection = this._skeleton.getCellPositionByOffset(
            moveOffsetX,
            moveOffsetY,
            scaleX,
            scaleY,
            scrollXY
        );

        const { row, column } = moveActualSelection;

        const moveRelativeCoords = scene.getRelativeToViewportCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));

        const maxRow = this._skeleton.getRowCount() - 1;

        const maxColumn = this._skeleton.getColumnCount() - 1;

        let startRow = this._relativeSelectionPositionRow;

        let startColumn = this._relativeSelectionPositionColumn;

        let endRow = this._relativeSelectionPositionRow + this._relativeSelectionRowLength;

        let endColumn = this._relativeSelectionPositionColumn + this._relativeSelectionColumnLength;

        let isLighten = false;

        let isRowDropping = true;

        if ((column < startColumn || column > endColumn) && row >= startRow && row <= endRow) {
            const rulerValue = this._fillRuler(
                column,
                startColumn,
                endColumn,
                this._relativeSelectionColumnLength,
                maxColumn
            );

            startColumn = rulerValue.startRowOrColumn;

            endColumn = rulerValue.endRowOrColumn;

            isLighten = rulerValue.isLighten;

            isRowDropping = false;
        } else if ((row < startRow || row > endRow) && column >= startColumn && column <= endColumn) {
            const rulerValue = this._fillRuler(row, startRow, endRow, this._relativeSelectionRowLength, maxRow);

            startRow = rulerValue.startRowOrColumn;

            endRow = rulerValue.endRowOrColumn;

            isLighten = rulerValue.isLighten;
        } else if (
            Math.abs(this._startOffsetX - moveRelativeCoords.x - scrollXY.x) / 2 >
            Math.abs(this._startOffsetY - moveRelativeCoords.y - scrollXY.y)
        ) {
            const rulerValue = this._fillRuler(
                column,
                startColumn,
                endColumn,
                this._relativeSelectionColumnLength,
                maxColumn
            );

            startColumn = rulerValue.startRowOrColumn;

            endColumn = rulerValue.endRowOrColumn;

            isLighten = rulerValue.isLighten;

            isRowDropping = false;
        } else {
            const rulerValue = this._fillRuler(row, startRow, endRow, this._relativeSelectionRowLength, maxRow);

            startRow = rulerValue.startRowOrColumn;

            endRow = rulerValue.endRowOrColumn;

            isLighten = rulerValue.isLighten;
        }

        const startCell = this._skeleton.getNoMergeCellPositionByIndex(startRow, startColumn);
        const endCell = this._skeleton.getNoMergeCellPositionByIndex(endRow, endColumn);

        const startY = startCell?.startY || 0;
        const endY = endCell?.endY || 0;
        const startX = startCell?.startX || 0;
        const endX = endCell?.endX || 0;

        if (isLighten) {
            this._controlHandler((o, index) => {
                const newColor = new ColorKit(this._fillControlColors[index])
                    .lighten(SELECTION_CONTROL_DELETING_LIGHTEN)
                    .toRgbString();
                o.setProps({
                    fill: newColor,
                });
            });
        } else {
            this._controlHandler((o, index) => {
                o.setProps({
                    fill: this._fillControlColors[index],
                });
            });
        }

        const SELECTION_CONTROL_BORDER_BUFFER_WIDTH_SCALE = SELECTION_CONTROL_BORDER_BUFFER_WIDTH / this._getScale();

        if ((startRow === endRow && isRowDropping === true) || (startColumn === endColumn && isRowDropping === false)) {
            this._helperSelection?.hide();
        } else {
            this._helperSelection?.transformByState({
                left: startX - SELECTION_CONTROL_BORDER_BUFFER_WIDTH_SCALE / 2,
                top: startY - SELECTION_CONTROL_BORDER_BUFFER_WIDTH_SCALE / 2,
                width: endX - startX,
                height: endY - startY,
            });

            this._helperSelection?.show();
        }

        this._targetSelection = {
            startY,
            endY,
            startX,
            endX,
            startRow,
            endRow,
            startColumn,
            endColumn,
        };

        this._control.selectionFilling$.next(this._targetSelection);
    }

    private _fillEvent(evt: IMouseEvent | IPointerEvent) {
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const scene = this._scene;

        const relativeCoords = scene.getRelativeToViewportCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        this._startOffsetX = newEvtOffsetX;

        this._startOffsetY = newEvtOffsetY;

        const {
            startRow: originStartRow,
            startColumn: originStartColumn,
            endRow: originEndRow,
            endColumn: originEndColumn,
        } = this._control.model;

        this._isInMergeState = this._hasMergeInRange(originStartRow, originStartColumn, originEndRow, originEndColumn);

        this._relativeSelectionPositionRow = originStartRow;

        this._relativeSelectionPositionColumn = originStartColumn;

        this._relativeSelectionRowLength = originEndRow - originStartRow;

        this._relativeSelectionColumnLength = originEndColumn - originStartColumn;

        const style = this._control.currentStyle;
        let stroke = style?.stroke;
        let strokeWidth = style?.strokeWidth;
        const defaultStyle = getNormalSelectionStyle(this._themeService);
        if (stroke == null) {
            stroke = defaultStyle.stroke;
        }

        if (strokeWidth == null) {
            strokeWidth = defaultStyle.strokeWidth;
        }

        const scale = this._getScale();

        strokeWidth /= scale;

        const SELECTION_CONTROL_BORDER_BUFFER_WIDTH_SCALE = SELECTION_CONTROL_BORDER_BUFFER_WIDTH / scale;

        const darkenColor = new ColorKit(stroke).darken(2).toRgbString();

        if (this.isHelperSelection) {
            this._helperSelection = new Rect(HELPER_SELECTION_TEMP_NAME, {
                stroke: darkenColor,
                strokeWidth: strokeWidth + SELECTION_CONTROL_BORDER_BUFFER_WIDTH_SCALE / 2,
            });
            scene.addObject(this._helperSelection);
        }

        this._activeViewport = scene.getActiveViewportByCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]))!;

        const viewportMain = scene.getViewport(SHEET_VIEWPORT_KEY.VIEW_MAIN);

        const scrollTimer = ScrollTimer.create(
            scene,
            this._activeViewport.viewportKey === SHEET_VIEWPORT_KEY.VIEW_MAIN ? ScrollTimerType.ALL : ScrollTimerType.NONE
        );

        scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY, viewportMain);

        this._scrollTimer = scrollTimer;

        scene.disableEvent();

        this._controlHandler((o) => {
            this._fillControlColors.push(o.fill as string);
        });

        // Controls the border of the expanding selection area
        this._scenePointerMoveSub = scene.onPointerMove$.subscribeEvent((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
            const currentViewport = scene.getActiveViewportByCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));

            const permissionCheck = this._injector.get(ISheetSelectionRenderService).interceptor.fetchThroughInterceptors(RANGE_FILL_PERMISSION_CHECK)(false, { x: evt.offsetX, y: evt.offsetY, skeleton: this._skeleton, scene: this._scene });

            if (!permissionCheck) {
                return;
            }

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeToViewportCoord(
                Vector2.FromArray([moveOffsetX, moveOffsetY])
            );

            this._fillMoving(newMoveOffsetX, newMoveOffsetY);

            scene.setCursor(CURSOR_TYPE.CROSSHAIR);

            const newSelection = this._targetSelection;

            if (viewportMain && currentViewport && this._activeViewport?.viewportKey !== currentViewport?.viewportKey) {
                let movingRange: IRangeWithCoord;
                if (newSelection.startRow !== originStartRow) {
                    scrollTimer.scrollTimerType = ScrollTimerType.Y;
                    movingRange = {
                        ...newSelection,
                        endRow: newSelection.startRow,
                    };
                } else if (newSelection.endRow !== originEndRow) {
                    scrollTimer.scrollTimerType = ScrollTimerType.Y;
                    movingRange = {
                        ...newSelection,
                        startRow: newSelection.endRow,
                    };
                } else if (newSelection.startColumn !== originStartColumn) {
                    scrollTimer.scrollTimerType = ScrollTimerType.X;
                    movingRange = {
                        ...newSelection,
                        endColumn: newSelection.startColumn,
                    };
                } else {
                    scrollTimer.scrollTimerType = ScrollTimerType.X;
                    movingRange = {
                        ...newSelection,
                        startColumn: newSelection.endColumn,
                    };
                }

                if (this._isSelectionInViewport(movingRange, currentViewport)) {
                    viewportMain.scrollToBarPos({
                        x: scrollTimer.scrollTimerType === ScrollTimerType.X ? 0 : undefined,
                        y: scrollTimer.scrollTimerType === ScrollTimerType.Y ? 0 : undefined,
                    });
                    this._activeViewport = currentViewport;
                }
            }

            scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                this._fillMoving(newMoveOffsetX, newMoveOffsetY);
            });
        });

        this._scenePointerUpSub = scene.onPointerUp$.subscribeEvent(() => {
            this._helperSelection?.dispose();
            const scene = this._scene;
            scene.resetCursor();
            this._clearObserverEvent();
            scene.enableEvent();
            this._scrollTimer?.dispose();
            this._control.refreshSelectionFilled(this._targetSelection);
            this._isInMergeState = false;
            this._controlHandler((o, index) => {
                o.setProps({
                    fill: this._fillControlColors[index],
                });
            });
            this._fillControlColors = [];
        });
    }

    private _hasMergeInRange(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        const mergeData = this._skeleton.mergeData;
        if (!mergeData) {
            return false;
        }

        for (const data of mergeData) {
            const {
                startRow: mainStartRow,
                startColumn: mainStartColumn,
                endRow: mainEndRow,
                endColumn: mainEndColumn,
            } = data;
            const rect1 = {
                left: startColumn,
                top: startRow,
                right: endColumn,
                bottom: endRow,
            };

            const rect2 = {
                left: mainStartColumn,
                top: mainStartRow,
                right: mainEndColumn,
                bottom: mainEndRow,
            };

            if (isRectIntersect(rect1, rect2)) {
                return true;
            }
        }

        return false;
    }

    private _swapPositions(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        const finalStartRow = Math.min(startRow, endRow);
        const finalStartColumn = Math.min(startColumn, endColumn);
        const finalEndRow = Math.max(startRow, endRow);
        const finalEndColumn = Math.max(startColumn, endColumn);
        return {
            startRow: finalStartRow,
            startColumn: finalStartColumn,
            endRow: finalEndRow,
            endColumn: finalEndColumn,
        };
    }

    private _controlHandler(func: (o: Rect, index: number) => void) {
        const {
            leftControl,
            rightControl,
            topControl,
            bottomControl,
            backgroundControlTop,
            backgroundControlMiddleLeft,
            backgroundControlMiddleRight,
            backgroundControlBottom,
            fillControl,
        } = this._control;
        const objects = [
            leftControl,
            rightControl,
            topControl,
            bottomControl,
            backgroundControlTop,
            backgroundControlMiddleLeft,
            backgroundControlMiddleRight,
            backgroundControlBottom,
            fillControl,
        ];

        for (let i = 0, len = objects.length; i < len; i++) {
            const object = objects[i];
            func(object, i);
        }
    }

    private _fillRuler(
        rowOrColumn: number,
        startRowOrColumn: number,
        endRowOrColumn: number,
        rowOrColumnLength: number,
        maxRowOrColumn: number
    ) {
        let isLighten = false;
        if (rowOrColumn < startRowOrColumn) {
            if (this._isInMergeState && rowOrColumn < startRowOrColumn) {
                const current = startRowOrColumn - rowOrColumn;
                const rangeRowCount = rowOrColumnLength + 1;
                const step = Math.ceil(current / rangeRowCount);

                let newStartRow = startRowOrColumn - step * rangeRowCount;

                if (newStartRow < 0) {
                    newStartRow = startRowOrColumn - (step - 1) * rangeRowCount;
                }

                startRowOrColumn = newStartRow;
            } else {
                startRowOrColumn = rowOrColumn;
            }
        } else if (rowOrColumn >= startRowOrColumn && rowOrColumn <= endRowOrColumn) {
            isLighten = true;
            if (!this._isInMergeState) {
                endRowOrColumn = rowOrColumn;
            }
        } else {
            if (this._isInMergeState && rowOrColumn > endRowOrColumn) {
                const current = rowOrColumn - endRowOrColumn;
                const rangeRowCount = rowOrColumnLength + 1;
                const step = Math.ceil(current / rangeRowCount);

                let newEndRow = endRowOrColumn + step * rangeRowCount;

                if (newEndRow > maxRowOrColumn) {
                    newEndRow = endRowOrColumn + (step - 1) * rangeRowCount;
                }

                endRowOrColumn = newEndRow;
            } else {
                endRowOrColumn = rowOrColumn;
            }
        }

        return {
            rowOrColumn,
            startRowOrColumn,
            endRowOrColumn,
            isLighten,
        };
    }

    private _getScale() {
        const { scaleX, scaleY } = this._scene.getAncestorScale();
        return Math.max(scaleX, scaleY);
    }
}
