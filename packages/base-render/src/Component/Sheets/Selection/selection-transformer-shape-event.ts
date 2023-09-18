import { ISelection, Nullable, Observer } from '@univerjs/core';

import { CURSOR_TYPE, IMouseEvent, IPointerEvent, Vector2 } from '../../../Basics';
import { Scene } from '../../../Scene';
import { ScrollTimer } from '../../../ScrollTimer';
import { Rect } from '../../../Shape';
import { SpreadsheetSkeleton } from '../SheetSkeleton';
import { SelectionTransformerShape } from './selection-transformer-shape';

const HELPER_SELECTION_TEMP_NAME = '__SpreadsheetHelperSelectionTempRect';

export interface ISelectionTransformerShapeTargetSelection {
    originControl: SelectionTransformerShape;
    targetSelection: ISelection;
}

export class SelectionTransformerShapeEvent {
    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _relativeSelectionPositionRow = 0;

    private _relativeSelectionPositionColumn = 0;

    private _relativeSelectionRowLength = 0;

    private _relativeSelectionColumnLength = 0;

    private _downObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _helperSelection: Rect;

    private _scrollTimer: ScrollTimer;

    private _targetSelection: ISelection;

    constructor(private _control: SelectionTransformerShape, private _skeleton: SpreadsheetSkeleton, private _scene: Scene) {
        this._initialControl();

        this._initialWidget();

        this._initialFill();

        this._control.dispose$.subscribe((control: SelectionTransformerShape) => {
            this.dispose();
        });
    }

    dispose() {}

    private _getCurrentSelection(evtOffsetX: number, evtOffsetY: number, scrollOffsetX: number, scrollOffsetY: number) {
        const scene = this._scene;

        const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        const scrollRelativeCoords = scene.getRelativeCoord(Vector2.FromArray([scrollOffsetX, scrollOffsetY]));

        const scrollXY = scene.getScrollXYByRelativeCoords(scrollRelativeCoords);

        const { scaleX, scaleY } = scene.getAncestorScale();

        return this._skeleton.getCellPositionByOffset(newEvtOffsetX, newEvtOffsetY, scaleX, scaleY, scrollXY);
    }

    private _initialControl() {
        const { leftControl, rightControl, topControl, bottomControl } = this._control;

        [leftControl, rightControl, topControl, bottomControl].forEach((control) => {
            control.onPointerEnterObserver.add((evt: IMouseEvent | IPointerEvent) => {
                control.setCursor(CURSOR_TYPE.MOVE);
            });

            control.onPointerLeaveObserver.add((evt: IMouseEvent | IPointerEvent) => {
                control.resetCursor();
            });

            control.onPointerDownObserver.add(this._controlEvent.bind(this));
        });
    }

    private _controlMoving(moveOffsetX: number, moveOffsetY: number) {
        const moveActualSelection = this._getCurrentSelection(moveOffsetX, moveOffsetY, this._startOffsetX, this._startOffsetY);

        const { scaleX, scaleY } = this._scene.getAncestorScale();

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

        const startCell = this._skeleton.getNoMergeCellPositionByIndex(startRow, startColumn, scaleX, scaleY);
        const endCell = this._skeleton.getNoMergeCellPositionByIndex(endRow, endColumn, scaleX, scaleY);

        const startY = startCell?.startY || 0;
        const endY = endCell?.endY || 0;
        const startX = startCell?.startX || 0;
        const endX = endCell?.endX || 0;

        this._helperSelection.transformByState({
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

    private _controlEvent(evt: IMouseEvent | IPointerEvent) {
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        const actualSelection = this._getCurrentSelection(evtOffsetX, evtOffsetY, evtOffsetX, evtOffsetY);

        this._startOffsetX = evtOffsetX;

        this._startOffsetY = evtOffsetY;

        const scene = this._scene;

        const { row, column } = actualSelection;

        const { startRow: originStartRow, startColumn: originStartColumn, endRow: originEndRow, endColumn: originEndColumn } = this._control.model;

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

        const style = this._control.selectionStyle;
        this._helperSelection = new Rect(HELPER_SELECTION_TEMP_NAME, {
            stroke: style?.stroke,
            strokeWidth: style?.strokeWidth,
        });
        scene.addObject(this._helperSelection);

        const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        const scrollTimer = ScrollTimer.create(scene);

        scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY);

        this._scrollTimer = scrollTimer;

        scene.disableEvent();

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));

            this._controlMoving(newMoveOffsetX, newMoveOffsetY);

            scene.setCursor(CURSOR_TYPE.MOVE);

            scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                this._controlMoving(newMoveOffsetX, newMoveOffsetY);
            });
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            this._helperSelection.dispose();
            const scene = this._scene;
            scene.resetCursor();
            scene.onPointerMoveObserver.remove(this._moveObserver);
            scene.onPointerUpObserver.remove(this._upObserver);
            scene.enableEvent();
            this._scrollTimer?.dispose();
            this._control.selectionMoved$.next(this._targetSelection);
        });
    }

    private _initialWidget() {
        const { topLeftWidget, topCenterWidget, topRightWidget, middleLeftWidget, middleRightWidget, bottomLeftWidget, bottomCenterWidget, bottomRightWidget } = this._control;

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

        [topLeftWidget, topCenterWidget, topRightWidget, middleLeftWidget, middleRightWidget, bottomLeftWidget, bottomCenterWidget, bottomRightWidget].forEach((control, index) => {
            control.onPointerEnterObserver.add((evt: IMouseEvent | IPointerEvent) => {
                control.setCursor(cursors[index]);
            });

            control.onPointerLeaveObserver.add((evt: IMouseEvent | IPointerEvent) => {
                control.resetCursor();
            });

            control.onPointerDownObserver.add((evt: IMouseEvent | IPointerEvent) => {
                this._widgetEvent(evt, cursors[index]);
            });
        });
    }

    private _widgetMoving(moveOffsetX: number, moveOffsetY: number, cursor: CURSOR_TYPE) {
        const moveActualSelection = this._getCurrentSelection(moveOffsetX, moveOffsetY, this._startOffsetX, this._startOffsetY);

        const { scaleX, scaleY } = this._scene.getAncestorScale();

        const { row, column } = moveActualSelection;

        const { rowTitleWidth, columnTitleHeight } = this._skeleton;

        const maxRow = this._skeleton.getRowCount() - 1;

        const maxColumn = this._skeleton.getColumnCount() - 1;

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

        const finalStartRow = Math.min(startRow, endRow);
        const finalStartColumn = Math.min(startColumn, endColumn);
        const finalEndRow = Math.max(startRow, endRow);
        const finalEndColumn = Math.max(startColumn, endColumn);

        const startCell = this._skeleton.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn, scaleX, scaleY);
        const endCell = this._skeleton.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn, scaleX, scaleY);

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

        this._control.update(this._targetSelection, rowTitleWidth, columnTitleHeight, this._control.selectionStyle);
        this._control.clearHighlight();
        this._control.selectionScaling$.next(this._targetSelection);
    }

    private _widgetEvent(evt: IMouseEvent | IPointerEvent, cursor: CURSOR_TYPE) {
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        this._startOffsetX = evtOffsetX;

        this._startOffsetY = evtOffsetY;

        const scene = this._scene;

        const { startRow: originStartRow, startColumn: originStartColumn, endRow: originEndRow, endColumn: originEndColumn } = this._control.model;

        this._relativeSelectionPositionRow = originStartRow;

        this._relativeSelectionPositionColumn = originStartColumn;

        this._relativeSelectionRowLength = originEndRow - originStartRow;

        this._relativeSelectionColumnLength = originEndColumn - originStartColumn;

        if (cursor === CURSOR_TYPE.NORTH_WEST_RESIZE) {
            this._relativeSelectionPositionRow = originEndRow;
            this._relativeSelectionPositionColumn = originEndColumn;
        } else if (cursor === CURSOR_TYPE.NORTH_RESIZE) {
            this._relativeSelectionPositionRow = originEndRow;
        } else if (cursor === CURSOR_TYPE.NORTH_EAST_RESIZE) {
            this._relativeSelectionPositionRow = originEndRow;
        } else if (cursor === CURSOR_TYPE.WEST_RESIZE) {
            this._relativeSelectionPositionColumn = originEndColumn;
        } else if (cursor === CURSOR_TYPE.SOUTH_WEST_RESIZE) {
            this._relativeSelectionPositionColumn = originEndColumn;
        }

        const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        const scrollTimer = ScrollTimer.create(scene);

        scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY);

        this._scrollTimer = scrollTimer;

        scene.disableEvent();

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));

            this._widgetMoving(newMoveOffsetX, newMoveOffsetY, cursor);

            scene.setCursor(cursor);

            scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                this._widgetMoving(newMoveOffsetX, newMoveOffsetY, cursor);
            });
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            const scene = this._scene;
            scene.resetCursor();
            scene.onPointerMoveObserver.remove(this._moveObserver);
            scene.onPointerUpObserver.remove(this._upObserver);
            scene.enableEvent();
            this._scrollTimer?.dispose();
            this._control.selectionScaled$.next(this._targetSelection);
        });
    }

    private _initialFill() {
        const { fillControl } = this._control;

        fillControl.onPointerEnterObserver.add((evt: IMouseEvent | IPointerEvent) => {
            fillControl.setCursor(CURSOR_TYPE.CROSSHAIR);
        });

        fillControl.onPointerLeaveObserver.add((evt: IMouseEvent | IPointerEvent) => {
            fillControl.resetCursor();
        });

        fillControl.onPointerDownObserver.add(this._fillEvent.bind(this));
    }

    private _fillMoving(moveOffsetX: number, moveOffsetY: number) {
        const moveActualSelection = this._getCurrentSelection(moveOffsetX, moveOffsetY, this._startOffsetX, this._startOffsetY);

        const { scaleX, scaleY } = this._scene.getAncestorScale();

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

        const startCell = this._skeleton.getNoMergeCellPositionByIndex(startRow, startColumn, scaleX, scaleY);
        const endCell = this._skeleton.getNoMergeCellPositionByIndex(endRow, endColumn, scaleX, scaleY);

        const startY = startCell?.startY || 0;
        const endY = endCell?.endY || 0;
        const startX = startCell?.startX || 0;
        const endX = endCell?.endX || 0;

        this._helperSelection.transformByState({
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

    private _fillEvent(evt: IMouseEvent | IPointerEvent) {
        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;

        this._startOffsetX = evtOffsetX;

        this._startOffsetY = evtOffsetY;

        const scene = this._scene;

        const { startRow: originStartRow, startColumn: originStartColumn, endRow: originEndRow, endColumn: originEndColumn } = this._control.model;

        this._relativeSelectionPositionRow = originStartRow;

        this._relativeSelectionPositionColumn = originStartColumn;

        this._relativeSelectionRowLength = originEndRow - originStartRow;

        this._relativeSelectionColumnLength = originEndColumn - originStartColumn;

        const style = this._control.selectionStyle;
        this._helperSelection = new Rect(HELPER_SELECTION_TEMP_NAME, {
            stroke: style?.stroke,
            strokeWidth: style?.strokeWidth,
        });
        scene.addObject(this._helperSelection);

        const relativeCoords = scene.getRelativeCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        const { x: newEvtOffsetX, y: newEvtOffsetY } = relativeCoords;

        const scrollTimer = ScrollTimer.create(scene);

        scrollTimer.startScroll(newEvtOffsetX, newEvtOffsetY);

        this._scrollTimer = scrollTimer;

        scene.disableEvent();

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

            const { x: newMoveOffsetX, y: newMoveOffsetY } = scene.getRelativeCoord(Vector2.FromArray([moveOffsetX, moveOffsetY]));

            this._fillMoving(newMoveOffsetX, newMoveOffsetY);

            scene.setCursor(CURSOR_TYPE.CROSSHAIR);

            scrollTimer.scrolling(newMoveOffsetX, newMoveOffsetY, () => {
                this._fillMoving(newMoveOffsetX, newMoveOffsetY);
            });
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            this._helperSelection.dispose();
            const scene = this._scene;
            scene.resetCursor();
            scene.onPointerMoveObserver.remove(this._moveObserver);
            scene.onPointerUpObserver.remove(this._upObserver);
            scene.enableEvent();
            this._scrollTimer?.dispose();
            this._control.selectionMoved$.next(this._targetSelection);
        });
    }
}
