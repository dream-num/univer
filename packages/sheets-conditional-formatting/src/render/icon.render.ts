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
import { SheetExtension, SpreadsheetExtensionRegistry } from '@univerjs/engine-render';
import { drawCanvasIcon } from '@univerjs/icons-svg';
import type { IConditionalFormattingIcon } from '../models/icon-map';
import type { IConditionalFormattingRenderRangeResolver, IIconSetCellData } from './type';
import { conditionalFormattingIcons } from '../models/icon-map';
import { ConditionalFormattingRasterCache } from './conditional-formatting-raster-cache';
import { resolveRenderRanges } from './resolve-render-ranges';

export const IconUKey = 'sheet-conditional-rule-icon';
const canvasIcons = new Map<string, IConditionalFormattingIcon>(Object.entries(conditionalFormattingIcons).flatMap(([type, icons]) =>
    icons.map((icon, index) => [`${type}_${index}`, icon] as const)));

const EXTENSION_Z_INDEX = 35;
export const DEFAULT_WIDTH = 15;
export const DEFAULT_PADDING = 2;

const stringifyRange = (range: IRange) => {
    const { startRow, endRow, startColumn, endColumn } = range;
    return `${startRow}-${endRow}-${startColumn}-${endColumn}`;
};

export class ConditionalFormattingIcon extends SheetExtension {
    override readonly viewportCacheReusable = this.constructor === ConditionalFormattingIcon;

    private _paddingRightAndLeft = DEFAULT_PADDING;

    private _width = DEFAULT_WIDTH;

    private readonly _rasterCache = new ConditionalFormattingRasterCache();
    private _renderRangeResolver: IConditionalFormattingRenderRangeResolver | null = null;
    override uKey = IconUKey;

    override Z_INDEX = EXTENSION_Z_INDEX;
    _radius = 1;

    setRenderRangeResolver(resolver: IConditionalFormattingRenderRangeResolver | null) {
        this._renderRangeResolver = resolver;
    }

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

                let cellData = worksheet.getCell(row, col) as IIconSetCellData;
                if (isMerged) {
                    cellData = worksheet.getCell(mergeInfo.startRow, mergeInfo.startColumn) as IIconSetCellData;
                }

                if (!cellData?.iconSet) {
                    return;
                }

                const { iconType, iconId } = cellData.iconSet;
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

                const { startX, endX, startY, endY } = (isMerged || isMergedMainCell) ? mergeInfo : primaryWithCoord;
                const borderWidth = endX - startX;
                const borderHeight = endY - startY;
                if (this._width > borderHeight || this._width > borderWidth + this._paddingRightAndLeft * 2) {
                    return;
                }

                // Highly centered processing
                const y = (borderHeight - this._width) / 2 + startY;
                this._drawIcon(ctx, `${iconType}_${iconId}`, startX + this._paddingRightAndLeft, y);
            });
        });
        ctx.restore();
    }

    override dispose(): void {
        this._rasterCache.dispose();
        this._renderRangeResolver = null;
        super.dispose();
    }

    private _drawIcon(ctx: UniverRenderingContext, key: string, x: number, y: number): void {
        const icon = canvasIcons.get(key);
        if (!icon) {
            return;
        }
        if (ctx.__mode === 'printing' || ctx.getSystemType() !== 'Linux') {
            drawCanvasIcon(ctx._context, icon.name, x, y, this._width, icon.colors);
            return;
        }
        this._rasterCache.draw(ctx, x, y, this._width, this._width, key, (paint, left, top) => {
            drawCanvasIcon(paint._context, icon.name, left, top, this._width, icon.colors);
        });
    }
}

SpreadsheetExtensionRegistry.add(ConditionalFormattingIcon);
