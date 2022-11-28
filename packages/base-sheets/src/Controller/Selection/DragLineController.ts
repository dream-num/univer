import { Group, IMouseEvent, IPointerEvent, Rect } from '@univer/base-render';
import { Nullable, Observer } from '@univer/core';
import { SelectionManager } from './SelectionManager';

enum DRAG_LINE_KEY {
    lineMain = '__SpreadsheetDragLineMain__',
    lineContent = '__SpreadsheetDragLineContent__',
    line = '__SpreadsheetDragLine__',
}

const DEFAULT_DRAG_LINE_CONFIG = {
    strokeColor: 'rgb(1,136,251)',
    strokeWidth: 2,
    fillStrokeWidth: 5,
};

interface State {
    left: number;
    clientX: number;
}

export class DragLineController {
    private _dragLineControlMain: Rect;

    private _dragLineControlContent: Rect;

    private _dragLine: Group;

    private _manager: SelectionManager;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _state: State;

    constructor(manager: SelectionManager) {
        this._manager = manager;

        this._dragLineControlMain = new Rect(DRAG_LINE_KEY.lineMain, {
            width: DEFAULT_DRAG_LINE_CONFIG.fillStrokeWidth,
            height: 20,
            fill: DEFAULT_DRAG_LINE_CONFIG.strokeColor,
            zIndex: 2,
        });

        this._dragLineControlContent = new Rect(DRAG_LINE_KEY.lineContent, {
            width: DEFAULT_DRAG_LINE_CONFIG.strokeWidth,
            height: 1000,
            fill: DEFAULT_DRAG_LINE_CONFIG.strokeColor,
            zIndex: 1,
        });

        this._dragLine = new Group(DRAG_LINE_KEY.line, this._dragLineControlMain, this._dragLineControlContent);

        // this._dragLine.hide();

        this._dragLine.evented = false;

        const scene = this._manager.getScene();

        scene.addObject(this._dragLine, 3);

        this._dragLine.onPointerDownObserver.add((e: IPointerEvent | IMouseEvent) => {
            this.dragDown(e);
        });
    }

    show() {
        this._dragLine.show();
    }

    hide() {
        this._dragLine.hide();
    }

    dragDown(e: IPointerEvent | IMouseEvent) {
        const scene = this._manager.getScene();

        scene.disableEvent();

        this._state = {
            left: this._dragLine.getState().left,
            clientX: e.clientX,
        };

        this._moveObserver = scene.onPointerMoveObserver.add((e: IPointerEvent | IMouseEvent) => {
            this.dragMoving(e);
        });

        this._upObserver = scene.onPointerUpObserver.add((e: IPointerEvent | IMouseEvent) => {
            this.dragUp();
            scene.onPointerMoveObserver.remove(this._moveObserver);
            scene.onPointerUpObserver.remove(this._upObserver);
            scene.enableEvent();
        });
    }

    dragMoving(e: IPointerEvent | IMouseEvent) {
        this._dragLine.transformByState({
            left: this._state.left + e.clientX - this._state.clientX,
        });
    }

    dragUp() {}
}
