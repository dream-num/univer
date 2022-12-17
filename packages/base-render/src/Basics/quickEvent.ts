import { BaseObject } from '../BaseObject';
import { IMouseEvent, IPointerEvent } from './IEvents';

export function attachObjectHover(o: BaseObject, hoverIn: (o: any, evt: IPointerEvent | IMouseEvent) => void, hoverOut: (o: any, evt: IPointerEvent | IMouseEvent) => void) {
    o.onPointerEnterObserver.add((evt) => {
        hoverIn(o, evt);
    });

    o.onPointerLeaveObserver.add((evt) => {
        hoverOut(o, evt);
    });
}
