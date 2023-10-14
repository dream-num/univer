import { IShapeProps, Rect, RegularPolygon, Shape } from '@univerjs/base-render';

import { HEADER_MENU_SHAPE_TRIANGLE_FILL } from './header-menu-shape';

export const enum HeaderUnhideShapeType {
    ROW,
    COLUMN,
}

export interface IHeaderUnhideShapeProps extends IShapeProps {
    /** On row headers or on column headers. */
    type: HeaderUnhideShapeType;
    /** After which row/col there are hidden rows/cols. */
    start: number;
    /** Before which row/col there are hidden rows/cols. */
    end: number;
    /** If the shape is hovered. If it's hovered it should have a border. */
    hovered: boolean;
}

export class HeaderUnhideShape<T extends IHeaderUnhideShapeProps = IHeaderUnhideShapeProps> extends Shape<T> {
    private _size: number = 20;
    private _iconRatio: number = 0.4;
    private _hovered: boolean = false;

    private _unhideType: HeaderUnhideShapeType = HeaderUnhideShapeType.COLUMN;

    constructor(key?: string, props?: T) {
        super(key, props);

        this.setShapeProps(props);
    }

    setShapeProps(props?: T): void {
        this._unhideType = props?.type ?? HeaderUnhideShapeType.COLUMN;
        this._hovered = props?.hovered ?? false;

        this.transformByState({
            width: this._size,
            height: this._size,
        });
    }

    protected override _draw(ctx: CanvasRenderingContext2D): void {
        if (this._unhideType === HeaderUnhideShapeType.ROW) {
            this._drawOnRow(ctx);
        } else {
            this._drawOnCol(ctx);
        }
    }

    private _drawOnRow(ctx: CanvasRenderingContext2D): void {
        throw new Error('not implemented yet');
    }

    /**
     *
     * @param ctx
     */
    private _drawOnCol(ctx: CanvasRenderingContext2D): void {
        if (true) {
            // should draw a bordered background
            Rect.drawWith(ctx, {
                width: this._size,
                height: this._size,
                stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
            Rect.drawWith(ctx, {
                width: 2 * this._size,
                height: this._size,
                stroke: HEADER_MENU_SHAPE_TRIANGLE_FILL,
            });
        }

        const iconSize = this._size * 0.5 * this._iconRatio;
        const sixtyDegree = (Math.PI / 180) * 60;
        const top = iconSize * Math.cos(sixtyDegree);
        const left = iconSize * Math.sin(sixtyDegree);

        // the arrow on the left
        RegularPolygon.drawWith(ctx, {
            pointsGroup: [
                [
                    { x: -top + this._size / 2, y: this._size / 2 },
                    { x: this._size / 2 + left, y: this._size / 2 - left },
                    { x: this._size / 2 + left, y: this._size / 2 + left },
                ],
            ],
            fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
        });

        // the arrow on the right
        RegularPolygon.drawWith(ctx, {
            pointsGroup: [
                [
                    { x: top + (this._size * 3) / 2, y: this._size / 2 },
                    { x: (this._size * 3) / 2 - left, y: this._size / 2 - left },
                    { x: (this._size * 3) / 2 - left, y: this._size / 2 + left },
                ],
            ],
            fill: HEADER_MENU_SHAPE_TRIANGLE_FILL,
        });
    }
}
