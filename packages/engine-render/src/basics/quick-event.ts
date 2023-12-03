import { BaseObject } from '../base-object';
import { IMouseEvent, IPointerEvent } from './i-events';

export function attachObjectHover(
    o: BaseObject,
    hoverIn: (o: any, evt: IPointerEvent | IMouseEvent) => void,
    hoverOut: (o: any, evt: IPointerEvent | IMouseEvent) => void
) {
    o.onPointerEnterObserver.add((evt) => {
        hoverIn(o, evt);
    });

    o.onPointerLeaveObserver.add((evt) => {
        hoverOut(o, evt);
    });
}
