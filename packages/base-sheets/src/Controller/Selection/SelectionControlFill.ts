import { CURSOR_TYPE, IMouseEvent, IPointerEvent } from '@univerjs/base-render';
import { SelectionControl } from './SelectionController';

export class SelectionControlFill {
    constructor(private _control: SelectionControl) {
        this._initialize();
    }

    static create(control: SelectionControl) {
        return new SelectionControlFill(control);
    }

    remove() {
        const { fillControl } = this._control;
        fillControl.onPointerEnterObserver.clear();
        fillControl.onPointerLeaveObserver.clear();
    }

    private _initialize() {
        const { fillControl } = this._control;
        const plugin = this._control.getPlugin();
        fillControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            fillControl.cursor = CURSOR_TYPE.CROSSHAIR;
        });

        fillControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            fillControl.resetCursor();
        });
    }
}
