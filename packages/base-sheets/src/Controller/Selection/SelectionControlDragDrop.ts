import { CURSOR_TYPE, Group, IMouseEvent, IPointerEvent, Rect } from '@univer/base-render';
import { ISelection, makeCellToSelection, Nullable, Observer } from '@univer/core';
import { SelectionModel } from '../../Model';
import { ScrollTimer } from '../ScrollTimer';
import { DEFAULT_SELECTION_CONFIG, SelectionControl } from './SelectionController';

enum SELECTION_DRAG_KEY {
    Selection = '__SelectionDragShape__',
    top = '__TopDragControl__',
    bottom = '__BottomDragControl__',
    left = '__LeftDragControl__',
    right = '__RightDragControl__',
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

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    constructor(private _control: SelectionControl) {
        this._zIndex = _control.zIndex + 1;
        this._model = _control.model;
        // this._model = new SelectionModel(SELECTION_TYPE.NORMAL);
        // this._model.setValue(_control.model.getValue().selection);
        this._initialize();
    }

    private _initialize() {
        const plugin = this._control.getPlugin();

        const main = plugin.getMainComponent();

        const { leftControl, rightControl, topControl, bottomControl, fillControl } = this._control;
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
            console.log('onPointerEnterObserver');
        });

        bottomControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.resetCursor();
            console.log('onPointerLeaveObserver');
        });

        bottomControl.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            console.log('onPointerDownObserver');

            this._updateControl();

            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;
            const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);

            // Subtract the border width to make the calculation of selected cells more accurate
            const cellInfo = main.calculateCellIndexByPosition(evtOffsetX, evtOffsetY - DEFAULT_SELECTION_CONFIG.strokeWidth, scrollXY);
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

            console.log('this._oldSelectionRange', this._oldSelectionRange);

            const scene = this._control.getScene();

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
        });

        bottomControl.onPointerUpObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.resetCursor();
            console.log('onPointerUpObserver');
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

        const scene = this._control.getScene();
        scene.addObject(this._selectionDragShape);
    }

    dragEventInitial() {}

    dragMoving(moveEvt: IPointerEvent | IMouseEvent) {
        const main = this._control.getPlugin().getMainComponent();
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
            startY: startX || 0,
            endY: startY || 0,
            startX: endX || 0,
            endX: endY || 0,
        };
        // when the selection changes
        const { startRow: oldStartRow, endRow: oldEndRow, startColumn: oldStartColumn, endColumn: oldEndColumn } = this._oldSelectionRange;

        if (oldStartColumn !== moveStartColumn || oldStartRow !== moveStartRow || oldEndColumn !== moveEndColumn || oldEndRow !== moveEndRow) {
            this._oldSelectionRange = newSelectionRange;
            console.log('this._oldSelectionRange', this._oldSelectionRange);
        }
    }

    dragUp() {
        console.log('drag up');
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

        this._selectionDragShape.visible = true;
        this._selectionDragShape.translate(startX, startY);

        this._selectionDragShape.makeDirty(true);
    }

    hide() {
        this._selectionDragShape.visible = false;
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
        const { leftControl, rightControl, topControl, bottomControl } = this._control;
        leftControl.onPointerEnterObserver.clear();
        leftControl.onPointerLeaveObserver.clear();
        rightControl.onPointerEnterObserver.clear();
        rightControl.onPointerLeaveObserver.clear();
        topControl.onPointerEnterObserver.clear();
        topControl.onPointerLeaveObserver.clear();
        bottomControl.onPointerEnterObserver.clear();
        bottomControl.onPointerLeaveObserver.clear();
    }

    static create(control: SelectionControl) {
        return new SelectionControlDragAndDrop(control);
    }
}
