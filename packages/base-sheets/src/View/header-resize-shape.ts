/* eslint-disable no-magic-numbers */
import { IShapeProps, Rect, Shape } from '@univerjs/base-render';

export interface IHeaderMenuShapeResizeProps extends IShapeProps {
    size?: number;
    mode?: HEADER_RESIZE_SHAPE_TYPE;
    color?: string;
}

export enum HEADER_RESIZE_SHAPE_TYPE {
    VERTICAL,
    HORIZONTAL,
}

export const HEADER_MENU_SHAPE_RECT_BACKGROUND_FILL = 'rgba(120, 120, 120, 0.01)';

export const HEADER_MENU_SHAPE_RECT_FILL = 'rgb(68, 71, 70)';

export const HEADER_MENU_SHAPE_WIDTH_HEIGHT = 12;

export const HEADER_MENU_SHAPE_THUMB_SIZE = 4;

export class HeaderMenuResizeShape<
    T extends IHeaderMenuShapeResizeProps = IHeaderMenuShapeResizeProps,
> extends Shape<T> {
    private _size: number = HEADER_MENU_SHAPE_WIDTH_HEIGHT;

    private _color: string = HEADER_MENU_SHAPE_RECT_FILL;

    private _mode: HEADER_RESIZE_SHAPE_TYPE = HEADER_RESIZE_SHAPE_TYPE.VERTICAL;

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

    get color() {
        return this._color;
    }

    protected override _draw(ctx: CanvasRenderingContext2D) {
        let width = this.width;

        let height = this.height;

        let left = 0;

        let top = 0;

        const scene = this.getScene();

        const { scaleX, scaleY } = scene.getAncestorScale();

        const scale = Math.max(scaleX, scaleY);

        const HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE = HEADER_MENU_SHAPE_WIDTH_HEIGHT / scale;

        const HEADER_MENU_SHAPE_THUMB_SIZE_SCALE = HEADER_MENU_SHAPE_THUMB_SIZE / scale;

        if (this.mode === HEADER_RESIZE_SHAPE_TYPE.VERTICAL) {
            width = HEADER_MENU_SHAPE_THUMB_SIZE_SCALE;

            left = HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE - HEADER_MENU_SHAPE_THUMB_SIZE_SCALE;
        } else {
            height = HEADER_MENU_SHAPE_THUMB_SIZE_SCALE;

            top = HEADER_MENU_SHAPE_WIDTH_HEIGHT_SCALE - HEADER_MENU_SHAPE_THUMB_SIZE_SCALE;
        }

        // background
        Rect.drawWith(ctx, {
            width: this.width,
            height: this.height,
            left: 0,
            top: 0,
            fill: HEADER_MENU_SHAPE_RECT_BACKGROUND_FILL,
        });

        // left or top
        Rect.drawWith(ctx, {
            width,
            height,
            fill: HEADER_MENU_SHAPE_RECT_FILL,
            radius: HEADER_MENU_SHAPE_THUMB_SIZE_SCALE,
        });

        ctx.save();
        ctx.transform(1, 0, 0, 1, left, top);

        // right or bottom
        Rect.drawWith(ctx, {
            width,
            height,
            fill: HEADER_MENU_SHAPE_RECT_FILL,
            radius: HEADER_MENU_SHAPE_THUMB_SIZE_SCALE,
        });
        ctx.restore();
    }

    setShapeProps(props?: T) {
        if (props?.size) {
            this._size = props.size;
        }

        if (props?.mode) {
            this._mode = props.mode;
        }

        if (props?.color) {
            this._color = props.color;
        }

        if (this.mode === HEADER_RESIZE_SHAPE_TYPE.VERTICAL) {
            this.transformByState({
                width: HEADER_MENU_SHAPE_WIDTH_HEIGHT,
                height: this.size,
            });
        } else {
            this.transformByState({
                width: this.size,
                height: HEADER_MENU_SHAPE_WIDTH_HEIGHT,
            });
        }

        return this;
    }
}
