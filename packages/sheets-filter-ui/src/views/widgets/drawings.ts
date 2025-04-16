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

import type { UniverRenderingContext2D } from '@univerjs/engine-render';
import { Rect } from '@univerjs/engine-render';

const BUTTON_VIEWPORT = 16;

// This path is deprecated. We need to get rounded edge of the stroked line.
// export const FILTER_BUTTON_HAS_CRITERIA = new Path2D('M3 4H13 M4.5 8H11.5 M6 12H10');
export const FILTER_BUTTON_EMPTY = new Path2D('M3.30363 3C2.79117 3 2.51457 3.60097 2.84788 3.99024L6.8 8.60593V12.5662C6.8 12.7184 6.8864 12.8575 7.02289 12.9249L8.76717 13.7863C8.96655 13.8847 9.2 13.7396 9.2 13.5173V8.60593L13.1521 3.99024C13.4854 3.60097 13.2088 3 12.6964 3H3.30363Z');

export class FilterButton {
    static drawNoCriteria(ctx: UniverRenderingContext2D, size: number, fgColor: string, bgColor: string): void {
        ctx.save();

        Rect.drawWith(ctx, {
            radius: 2,
            width: BUTTON_VIEWPORT,
            height: BUTTON_VIEWPORT,
            fill: bgColor,
        });

        ctx.lineCap = 'square';
        ctx.strokeStyle = fgColor;
        ctx.scale(size / BUTTON_VIEWPORT, size / BUTTON_VIEWPORT);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.lineCap = 'round';
        ctx.moveTo(3, 4);
        ctx.lineTo(13, 4);
        ctx.moveTo(4.5, 8);
        ctx.lineTo(11.5, 8);
        ctx.moveTo(6, 12);
        ctx.lineTo(10, 12);
        ctx.stroke();
        ctx.restore();
    }

    static drawHasCriteria(ctx: UniverRenderingContext2D, size: number, fgColor: string, bgColor: string): void {
        ctx.save();

        Rect.drawWith(ctx, {
            radius: 2,
            width: BUTTON_VIEWPORT,
            height: BUTTON_VIEWPORT,
            fill: bgColor,
        });

        ctx.scale(size / BUTTON_VIEWPORT, size / BUTTON_VIEWPORT);
        ctx.fillStyle = fgColor;
        ctx.fill(FILTER_BUTTON_EMPTY);
        ctx.restore();
    }
}
