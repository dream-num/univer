// import { IShapeProps, Shape, IObjectFullState, Group, Scene } from '.';

import { IKeyValue } from '@univerjs/core';
import { IObjectFullState, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '../Basics/Interfaces';
import { IPoint } from '../Basics/Vector2';
import { IShapeProps, Shape } from './Shape';

export interface IRegularPolygonProps extends IShapeProps {
    pointsGroup: IPoint[][];
}

export const REGULAR_POLYGON_OBJECT_ARRAY = ['pointsGroup'];

export class RegularPolygon extends Shape<IRegularPolygonProps> {
    private _pointsGroup: IPoint[][];

    constructor(key?: string, props?: IRegularPolygonProps) {
        super(key, props);
        this._pointsGroup = props?.pointsGroup || [[]];
        this._setFixBoundingBox();
        this.onTransformChangeObservable.add((changeState) => {
            const { type, value, preValue } = changeState;
            if (type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize || type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.all) {
                this.resizePolygon(preValue as IObjectFullState);
            }
        });
    }

    get pointsGroup() {
        return this._pointsGroup;
    }

    static drawWith(ctx: CanvasRenderingContext2D, props: IRegularPolygonProps | RegularPolygon) {
        let { pointsGroup } = props;

        pointsGroup = pointsGroup ?? [[]];

        if (props.strokeDashArray) {
            ctx.setLineDash(props.strokeDashArray);
        }
        ctx.beginPath();
        for (let points of pointsGroup) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let n = 1; n < points.length; n++) {
                const point = points[n];
                ctx.lineTo(point.x, point.y);
            }
        }
        ctx.closePath();

        this._renderPaintInOrder(ctx, props);
    }

    updatePointGroup(pointGroup: IPoint[][]) {
        this._pointsGroup = pointGroup;
        this._setFixBoundingBox();
    }

    resizePolygon(preValue: IObjectFullState) {
        const { left, top, width, height } = this._getSelfRect();

        const { width: preWidth, height: preHeight } = preValue;

        let fixX;
        let fixY;

        if (!preWidth) {
            fixX = 0;
        } else {
            fixX = (this.width as number) - preWidth;
        }

        if (!preHeight) {
            fixY = 0;
        } else {
            fixY = (this.height as number) - preHeight;
        }

        const increaseScaleX = fixX / width;

        const increaseScaleY = fixY / height;

        this.scaleX += increaseScaleX;
        this.scaleY += increaseScaleY;

        this.left = (this.left as number) - left * increaseScaleX;
        this.top = (this.top as number) - top * increaseScaleY;

        this._setTransForm();
    }

    toJson() {
        const props: IKeyValue = {};
        REGULAR_POLYGON_OBJECT_ARRAY.forEach((key) => {
            if (this[key as keyof RegularPolygon]) {
                props[key] = this[key as keyof RegularPolygon];
            }
        });
        return {
            ...super.toJson(),
            ...props,
        };
    }

    getState() {
        const { left, top, width, height } = this.getRect();
        return {
            left,
            top,
            width,
            height,
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            angle: this.angle,
            skewX: this.skewX,
            skewY: this.skewY,
            flipX: this.flipX,
            flipY: this.flipY,
        };
    }

    getRect() {
        const { left, top, width, height } = this._getSelfRect();
        return {
            left: left * this.scaleX + this.left,
            top: top * this.scaleY + this.top,
            width: width * this.scaleX,
            height: height * this.scaleY,
        };
    }

    protected _draw(ctx: CanvasRenderingContext2D) {
        RegularPolygon.drawWith(ctx, this);
    }

    private _setFixBoundingBox() {
        const { width, height, left, top } = this._getSelfRect();
        this.left = (this.left as number) + left;
        this.top = (this.top as number) + top;
        this.width = width;
        this.height = height;

        const pointsGroup = this.pointsGroup;
        for (let points of pointsGroup) {
            for (let point of points) {
                point.x -= left;
                point.y -= top;
            }
        }

        this._setTransForm();
    }

    private _getSelfRect() {
        const pointsGroup = this.pointsGroup;

        let minX = pointsGroup[0][0].x;
        let maxX = pointsGroup[0][0].x;
        let minY = pointsGroup[0][0].y;
        let maxY = pointsGroup[0][0].y;

        for (let points of pointsGroup) {
            for (let point of points) {
                minX = Math.min(minX, point.x);
                maxX = Math.max(maxX, point.x);
                minY = Math.min(minY, point.y);
                maxY = Math.max(maxY, point.y);
            }
        }

        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
}
