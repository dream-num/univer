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

import type { Vector2 } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import type { IShapeProps } from './shape';
import { Shape } from './shape';

/**
 * A lightweight line segment from the local origin to the object's width and height.
 */
export class Line extends Shape<IShapeProps> {
    static override drawWith(ctx: UniverRenderingContext, props: IShapeProps | Line) {
        if (!props.stroke || props.strokeWidth === 0) {
            return;
        }

        const width = props.width ?? 0;
        const height = props.height ?? 0;

        ctx.save();
        ctx.beginPath();

        if (props.strokeDashArray) {
            ctx.setLineDash(props.strokeDashArray);
        }

        ctx.moveTo(0, 0);
        ctx.lineTo(width, height);
        this._renderPaintInOrder(ctx, props);
        ctx.restore();
    }

    override isHit(coord: Vector2) {
        const point = this.getInverseCoord(coord);
        const width = this.width;
        const height = this.height;
        const lengthSquared = width * width + height * height;
        const parsedHitStrokeWidth = typeof this.hitStrokeWidth === 'number'
            ? this.hitStrokeWidth
            : Number.parseFloat(this.hitStrokeWidth);
        const hitStrokeWidth = Number.isFinite(parsedHitStrokeWidth) ? parsedHitStrokeWidth : 0;
        const tolerance = Math.max(this.strokeWidth, hitStrokeWidth) / 2;

        if (lengthSquared === 0) {
            return point.x * point.x + point.y * point.y <= tolerance * tolerance;
        }

        const projection = Math.max(0, Math.min(1, (point.x * width + point.y * height) / lengthSquared));
        const offsetX = point.x - projection * width;
        const offsetY = point.y - projection * height;

        return offsetX * offsetX + offsetY * offsetY <= tolerance * tolerance;
    }

    protected override _draw(ctx: UniverRenderingContext) {
        Line.drawWith(ctx, this);
    }
}
