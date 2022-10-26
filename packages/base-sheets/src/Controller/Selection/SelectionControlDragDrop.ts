import { CURSOR_TYPE, Group, IMouseEvent, IPointerEvent, Rect } from '@univer/base-render';
import { SelectionModel } from '../../Model';
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

    private _selectionShape: Group;

    private _zIndex: number;

    private _model: SelectionModel;

    constructor(private _control: SelectionControl) {
        this._zIndex = _control.zIndex + 1;
        this._model = _control.model;
        this._initialize();
    }

    private _initialize() {
        const plugin = this._control.getPlugin();
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
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        bottomControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.resetCursor();
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        bottomControl.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.cursor = CURSOR_TYPE.MOVE;
            console.log(CURSOR_TYPE.MOVE, evt);
        });
        bottomControl.onPointerUpObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.resetCursor();
            console.log(CURSOR_TYPE.MOVE, evt);
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

        this._selectionShape = new Group(SELECTION_DRAG_KEY.Selection + zIndex, this._leftDragControl, this._rightDragControl, this._topDragControl, this._bottomDragControl);

        this._selectionShape.visible = true;

        this._selectionShape.evented = false;

        this._selectionShape.zIndex = zIndex;

        const scene = this._control.getScene();
        scene.addObject(this._selectionShape);

        this._updateControl();
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

        this._selectionShape.visible = true;
        this._selectionShape.translate(startX, startY);

        this._selectionShape.makeDirty(true);
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
