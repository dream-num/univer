import { CURSOR_TYPE, IMouseEvent, IPointerEvent, Rect } from '@univerjs/base-render';
import { Injector } from '@univerjs/core';

export interface ISelectionControlHandler {
    fillControl: Rect;
}

export class SelectionControlFill {
    constructor(private readonly _handler: ISelectionControlHandler) {
        this._initialize();
    }

    static create(injector: Injector, handler: ISelectionControlHandler) {
        return injector.createInstance(SelectionControlFill, handler);
    }

    remove() {
        const { fillControl } = this._handler;
        fillControl.onPointerEnterObserver.clear();
        fillControl.onPointerLeaveObserver.clear();
    }

    private _initialize() {
        const { fillControl } = this._handler;
        fillControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            fillControl.cursor = CURSOR_TYPE.CROSSHAIR;
        });

        fillControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            fillControl.resetCursor();
        });
    }
}
