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

import type { IViewportInfo } from '../basics/vector2';
import type { UniverRenderingContext } from '../context';
import type { IRectProps } from './rect';
import { Rectangle } from '@univerjs/core';
import { Rect } from './rect';

export class DashedRect extends Rect {
    static override drawWith(ctx: UniverRenderingContext, props: IRectProps | Rect) {
        let { radius, left, top, width, height } = props;

        radius = radius ?? 0;
        width = width ?? 0;
        height = height ?? 0;
        left = left ?? 0;
        top = top ?? 0;

        ctx.beginPath();
        ctx.setLineDash(props.strokeDashArray!);

        if (!radius) {
            // simple rect - don't bother doing all that complicated maths stuff.
            ctx.rect(left, top, width, height);
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

    protected override _draw(ctx: UniverRenderingContext, viewportInfo?: IViewportInfo) {
        const { radius, paintFirst, stroke, strokeWidth, fill, strokeScaleEnabled, fillRule, strokeLineCap, strokeDashOffset, strokeLineJoin, strokeMiterLimit, strokeDashArray } = this;
        const parentTrans = this.getParent().transform;
        // group.transform contains startXY
        // selection-shape@_updateControl -->  this.selectionShape.translate(startX, startY);

        // startXY comes from selecitonModel
        // const { startX, startY, endX, endY } = this._selectionModel;
        const startX = parentTrans.getMatrix()[4];
        const startY = parentTrans.getMatrix()[5];
        const endX = startX + this.width;
        const endY = startY + this.height;
        const rect = { left: startX, top: startY, right: endX, bottom: endY };
        let { left, top, right, bottom } = rect;

        let width = right - left;
        let height = bottom - top;
        if (viewportInfo) {
            const intersectRect = Rectangle.getIntersectionBetweenTwoRect(rect, viewportInfo.cacheBound);
            if (intersectRect) {
                left = intersectRect.left - startX;
                top = intersectRect.top - startY;
                right = intersectRect.right;
                bottom = intersectRect.bottom;
                width = intersectRect.width;
                height = intersectRect.height;
            }
        }
        DashedRect.drawWith(ctx, { ...{ radius, paintFirst, stroke, strokeWidth, fill, strokeScaleEnabled, fillRule, strokeLineCap, strokeDashOffset, strokeLineJoin, strokeMiterLimit, strokeDashArray }, ...{ width, height, left, top } });
    }
}
