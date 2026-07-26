/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import type { IPosition } from '@univerjs/core';
import type { Vector2 } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { Shape } from './shape';

export interface ILineProps extends Omit<IShapeProps, 'left' | 'top' | 'width' | 'height'>, IPosition {}

function normalizeLinePosition(position: IPosition) {
    const left = Math.min(position.startX, position.endX);
    const top = Math.min(position.startY, position.endY);

    return {
        left,
        top,
        width: Math.abs(position.endX - position.startX),
        height: Math.abs(position.endY - position.startY),
        startX: position.startX - left,
        startY: position.startY - top,
        endX: position.endX - left,
        endY: position.endY - top,
    };
}

/**
 * A line segment defined by two endpoints in its parent's coordinate system.
 *
 * The BaseObject bounds are derived internally so callers only describe line geometry.
 */
export class Line extends Shape<ILineProps> {
    private _startX: number = 0;
    private _startY: number = 0;
    private _endX: number = 0;
    private _endY: number = 0;

    constructor(key?: string, props?: ILineProps) {
        const position = {
            startX: props?.startX ?? 0,
            startY: props?.startY ?? 0,
            endX: props?.endX ?? 0,
            endY: props?.endY ?? 0,
        };
        const geometry = normalizeLinePosition(position);
        const lineProps: ILineProps = props ?? position;
        const normalizedProps = {
            ...lineProps,
            left: geometry.left,
            top: geometry.top,
            width: geometry.width,
            height: geometry.height,
        };

        super(key, normalizedProps);

        this._startX = geometry.startX;
        this._startY = geometry.startY;
        this._endX = geometry.endX;
        this._endY = geometry.endY;
    }

    get startX() {
        return this.left + this._startX;
    }

    get startY() {
        return this.top + this._startY;
    }

    get endX() {
        return this.left + this._endX;
    }

    get endY() {
        return this.top + this._endY;
    }

    static override drawWith(ctx: UniverRenderingContext, props: ILineProps) {
        Line._drawSegment(
            ctx,
            props.startX,
            props.startY,
            props.endX,
            props.endY,
            props
        );
    }

    setPoints(position: IPosition) {
        const geometry = normalizeLinePosition(position);

        this._startX = geometry.startX;
        this._startY = geometry.startY;
        this._endX = geometry.endX;
        this._endY = geometry.endY;
        this.transformByState({
            left: geometry.left,
            top: geometry.top,
            width: geometry.width,
            height: geometry.height,
        });

        return this;
    }

    override setProps(props?: Partial<ILineProps>) {
        if (!props) {
            return this;
        }

        const position = {
            startX: props.startX ?? this.startX,
            startY: props.startY ?? this.startY,
            endX: props.endX ?? this.endX,
            endY: props.endY ?? this.endY,
        };
        const lineProps: ILineProps = {
            ...props,
            ...position,
        };

        super.setProps(lineProps);
        this.setPoints(position);

        return this;
    }

    override isHit(coord: Vector2) {
        const point = this.getInverseCoord(coord);
        const width = this._endX - this._startX;
        const height = this._endY - this._startY;
        const lengthSquared = width * width + height * height;
        const parsedHitStrokeWidth = typeof this.hitStrokeWidth === 'number'
            ? this.hitStrokeWidth
            : Number.parseFloat(this.hitStrokeWidth);
        const hitStrokeWidth = Number.isFinite(parsedHitStrokeWidth) ? parsedHitStrokeWidth : 0;
        const tolerance = Math.max(this.strokeWidth, hitStrokeWidth) / 2;
        const pointX = point.x - this._startX;
        const pointY = point.y - this._startY;

        if (lengthSquared === 0) {
            return pointX * pointX + pointY * pointY <= tolerance * tolerance;
        }

        const projection = Math.max(0, Math.min(1, (pointX * width + pointY * height) / lengthSquared));
        const offsetX = pointX - projection * width;
        const offsetY = pointY - projection * height;

        return offsetX * offsetX + offsetY * offsetY <= tolerance * tolerance;
    }

    override toJson() {
        const props = super.toJson();
        delete props.left;
        delete props.top;
        delete props.width;
        delete props.height;

        return {
            ...props,
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY,
        };
    }

    protected override _draw(ctx: UniverRenderingContext) {
        Line._drawSegment(ctx, this._startX, this._startY, this._endX, this._endY, this);
    }

    private static _drawSegment(
        ctx: UniverRenderingContext,
        startX: number,
        startY: number,
        endX: number,
        endY: number,
        props: IShapeProps
    ) {
        if (!props.stroke || props.strokeWidth === 0) {
            return;
        }

        ctx.save();
        ctx.beginPath();

        if (props.strokeDashArray) {
            ctx.setLineDash(props.strokeDashArray);
        }

        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        this._renderPaintInOrder(ctx, props);
        ctx.restore();
    }
}
