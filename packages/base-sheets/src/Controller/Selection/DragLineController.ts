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
    strokeWidth: 1,
    fillStrokeWidth: 5,
};

export enum DragLineDirection {
    VERTICAL,
    HORIZONTAL,
}

interface State {
    left?: number;
    top?: number;
    distance: number;
}

interface Option {
    direction: DragLineDirection;
    end: number; // 当前列/行尾距离屏幕距离
    start: number; //当前列/行首距离屏幕距离
    dragUp: (distance: Nullable<number>) => void;
}

export class DragLineController {
    private _dragLineControlMain: Rect;

    private _dragLineControlContent: Rect;

    private _dragLine: Group;

    private _manager: SelectionManager;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _state: State;

    private _direction: DragLineDirection;

    private _end: number; // 初始线距离屏幕的距离

    private _start: number;

    private _dragUp: (distance: Nullable<number>) => void;

    constructor(manager: SelectionManager) {
        this._manager = manager;
    }

    create(option: Option) {
        const { direction, end, dragUp, start } = option;
        this._direction = direction;
        this._end = end;
        this._start = start;
        this._dragUp = dragUp;

        const skeleton = this._manager.getSheetView().getSpreadsheetColumnTitle().getSkeleton();
        if (direction) {
            const width = skeleton?.rowTitleWidth;
            const contentWidth = skeleton?.columnTotalWidth;
            this._dragLineControlMain = new Rect(DRAG_LINE_KEY.lineMain, {
                width,
                height: 5,
                top: this._end - 5,
                fill: DEFAULT_DRAG_LINE_CONFIG.strokeColor,
            });

            this._dragLineControlContent = new Rect(DRAG_LINE_KEY.lineContent, {
                width: contentWidth,
                height: 1,
                top: this._end - 1,
                left: width,
                fill: DEFAULT_DRAG_LINE_CONFIG.strokeColor,
            });
        } else {
            const height = skeleton?.columnTitleHeight;
            const contentHeight = skeleton?.rowTotalHeight;
            this._dragLineControlMain = new Rect(DRAG_LINE_KEY.lineMain, {
                width: DEFAULT_DRAG_LINE_CONFIG.fillStrokeWidth,
                height,
                left: this._end - 5,
                fill: DEFAULT_DRAG_LINE_CONFIG.strokeColor,
            });

            this._dragLineControlContent = new Rect(DRAG_LINE_KEY.lineContent, {
                width: DEFAULT_DRAG_LINE_CONFIG.strokeWidth,
                height: contentHeight,
                top: height,
                left: this._end - 1,
                fill: DEFAULT_DRAG_LINE_CONFIG.strokeColor,
            });
        }

        this._dragLine = new Group(DRAG_LINE_KEY.line, this._dragLineControlMain, this._dragLineControlContent);

        this._dragLine.hide();

        this._dragLine.evented = false;

        const scene = this._manager.getScene();

        scene.addObject(this._dragLine, 3);
    }

    dragDown(e: IPointerEvent | IMouseEvent) {
        const scene = this._manager.getScene();

        scene.disableEvent();

        this._state = {
            distance: this._direction ? e.clientY : e.clientX,
        };

        this._dragLine.show();

        this._moveObserver = scene.onPointerMoveObserver.add((e: IPointerEvent | IMouseEvent) => {
            this.dragMoving(e);
        });

        this._upObserver = scene.onPointerUpObserver.add((e: IPointerEvent | IMouseEvent) => {
            this.dragUp(e);
            scene.onPointerMoveObserver.remove(this._moveObserver);
            scene.onPointerUpObserver.remove(this._upObserver);
            scene.enableEvent();
        });
    }

    dragMoving(e: IPointerEvent | IMouseEvent) {
        if (this._direction) {
            if (e.clientY < this._state.distance && this._state.distance - e.clientY >= this._end - this._start - 5) {
                //留一丝空隙
                return;
            }
            this._dragLine.transformByState({
                top: e.clientY - this._state.distance,
            });
        } else {
            if (e.clientX < this._state.distance && this._state.distance - e.clientX >= this._end - this._start - 5) {
                //留一丝空隙
                return;
            }
            this._dragLine.transformByState({
                left: e.clientX - this._state.distance,
            });
        }
    }

    dragUp(e: IPointerEvent | IMouseEvent) {
        let distance;
        if (this._direction) {
            distance = e.clientY - this._state.distance;
            if (e.clientY < this._state.distance && this._state.distance - e.clientY >= this._end - this._start - 5) {
                distance = null;
            }
        } else {
            distance = e.clientX - this._state.distance;
            if (e.clientX < this._state.distance && this._state.distance - e.clientX >= this._end - this._start - 5) {
                distance = null;
            }
        }
        this._dragUp(distance);
        this._dragLine.dispose();
    }
}
