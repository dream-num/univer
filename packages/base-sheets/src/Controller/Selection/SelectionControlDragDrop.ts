import { CURSOR_TYPE, IMouseEvent, IPointerEvent } from '@univer/base-render';
import { SelectionControl } from './SelectionController';

export class SelectionControlDragAndDrop {
    constructor(private _control: SelectionControl) {
        this._initialize();
    }

    private _initialize() {
        const plugin = this._control.getPlugin();
        const { leftControl, rightControl, topControl, bottomControl, fillControl } = this._control;
        leftControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            leftControl.cursor = CURSOR_TYPE.MOVE;
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        leftControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            leftControl.resetCursor();
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        rightControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            rightControl.cursor = CURSOR_TYPE.MOVE;
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        rightControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            rightControl.resetCursor();
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        topControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            topControl.cursor = CURSOR_TYPE.MOVE;
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        topControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            topControl.resetCursor();
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        bottomControl.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.cursor = CURSOR_TYPE.MOVE;
            console.log(CURSOR_TYPE.MOVE, evt);
        });

        bottomControl.onPointerLeaveObserver.add((evt: IPointerEvent | IMouseEvent) => {
            bottomControl.resetCursor();
            console.log(CURSOR_TYPE.MOVE, evt);
        });
    }

    static create(control: SelectionControl) {
        return new SelectionControlDragAndDrop(control);
    }
}
