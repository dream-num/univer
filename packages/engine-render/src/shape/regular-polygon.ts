/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { IKeyValue } from '@univerjs/core';

import type { IObjectFullState } from '../basics/interfaces';
import { TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '../basics/interfaces';
import type { IPoint } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { Shape } from './shape';

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

    static override drawWith(ctx: UniverRenderingContext, props: IRegularPolygonProps | RegularPolygon) {
        let { pointsGroup } = props;

        pointsGroup = pointsGroup ?? [[]];

        if (props.strokeDashArray) {
            ctx.setLineDash(props.strokeDashArray);
        }
        ctx.beginPath();
        for (const points of pointsGroup) {
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

    override toJson() {
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

    override getState() {
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

    protected override _draw(ctx: UniverRenderingContext) {
        RegularPolygon.drawWith(ctx, this);
    }

    private _setFixBoundingBox() {
        const { width, height, left, top } = this._getSelfRect();
        this.left = (this.left as number) + left;
        this.top = (this.top as number) + top;
        this.width = width;
        this.height = height;

        const pointsGroup = this.pointsGroup;
        for (const points of pointsGroup) {
            for (const point of points) {
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

        for (const points of pointsGroup) {
            for (const point of points) {
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
