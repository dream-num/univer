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

import type { IRange, IScale } from '@univerjs/core';
import type { SpreadsheetSkeleton, UniverRenderingContext } from '@univerjs/engine-render';
import { Range } from '@univerjs/core';
import {
    FIX_ONE_PIXEL_BLUR_OFFSET,
    SheetExtension,
    SpreadsheetExtensionRegistry,
} from '@univerjs/engine-render';
import type { IConditionalFormattingRenderRangeResolver, IDataBarCellData } from './type';
import { ConditionalFormattingRasterCache } from './conditional-formatting-raster-cache';
import { resolveRenderRanges } from './resolve-render-ranges';

export const dataBarUKey = 'sheet-conditional-rule-data-bar';
export const defaultDataBarPositiveColor = '#ffbe38';
export const defaultDataBarNativeColor = '#abd91a';

export const defaultPlaceholderColor = '#000';

const EXTENSION_Z_INDEX = 34;

const stringifyRange = (range: IRange) => {
    const { startRow, endRow, startColumn, endColumn } = range;
    return `${startRow}-${endRow}-${startColumn}-${endColumn}`;
};

export class DataBar extends SheetExtension {
    override readonly viewportCacheReusable = this.constructor === DataBar;

    private _paddingRightAndLeft = 2;
    private _paddingTopAndBottom = 2;
    private readonly _rasterCache = new ConditionalFormattingRasterCache();
    private _renderRangeResolver: IConditionalFormattingRenderRangeResolver | null = null;
    override uKey = dataBarUKey;

    override Z_INDEX = EXTENSION_Z_INDEX;
    _radius = 1;

    setRenderRangeResolver(resolver: IConditionalFormattingRenderRangeResolver | null) {
        this._renderRangeResolver = resolver;
    }

    // eslint-disable-next-line max-lines-per-function
    override draw(
        ctx: UniverRenderingContext,
        _parentScale: IScale,
        spreadsheetSkeleton: SpreadsheetSkeleton,
        diffRanges: IRange[]
    ) {
        const { worksheet } = spreadsheetSkeleton;
        if (!worksheet) {
            return false;
        }
        const mergeCellRendered = new Set<string>();
        const sourceRanges = diffRanges?.length ? diffRanges : [spreadsheetSkeleton.rowColumnSegment];
        const renderRanges = resolveRenderRanges(worksheet, sourceRanges, this._renderRangeResolver);
        if (!renderRanges.length) {
            return;
        }
        ctx.save();
        // ctx.globalCompositeOperation = 'destination-over';

        renderRanges.forEach((range) => {
            Range.foreach(range, (row, col) => {
                if (!worksheet.getRowVisible(row) || !worksheet.getColVisible(col)) {
                    return;
                }

                const primaryWithCoord = spreadsheetSkeleton.getCellWithCoordByIndex(row, col, false);
                const { isMerged, isMergedMainCell, mergeInfo } = primaryWithCoord;

                let cellData = worksheet.getCell(row, col) as IDataBarCellData;
                if (isMerged) {
                    cellData = worksheet.getCell(mergeInfo.startRow, mergeInfo.startColumn) as IDataBarCellData;
                }

                if (!cellData?.dataBar) {
                    return;
                }

                if (!this.isRenderDiffRangesByCell(mergeInfo, diffRanges)) {
                    return;
                }

                if (isMerged || isMergedMainCell) {
                    const rangeStr = stringifyRange(mergeInfo);
                    if (mergeCellRendered.has(rangeStr)) {
                        return;
                    }

                    mergeCellRendered.add(rangeStr);
                }

                const { color, value, startPoint, isGradient } = cellData.dataBar;
                const { startX, endX, startY, endY } = (isMerged || isMergedMainCell) ? mergeInfo : primaryWithCoord;
                const borderWidth = endX - startX;
                const borderHeight = (endY + FIX_ONE_PIXEL_BLUR_OFFSET) - startY;
                const width = borderWidth - this._paddingRightAndLeft * 2;
                const height = borderHeight - this._paddingTopAndBottom * 2;

                const positive = value > 0;
                const dataBarWidth = Math.max(positive
                    ? width * (1 - startPoint / 100) * value / 100
                    : width * startPoint / 100 * Math.abs(value) / 100, 1);
                const x0 = startX + this._paddingRightAndLeft + (startPoint / 100) * width - (positive ? 0 : dataBarWidth);
                const y0 = startY + this._paddingTopAndBottom;
                ctx.fillStyle = color;
                ctx.strokeStyle = color;
                const fillColor = ctx.fillStyle;
                const strokeColor = ctx.strokeStyle;
                this._drawAtLocalOrigin(ctx, x0, y0, dataBarWidth, height, (paint, x, y) => {
                    if (isGradient) {
                        const gradient = paint.createLinearGradient(x, y, x + dataBarWidth, y);
                        gradient.addColorStop(0, positive ? color : 'rgb(255 255 255)');
                        gradient.addColorStop(1, positive ? 'rgb(255 255 255)' : color);
                        paint.fillStyle = gradient;
                        paint.strokeStyle = strokeColor;
                        paint.lineWidth = 1;
                    } else {
                        paint.fillStyle = fillColor;
                    }
                    this._drawRectWithRoundedCorner(paint, x, y, dataBarWidth, height, !positive, positive, positive, !positive);
                    if (isGradient) {
                        paint.stroke();
                    }
                }, `${positive}:${isGradient}:${this._radius}:${color}`, isGradient ? 1 : 0);
            });
        });
        ctx.restore();
    }

    override dispose(): void {
        this._rasterCache.dispose();
        this._renderRangeResolver = null;
        super.dispose();
    }

    private _drawAtLocalOrigin(
        ctx: UniverRenderingContext,
        x: number,
        y: number,
        width: number,
        height: number,
        draw: (paint: UniverRenderingContext, x: number, y: number) => void,
        variant = '',
        strokeWidth = 0
    ): void {
        this._rasterCache.draw(ctx, x, y, width, height, variant, draw, strokeWidth);
    }

    private _drawRectWithRoundedCorner(ctx: UniverRenderingContext, x: number, y: number, width: number, height: number, topLeftRadius: boolean, topRightRadius: boolean, bottomRightRadius: boolean, bottomLeftRadius: boolean) {
        const radius = this._radius;
        if (!height || !width) {
            return;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        if (topRightRadius) {
            ctx.arcTo(x + width, y, x + width, y + radius, radius);
        } else {
            ctx.lineTo(x + width, y);
        }
        ctx.lineTo(x + width, y + height - radius);
        if (bottomRightRadius) {
            ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        } else {
            ctx.lineTo(x + width, y + height);
        }
        ctx.lineTo(x + radius, y + height);
        if (bottomLeftRadius) {
            ctx.arcTo(x, y + height, x, y + height - radius, radius);
        } else {
            ctx.lineTo(x, y + height);
        }
        ctx.lineTo(x, y + radius);
        if (topLeftRadius) {
            ctx.arcTo(x, y, x + radius, y, radius);
        } else {
            ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
}

SpreadsheetExtensionRegistry.add(DataBar);
