import { CURSOR_TYPE, Group, IMouseEvent, IPointerEvent, Rect, ScrollTimer } from '@univerjs/base-render';
import { Direction, ICellInfo, ISelection, makeCellToSelection, Nullable, Observer } from '@univerjs/core';
import { Inject, Injector } from '@wendellhu/redi';
import { SelectionModel } from '../../Model';
import { DEFAULT_SELECTION_CONFIG, SELECTION_TYPE } from './SelectionController';
import { CanvasView } from '../../View';

enum SELECTION_DRAG_KEY {
    Selection = '__SelectionDragShape__',
    top = '__TopDragControl__',
    bottom = '__BottomDragControl__',
    left = '__LeftDragControl__',
    right = '__RightDragControl__',
}

interface IPositionOffset {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export interface ISelectionControlDragDropHandler {
    leftControl: Rect;
    rightControl: Rect;
    topControl: Rect;
    bottomControl: Rect;
    fillControl: Rect;

    update(newSelectionRange: ISelection, highlight: Nullable<ICellInfo>): void;
}

export class SelectionControlDragAndDrop {
    private _leftDragControl: Rect;

    private _rightDragControl: Rect;

    private _topDragControl: Rect;

    private _bottomDragControl: Rect;

    private _selectionDragShape: Group;

    private _zIndex: number;

    private _model: SelectionModel;

    private _oldSelectionRange: ISelection;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _cellPositionOffset: IPositionOffset;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    constructor(
        zIndex: number,
        model: SelectionModel,
        private readonly _handlers: ISelectionControlDragDropHandler,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(CanvasView) private readonly _canvasView: CanvasView
    ) {
        this._zIndex = zIndex + 1;
        this._model = model;

        this._initialize();
    }

    static create(injector: Injector, zIndex: number, model: SelectionModel, handler: ISelectionControlDragDropHandler) {
        return injector.createInstance(SelectionControlDragAndDrop, zIndex, model, handler);
    }

    dragEventInitial() {
        // TODO ...
    }

    dragDown(evt: IPointerEvent | IMouseEvent, direction: Direction) {
        const main = this._canvasView.getSheetView().getSpreadsheet();

        // reset model
        const selection = this._model.getValue().selection;
        this._model = this._injector.createInstance(SelectionModel, SELECTION_TYPE.NORMAL);
        this._model.setValue(selection);

        // update control
        this._updateControl();

        const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
        this._startOffsetX = evtOffsetX;
        this._startOffsetY = evtOffsetY;
        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);

        // Subtract the border width to make the calculation of selected cells more accurate
        let cellInfo = null;
        switch (direction) {
            case Direction.LEFT:
                cellInfo = main.calculateCellIndexByPosition(evtOffsetX + DEFAULT_SELECTION_CONFIG.strokeWidth, evtOffsetY, scrollXY);
                break;
            case Direction.TOP:
                cellInfo = main.calculateCellIndexByPosition(evtOffsetX, evtOffsetY + DEFAULT_SELECTION_CONFIG.strokeWidth, scrollXY);
                break;
            case Direction.RIGHT:
                cellInfo = main.calculateCellIndexByPosition(evtOffsetX - DEFAULT_SELECTION_CONFIG.strokeWidth, evtOffsetY, scrollXY);
                break;
            case Direction.BOTTOM:
                cellInfo = main.calculateCellIndexByPosition(evtOffsetX, evtOffsetY - DEFAULT_SELECTION_CONFIG.strokeWidth, scrollXY);
                break;

            default:
                break;
        }

        const actualSelection = makeCellToSelection(cellInfo);
        if (!actualSelection) {
            return false;
        }

        const { startRow, startColumn, endColumn, endRow, startY, endY, startX, endX } = actualSelection;

        const startSelectionRange = {
            startColumn,
            startRow,
            endColumn,
            endRow,
            startY,
            endY,
            startX,
            endX,
        };

        this._oldSelectionRange = startSelectionRange;

        // calculate active cell in selection position
        this._cellPositionOffset = {
            top: startSelectionRange.startRow - this._model.startRow,
            bottom: this._model.endRow - startSelectionRange.endRow,
            left: startSelectionRange.startColumn - this._model.startColumn,
            right: this._model.endColumn - startSelectionRange.endColumn,
        };

        const scene = this._canvasView.getSheetView().getScene();

        scene.disableEvent();

        const scrollTimer = ScrollTimer.create(scene);
        scrollTimer.startScroll(evtOffsetX, evtOffsetY);

        this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
            this.dragMoving(moveEvt);
            const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;
            scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                this.dragMoving(moveEvt);
            });
        });

        this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
            this.dragUp();
            scene.onPointerMoveObserver.remove(this._moveObserver);
            scene.onPointerUpObserver.remove(this._upObserver);
            scene.enableEvent();
            scrollTimer.stopScroll();
        });
    }

    dragMoving(moveEvt: IPointerEvent | IMouseEvent) {
        const main = this._canvasView.getSheetView().getSpreadsheet();
        const { offsetX: moveOffsetX, offsetY: moveOffsetY, clientX, clientY } = moveEvt;

        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const moveCellInfo = main.calculateCellIndexByPosition(moveOffsetX, moveOffsetY, scrollXY);
        const moveActualSelection = makeCellToSelection(moveCellInfo);

        if (!moveActualSelection) {
            return false;
        }
        const { startRow: moveStartRow, startColumn: moveStartColumn, endColumn: moveEndColumn, endRow: moveEndRow, startX, startY, endX, endY } = moveActualSelection;

        const newSelectionRange: ISelection = {
            startColumn: moveStartColumn,
            startRow: moveStartRow,
            endColumn: moveEndColumn,
            endRow: moveEndRow,
            startY: startY || 0,
            endY: endY || 0,
            startX: startX || 0,
            endX: endX || 0,
        };
        // when the selection changes
        const { startRow: oldStartRow, endRow: oldEndRow, startColumn: oldStartColumn, endColumn: oldEndColumn } = this._oldSelectionRange;

        if (oldStartColumn !== moveStartColumn || oldStartRow !== moveStartRow || oldEndColumn !== moveEndColumn || oldEndRow !== moveEndRow) {
            this._oldSelectionRange = newSelectionRange;

            // Calculate the position of the selection based on the position of the cell selected when clicking
            const { left, right, top, bottom } = this._cellPositionOffset;

            const startRowTop = moveStartRow - top;
            const endRowBottom = moveEndRow + bottom;
            const startColumnLeft = moveStartColumn - left;
            const endColumnRight = moveEndColumn + right;

            // Boundary detection
            if (startRowTop < 0 || endRowBottom < 0 || startColumnLeft < 0 || endColumnRight < 0) {
                return;
            }
            const newSelection = {
                startRow: startRowTop,
                endRow: endRowBottom,
                startColumn: startColumnLeft,
                endColumn: endColumnRight,
            };

            const startCell = main.getNoMergeCellPositionByIndex(newSelection.startRow, newSelection.startColumn);
            const endCell = main.getNoMergeCellPositionByIndex(newSelection.endRow, newSelection.endColumn);

            const newSelectionPosition = Object.assign(newSelection, {
                startY: startCell?.startY || 0,
                endY: endCell?.endY || 0,
                startX: startCell?.startX || 0,
                endX: endCell?.endX || 0,
            });

            this._model.setValue(newSelectionPosition);

            this._updateControl();
        }
    }

    dragUp() {
        const main = this._canvasView.getSheetView().getSpreadsheet();

        this.hide();

        const { selection } = this._model.getValue();

        // By default, the upper left corner is the active cell
        const cell = main.getCellByIndex(selection.startRow, selection.startColumn);

        // TODO@huwenzhao: add a handler here
        this._handlers.update(selection, cell);
    }

    _updateControl() {
        const { startX, startY, endX, endY } = this._model;

        this._leftDragControl.resize(undefined, endY - startY);
        this._rightDragControl.transformByState({
            height: endY - startY,
            left: endX - startX - DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
        });
        this._topDragControl.resize(endX - startX + DEFAULT_SELECTION_CONFIG.strokeWidth);
        this._bottomDragControl.transformByState({
            width: endX - startX + DEFAULT_SELECTION_CONFIG.strokeWidth,
            top: endY - startY - DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
        });

        this._selectionDragShape.show();
        this._selectionDragShape.translate(startX, startY);

        this._selectionDragShape.makeDirty(true);
    }

    hide() {
        this._selectionDragShape.hide();
        this._selectionDragShape.makeDirty(true);
    }

    dispose() {
        this._leftDragControl.dispose();
        this._rightDragControl.dispose();
        this._topDragControl.dispose();
        this._bottomDragControl.dispose();
        this._selectionDragShape.dispose();
    }

    remove() {
        const { leftControl, rightControl, topControl, bottomControl } = this._handlers;

        leftControl.onPointerEnterObserver.clear();
        leftControl.onPointerLeaveObserver.clear();
        rightControl.onPointerEnterObserver.clear();
        rightControl.onPointerLeaveObserver.clear();
        topControl.onPointerEnterObserver.clear();
        topControl.onPointerLeaveObserver.clear();
        bottomControl.onPointerEnterObserver.clear();
        bottomControl.onPointerLeaveObserver.clear();
    }

    private _initialize() {
        const { leftControl, rightControl, topControl, bottomControl, fillControl } = this._handlers;

        leftControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            leftControl.cursor = CURSOR_TYPE.MOVE;
        });

        leftControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            leftControl.resetCursor();
        });

        rightControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            rightControl.cursor = CURSOR_TYPE.MOVE;
        });

        rightControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            rightControl.resetCursor();
        });

        topControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            topControl.cursor = CURSOR_TYPE.MOVE;
        });

        topControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            topControl.resetCursor();
        });

        bottomControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.cursor = CURSOR_TYPE.MOVE;
        });

        bottomControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.resetCursor();
        });

        bottomControl.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this.dragDown(evt, Direction.BOTTOM);
        });

        bottomControl.onPointerUpObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.resetCursor();
        });

        // init drag render box
        const zIndex = this._zIndex;
        this._leftDragControl = new Rect(SELECTION_DRAG_KEY.left + zIndex, {
            top: 0,
            left: -DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
            width: DEFAULT_SELECTION_CONFIG.strokeWidth * 2,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            zIndex,
        });
        this._rightDragControl = new Rect(SELECTION_DRAG_KEY.right + zIndex, {
            width: DEFAULT_SELECTION_CONFIG.strokeWidth * 2,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            zIndex,
        });
        this._topDragControl = new Rect(SELECTION_DRAG_KEY.top + zIndex, {
            top: -DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
            left: -DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
            height: DEFAULT_SELECTION_CONFIG.strokeWidth * 2,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            zIndex,
        });
        this._bottomDragControl = new Rect(SELECTION_DRAG_KEY.bottom + zIndex, {
            height: DEFAULT_SELECTION_CONFIG.strokeWidth * 2,
            fill: DEFAULT_SELECTION_CONFIG.strokeColor,
            left: -DEFAULT_SELECTION_CONFIG.strokeWidth / 2,
            zIndex,
        });

        this._selectionDragShape = new Group(SELECTION_DRAG_KEY.Selection + zIndex, this._leftDragControl, this._rightDragControl, this._topDragControl, this._bottomDragControl);

        // this._selectionDragShape.visible = false;

        this._selectionDragShape.evented = false;

        this._selectionDragShape.zIndex = zIndex;

        const scene = this._canvasView.getSheetView().getScene();
        scene.addObject(this._selectionDragShape);
    }
}
