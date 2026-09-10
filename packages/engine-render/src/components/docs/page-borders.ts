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

import type { IPageBorder, IPageBorders } from '@univerjs/core';
import type { IDocumentSkeletonPage } from '../../basics/i-document-skeleton-cached';
import type { UniverRenderingContext } from '../../context';
import { COLOR_BLACK_RGB } from '../../basics/const';
import { getColorStyleForCanvas } from './layout/style/color';

function getBorderBands(border: IPageBorder | undefined): number[] {
    if (!border) {
        return [];
    }
    const width = border.width ?? 1;
    if (!Number.isFinite(width) || width <= 0) {
        return [];
    }
    // Alternating ink and transparent space, in increasing document coordinates.
    switch (border.style ?? 'single') {
        case 'single':
        case 'thick':
        case 'dotted':
        case 'dashed':
        case 'dashSmallGap':
        case 'dotDash':
        case 'dotDotDash':
            return [width];
        case 'double':
            return [width, width, width];
        case 'triple':
            return [width, width, width, width, width];
        case 'thickThinSmallGap':
            return [width / 4, width / 4, width];
        case 'thinThickSmallGap':
            return [width, width / 4, width / 4];
        case 'thinThickThinSmallGap':
            return [width / 4, width / 4, width, width / 4, width / 4];
        default:
            // Unsupported art/line styles retain their public model for export.
            return [];
    }
}

/** Draws section page borders without contributing to text/table layout. */
export function drawPageBorders(
    ctx: UniverRenderingContext,
    page: IDocumentSkeletonPage,
    borders: IPageBorders | undefined,
    pageLeft: number,
    pageTop: number,
    firstPageInSection: boolean
): void {
    if (!borders || (borders.display === 'firstPage' && !firstPageInSection) ||
        (borders.display === 'notFirstPage' && firstPageInSection)) {
        return;
    }
    const sides = [borders.top, borders.right, borders.bottom, borders.left];
    const bands = sides.map(getBorderBands);
    const widths = bands.map((values) => values.reduce((sum, value) => sum + value, 0));
    const padding = sides.map((side) => Number.isFinite(side?.padding) ? Math.max(0, side!.padding!) : 0);
    const fromPage = borders.offsetFrom === 'page';
    const left = pageLeft + (fromPage ? padding[3] : page.marginLeft - padding[3] - widths[3]);
    const top = pageTop + (fromPage ? padding[0] : page.originMarginTop - padding[0] - widths[0]);
    const right = pageLeft + page.pageWidth - (fromPage ? padding[1] : page.marginRight - padding[1] - widths[1]);
    const bottom = pageTop + page.pageHeight - (fromPage ? padding[2] : page.originMarginBottom - padding[2] - widths[2]);
    if (![left, top, right, bottom].every(Number.isFinite) || right <= left || bottom <= top) {
        return;
    }

    for (let sideIndex = 0; sideIndex < sides.length; sideIndex++) {
        const border = sides[sideIndex];
        const thickness = widths[sideIndex];
        if (!border || thickness === 0) {
            continue;
        }
        const horizontal = sideIndex % 2 === 0;
        const reverse = sideIndex === 1 || sideIndex === 2;
        const values = reverse ? [...bands[sideIndex]].reverse() : bands[sideIndex];
        const color = getColorStyleForCanvas(border.color) ?? COLOR_BLACK_RGB;
        const corners = [[left, top], [right, top], [right, bottom], [left, bottom]];
        const inner = [
            [left + widths[3], top + widths[0]],
            [right - widths[1], top + widths[0]],
            [right - widths[1], bottom - widths[2]],
            [left + widths[3], bottom - widths[2]],
        ];
        const next = (sideIndex + 1) % 4;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(corners[sideIndex][0], corners[sideIndex][1]);
        ctx.lineTo(corners[next][0], corners[next][1]);
        ctx.lineTo(inner[next][0], inner[next][1]);
        ctx.lineTo(inner[sideIndex][0], inner[sideIndex][1]);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        let offset = 0;
        for (let bandIndex = 0; bandIndex < values.length; bandIndex++) {
            const width = values[bandIndex];
            if (bandIndex % 2 === 0) {
                let x = left;
                let y = top;
                if (horizontal) {
                    y = reverse ? bottom - offset - width : top + offset;
                } else {
                    x = reverse ? right - offset - width : left + offset;
                }
                const dash = border.style;
                if (dash === 'dotted' || dash === 'dashed' || dash === 'dashSmallGap' || dash === 'dotDash' || dash === 'dotDotDash') {
                    let pattern = [3 * width, width];
                    if (dash === 'dotted') {
                        pattern = [width, width];
                    } else if (dash === 'dotDash') {
                        pattern = [3 * width, width, width, width];
                    } else if (dash === 'dotDotDash') {
                        pattern = [3 * width, width, width, width, width, width];
                    }
                    ctx.setLineDash(pattern);
                    ctx.lineWidth = width;
                    ctx.lineCap = 'butt';
                    ctx.beginPath();
                    ctx.moveTo(x + (horizontal ? 0 : width / 2), y + (horizontal ? width / 2 : 0));
                    ctx.lineTo(horizontal ? right : x + width / 2, horizontal ? y + width / 2 : bottom);
                    ctx.stroke();
                } else {
                    ctx.fillRect(x, y, horizontal ? right - left : width, horizontal ? width : bottom - top);
                }
            }
            offset += width;
        }
        ctx.restore();
    }
}
