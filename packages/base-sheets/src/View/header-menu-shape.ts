/* eslint-disable no-magic-numbers */
import { IShapeProps, Rect, RegularPolygon, Shape } from '@univerjs/base-render';

export interface IHeaderMenuShapeProps extends IShapeProps {
    size?: number;
    mode?: HEADER_MENU_SHAPE_TYPE;
    iconRatio?: number;
}

export enum HEADER_MENU_SHAPE_TYPE {
    NORMAL,
    HIGHLIGHT,
}

export const HEADER_MENU_SHAPE_CIRCLE_FILL = 'rgba(0, 0, 0, 0.15)';

export const HEADER_MENU_SHAPE_TRIANGLE_FILL = 'rgb(0, 0, 0)';

export class HeaderMenuShape<T extends IHeaderMenuShapeProps = IHeaderMenuShapeProps> extends Shape<T> {
    private _size: number = 12;

    private _iconRatio: number = 0.4;

    private _mode: HEADER_MENU_SHAPE_TYPE = HEADER_MENU_SHAPE_TYPE.NORMAL;

    constructor(key?: string, props?: T) {
        super(key, props);
        this.setShapeProps(props);
    }

    get size() {
        return this._size;
    }

    get mode() {
        return this._mode;
    }

    get iconRatio() {
        return this._iconRatio;
    }

    protected override _draw(ctx: CanvasRenderingContext2D) {
        if (this.mode === HEADER_MENU_SHAPE_TYPE.HIGHLIGHT) {
            Rect.drawWith(ctx, {
                width: this.size,
                height: this.size,
                // left: this.left,
                // top: this.top,
                radius: this.size,
                fill: HEADER_MENU_SHAPE_CIRCLE_FILL,
            });
        }

        const iconSize = this.size * 0.5 * this.iconRatio;

        const left = iconSize * Math.sin(30);

        const top = iconSize * Math.cos(30);

        RegularPolygon.drawWith(ctx, {
            pointsGroup: [
                [
                    { x: -left + this.size / 2, y: -top + this.size / 2 },
                    { x: left + this.size / 2, y: -top + this.size / 2 },
                    { x: 0 + this.size / 2, y: iconSize + this.size / 2 },
                ],
            ],
            // left: this.left,
            // top: this.top,
            fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
        });
    }

    setShapeProps(props?: T) {
        if (props?.size) {
            this._size = props.size;
        }

        if (props?.mode) {
            this._mode = props.mode;
        }

        if (props?.iconRatio) {
            this._iconRatio = props.iconRatio;
        }

        this.transformByState({
            width: this._size,
            height: this._size,
        });
    }
}
