// import { IShapeProps, Shape, IObjectFullState, Group, Scene } from '.';

import { IKeyValue } from '@univerjs/core';
import { IShapeProps, Shape } from './Shape';

export interface IRectProps extends IShapeProps {
    radius?: number;
}

export const RECT_OBJECT_ARRAY = ['radius'];

export class Rect<T extends IRectProps = IRectProps> extends Shape<T> {
    private _radius: number;

    constructor(key?: string, props?: T) {
        super(key, props);
        if (props?.radius) {
            this._radius = props?.radius;
        }
    }

    get radius() {
        return this._radius;
    }

    static drawWith(ctx: CanvasRenderingContext2D, props: IRectProps | Rect) {
        let { radius, width, height } = props;

        radius = radius ?? 0;
        width = width ?? 30;
        height = height ?? 30;

        ctx.beginPath();

        if (props.strokeDashArray) {
            ctx.setLineDash(props.strokeDashArray);
        }

        if (!radius) {
            // simple rect - don't bother doing all that complicated maths stuff.
            ctx.rect(0, 0, width, height);
        } else {
            let topLeft = 0;
            let topRight = 0;
            let bottomLeft = 0;
            let bottomRight = 0;
            topLeft = topRight = bottomLeft = bottomRight = Math.min(radius, width / 2, height / 2);

            ctx.moveTo(topLeft, 0);
            ctx.lineTo(width - topRight, 0);
            ctx.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
            ctx.lineTo(width, height - bottomRight);
            ctx.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
            ctx.lineTo(bottomLeft, height);
            ctx.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
            ctx.lineTo(0, topLeft);
            ctx.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
        }
        ctx.closePath();
        this._renderPaintInOrder(ctx, props);
    }

    toJson() {
        const props: IKeyValue = {};
        RECT_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof Rect]) {
                props[key] = this[key as keyof Rect];
            }
        });
        return {
            ...super.toJson(),
            ...props,
        };
    }

    protected _draw(ctx: CanvasRenderingContext2D) {
        Rect.drawWith(ctx, this);
    }
}
