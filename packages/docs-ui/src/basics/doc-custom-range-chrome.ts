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

import type { ThemeService } from '@univerjs/core';
import type { UniverRenderingContext } from '@univerjs/engine-render';
import { ColorKit } from '@univerjs/core';

export const DOC_CUSTOM_RANGE_CHROME_RADIUS = 1;
export const DOC_CUSTOM_RANGE_CHROME_BACKGROUND_ALPHA = 0.07;

export interface IDocCustomRangeChromeRect {
    bottom: number;
    left: number;
    right: number;
    top: number;
}

export interface IDocCustomRangeChromeTheme {
    background: string;
    border: string;
}

export function resolveDocCustomRangeChromeTheme(
    themeService: ThemeService
): IDocCustomRangeChromeTheme {
    const primary = themeService.getColorFromTheme('primary.600');

    return {
        background: new ColorKit(primary)
            .setAlpha(DOC_CUSTOM_RANGE_CHROME_BACKGROUND_ALPHA)
            .toRgbString(),
        border: primary,
    };
}

export function drawDocCustomRangeChrome(
    ctx: Pick<
        UniverRenderingContext,
        | 'beginPath'
        | 'fill'
        | 'fillStyle'
        | 'lineWidth'
        | 'restore'
        | 'roundRect'
        | 'save'
        | 'stroke'
        | 'strokeStyle'
    >,
    rect: IDocCustomRangeChromeRect,
    theme: IDocCustomRangeChromeTheme
): void {
    ctx.save();
    ctx.fillStyle = theme.background;
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(
        rect.left,
        rect.top,
        rect.right - rect.left,
        rect.bottom - rect.top,
        DOC_CUSTOM_RANGE_CHROME_RADIUS
    );
    ctx.fill();
    ctx.stroke();
    ctx.restore();
}
