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
import type { SpreadsheetSkeleton } from '@univerjs/engine-render';
import { Range } from '@univerjs/core';
import {
    FIX_ONE_PIXEL_BLUR_OFFSET,
    SheetExtension,
    SpreadsheetExtensionRegistry,
    UniverRenderingContext,
} from '@univerjs/engine-render';
import type { IConditionalFormattingRenderRangeResolver, IDataBarCellData } from './type';
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
    private _barCanvas?: HTMLCanvasElement;
    private _barContext?: UniverRenderingContext;
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
                });
            });
        });
        ctx.restore();
    }

    override dispose(): void {
        this._renderRangeResolver = null;
        if (this._barCanvas) {
            this._barCanvas.width = 0;
            this._barCanvas.height = 0;
        }
        this._barCanvas = undefined;
        this._barContext = undefined;
        super.dispose();
    }

    private _drawAtLocalOrigin(
        ctx: UniverRenderingContext,
        x: number,
        y: number,
        width: number,
        height: number,
        draw: (paint: UniverRenderingContext, x: number, y: number) => void
    ): void {
        const native = ctx._context;
        const m = native?.getTransform();
        const colorSpace = native?.getContextAttributes?.()?.colorSpace;
        if (!m || ctx.__mode === 'printing' || typeof document === 'undefined'
            || m.a !== m.d || m.a <= 0 || m.b || m.c || native.globalAlpha !== 1
            || native.globalCompositeOperation !== 'source-over' || (colorSpace && colorSpace !== 'srgb')
            || native.shadowBlur || native.shadowOffsetX || native.shadowOffsetY
            || !['rgba(0, 0, 0, 0)', 'transparent', '#00000000'].includes(native.shadowColor)
            || (native.filter && native.filter !== 'none') || width <= 0 || height <= 0) {
            draw(ctx, x, y);
            return;
        }
        const px = x * m.a + m.e;
        const py = y * m.d + m.f;
        const left = Math.floor(px) - 2;
        const top = Math.floor(py) - 2;
        const pixelWidth = Math.ceil(px + width * m.a) - left + 2;
        const pixelHeight = Math.ceil(py + height * m.d) - top + 2;
        if (!Number.isFinite(pixelWidth * pixelHeight) || pixelWidth * pixelHeight > 128 * 1024) {
            draw(ctx, x, y);
            return;
        }
        // Keep curves and gradients at a stable native origin, without resampling the physical pixels.
        const canvas = this._barCanvas ?? document.createElement('canvas');
        if (!this._barCanvas) {
            const context = canvas.getContext('2d');
            if (!context) {
                draw(ctx, x, y);
                return;
            }
            this._barCanvas = canvas;
            this._barContext = new UniverRenderingContext(context);
        }
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
        const paint = this._barContext!;
        paint.setTransform(m.a, 0, 0, m.d, px - left, py - top);
        paint.setLineDash(ctx.getLineDash());
        paint.lineDashOffset = ctx.lineDashOffset;
        paint.lineCap = ctx.lineCap;
        paint.lineJoin = ctx.lineJoin;
        paint.miterLimit = ctx.miterLimit;
        draw(paint, 0, 0);
        ctx.save();
        try {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(canvas, left, top);
        } finally {
            ctx.restore();
        }
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
